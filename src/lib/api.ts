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

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000';

// ─── Re-export types for consumers ────────────────────────
export type {
  Track,
  GuidelineSection,
  LeaderboardEntry,
  RegistrationPayload,
  RegistrationResult,
};

export interface AdminRegistration {
  _id: string;
  teamId: string;
  teamName: string;
  trackId: string;
  leaderName: string;
  leaderEmail: string;
  members: { name: string; email: string }[];
  verificationStatus: 'PENDING' | 'VERIFIED';
  createdAt: string;
  updatedAt: string;
}

// ─── Fetch helpers ────────────────────────────────────────

/**
 * Returns the list of hackathon tracks.
 */
export async function fetchTracks(): Promise<Track[]> {
  const res = await fetch(`${BASE_URL}/api/tracks`);
  if (!res.ok) {
    throw new Error('Failed to fetch tracks');
  }
  const json = await res.json();
  return json.data as Track[];
}

/**
 * Returns the full guidelines document sections.
 */
export async function fetchGuidelines(): Promise<GuidelineSection[]> {
  const res = await fetch(`${BASE_URL}/api/guidelines`);
  if (!res.ok) {
    throw new Error('Failed to fetch guidelines');
  }
  const json = await res.json();
  return json.data as GuidelineSection[];
}

/**
 * Returns the current leaderboard snapshot.
 */
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch(`${BASE_URL}/api/leaderboard`);
  if (!res.ok) {
    throw new Error('Failed to fetch leaderboard');
  }
  const json = await res.json();
  return json.data as LeaderboardEntry[];
}

/**
 * Submits a team registration.
 */
export async function registerTeam(
  payload: RegistrationPayload,
): Promise<RegistrationResult> {
  try {
    const res = await fetch(`${BASE_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    const json = await res.json();
    if (!res.ok) {
      return {
        success: false,
        teamId: '',
        message: json.message || 'Registration failed.',
      };
    }
    return json as RegistrationResult;
  } catch (err) {
    return {
      success: false,
      teamId: '',
      message: 'Network error. Please try again.',
    };
  }
}

/**
 * Admin Login.
 */
export async function adminLogin(
  password: string,
): Promise<{ success: boolean; token: string; message: string }> {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const json = await res.json();
    return {
      success: res.ok,
      token: json.token || '',
      message: json.message || '',
    };
  } catch (err) {
    return {
      success: false,
      token: '',
      message: 'Network error. Please try again.',
    };
  }
}

/**
 * Fetch all registrations (Admin only).
 */
export async function getAdminRegistrations(
  token: string,
): Promise<AdminRegistration[]> {
  const res = await fetch(`${BASE_URL}/api/admin/registrations`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error('Failed to fetch admin registrations');
  }
  const json = await res.json();
  return json.data as AdminRegistration[];
}

/**
 * Update verification status of a team (Admin only).
 */
export async function updateTeamVerification(
  token: string,
  id: string,
  status: 'PENDING' | 'VERIFIED',
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/registrations/${id}/verification`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    return {
      success: res.ok,
      message: json.message || 'Verification update failed',
    };
  } catch (err) {
    return {
      success: false,
      message: 'Network error. Please try again.',
    };
  }
}


