import type { Track, GuidelineSection, LeaderboardEntry } from './mocks/mockServer';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000';

export type { Track, GuidelineSection, LeaderboardEntry };

export interface Participant {
  name: string;
  email: string;
  phone: string;
}

export interface RegistrationPayload {
  teamName: string;
  trackId: string;
  leaderName: string;
  leaderEmail: string;
  leaderPhone: string;
  members: Participant[];
}

export interface RegistrationResult {
  success: boolean;
  teamId: string;
  registrationId?: string;
  message: string;
  registration?: {
    teamId: string;
    participantCount: number;
    totalRegistrationFee: number;
    verificationStatus: string;
  };
}

export interface AdminRegistration {
  _id: string;
  teamId: string;
  teamName: string;
  trackId: string;
  leaderName: string;
  leaderEmail: string;
  leaderPhone: string;
  members: Participant[];
  participantCount: number;
  feePerParticipantAtRegistration: number;
  totalRegistrationFee: number;
  paymentScreenshot?: {
    originalName?: string;
    mimeType?: string;
    size?: number;
    fileName?: string;
    path?: string;
    url?: string;
  };
  verificationStatus: 'Pending Verification' | 'Verified' | 'Rejected';
  paymentAmountChecked?: number | null;
  rejectionReason?: string | null;
  verificationEmailSent?: boolean;
  rejectionEmailSent?: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function fetchTracks(): Promise<Track[]> {
  const res = await fetch(`${BASE_URL}/api/tracks`);
  if (!res.ok) throw new Error('Failed to fetch tracks');
  const json = await res.json();
  return json.data as Track[];
}

export async function fetchGuidelines(): Promise<GuidelineSection[]> {
  const res = await fetch(`${BASE_URL}/api/guidelines`);
  if (!res.ok) throw new Error('Failed to fetch guidelines');
  const json = await res.json();
  return json.data as GuidelineSection[];
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch(`${BASE_URL}/api/leaderboard`);
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  const json = await res.json();
  return json.data as LeaderboardEntry[];
}

export async function fetchRegistrationFee(): Promise<number> {
  const res = await fetch(`${BASE_URL}/api/registration-fee`);
  if (!res.ok) throw new Error('Failed to fetch registration fee');
  const json = await res.json();
  return Number(json.fee ?? 0);
}

export async function registerTeam(
  payload: RegistrationPayload,
  file: File | null,
): Promise<RegistrationResult> {
  try {
    const formData = new FormData();
    formData.append('teamName', payload.teamName);
    formData.append('trackId', payload.trackId);
    formData.append('leaderName', payload.leaderName);
    formData.append('leaderEmail', payload.leaderEmail);
    formData.append('leaderPhone', payload.leaderPhone);
    formData.append('members', JSON.stringify(payload.members));
    if (file) formData.append('paymentScreenshot', file);

    const res = await fetch(`${BASE_URL}/api/register`, {
      method: 'POST',
      body: formData,
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
  } catch (_err) {
    return {
      success: false,
      teamId: '',
      message: 'Network error. Please try again.',
    };
  }
}

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
  } catch (_err) {
    return {
      success: false,
      token: '',
      message: 'Network error. Please try again.',
    };
  }
}

export async function getAdminRegistrations(
  token: string,
): Promise<AdminRegistration[]> {
  const res = await fetch(`${BASE_URL}/api/admin/registrations`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch admin registrations');
  const json = await res.json();
  return json.data as AdminRegistration[];
}

export async function updateRegistrationFee(
  token: string,
  fee: number,
): Promise<{ success: boolean; fee: number; message: string }> {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/registration-fee`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ fee }),
    });
    const json = await res.json();
    return {
      success: res.ok,
      fee: json.fee ?? fee,
      message: json.message || 'Fee update failed',
    };
  } catch (_err) {
    return {
      success: false,
      fee,
      message: 'Network error. Please try again.',
    };
  }
}

export async function updateTeamVerification(
  token: string,
  id: string,
  status: 'Pending Verification' | 'Verified' | 'Rejected',
  paymentAmountChecked?: number | null,
  rejectionReason?: string,
): Promise<{ success: boolean; message: string } > {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/registrations/${id}/verification`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status, paymentAmountChecked, rejectionReason }),
    });
    const json = await res.json();
    return {
      success: res.ok,
      message: json.message || 'Verification update failed',
    };
  } catch (_err) {
    return {
      success: false,
      message: 'Network error. Please try again.',
    };
  }
}

export async function sendVerificationEmail(token: string, id: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/registrations/${id}/send-verification-email`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    return { success: res.ok, message: json.message || 'Verification email failed' };
  } catch (_err) {
    return { success: false, message: 'Network error. Please try again.' };
  }
}

export async function sendRejectionEmail(token: string, id: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/registrations/${id}/send-rejection-email`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    return { success: res.ok, message: json.message || 'Rejection email failed' };
  } catch (_err) {
    return { success: false, message: 'Network error. Please try again.' };
  }
}

