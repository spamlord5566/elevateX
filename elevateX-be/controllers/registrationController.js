const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const Registration = require('../models/Registration');
const RegistrationFee = require('../models/RegistrationFee');
const { activeSessions } = require('../middleware/authMiddleware');
const { sendVerificationEmail, sendRejectionEmail } = require('../services/emailService');

const TRACKS = [
  {
    id: 'ai-ml',
    name: 'AI & Machine Learning',
    description: 'Build intelligent systems that learn, predict, and adapt. From NLP models to computer vision — push the frontier of artificial intelligence.',
    icon: '🤖',
    color: '#d4f000',
    maxTeamSize: 4,
    prizePool: '₹1,00,000',
    tags: ['Python', 'TensorFlow', 'PyTorch', 'LLMs'],
  },
  {
    id: 'web3',
    name: 'Web3 & Blockchain',
    description: 'Decentralise everything. Build DeFi protocols, NFT platforms, DAOs, or supply-chain solutions on the blockchain of your choice.',
    icon: '⛓️',
    color: '#a78bfa',
    maxTeamSize: 4,
    prizePool: '₹80,000',
    tags: ['Solidity', 'Ethereum', 'IPFS', 'Hardhat'],
  },
  {
    id: 'open-innovation',
    name: 'Open Innovation',
    description: 'No boundaries, no limits. Solve any real-world problem using any technology stack. Creativity rewarded over conformity.',
    icon: '💡',
    color: '#fb923c',
    maxTeamSize: 4,
    prizePool: '₹60,000',
    tags: ['Any Stack', 'IoT', 'AR/VR', 'Robotics'],
  },
  {
    id: 'sustainability',
    name: 'Sustainability & Climate Tech',
    description: 'Code for the planet. Develop tech solutions that address climate change, renewable energy, waste management, or carbon tracking.',
    icon: '🌿',
    color: '#4ade80',
    maxTeamSize: 4,
    prizePool: '₹70,000',
    tags: ['GreenTech', 'Data', 'APIs', 'Sensors'],
  },
  {
    id: 'fintech',
    name: 'FinTech & Payments',
    description: 'Reimagine finance. Build next-gen payment systems, credit scoring, embedded finance, or financial inclusion tools.',
    icon: '💳',
    color: '#38bdf8',
    maxTeamSize: 4,
    prizePool: '₹75,000',
    tags: ['UPI', 'RazorpayX', 'Open Banking', 'ML'],
  },
  {
    id: 'healthtech',
    name: 'Health & MedTech',
    description: 'Transform healthcare with technology. Telemedicine, diagnostics, mental health apps, or med-data pipelines — all tracks welcome.',
    icon: '🏥',
    color: '#f472b6',
    maxTeamSize: 4,
    prizePool: '₹65,000',
    tags: ['FHIR', 'Wearables', 'NLP', 'Imaging'],
  },
];

const GUIDELINES = [
  { id: 'eligibility', title: 'Eligibility', items: ['Open to all undergraduate and postgraduate students from any recognised institution.', 'Teams of 1–4 members for this registration flow.', 'Each participant may register for only one track.', 'Faculty or industry mentors are welcome as advisors but not as team members.'] },
  { id: 'submission', title: 'Submission Requirements', items: ['Submit a working prototype/demo + 5-minute pitch deck by Day 2 at 10:00 PM IST.', 'Source code must be pushed to a public GitHub repository.', 'Include a README with setup instructions and problem statement.', 'Teams must present live to judges — no pre-recorded videos.'] },
  { id: 'judging', title: 'Judging Criteria', items: ['Innovation & Creativity — 30%', 'Technical Complexity & Execution — 25%', 'Impact & Scalability — 25%', 'Design & User Experience — 20%'] },
  { id: 'conduct', title: 'Code of Conduct', items: ['All work must be original; plagiarism leads to immediate disqualification.', 'Respectful behaviour towards all participants, judges, and volunteers is mandatory.', 'Use of pre-built templates must be disclosed during presentation.', 'Violations will be reviewed by the organising committee whose decision is final.'] },
];

