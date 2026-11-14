const mongoose = require('mongoose');

const RatiosSchema = new mongoose.Schema(
  {
    biochar: {
      type: Number,
      required: true,
      min: [0, 'Biochar ratio cannot be negative'],
      max: [100, 'Biochar ratio cannot exceed 100'],
      default: 50
    },
    microbes: {
      type: Number,
      required: true,
      min: [0, 'Microbes ratio cannot be negative'],
      max: [100, 'Microbes ratio cannot exceed 100'],
      default: 25
    },
    minerals: {
      type: Number,
      required: true,
      min: [0, 'Minerals ratio cannot be negative'],
      max: [100, 'Minerals ratio cannot exceed 100'],
      default: 25
    }
  },
  { _id: false }
);

const FormulationRecipeSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Recipe title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    feedstockOrigin: {
      type: String,
      required: [true, 'Feedstock origin is required'],
      trim: true,
      default: 'Paddy Straw'
    },
    ratios: {
      type: RatiosSchema,
      required: true,
      default: () => ({ biochar: 50, microbes: 25, minerals: 25 })
    },
    fcoCompliant: {
      type: Boolean,
      default: false,
      index: true
    },
    isPublic: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Virtual validation to ensure ratios sum to approximately 100%
FormulationRecipeSchema.pre('validate', function (next) {
  if (this.ratios) {
    const total = (this.ratios.biochar || 0) + (this.ratios.microbes || 0) + (this.ratios.minerals || 0);
    if (Math.abs(total - 100) > 0.5) {
      this.invalidate('ratios', `Ratios sum must equal 100%. Current total: ${total}%`);
    }
  }
  next();
});

module.exports = mongoose.model('FormulationRecipe', FormulationRecipeSchema);
