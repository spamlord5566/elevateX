const mongoose = require('mongoose');

const registrationFeeSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: 'currentRegistrationFee',
  },
  value: {
    type: Number,
    required: true,
    min: 0,
  },
  lastUpdatedBy: {
    type: String,
    default: 'admin',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('RegistrationFee', registrationFeeSchema);
