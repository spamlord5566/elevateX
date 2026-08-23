/**
 * Mock Server — lightweight in-memory data store.
 * Simulates a backend API returning realistic data.
 *
 * TODO: Replace with real DB/ORM (e.g., Prisma + Postgres)
 *       and real auth/cloudinary integrations when going
 *       to production.
 */

// ─── Types ────────────────────────────────────────────────

export interface Track {
  id: string;
  name: string;
  description: string;
  icon: string;         // emoji or icon name
  color: string;        // tailwind-compatible hex or CSS colour
  maxTeamSize: number;
  prizePool: string;
  tags: string[];
}

export interface GuidelineSection {
  id: string;
  title: string;
  items: string[];
}

export interface LeaderboardEntry {
  rank: number;
  teamId: string;
  teamName: string;
  track: string;
  score: number;
  submittedAt: string;
}

// ─── Mock Data ────────────────────────────────────────────

export const MOCK_TRACKS: Track[] = [
  {
    id: 'ai-ml',
    name: 'AI & Machine Learning',
    description:
      'Build intelligent systems that learn, predict, and adapt. From NLP models to computer vision — push the frontier of artificial intelligence.',
    icon: '🤖',
    color: '#d4f000',
    maxTeamSize: 4,
    prizePool: '₹1,00,000',
    tags: ['Python', 'TensorFlow', 'PyTorch', 'LLMs'],
  },
  {
    id: 'web3',
    name: 'Web3 & Blockchain',
    description:
      'Decentralise everything. Build DeFi protocols, NFT platforms, DAOs, or supply-chain solutions on the blockchain of your choice.',
    icon: '⛓️',
    color: '#a78bfa',
    maxTeamSize: 4,
    prizePool: '₹80,000',
    tags: ['Solidity', 'Ethereum', 'IPFS', 'Hardhat'],
  },
  {
    id: 'open-innovation',
    name: 'Open Innovation',
    description:
      'No boundaries, no limits. Solve any real-world problem using any technology stack. Creativity rewarded over conformity.',
    icon: '💡',
    color: '#fb923c',
    maxTeamSize: 5,
    prizePool: '₹60,000',
    tags: ['Any Stack', 'IoT', 'AR/VR', 'Robotics'],
  },
  {
    id: 'sustainability',
    name: 'Sustainability & Climate Tech',
    description:
      'Code for the planet. Develop tech solutions that address climate change, renewable energy, waste management, or carbon tracking.',
    icon: '🌿',
    color: '#4ade80',
    maxTeamSize: 4,
    prizePool: '₹70,000',
    tags: ['GreenTech', 'Data', 'APIs', 'Sensors'],
  },
  {
    id: 'fintech',
    name: 'FinTech & Payments',
    description:
      'Reimagine finance. Build next-gen payment systems, credit scoring, embedded finance, or financial inclusion tools.',
    icon: '💳',
    color: '#38bdf8',
    maxTeamSize: 4,
    prizePool: '₹75,000',
    tags: ['UPI', 'RazorpayX', 'Open Banking', 'ML'],
  },
  {
    id: 'healthtech',
    name: 'Health & MedTech',
    description:
      'Transform healthcare with technology. Telemedicine, diagnostics, mental health apps, or med-data pipelines — all tracks welcome.',
    icon: '🏥',
    color: '#f472b6',
    maxTeamSize: 4,
    prizePool: '₹65,000',
    tags: ['FHIR', 'Wearables', 'NLP', 'Imaging'],
  },
];

export const MOCK_GUIDELINES: GuidelineSection[] = [
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

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, teamId: 'TM-0042', teamName: 'Neural Nomads', track: 'AI & Machine Learning', score: 942, submittedAt: '2025-09-14T22:03:00Z' },
  { rank: 2, teamId: 'TM-0017', teamName: 'Chain Reaction', track: 'Web3 & Blockchain', score: 918, submittedAt: '2025-09-14T21:55:00Z' },
  { rank: 3, teamId: 'TM-0089', teamName: 'Green Bits', track: 'Sustainability & Climate Tech', score: 905, submittedAt: '2025-09-14T22:15:00Z' },
  { rank: 4, teamId: 'TM-0034', teamName: 'CashFlow Crusaders', track: 'FinTech & Payments', score: 890, submittedAt: '2025-09-14T22:30:00Z' },
  { rank: 5, teamId: 'TM-0061', teamName: 'HeartBeat Labs', track: 'Health & MedTech', score: 877, submittedAt: '2025-09-14T23:01:00Z' },
];

// ─── Mock API Handler ─────────────────────────────────────

/**
 * Simulates a network delay (150–400 ms) like a real server.
 */
async function simulateDelay(ms = 250): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, ms));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MockEndpoint = () => Promise<any>;

const endpoints: Record<string, MockEndpoint> = {
  '/api/mock/tracks': async () => {
    await simulateDelay(200);
    return { data: MOCK_TRACKS };
  },
  '/api/mock/guidelines': async () => {
    await simulateDelay(180);
    return { data: MOCK_GUIDELINES };
  },
  '/api/mock/leaderboard': async () => {
    await simulateDelay(220);
    return { data: MOCK_LEADERBOARD };
  },
};

/**
 * Dispatch a mock fetch — used by client-side mock interceptor.
 */
export async function mockFetch(path: string) {
  const handler = endpoints[path];
  if (!handler) {
    throw new Error(`Mock endpoint not found: ${path}`);
  }
  return handler();
}
