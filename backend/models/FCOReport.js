const mongoose = require('mongoose');

const MetricTestResultSchema = new mongoose.Schema(
  {
    parameter: {
      type: String,
      required: [true, 'Metric parameter name is required'],
      trim: true
    },
    testedValue: {
      type: Number,
      required: [true, 'Tested numerical value is required']
    },
    unit: {
      type: String,
      trim: true,
      default: '%'
    },
    fcoStandard: {
      type: String,
      required: [true, 'FCO standard specification benchmark is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['Compliant', 'Non-Compliant', 'Warning', 'Pending'],
      default: 'Compliant'
    },
    testDate: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const FCOReportSchema = new mongoose.Schema(
  {
    operator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Operator reference is required'],
      index: true
    },
    batchNumber: {
      type: String,
      required: [true, 'Batch number is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    metrics: {
      type: [MetricTestResultSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A batch report must contain at least one metric test result.'
      }
    },
    overallCompliance: {
      type: String,
      enum: {
        values: ['Compliant', 'Non-Compliant', 'Conditional'],
        message: '{VALUE} is not a valid overall compliance status'
      },
      default: 'Compliant',
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('FCOReport', FCOReportSchema);
