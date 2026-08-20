/**
 * API client layer.
 *
 * All data fetching goes through here so that swapping
 * from mock to real backend only requires changing this file.
 *
 * TODO: Replace mockFetch calls with real fetch() calls pointing
 *       to your production API (e.g. NEXT_PUBLIC_APP_URL/api/...).
 */

import {
  mockFetch,
  mockRegister,
  type Track,
  type GuidelineSection,
  type LeaderboardEntry,
  type RegistrationPayload,
  type RegistrationResult,
} from './mocks/mockServer';

// ─── Re-export types for consumers ────────────────────────
export type {
  Track,
  GuidelineSection,
  LeaderboardEntry,
  RegistrationPayload,
  RegistrationResult,
};

// ─── Fetch helpers ────────────────────────────────────────

/**
 * Returns the list of hackathon tracks.
 *
 * TODO: Replace with:
 *   const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/tracks`);
 *   return (await res.json()).data as Track[];
 */
export async function fetchTracks(): Promise<Track[]> {
  const res = await mockFetch('/api/mock/tracks');
  return res.data as Track[];
}

/**
 * Returns the full guidelines document sections.
 */
export async function fetchGuidelines(): Promise<GuidelineSection[]> {
  const res = await mockFetch('/api/mock/guidelines');
  return res.data as GuidelineSection[];
}

/**
 * Returns the current leaderboard snapshot.
 */
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await mockFetch('/api/mock/leaderboard');
  return res.data as LeaderboardEntry[];
}

/**
 * Submits a team registration.
 */
export async function registerTeam(
  payload: RegistrationPayload,
): Promise<RegistrationResult> {
  // TODO: Replace with:
  //   const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/register`, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(payload),
  //   });
  //   return res.json() as Promise<RegistrationResult>;
  return mockRegister(payload);
}
