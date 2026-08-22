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
  },
  phone: {
    type: String,
    required: [true, 'Member phone number is required'],
    trim: true,
    match: [/^[0-9+\s()-]{8,20}$/, 'Please enter a valid phone number']
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
    trim: true,
    lowercase: true,
    unique: true,
    sparse: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  leaderPhone: {
    type: String,
    required: [true, 'Leader phone number is required'],
    trim: true,
    match: [/^[0-9+\s()-]{8,20}$/, 'Please enter a valid phone number']
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
  participantCount: {
    type: Number,
    required: true,
    min: [1, 'A team must have at least 1 participant'],
    max: [4, 'A team cannot have more than 4 participants']
  },
  feePerParticipantAtRegistration: {
    type: Number,
    required: true,
    min: [0, 'Fee cannot be negative']
  },
  totalRegistrationFee: {
    type: Number,
    required: true,
    min: [0, 'Total fee cannot be negative']
  },
  paymentScreenshot: {
    fileName: String,
    originalName: String,
    mimeType: String,
    size: Number,
    path: String,
    url: String,
    uploadedAt: Date
  },
  paymentAmountChecked: {
    type: Number,
    default: null
  },
  verificationStatus: {
    type: String,
    enum: {
      values: ['Pending Verification', 'Verified', 'Rejected'],
      message: '{VALUE} is not a valid verification status'
    },
    default: 'Pending Verification'
  },
  rejectionReason: {
    type: String,
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  rejectedAt: {
    type: Date,
    default: null
  },
  verificationEmailSent: {
    type: Boolean,
    default: false
  },
  verificationEmailSentAt: {
    type: Date,
    default: null
  },
  rejectionEmailSent: {
    type: Boolean,
    default: false
  },
  rejectionEmailSentAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

registrationSchema.index({ leaderEmail: 1 }, { unique: true, sparse: true });
registrationSchema.index({ 'members.email': 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Registration', registrationSchema);
