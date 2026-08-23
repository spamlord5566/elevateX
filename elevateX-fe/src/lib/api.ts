import type { Track, GuidelineSection, LeaderboardEntry } from './mocks/mockServer';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000';

export type { Track, GuidelineSection, LeaderboardEntry };

export interface RegistrationPayload {
  name: string;
  email: string;
  phone: string;
  trackId: string;
}

export interface RegistrationResult {
  success: boolean;
  registrationId: string;
  id?: string;
  message: string;
  registration?: {
    registrationId: string;
    name: string;
    email: string;
    trackId: string;
    totalRegistrationFee: number;
    verificationStatus: string;
  };
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

export async function registerParticipant(
  payload: RegistrationPayload,
  file: File | null,
): Promise<RegistrationResult> {
  try {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('email', payload.email);
    formData.append('phone', payload.phone);
    formData.append('trackId', payload.trackId);
    if (file) formData.append('paymentScreenshot', file);

    const res = await fetch(`${BASE_URL}/api/register`, {
      method: 'POST',
      body: formData,
    });

    const json = await res.json();
    if (!res.ok) {
      return {
        success: false,
        registrationId: '',
        message: json.message || 'Registration failed.',
      };
    }

    return json as RegistrationResult;
  } catch (_err) {
    return {
      success: false,
      registrationId: '',
      message: 'Network error. Please try again.',
    };
  }
}


