const Complaint = require('../models/Complaint');
const AIAnalysis = require('../models/AIAnalysis');

const getDelayedComplaints = async (req, res, next) => {
  try {
    const { category, department } = req.query;
    const query = {
      delayFlag: true,
      status: { $nin: ['resolved', 'rejected'] }
    };

    if (category) {
      query.category = category;
    }

    if (department) {
      query.department = department;
    }

    const complaints = await Complaint.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({ complaints });
  } catch (error) {
    return next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalComplaints,
      resolvedComplaints,
      pendingComplaints,
      delayedComplaints,
      complaintsByCategory,
      monthlyTrend,
      clusterSummary,
      averageResolutionData
    ] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'resolved' }),
      Complaint.countDocuments({ status: { $in: ['pending', 'in_progress'] } }),
      Complaint.countDocuments({ delayFlag: true, status: { $nin: ['resolved', 'rejected'] } }),
      Complaint.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),
      Complaint.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 11))
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            label: {
              $concat: [
                { $toString: '$_id.year' },
                '-',
                {
                  $cond: [
                    { $lt: ['$_id.month', 10] },
                    { $concat: ['0', { $toString: '$_id.month' }] },
                    { $toString: '$_id.month' }
                  ]
                }
              ]
            },
            count: 1
          }
        },
        { $sort: { label: 1 } }
      ]),
      Complaint.aggregate([
        { $match: { aiCluster: { $gte: 0 } } },
        {
          $group: {
            _id: '$aiCluster',
            count: { $sum: 1 },
            sampleTitle: { $first: '$title' }
          }
        },
        { $sort: { count: -1 } }
      ]),
      Complaint.aggregate([
        {
          $match: {
            status: 'resolved',
            resolvedAt: { $ne: null }
          }
        },
        {
          $project: {
            resolutionHours: {
              $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 3600000]
            }
          }
        },
        {
          $group: {
            _id: null,
            avgResolutionHours: { $avg: '$resolutionHours' }
          }
        }
      ])
    ]);

    const aiKeywordsByCluster = await AIAnalysis.aggregate([
      { $match: { clusterId: { $gte: 0 } } },
      { $unwind: '$keywords' },
      {
        $group: {
          _id: { clusterId: '$clusterId', keyword: '$keywords' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const keywordMap = {};
    aiKeywordsByCluster.forEach((item) => {
      const cluster = item._id.clusterId;
      if (!keywordMap[cluster]) {
        keywordMap[cluster] = [];
      }
      if (keywordMap[cluster].length < 4) {
        keywordMap[cluster].push(item._id.keyword);
      }
    });

    const clusteredIssues = clusterSummary.map((cluster) => ({
      clusterId: cluster._id,
      count: cluster.count,
      sampleTitle: cluster.sampleTitle,
      keywords: keywordMap[cluster._id] || []
    }));

    return res.status(200).json({
      totalComplaints,
      resolvedComplaints,
      pendingComplaints,
      delayedComplaints,
      slaViolations: delayedComplaints,
      averageResolutionHours: Number((averageResolutionData[0]?.avgResolutionHours || 0).toFixed(2)),
      complaintsByCategory: complaintsByCategory.map((item) => ({
        category: item._id || 'Uncategorized',
        count: item.count
      })),
      monthlyTrend,
      clusteredIssues
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getDelayedComplaints,
  getDashboardStats
};
