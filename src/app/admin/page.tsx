'use client';

import { useState, useEffect } from 'react';
import { adminLogin, fetchRegistrationFee, getAdminRegistrations, updateRegistrationFee, updateTeamVerification, sendVerificationEmail, sendRejectionEmail, type AdminRegistration } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { Zap, Search, LogOut, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import styles from './Admin.module.css';

const TRACKS_MAP: Record<string, string> = {
  'ai-ml': 'AI & Machine Learning',
  'web3': 'Web3 & Blockchain',
  'open-innovation': 'Open Innovation',
  'sustainability': 'Sustainability & Climate Tech',
  'fintech': 'FinTech & Payments',
  'healthtech': 'Health & MedTech',
};

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
      .then((res) => res.blob())
      .then((blob) => {
        if (blob.size > 0) setScreenshotUrl(URL.createObjectURL(blob));
        else setScreenshotUrl(null);
      })
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
      if (data.length > 0 && (!selectedReg || !data.some((reg) => reg._id === selectedReg._id))) {
        setSelectedReg(data[0]);
      }
    } catch (_err) {
      addToast('Failed to load registrations. Session may have expired.', 'error');
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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
    if (result.success) {
      setFeeInput(String(result.fee));
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: 'Pending Verification' | 'Verified' | 'Rejected', customAmount?: number | null, reason?: string) => {
    if (!token) return;
    const result = await updateTeamVerification(token, id, newStatus, customAmount ?? null, reason);
    if (result.success) {
      addToast(`Team status updated to ${newStatus}`, 'success');
      setRegistrations((prev) => prev.map((reg) => reg._id === id ? { ...reg, verificationStatus: newStatus } : reg));
      if (selectedReg && selectedReg._id === id) {
        setSelectedReg((prev) => prev ? { ...prev, verificationStatus: newStatus } : null);
      }
    } else {
      addToast(result.message, 'error');
    }
  };

  const filteredRegs = registrations.filter((reg) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || reg.teamName.toLowerCase().includes(query) || reg.teamId.toLowerCase().includes(query) || reg.leaderName.toLowerCase().includes(query) || reg.leaderEmail.toLowerCase().includes(query) || reg.members.some((m) => m.name.toLowerCase().includes(query) || m.email.toLowerCase().includes(query));
    const matchesStatus = statusFilter === 'ALL' || reg.verificationStatus === statusFilter;
    const matchesTrack = trackFilter === 'ALL' || reg.trackId === trackFilter;
    return matchesSearch && matchesStatus && matchesTrack;
  });

  const totalCount = registrations.length;
  const verifiedCount = registrations.filter((r) => r.verificationStatus === 'Verified').length;
  const pendingCount = registrations.filter((r) => r.verificationStatus === 'Pending Verification').length;

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
              <Input id="admin-password-input" label="Admin Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} error={loginError} />
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
            <p className={styles.headerSubtitle}>Manually verify payments and review registrations</p>
          </div>
          <div className={styles.headerActions}>
            <Button variant="outline" size="sm" onClick={() => fetchData(token)} disabled={loading}><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></Button>
            <Button variant="outline" size="sm" onClick={handleLogout}><LogOut size={16} className="mr-2" /> Logout</Button>
          </div>
        </header>

        <section className={styles.statsGrid}>
          <div className={styles.statCard}><span className={styles.statLabel}>Total Teams</span><span className={styles.statValue}>{totalCount}</span></div>
          <div className={styles.statCard}><span className={styles.statLabel}>Verified Payments</span><span className={`${styles.statValue} ${styles.statValueYellow}`}>{verifiedCount}</span></div>
          <div className={styles.statCard}><span className={styles.statLabel}>Pending Verification</span><span className={styles.statValue}>{pendingCount}</span></div>
        </section>

        <section className={styles.controlsRow}>
          <div className={styles.searchWrapper}><Search className={styles.searchIcon} size={18} /><input type="text" placeholder="Search team ID, team name, leader email or members..." className={styles.searchInput} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
          <select className={styles.filterSelect} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="Pending Verification">Pending Verification</option>
            <option value="Verified">Verified</option>
            <option value="Rejected">Rejected</option>
          </select>
          <select className={styles.filterSelect} value={trackFilter} onChange={(e) => setTrackFilter(e.target.value)}>
            <option value="ALL">All Tracks</option>
            {Object.entries(TRACKS_MAP).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
        </section>

        <section className={styles.feePanel}>
          <div className={styles.feeHeader}><h3>Registration Fee Management</h3></div>
          <div className={styles.feeRow}>
            <label htmlFor="registration-fee">Current Fee (₹ per participant)</label>
            <div className={styles.feeControls}>
              <Input id="registration-fee" type="number" min="1" step="1" value={feeInput} onChange={(e) => setFeeInput(e.target.value)} />
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
                    <th>Team ID</th>
                    <th>Team Name</th>
                    <th>Track</th>
                    <th>Leader Email</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegs.length > 0 ? filteredRegs.map((reg) => (
                    <tr key={reg._id} onClick={() => setSelectedReg(reg)} className={`${styles.rowSelectable} ${selectedReg?._id === reg._id ? styles.rowActive : ''}`}>
                      <td>{reg.teamId}</td>
                      <td>{reg.teamName}</td>
                      <td>{TRACKS_MAP[reg.trackId] || reg.trackId}</td>
                      <td>{reg.leaderEmail}</td>
                      <td><span className={`${styles.badge} ${reg.verificationStatus === 'Verified' ? styles.badgeVerified : reg.verificationStatus === 'Rejected' ? styles.badgeRejected : styles.badgePending}`}>{reg.verificationStatus}</span></td>
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
                  <h2 className={styles.detailsTeamName}>{selectedReg.teamName}</h2>
                  <p className={styles.detailsTeamId}>ID: {selectedReg.teamId}</p>
                </div>

                <div className={styles.detailsSection}><span className={styles.detailsLabel}>Track</span><p className={styles.detailsValue}>{TRACKS_MAP[selectedReg.trackId] || selectedReg.trackId}</p></div>
                <div className={styles.detailsSection}><span className={styles.detailsLabel}>Leader Information</span><p className={styles.detailsValue}>{selectedReg.leaderName} ({selectedReg.leaderEmail})</p><p className={styles.detailsValue}>{selectedReg.leaderPhone}</p></div>
                <div className={styles.detailsSection}><span className={styles.detailsLabel}>Participants</span><div className={styles.membersList}>{selectedReg.members.map((m, i) => <div key={i} className={styles.memberCard}><span className={styles.memberName}>{m.name}</span><span className={styles.memberEmail}>{m.email}</span><span className={styles.memberEmail}>{m.phone}</span></div>)}</div></div>
                <div className={styles.detailsSection}><span className={styles.detailsLabel}>Payment Information</span><p className={styles.detailsValue}>Per participant fee: ₹{selectedReg.feePerParticipantAtRegistration}</p><p className={styles.detailsValue}>Participants: {selectedReg.participantCount}</p><p className={styles.detailsValue}>Total fee: ₹{selectedReg.totalRegistrationFee}</p><p className={styles.detailsValue}>Status: {selectedReg.verificationStatus}</p></div>

                <div className={styles.amountBox}>
                  <label htmlFor="checked-amount" className={styles.detailsLabel}>Expected Amount: ₹{selectedReg.totalRegistrationFee}</label>
                  <Input id="checked-amount" type="number" value={amountChecked || selectedReg.totalRegistrationFee} onChange={(e) => setAmountChecked(e.target.value)} placeholder="Enter checked amount" />
                </div>

                {screenshotUrl ? (
                  <div className={styles.detailsSection}>
                    <span className={styles.detailsLabel}>Payment Screenshot</span>
                    <img src={screenshotUrl} alt="Payment screenshot" className={styles.paymentImage} />
                  </div>
                ) : (
                  <div className={styles.detailsSection}><span className={styles.detailsLabel}>Payment Screenshot</span><p className={styles.detailsValue}>Not available</p></div>
                )}

                <div className={styles.actionsBox}>
                  <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} className={styles.reasonInput} placeholder="Rejection reason required before rejecting a registration" />
                  <div className={styles.statusToggleRow}>
                    <Button variant="primary" size="sm" onClick={() => handleStatusUpdate(selectedReg._id, 'Verified', Number(amountChecked || selectedReg.totalRegistrationFee))}>Verify</Button>
                    <Button variant="secondary" size="sm" onClick={() => { if (!rejectionReason.trim()) { addToast('A rejection reason is required.', 'error'); return; } handleStatusUpdate(selectedReg._id, 'Rejected', Number(amountChecked || selectedReg.totalRegistrationFee), rejectionReason); }}><AlertCircle size={16} className="mr-2" /> Reject</Button>
                  </div>
                </div>

                <div className={styles.actionsBox}>
                  <div className={styles.statusToggleRow}>
                    <Button variant="outline" size="sm" onClick={async () => { const result = await sendVerificationEmail(token, selectedReg._id); addToast(result.message, result.success ? 'success' : 'error'); }} disabled={selectedReg.verificationStatus !== 'Verified' || selectedReg.verificationEmailSent}>Send Verification Email</Button>
                    <Button variant="outline" size="sm" onClick={async () => { const result = await sendRejectionEmail(token, selectedReg._id); addToast(result.message, result.success ? 'success' : 'error'); }} disabled={selectedReg.verificationStatus !== 'Rejected' || selectedReg.rejectionEmailSent}>Send Rejection Email</Button>
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>Select a team from the list to view detailed registration information.</div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
