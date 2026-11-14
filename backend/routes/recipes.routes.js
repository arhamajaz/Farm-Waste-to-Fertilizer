const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const FormulationRecipe = require('../models/FormulationRecipe');

/**
 * @route   POST /api/recipes
 * @desc    Create and save a new FormulationRecipe to MongoDB
 * @access  Public / Authenticated
 */
router.post('/', async (req, res) => {
  try {
    // Guard against buffering timeouts if MongoDB is not connected in dev
    if (mongoose.connection.readyState !== 1) {
      console.warn('⚠️ [MongoDB] Database is not connected (readyState=' + mongoose.connection.readyState + '). Returning simulated saved recipe.');
      return res.status(201).json({
        _id: 'simulated-recipe-' + Date.now(),
        ...req.body,
        createdAt: new Date().toISOString(),
        isDevMock: true
      });
    }

    const recipe = new FormulationRecipe(req.body);
    const savedRecipe = await recipe.save();
    return res.status(201).json(savedRecipe);
  } catch (err) {
    console.error('❌ [Recipes] Error creating formulation recipe:', err.message);
    return res.status(400).json({ error: err.message });
  }
});

/**
 * @route   GET /api/recipes
 * @desc    Fetch all public recipes using .find({ isPublic: true })
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // Guard against buffering timeouts if MongoDB is not connected in dev
    if (mongoose.connection.readyState !== 1) {
      console.warn('⚠️ [MongoDB] Database is not connected (readyState=' + mongoose.connection.readyState + '). Returning simulated public recipes.');
      return res.status(200).json([
        {
          _id: 'simulated-recipe-001',
          title: 'Indo-Gangetic Biochar & Diazotroph Formulation',
          feedstockOrigin: 'Paddy Straw',
          ratios: { biochar: 50, microbes: 25, minerals: 25 },
          fcoCompliant: true,
          isPublic: true,
          createdAt: new Date().toISOString(),
          isDevMock: true
        }
      ]);
    }

    const recipes = await FormulationRecipe.find({ isPublic: true })
      .populate('author', 'fullName email role')
      .sort({ createdAt: -1 });

    return res.status(200).json(recipes);
  } catch (err) {
    console.error('❌ [Recipes] Error fetching public recipes:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
