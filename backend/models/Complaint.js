const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 200
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000
    },
    category: {
      type: String,
      required: true,
      trim: true,
      default: 'Other'
    },
    location: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 300
    },
    image: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'resolved', 'rejected'],
      default: 'pending'
    },
    delayFlag: {
      type: Boolean,
      default: false
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    department: {
      type: String,
      default: 'Unassigned'
    },
    aiCluster: {
      type: Number,
      default: -1
    },
    escalationLevel: {
      type: Number,
      default: 0
    },
    reminderSentAt: {
      type: Date,
      default: null
    },
    escalationSentAt: {
      type: Date,
      default: null
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

complaintSchema.index({ status: 1, delayFlag: 1, createdAt: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ aiCluster: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
