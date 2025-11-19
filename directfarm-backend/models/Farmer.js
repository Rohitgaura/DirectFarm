const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  farmName: {
    type: String,
    required: [true, 'Farm name is required'],
    trim: true,
    maxlength: [100, 'Farm name cannot exceed 100 characters']
  },
  experienceYears: {
    type: Number,
    required: [true, 'Experience years is required'],
    min: [0, 'Experience years must be at least 0'],
    max: [50, 'Experience years must be at most 50']
  },
  //,
  //farmLocation: {
   // type: String,
    //required: [true, 'Farm location is required'],
    //trim: true
  //}
  
  verificationStatus: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index on userId for faster lookups
farmerSchema.index({ userId: 1 });

module.exports = mongoose.model('Farmer', farmerSchema);

