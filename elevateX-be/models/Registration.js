const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  registrationId: {
    type: String,
    required: true,
    unique: true,
    sparse: true,
    index: true
  },
  trackId: {
    type: String,
    required: [true, 'Track ID is required'],
    enum: {
      values: ['ai-ml', 'web3', 'open-innovation', 'sustainability', 'fintech', 'healthtech'],
      message: '{VALUE} is not a valid track ID'
    }
  },
  name: {
    type: String,
    required: [true, 'Participant name is required'],
    trim: true,
    minlength: [2, 'Participant name must be at least 2 characters'],
    maxlength: [50, 'Participant name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Participant email is required'],
    trim: true,
    lowercase: true,
    unique: true,
    sparse: true,
    index: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  phone: {
    type: String,
    required: [true, 'Participant phone number is required'],
    trim: true,
    match: [/^[0-9+\s()-]{8,20}$/, 'Please enter a valid phone number']
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

module.exports = mongoose.model('Registration', registrationSchema);
