const express = require('express');
const router = express.Router();

const {
  registerTeam,
  getTracks,
  getGuidelines,
  getLeaderboard,
  adminLogin,
  getAdminRegistrations,
  updateTeamVerification
} = require('../controllers/registrationController');

const { validateRegistration } = require('../middleware/validationMiddleware');
const { adminAuth } = require('../middleware/authMiddleware');

router.post('/register', validateRegistration, registerTeam);
router.get('/tracks', getTracks);
router.get('/guidelines', getGuidelines);
router.get('/leaderboard', getLeaderboard);

// Admin Routes
router.post('/admin/login', adminLogin);
router.get('/admin/registrations', adminAuth, getAdminRegistrations);
router.patch('/admin/registrations/:id/verification', adminAuth, updateTeamVerification);

module.exports = router;
