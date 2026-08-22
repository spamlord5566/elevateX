const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/uploadMiddleware');

const {
  registerTeam,
  getRegistrationFee,
  updateRegistrationFee,
  getTracks,
  getGuidelines,
  getLeaderboard,
  adminLogin,
  getAdminRegistrations,
  getRegistrationById,
  getPaymentScreenshot,
  updateTeamVerification,
  sendVerificationEmailToRegistration,
  sendRejectionEmailToRegistration,
} = require('../controllers/registrationController');

const { validateRegistration } = require('../middleware/validationMiddleware');
const { adminAuth } = require('../middleware/authMiddleware');

router.get('/registration-fee', getRegistrationFee);
router.post('/register', upload.single('paymentScreenshot'), validateRegistration, registerTeam);
router.get('/tracks', getTracks);
router.get('/guidelines', getGuidelines);
router.get('/leaderboard', getLeaderboard);

// Admin Routes
router.post('/admin/login', adminLogin);
router.get('/admin/registrations', adminAuth, getAdminRegistrations);
router.get('/admin/registrations/:id', adminAuth, getRegistrationById);
router.get('/admin/registrations/:id/payment-screenshot', adminAuth, getPaymentScreenshot);
router.patch('/admin/registrations/:id/verification', adminAuth, updateTeamVerification);
router.post('/admin/registrations/:id/send-verification-email', adminAuth, sendVerificationEmailToRegistration);
router.post('/admin/registrations/:id/send-rejection-email', adminAuth, sendRejectionEmailToRegistration);
router.patch('/admin/registration-fee', adminAuth, updateRegistrationFee);

module.exports = router;