const LEADERBOARD = [
  { rank: 1, teamId: 'TM-0042', teamName: 'Neural Nomads', track: 'AI & Machine Learning', score: 942, submittedAt: '2025-09-14T22:03:00Z' },
  { rank: 2, teamId: 'TM-0017', teamName: 'Chain Reaction', track: 'Web3 & Blockchain', score: 918, submittedAt: '2025-09-14T21:55:00Z' },
  { rank: 3, teamId: 'TM-0089', teamName: 'Green Bits', track: 'Sustainability & Climate Tech', score: 905, submittedAt: '2025-09-14T22:15:00Z' },
  { rank: 4, teamId: 'TM-0034', teamName: 'CashFlow Crusaders', track: 'FinTech & Payments', score: 890, submittedAt: '2025-09-14T22:30:00Z' },
  { rank: 5, teamId: 'TM-0061', teamName: 'HeartBeat Labs', track: 'Health & MedTech', score: 877, submittedAt: '2025-09-14T23:01:00Z' },
];

const DEFAULT_REGISTRATION_FEE = Number(process.env.DEFAULT_REGISTRATION_FEE || 200);

const getCurrentRegistrationFee = async () => {
  const setting = await RegistrationFee.findOne({ key: 'currentRegistrationFee' }).sort({ updatedAt: -1 }).lean();
  return setting ? Number(setting.value) : DEFAULT_REGISTRATION_FEE;
};

const setCurrentRegistrationFee = async (newFee) => {
  const safeFee = Number(newFee);
  if (!Number.isFinite(safeFee) || safeFee <= 0) {
    throw new Error('Registration fee must be a positive number');
  }

  const updated = await RegistrationFee.findOneAndUpdate(
    { key: 'currentRegistrationFee' },
    {
      key: 'currentRegistrationFee',
      value: safeFee,
      lastUpdatedBy: 'admin',
      updatedAt: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return Number(updated.value);
};

const generateUniqueRegistrationId = async () => {
  let isUnique = false;
  let registrationId = '';
  while (!isUnique) {
    const rand = Math.floor(1000 + Math.random() * 9000);
    registrationId = `REG-${rand}`;
    const existing = await Registration.findOne({ registrationId });
    if (!existing) {
      isUnique = true;
    }
  }
  return registrationId;
};

const getRegistrationPayload = (req) => {
  const { name, email, phone, trackId } = req.body;
  return {
    name: String(name || '').trim(),
    email: String(email || '').trim().toLowerCase(),
    phone: String(phone || '').trim(),
    trackId: String(trackId || '').trim(),
  };
};

const registerParticipant = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Payment screenshot is required before registration can be submitted.'
      });
    }

    const payload = getRegistrationPayload(req);
    const { name, email, phone, trackId } = payload;
    const existingRegistration = await Registration.findOne({ email });

    if (existingRegistration) {
      return res.status(409).json({
        success: false,
        message: 'This email address is already registered.'
      });
    }

    const currentFee = await getCurrentRegistrationFee();
    const registrationId = await generateUniqueRegistrationId();

    const registration = new Registration({
      registrationId,
      name,
      email,
      phone,
      trackId,
      feePerParticipantAtRegistration: currentFee,
      totalRegistrationFee: currentFee,
      paymentScreenshot: {
        fileName: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        url: `/api/admin/registrations/${req.file.filename}`,
        uploadedAt: new Date(),
      },
      verificationStatus: 'Pending Verification',
      paymentAmountChecked: null,
      rejectionReason: null,
      verifiedAt: null,
      rejectedAt: null,
      verificationEmailSent: false,
      rejectionEmailSent: false,
    });

    await registration.save();

    res.status(201).json({
      success: true,
      registrationId,
      id: registration._id,
      message: 'Registration over. Verification pending. You may exit.',
      registration: {
        registrationId,
        name,
        email,
        trackId,
        totalRegistrationFee: currentFee,
        verificationStatus: 'Pending Verification',
      }
    });
  } catch (error) {
    next(error);
  }
};

const getRegistrationFee = async (req, res, next) => {
  try {
    const fee = await getCurrentRegistrationFee();
    res.status(200).json({
      success: true,
      fee,
    });
  } catch (error) {
    next(error);
  }
};

const updateRegistrationFee = async (req, res, next) => {
  try {
    const fee = Number(req.body?.fee ?? req.body?.value ?? req.body?.registrationFee);
    const updatedFee = await setCurrentRegistrationFee(fee);
    res.status(200).json({
      success: true,
      fee: updatedFee,
      message: `Registration fee updated to ₹${updatedFee}`
    });
  } catch (error) {
    next(error);
  }
};

const getTracks = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: TRACKS });
  } catch (error) {
    next(error);
  }
};

const getGuidelines = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: GUIDELINES });
  } catch (error) {
    next(error);
  }
};

const getLeaderboard = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: LEADERBOARD });
  } catch (error) {
    next(error);
  }
};

