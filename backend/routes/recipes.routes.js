const express = require('express');
const router = express.Router();
const FormulationRecipe = require('../models/FormulationRecipe');

/**
 * @route   POST /api/recipes
 * @desc    Create and save a new FormulationRecipe to MongoDB
 * @access  Public / Authenticated
 */
router.post('/', async (req, res) => {
  try {
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
