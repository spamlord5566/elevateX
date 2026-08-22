const crypto = require('crypto');
const Registration = require('../models/Registration');
const { activeSessions } = require('../middleware/authMiddleware');

// Static Data matching the frontend's mockServer
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
    maxTeamSize: 5,
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
  {
    id: 'eligibility',
    title: 'Eligibility',
    items: [
      'Open to all undergraduate and postgraduate students from any recognised institution.',
      'Teams of 2–5 members; solo participation is not permitted.',
      'Each participant may register for only one track.',
      'Faculty or industry mentors are welcome as advisors but not as team members.',
    ],
  },
  {
    id: 'submission',
    title: 'Submission Requirements',
    items: [
      'Submit a working prototype/demo + 5-minute pitch deck by Day 2 at 10:00 PM IST.',
      'Source code must be pushed to a public GitHub repository.',
      'Include a README with setup instructions and problem statement.',
      'Teams must present live to judges — no pre-recorded videos.',
    ],
  },
  {
    id: 'judging',
    title: 'Judging Criteria',
    items: [
      'Innovation & Creativity — 30%',
      'Technical Complexity & Execution — 25%',
      'Impact & Scalability — 25%',
      'Design & User Experience — 20%',
    ],
  },
  {
    id: 'conduct',
    title: 'Code of Conduct',
    items: [
      'All work must be original; plagiarism leads to immediate disqualification.',
      'Respectful behaviour towards all participants, judges, and volunteers is mandatory.',
      'Use of pre-built templates must be disclosed during presentation.',
      'Violations will be reviewed by the organising committee whose decision is final.',
    ],
  },
];

const LEADERBOARD = [
  { rank: 1, teamId: 'TM-0042', teamName: 'Neural Nomads', track: 'AI & Machine Learning', score: 942, submittedAt: '2025-09-14T22:03:00Z' },
  { rank: 2, teamId: 'TM-0017', teamName: 'Chain Reaction', track: 'Web3 & Blockchain', score: 918, submittedAt: '2025-09-14T21:55:00Z' },
  { rank: 3, teamId: 'TM-0089', teamName: 'Green Bits', track: 'Sustainability & Climate Tech', score: 905, submittedAt: '2025-09-14T22:15:00Z' },
  { rank: 4, teamId: 'TM-0034', teamName: 'CashFlow Crusaders', track: 'FinTech & Payments', score: 890, submittedAt: '2025-09-14T22:30:00Z' },
  { rank: 5, teamId: 'TM-0061', teamName: 'HeartBeat Labs', track: 'Health & MedTech', score: 877, submittedAt: '2025-09-14T23:01:00Z' },
];

/**
 * Helper to generate a collision-free 4-digit unique Team ID
 */
const generateUniqueTeamId = async () => {
  let isUnique = false;
  let teamId = '';
  while (!isUnique) {
    const rand = Math.floor(1000 + Math.random() * 9000);
    teamId = `TM-${rand}`;
    const existing = await Registration.findOne({ teamId });
    if (!existing) {
      isUnique = true;
    }
  }
  return teamId;
};

/**
 * @desc    Submit new team registration
 * @route   POST /api/register
 * @access  Public
 */
const registerTeam = async (req, res, next) => {
  try {
    const { teamName, trackId, leaderName, leaderEmail, members } = req.body;

    // 1. Gather all emails to verify uniqueness against database
    const emailsToCheck = [leaderEmail, ...members.map(m => m.email)].map(email => email.toLowerCase().trim());

    // Query DB to see if any email is already registered as a leader or member
    const existingRegistration = await Registration.findOne({
      $or: [
        { leaderEmail: { $in: emailsToCheck } },
        { 'members.email': { $in: emailsToCheck } }
      ]
    });

    if (existingRegistration) {
      return res.status(409).json({
        success: false,
        message: 'One or more email addresses in your team are already registered.'
      });
    }

    // 2. Generate a unique Team ID
    const teamId = await generateUniqueTeamId();

    // 3. Create the registration document
    const registration = new Registration({
      teamId,
      teamName,
      trackId,
      leaderName,
      leaderEmail,
      members
    });

    await registration.save();

    // 4. Respond with the registered payload
    res.status(201).json({
      success: true,
      teamId,
      message: `Team "${teamName}" registered successfully!`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all tracks
 * @route   GET /api/tracks
 * @access  Public
 */
const getTracks = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: TRACKS
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all guidelines
 * @route   GET /api/guidelines
 * @access  Public
 */
const getGuidelines = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: GUIDELINES
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get leaderboard
 * @route   GET /api/leaderboard
 * @access  Public
 */
const getLeaderboard = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: LEADERBOARD
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin login
 * @route   POST /api/admin/login
 * @access  Public
 */
const adminLogin = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin password'
      });
    }

    // Generate secure session token
    const token = crypto.randomBytes(32).toString('hex');
    activeSessions.add(token);

    res.status(200).json({
      success: true,
      token,
      message: 'Logged in successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all registrations
 * @route   GET /api/admin/registrations
 * @access  Private (Admin)
 */
const getAdminRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: registrations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update team verification status
 * @route   PATCH /api/admin/registrations/:id/verification
 * @access  Private (Admin)
 */
const updateTeamVerification = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!status || !['PENDING', 'VERIFIED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification status. Must be PENDING or VERIFIED.'
      });
    }

    const registration = await Registration.findByIdAndUpdate(
      id,
      { verificationStatus: status },
      { new: true }
    );

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    res.status(200).json({
      success: true,
      data: registration,
      message: `Status updated to ${status}`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerTeam,
  getTracks,
  getGuidelines,
  getLeaderboard,
  adminLogin,
  getAdminRegistrations,
  updateTeamVerification
};
