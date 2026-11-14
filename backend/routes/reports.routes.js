const express = require('express');
const router = express.Router();
const FCOReport = require('../models/FCOReport');

/**
 * @route   GET /api/reports
 * @desc    Fetch batch FCO test reports (with compliance filtering)
 * @access  Public / Operator
 */
router.get('/', async (req, res) => {
  try {
    const { status, limit = 20 } = req.query;
    const filter = {};

    if (status) {
      filter.overallCompliance = status;
    }

    const reports = await FCOReport.find(filter)
      .populate('operator', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));

    return res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (err) {
    console.error('Error fetching FCO reports:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve FCO audit reports',
      error: err.message
    });
  }
});

/**
 * @route   POST /api/reports
 * @desc    Submit a new batch FCO compliance testing report
 * @access  Operator / Agronomist
 */
router.post('/', async (req, res) => {
  try {
    const { operator, batchNumber, metrics, overallCompliance } = req.body;

    const report = new FCOReport({
      operator,
      batchNumber,
      metrics,
      overallCompliance
    });

    const savedReport = await report.save();
    return res.status(201).json({
      success: true,
      message: 'FCO compliance test report logged successfully',
      data: savedReport
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: 'Failed to create FCO report',
      error: err.message
    });
  }
});

/**
 * @route   GET /api/reports/:batchNumber
 * @desc    Look up an FCO batch report by its unique batch number
 * @access  Public / Verifier
 */
router.get('/:batchNumber', async (req, res) => {
  try {
    const report = await FCOReport.findOne({
      batchNumber: req.params.batchNumber.toUpperCase()
    }).populate('operator', 'fullName email role');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: `Batch report ${req.params.batchNumber.toUpperCase()} not found in national registry`
      });
    }

    return res.status(200).json({
      success: true,
      data: report
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Error looking up batch report',
      error: err.message
    });
  }
});

module.exports = router;
