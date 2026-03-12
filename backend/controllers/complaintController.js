const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const AIAnalysis = require('../models/AIAnalysis');
const { runComplaintAnalysis, runComplaintClustering } = require('../services/aiService');

const canManageComplaint = (complaint, user) => {
  if (user.role === 'admin') {
    return true;
  }
  return complaint.user.toString() === user._id.toString();
};

const triggerClusterRefresh = async () => {
  const complaintList = await Complaint.find({}, '_id description title').lean();

  if (complaintList.length < 2) {
    if (complaintList.length === 1) {
      const complaint = complaintList[0];
      await Complaint.findByIdAndUpdate(complaint._id, { aiCluster: 0 });
      await AIAnalysis.findOneAndUpdate(
        { complaintId: complaint._id },
        {
          $set: { clusterId: 0 },
          $setOnInsert: {
            predictedCategory: 'Other',
            keywords: [],
            confidence: 0
          }
        },
        { upsert: true }
      );
    }
    return;
  }

  const payload = complaintList.map((item) => ({
    id: item._id.toString(),
    text: `${item.title} ${item.description}`
  }));

  const clusteringResult = await runComplaintClustering(payload);
  if (!clusteringResult?.clusters?.length) {
    return;
  }

  const bulkComplaintUpdates = [];
  const bulkAnalysisUpdates = [];

  clusteringResult.clusters.forEach((clusterItem) => {
    if (!mongoose.Types.ObjectId.isValid(clusterItem.id)) {
      return;
    }

    bulkComplaintUpdates.push({
      updateOne: {
        filter: { _id: clusterItem.id },
        update: { $set: { aiCluster: clusterItem.clusterId } }
      }
    });

    bulkAnalysisUpdates.push({
      updateOne: {
        filter: { complaintId: clusterItem.id },
        update: {
          $set: { clusterId: clusterItem.clusterId },
          $setOnInsert: {
            predictedCategory: 'Other',
            keywords: [],
            confidence: 0
          }
        },
        upsert: true
      }
    });
  });

  if (bulkComplaintUpdates.length > 0) {
    await Complaint.bulkWrite(bulkComplaintUpdates);
  }

  if (bulkAnalysisUpdates.length > 0) {
    await AIAnalysis.bulkWrite(bulkAnalysisUpdates);
  }
};

const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, location } = req.body;

    const complaint = await Complaint.create({
      title,
      description,
      category,
      location,
      image: req.file ? `/uploads/${req.file.filename}` : null,
      user: req.user._id
    });

    const analysis = await runComplaintAnalysis(`${title} ${description}`);
    if (analysis) {
      await AIAnalysis.findOneAndUpdate(
        { complaintId: complaint._id },
        {
          $set: {
            predictedCategory: analysis.predictedCategory,
            keywords: analysis.keywords,
            confidence: analysis.confidence,
            clusterId: complaint.aiCluster
          },
          $setOnInsert: {
            complaintId: complaint._id
          }
        },
        { upsert: true, new: true }
      );
    }

    await triggerClusterRefresh();

    const savedComplaint = await Complaint.findById(complaint._id).populate('user', 'name email role');

    return res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint: savedComplaint
    });
  } catch (error) {
    return next(error);
  }
};

const getComplaints = async (req, res, next) => {
  try {
    const {
      status,
      category,
      delayFlag,
      department,
      search,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    if (typeof delayFlag !== 'undefined') {
      query.delayFlag = delayFlag === 'true';
    }

    if (department) {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNumber = Math.max(Number(page), 1);
    const pageLimit = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (pageNumber - 1) * pageLimit;

    const [complaints, total] = await Promise.all([
      Complaint.find(query)
        .populate('user', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit)
        .lean(),
      Complaint.countDocuments(query)
    ]);

    return res.status(200).json({
      complaints,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageLimit),
        limit: pageLimit
      }
    });
  } catch (error) {
    return next(error);
  }
};

const getComplaintById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid complaint ID' });
    }

    const complaint = await Complaint.findById(id).populate('user', 'name email role').lean();
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (req.user.role !== 'admin' && complaint.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied to this complaint' });
    }

    const analysis = await AIAnalysis.findOne({ complaintId: complaint._id }).lean();

    return res.status(200).json({ complaint, analysis });
  } catch (error) {
    return next(error);
  }
};

const updateComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid complaint ID' });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (!canManageComplaint(complaint, req.user)) {
      return res.status(403).json({ message: 'Access denied to update this complaint' });
    }

    const statusBefore = complaint.status;

    if (req.user.role === 'admin') {
      const allowedAdminFields = [
        'title',
        'description',
        'category',
        'location',
        'status',
        'department',
        'delayFlag'
      ];

      allowedAdminFields.forEach((field) => {
        if (typeof req.body[field] !== 'undefined') {
          complaint[field] = req.body[field];
        }
      });
    } else {
      if (['resolved', 'rejected'].includes(complaint.status)) {
        return res.status(400).json({ message: 'Resolved/rejected complaint cannot be edited by citizen' });
      }

      const allowedCitizenFields = ['title', 'description', 'category', 'location'];
      allowedCitizenFields.forEach((field) => {
        if (typeof req.body[field] !== 'undefined') {
          complaint[field] = req.body[field];
        }
      });
    }

    if (req.file) {
      complaint.image = `/uploads/${req.file.filename}`;
    }

    if (complaint.status === 'resolved' && statusBefore !== 'resolved') {
      complaint.resolvedAt = new Date();
      complaint.delayFlag = false;
    }

    if (statusBefore === 'resolved' && complaint.status !== 'resolved') {
      complaint.resolvedAt = null;
    }

    await complaint.save();

    const analyzeFieldsChanged = ['title', 'description', 'category'].some(
      (field) => typeof req.body[field] !== 'undefined'
    );

    if (analyzeFieldsChanged) {
      const analysis = await runComplaintAnalysis(`${complaint.title} ${complaint.description}`);
      if (analysis) {
        await AIAnalysis.findOneAndUpdate(
          { complaintId: complaint._id },
          {
            $set: {
              predictedCategory: analysis.predictedCategory,
              keywords: analysis.keywords,
              confidence: analysis.confidence
            },
            $setOnInsert: {
              complaintId: complaint._id,
              clusterId: complaint.aiCluster
            }
          },
          { upsert: true }
        );
      }

      await triggerClusterRefresh();
    }

    const updated = await Complaint.findById(complaint._id).populate('user', 'name email role');

    return res.status(200).json({
      message: 'Complaint updated successfully',
      complaint: updated
    });
  } catch (error) {
    return next(error);
  }
};

const deleteComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid complaint ID' });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (!canManageComplaint(complaint, req.user)) {
      return res.status(403).json({ message: 'Access denied to delete this complaint' });
    }

    if (req.user.role !== 'admin' && complaint.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending complaints can be deleted by citizen' });
    }

    await AIAnalysis.deleteOne({ complaintId: complaint._id });
    await Complaint.findByIdAndDelete(complaint._id);

    await triggerClusterRefresh();

    return res.status(200).json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint
};
