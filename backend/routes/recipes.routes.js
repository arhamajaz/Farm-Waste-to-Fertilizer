const express = require('express');
const router = express.Router();
const FormulationRecipe = require('../models/FormulationRecipe');

/**
 * @route   GET /api/recipes
 * @desc    Fetch all public formulation recipes (or filter by author/feedstock)
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { feedstock, fcoOnly } = req.query;
    const filter = { isPublic: true };

    if (feedstock) {
      filter.feedstockOrigin = new RegExp(feedstock, 'i');
    }
    if (fcoOnly === 'true') {
      filter.fcoCompliant = true;
    }

    const recipes = await FormulationRecipe.find(filter)
      .populate('author', 'fullName role email')
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      count: recipes.length,
      data: recipes
    });
  } catch (err) {
    console.error('Error fetching recipes:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve formulation recipes',
      error: err.message
    });
  }
});

/**
 * @route   POST /api/recipes
 * @desc    Create a new bio-fertilizer formulation recipe
 * @access  Authenticated
 */
router.post('/', async (req, res) => {
  try {
    const { author, title, feedstockOrigin, ratios, fcoCompliant, isPublic } = req.body;

    const recipe = new FormulationRecipe({
      author,
      title,
      feedstockOrigin,
      ratios,
      fcoCompliant,
      isPublic
    });

    const savedRecipe = await recipe.save();
    return res.status(201).json({
      success: true,
      message: 'Bio-fertilizer formulation recipe created successfully',
      data: savedRecipe
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: 'Failed to save formulation recipe',
      error: err.message
    });
  }
});

/**
 * @route   GET /api/recipes/:id
 * @desc    Fetch single formulation recipe by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const recipe = await FormulationRecipe.findById(req.params.id).populate('author', 'fullName role email');
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Formulation recipe not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: recipe
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching recipe details',
      error: err.message
    });
  }
});

module.exports = router;