const adminLogin = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ success: false, message: 'Invalid admin password' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    activeSessions.add(token);

    res.status(200).json({ success: true, token, message: 'Logged in successfully' });
  } catch (error) {
    next(error);
  }
};

const getAdminRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: registrations,
    });
  } catch (error) {
    next(error);
  }
};

const getRegistrationById = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }
    res.status(200).json({ success: true, data: registration });
  } catch (error) {
    next(error);
  }
};

const getPaymentScreenshot = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration || !registration.paymentScreenshot?.path) {
      return res.status(404).json({ success: false, message: 'Payment screenshot not found' });
    }

    if (!fs.existsSync(registration.paymentScreenshot.path)) {
      return res.status(404).json({ success: false, message: 'Stored payment screenshot missing' });
    }

    res.sendFile(registration.paymentScreenshot.path);
  } catch (error) {
    next(error);
  }
};

const updateTeamVerification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, paymentAmountChecked, rejectionReason } = req.body;
    const normalizedStatus = String(status || '').trim();
    const validStatuses = ['Pending Verification', 'Verified', 'Rejected'];

    if (!validStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification status. Use Pending Verification, Verified, or Rejected.',
      });
    }

    const registration = await Registration.findById(id);
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    if (normalizedStatus === 'Verified') {
      if (registration.verificationStatus === 'Rejected') {
        return res.status(400).json({ success: false, message: 'A rejected registration cannot be verified.' });
      }
      registration.verificationStatus = 'Verified';
      registration.verifiedAt = new Date();
      registration.rejectedAt = null;
      registration.rejectionReason = null;
      if (paymentAmountChecked !== undefined && paymentAmountChecked !== null && paymentAmountChecked !== '') {
        registration.paymentAmountChecked = Number(paymentAmountChecked);
      }
    }

    if (normalizedStatus === 'Rejected') {
      if (registration.verificationStatus === 'Verified') {
        return res.status(400).json({ success: false, message: 'A verified registration cannot be rejected.' });
      }
      const reason = String(rejectionReason || '').trim();
      if (!reason) {
        return res.status(400).json({ success: false, message: 'Rejection reason is required.' });
      }
      registration.verificationStatus = 'Rejected';
      registration.rejectedAt = new Date();
      registration.rejectionReason = reason;
      if (paymentAmountChecked !== undefined && paymentAmountChecked !== null && paymentAmountChecked !== '') {
        registration.paymentAmountChecked = Number(paymentAmountChecked);
      }
    }

    if (normalizedStatus === 'Pending Verification') {
      if (registration.verificationStatus === 'Verified' || registration.verificationStatus === 'Rejected') {
        return res.status(400).json({ success: false, message: 'A verified or rejected registration cannot be moved back to pending.' });
      }
      registration.verificationStatus = 'Pending Verification';
      registration.rejectedAt = null;
      registration.verifiedAt = null;
      registration.rejectionReason = null;
    }

    await registration.save();

    res.status(200).json({
      success: true,
      data: registration,
      message: `Status updated to ${registration.verificationStatus}`,
    });
  } catch (error) {
    next(error);
  }
};

const sendVerificationEmailToRegistration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const registration = await Registration.findById(id);
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    if (registration.verificationStatus !== 'Verified') {
      return res.status(400).json({ success: false, message: 'Only verified registrations can receive a verification email.' });
    }

    if (registration.verificationEmailSent) {
      return res.status(409).json({ success: false, message: 'Verification email has already been sent.' });
    }

    const sent = await sendVerificationEmail(registration);
    if (!sent) {
      return res.status(503).json({ success: false, message: 'Verification email could not be sent right now.' });
    }

    registration.verificationEmailSent = true;
    registration.verificationEmailSentAt = new Date();
    await registration.save();

    res.status(200).json({ success: true, message: 'Verification email sent to all participants.' });
  } catch (error) {
    next(error);
  }
};

const sendRejectionEmailToRegistration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const registration = await Registration.findById(id);
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    if (registration.verificationStatus !== 'Rejected') {
      return res.status(400).json({ success: false, message: 'Only rejected registrations can receive a rejection email.' });
    }

    if (registration.rejectionEmailSent) {
      return res.status(409).json({ success: false, message: 'Rejection email has already been sent.' });
    }

    const sent = await sendRejectionEmail(registration);
    if (!sent) {
      return res.status(503).json({ success: false, message: 'Rejection email could not be sent right now.' });
    }

    registration.rejectionEmailSent = true;
    registration.rejectionEmailSentAt = new Date();
    await registration.save();

    res.status(200).json({ success: true, message: 'Rejection email sent to all participants.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerParticipant,
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
};

