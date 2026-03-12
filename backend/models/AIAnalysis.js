const mongoose = require('mongoose');

const aiAnalysisSchema = new mongoose.Schema(
  {
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      unique: true,
      index: true
    },
    predictedCategory: {
      type: String,
      required: true
    },
    keywords: {
      type: [String],
      default: []
    },
    clusterId: {
      type: Number,
      default: -1
    },
    confidence: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('AIAnalysis', aiAnalysisSchema);
