'use client';

import { useEffect, useState } from 'react';
import {
  adminLogin,
  fetchRegistrationFee,
  getAdminRegistrations,
  sendRejectionEmail,
  sendVerificationEmail,
  updateRegistrationFee,
  updateRegistrationVerification,
  type AdminRegistration,
} from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { AlertCircle, LogOut, RefreshCw, Search, Zap } from 'lucide-react';
import styles from './Admin.module.css';

const TRACKS_MAP: Record<string, string> = {
  'ai-ml': 'AI & Machine Learning',
  web3: 'Web3 & Blockchain',
  'open-innovation': 'Open Innovation',
  sustainability: 'Sustainability & Climate Tech',
  fintech: 'FinTech & Payments',
  healthtech: 'Health & MedTech',
};

const formatDate = (value: string) => new Date(value).toLocaleString();

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [registrations, setRegistrations] = useState<AdminRegistration[]>([]);
  const [selectedReg, setSelectedReg] = useState<AdminRegistration | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [trackFilter, setTrackFilter] = useState('ALL');
  const [feeInput, setFeeInput] = useState('200');
  const [rejectionReason, setRejectionReason] = useState('');
  const [amountChecked, setAmountChecked] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const savedToken = sessionStorage.getItem('elevate_admin_token');
    if (savedToken) setToken(savedToken);
  }, []);

  useEffect(() => {
    if (token) {
      fetchData(token);
      fetchRegistrationFee().then((fee) => setFeeInput(String(fee))).catch(() => setFeeInput('200'));
    } else {
      setRegistrations([]);
      setSelectedReg(null);
      setScreenshotUrl(null);
    }
  }, [token]);

  useEffect(() => {
    if (!selectedReg || !token) {
      setScreenshotUrl(null);
      return;
    }

    const imageUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/api/admin/registrations/${selectedReg._id}/payment-screenshot`;
    const controller = new AbortController();

    fetch(imageUrl, { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal })
      .then((res) => res.ok ? res.blob() : null)
      .then((blob) => setScreenshotUrl(blob && blob.size > 0 ? URL.createObjectURL(blob) : null))
      .catch(() => setScreenshotUrl(null));

    return () => {
      controller.abort();
      if (screenshotUrl) URL.revokeObjectURL(screenshotUrl);
    };
  }, [selectedReg, token]);

  const fetchData = async (authToken: string) => {
    setLoading(true);
    try {
      const data = await getAdminRegistrations(authToken);
      setRegistrations(data);
      if (data.length > 0 && (!selectedReg || !data.some((registration) => registration._id === selectedReg._id))) {
        setSelectedReg(data[0]);
      }
    } catch (_err) {
      addToast('Failed to load registrations. Session may have expired.', 'error');
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginError('');
    if (!password) return;

    setLoading(true);
    const result = await adminLogin(password);
    setLoading(false);

    if (result.success && result.token) {
      sessionStorage.setItem('elevate_admin_token', result.token);
      setToken(result.token);
      setPassword('');
      addToast('Authenticated successfully as Admin', 'success');
    } else {
      setLoginError(result.message || 'Invalid admin password');
      addToast(result.message || 'Invalid admin password', 'error');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('elevate_admin_token');
    setToken(null);
  };

  const handleFeeSave = async () => {
    if (!token) return;
    const parsed = Number(feeInput);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      addToast('Please enter a valid registration fee greater than zero.', 'error');
      return;
    }
    const result = await updateRegistrationFee(token, parsed);
    addToast(result.message, result.success ? 'success' : 'error');
    if (result.success) setFeeInput(String(result.fee));
  };

  const handleStatusUpdate = async (id: string, status: 'Pending Verification' | 'Verified' | 'Rejected', paymentAmountChecked?: number | null, reason?: string) => {
    if (!token) return;
    const result = await updateRegistrationVerification(token, id, status, paymentAmountChecked ?? null, reason);
    if (!result.success) {
      addToast(result.message, 'error');
      return;
    }

    const update = (registration: AdminRegistration) => registration._id === id
      ? {
          ...registration,
          verificationStatus: status,
          paymentAmountChecked: paymentAmountChecked ?? registration.paymentAmountChecked,
          rejectionReason: status === 'Rejected' ? reason ?? null : null,
        }
      : registration;
    setRegistrations((previous) => previous.map(update));
    setSelectedReg((previous) => previous ? update(previous) : null);
    addToast(`Registration status updated to ${status}`, 'success');
  };

  const handleEmail = async (id: string, kind: 'verification' | 'rejection') => {
    if (!token) return;
    const result = kind === 'verification'
      ? await sendVerificationEmail(token, id)
      : await sendRejectionEmail(token, id);
    addToast(result.message, result.success ? 'success' : 'error');
    if (!result.success) return;

    const update = (registration: AdminRegistration) => registration._id === id
      ? { ...registration, [kind === 'verification' ? 'verificationEmailSent' : 'rejectionEmailSent']: true }
      : registration;
    setRegistrations((previous) => previous.map(update));
    setSelectedReg((previous) => previous ? update(previous) : null);
  };

  const filteredRegs = registrations.filter((registration) => {
    const query = searchQuery.toLowerCase().trim();
    const searchable = [registration.registrationId, registration.name, registration.email, registration.phone, registration.trackId].map((value) => String(value || '').toLowerCase());
    const matchesSearch = !query || searchable.some((value) => value.includes(query));
    const matchesStatus = statusFilter === 'ALL' || registration.verificationStatus === statusFilter;
    const matchesTrack = trackFilter === 'ALL' || registration.trackId === trackFilter;
    return matchesSearch && matchesStatus && matchesTrack;
  });

  const totalCount = registrations.length;
  const verifiedCount = registrations.filter((registration) => registration.verificationStatus === 'Verified').length;
  const pendingCount = registrations.filter((registration) => registration.verificationStatus === 'Pending Verification').length;

  if (!token) {
    return (
      <main className={styles.main}>
        <div aria-hidden="true" className={styles.background} />
        <div className={styles.loginContainer}>
          <div className={styles.loginCard}>
            <div className={styles.brandRow}>
              <Zap size={28} className={styles.brandIcon} aria-hidden="true" />
              <span className={styles.brand}>ELEVATE<span className={styles.wordmarkX}>X</span></span>
            </div>
            <h1 className={styles.loginTitle}>Admin Console</h1>
            <p className={styles.loginSubtitle}>Enter password to manage event registrations</p>
            <form onSubmit={handleLogin} className={styles.formGroup}>
              <Input id="admin-password-input" label="Admin Password" type="password" placeholder="••••••••" value={password} onChange={(event) => setPassword(event.target.value)} error={loginError} />
              <Button variant="primary" type="submit" className="w-full" id="admin-login-submit" disabled={loading}>{loading ? 'Authenticating...' : 'Access Dashboard'}</Button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div aria-hidden="true" className={styles.background} />
      <div className={styles.dashboardContainer}>
        <header className={styles.header}>
          <div className={styles.headerTitleRow}>
            <h1 className={styles.headerTitle}>Elevate Admin</h1>
            <p className={styles.headerSubtitle}>Review registrations and verify payments</p>
          </div>
          <div className={styles.headerActions}>
            <Button variant="outline" size="sm" onClick={() => fetchData(token)} disabled={loading}><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></Button>
            <Button variant="outline" size="sm" onClick={handleLogout}><LogOut size={16} className="mr-2" /> Logout</Button>
          </div>
        </header>

        <section className={styles.statsGrid}>
          <div className={styles.statCard}><span className={styles.statLabel}>Total Registrations</span><span className={styles.statValue}>{totalCount}</span></div>
          <div className={styles.statCard}><span className={styles.statLabel}>Verified Payments</span><span className={`${styles.statValue} ${styles.statValueYellow}`}>{verifiedCount}</span></div>
          <div className={styles.statCard}><span className={styles.statLabel}>Pending Verification</span><span className={styles.statValue}>{pendingCount}</span></div>
        </section>

        <section className={styles.controlsRow}>
          <div className={styles.searchWrapper}><Search className={styles.searchIcon} size={18} /><input type="text" placeholder="Search registration ID, name, email or phone..." className={styles.searchInput} value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} /></div>
          <select className={styles.filterSelect} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="Pending Verification">Pending Verification</option>
            <option value="Verified">Verified</option>
            <option value="Rejected">Rejected</option>
          </select>
          <select className={styles.filterSelect} value={trackFilter} onChange={(event) => setTrackFilter(event.target.value)}>
            <option value="ALL">All Tracks</option>
            {Object.entries(TRACKS_MAP).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
        </section>

        <section className={styles.feePanel}>
          <div className={styles.feeHeader}><h3>Registration Fee Management</h3></div>
          <div className={styles.feeRow}>
            <label htmlFor="registration-fee">Current Fee (₹ per participant)</label>
            <div className={styles.feeControls}>
              <Input id="registration-fee" type="number" min="1" step="1" value={feeInput} onChange={(event) => setFeeInput(event.target.value)} />
              <Button variant="primary" size="sm" onClick={handleFeeSave}>Save Fee</Button>
            </div>
          </div>
        </section>

        <div className={styles.panels}>
          <div className={styles.listPanel}>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Registration ID</th>
                    <th>Participant</th>
                    <th>Track</th>
                    <th>Email</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegs.length > 0 ? filteredRegs.map((registration) => (
                    <tr key={registration._id} onClick={() => setSelectedReg(registration)} className={`${styles.rowSelectable} ${selectedReg?._id === registration._id ? styles.rowActive : ''}`}>
                      <td>{registration.registrationId}</td>
                      <td>{registration.name}</td>
                      <td>{TRACKS_MAP[registration.trackId] || registration.trackId}</td>
                      <td>{registration.email}</td>
                      <td><span className={`${styles.badge} ${registration.verificationStatus === 'Verified' ? styles.badgeVerified : registration.verificationStatus === 'Rejected' ? styles.badgeRejected : styles.badgePending}`}>{registration.verificationStatus}</span></td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className={styles.emptyState}>{loading ? 'Loading registrations...' : 'No registrations match your search criteria.'}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.detailsPanel}>
            {selectedReg ? (
              <>
                <div className={styles.detailsHeader}>
                  <h2 className={styles.detailsParticipantName}>{selectedReg.name}</h2>
                  <p className={styles.detailsRegistrationId}>ID: {selectedReg.registrationId}</p>
                </div>

                <div className={styles.detailsSection}><span className={styles.detailsLabel}>Participant Information</span><p className={styles.detailsValue}>{selectedReg.name}</p><p className={styles.detailsValue}>{selectedReg.email}</p><p className={styles.detailsValue}>{selectedReg.phone}</p></div>
                <div className={styles.detailsSection}><span className={styles.detailsLabel}>Registration Details</span><p className={styles.detailsValue}>Track: {TRACKS_MAP[selectedReg.trackId] || selectedReg.trackId}</p><p className={styles.detailsValue}>Registered: {formatDate(selectedReg.createdAt)}</p></div>
                <div className={styles.detailsSection}><span className={styles.detailsLabel}>Payment Information</span><p className={styles.detailsValue}>Registration fee: ₹{selectedReg.feePerParticipantAtRegistration}</p><p className={styles.detailsValue}>Total paid amount expected: ₹{selectedReg.totalRegistrationFee}</p>{selectedReg.paymentAmountChecked !== null && selectedReg.paymentAmountChecked !== undefined && <p className={styles.detailsValue}>Amount checked: ₹{selectedReg.paymentAmountChecked}</p>}<p className={styles.detailsValue}>Status: {selectedReg.verificationStatus}</p></div>

                {screenshotUrl ? (
                  <div className={styles.detailsSection}>
                    <span className={styles.detailsLabel}>Payment Screenshot</span>
                    <img src={screenshotUrl} alt="Payment screenshot" className={styles.paymentImage} />
                  </div>
                ) : (
                  <div className={styles.detailsSection}><span className={styles.detailsLabel}>Payment Screenshot</span><p className={styles.detailsValue}>Not available</p></div>
                )}

                {selectedReg.rejectionReason && <div className={styles.detailsSection}><span className={styles.detailsLabel}>Rejection Reason</span><p className={styles.detailsValue}>{selectedReg.rejectionReason}</p></div>}

                <div className={styles.actionsBox}>
                  <div className={styles.amountBox}>
                    <label htmlFor="checked-amount" className={styles.detailsLabel}>Expected Amount: ₹{selectedReg.totalRegistrationFee}</label>
                    <Input id="checked-amount" type="number" value={amountChecked || selectedReg.totalRegistrationFee} onChange={(event) => setAmountChecked(event.target.value)} placeholder="Enter checked amount" />
                  </div>
                  <textarea value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} className={styles.reasonInput} placeholder="Rejection reason required before rejecting a registration" />
                  <div className={styles.statusToggleRow}>
                    <Button variant="primary" size="sm" onClick={() => handleStatusUpdate(selectedReg._id, 'Verified', Number(amountChecked || selectedReg.totalRegistrationFee))}>Verify</Button>
                    <Button variant="secondary" size="sm" onClick={() => { if (!rejectionReason.trim()) { addToast('A rejection reason is required.', 'error'); return; } handleStatusUpdate(selectedReg._id, 'Rejected', Number(amountChecked || selectedReg.totalRegistrationFee), rejectionReason); }}><AlertCircle size={16} className="mr-2" /> Reject</Button>
                  </div>
                </div>

                <div className={styles.actionsBox}>
                  <div className={styles.statusToggleRow}>
                    <Button variant="outline" size="sm" onClick={() => handleEmail(selectedReg._id, 'verification')} disabled={selectedReg.verificationStatus !== 'Verified' || selectedReg.verificationEmailSent}>Send Verification Email</Button>
                    <Button variant="outline" size="sm" onClick={() => handleEmail(selectedReg._id, 'rejection')} disabled={selectedReg.verificationStatus !== 'Rejected' || selectedReg.rejectionEmailSent}>Send Rejection Email</Button>
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>Select a registration from the list to view participant details.</div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
