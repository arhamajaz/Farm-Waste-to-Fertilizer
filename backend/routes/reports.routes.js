const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
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

    if (mongoose.connection.readyState !== 1) {
      console.warn('⚠️ [MongoDB] Database is not connected. Returning simulated batch reports.');
      return res.status(200).json({
        success: true,
        count: 1,
        data: [
          {
            _id: 'simulated-report-001',
            batchNumber: 'KU-2026-PUN-089',
            metrics: [
              { parameter: 'Organic Carbon (C)', testedValue: 18.4, unit: '%', fcoStandard: '>= 14.0%', status: 'Compliant' },
              { parameter: 'Total Nitrogen (N)', testedValue: 1.25, unit: '%', fcoStandard: '>= 0.8%', status: 'Compliant' },
              { parameter: 'C:N Ratio', testedValue: 14.7, unit: '', fcoStandard: '< 20:1', status: 'Compliant' },
              { parameter: 'pH (1:5 dilution)', testedValue: 7.2, unit: '', fcoStandard: '6.5 - 7.5', status: 'Compliant' }
            ],
            overallCompliance: 'Compliant',
            isDevMock: true
          }
        ]
      });
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

    if (mongoose.connection.readyState !== 1) {
      console.warn('⚠️ [MongoDB] Database is not connected. Returning simulated created report.');
      return res.status(201).json({
        success: true,
        message: 'FCO compliance test report logged successfully (Dev Simulation)',
        data: {
          _id: 'simulated-report-' + Date.now(),
          operator: operator || 'mock-operator-id',
          batchNumber: (batchNumber || 'KU-BATCH-DEMO').toUpperCase(),
          metrics: metrics || [],
          overallCompliance: overallCompliance || 'Compliant',
          createdAt: new Date().toISOString(),
          isDevMock: true
        }
      });
    }

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
    const batchNo = req.params.batchNumber.toUpperCase();

    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        data: {
          batchNumber: batchNo,
          overallCompliance: 'Compliant',
          note: 'Database disconnected (Dev Simulation)',
          isDevMock: true
        }
      });
    }

    const report = await FCOReport.findOne({
      batchNumber: batchNo
    }).populate('operator', 'fullName email role');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: `Batch report ${batchNo} not found in national registry`
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
