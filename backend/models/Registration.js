const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Member name is required'],
    trim: true,
    minlength: [2, 'Member name must be at least 2 characters'],
    maxlength: [50, 'Member name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Member email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  }
}, { _id: false });

const registrationSchema = new mongoose.Schema({
  teamId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  teamName: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
    minlength: [2, 'Team name must be at least 2 characters'],
    maxlength: [50, 'Team name cannot exceed 50 characters']
  },
  trackId: {
    type: String,
    required: [true, 'Track ID is required'],
    enum: {
      values: ['ai-ml', 'web3', 'open-innovation', 'sustainability', 'fintech', 'healthtech'],
      message: '{VALUE} is not a valid track ID'
    }
  },
  leaderName: {
    type: String,
    required: [true, 'Leader name is required'],
    trim: true,
    minlength: [2, 'Leader name must be at least 2 characters'],
    maxlength: [50, 'Leader name cannot exceed 50 characters']
  },
  leaderEmail: {
    type: String,
    required: [true, 'Leader email is required'],
    unique: true,
    index: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  members: {
    type: [memberSchema],
    default: [],
    validate: {
      validator: function(val) {
        return val.length <= 3;
      },
      message: 'A team can have at most 3 additional members.'
    }
  },
  verificationStatus: {
    type: String,
    enum: {
      values: ['PENDING', 'VERIFIED'],
      message: '{VALUE} is not a valid verification status'
    },
    default: 'PENDING'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Registration', registrationSchema);
