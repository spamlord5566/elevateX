const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000';

export interface AdminRegistration {
  _id: string;
  registrationId: string;
  name: string;
  email: string;
  phone: string;
  trackId: string;
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

export async function fetchRegistrationFee(): Promise<number> {
  const res = await fetch(`${BASE_URL}/api/registration-fee`);
  if (!res.ok) throw new Error('Failed to fetch registration fee');
  const json = await res.json();
  return Number(json.fee ?? 0);
}

export async function adminLogin(password: string): Promise<{ success: boolean; token: string; message: string }> {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const json = await res.json();
    return { success: res.ok, token: json.token || '', message: json.message || '' };
  } catch (_err) {
    return { success: false, token: '', message: 'Network error. Please try again.' };
  }
}

export async function getAdminRegistrations(token: string): Promise<AdminRegistration[]> {
  const res = await fetch(`${BASE_URL}/api/admin/registrations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch admin registrations');
  const json = await res.json();
  return json.data as AdminRegistration[];
}

export async function updateRegistrationFee(token: string, fee: number): Promise<{ success: boolean; fee: number; message: string }> {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/registration-fee`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ fee }),
    });
    const json = await res.json();
    return { success: res.ok, fee: json.fee ?? fee, message: json.message || 'Fee update failed' };
  } catch (_err) {
    return { success: false, fee, message: 'Network error. Please try again.' };
  }
}

export async function updateRegistrationVerification(token: string, id: string, status: 'Pending Verification' | 'Verified' | 'Rejected', paymentAmountChecked?: number | null, rejectionReason?: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/registrations/${id}/verification`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status, paymentAmountChecked, rejectionReason }),
    });
    const json = await res.json();
    return { success: res.ok, message: json.message || 'Verification update failed' };
  } catch (_err) {
    return { success: false, message: 'Network error. Please try again.' };
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
