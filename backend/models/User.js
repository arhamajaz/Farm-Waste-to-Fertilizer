const mongoose = require('mongoose');

const FarmDetailsSchema = new mongoose.Schema(
  {
    state: {
      type: String,
      trim: true,
      default: ''
    },
    farmSizeHectares: {
      type: Number,
      min: [0, 'Farm size cannot be negative'],
      default: 0
    },
    dominantCropResidue: {
      type: String,
      trim: true,
      default: 'Paddy Straw'
    }
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: [true, 'Firebase UID is required'],
      unique: true,
      index: true,
      trim: true
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    role: {
      type: String,
      enum: {
        values: ['farmer', 'agronomist', 'operator', 'admin'],
        message: '{VALUE} is not a supported role'
      },
      default: 'farmer'
    },
    farmDetails: {
      type: FarmDetailsSchema,
      default: () => ({})
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', UserSchema);
