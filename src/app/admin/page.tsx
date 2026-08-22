'use client';

import { useState, useEffect, useTransition } from 'react';
import { 
  adminLogin, 
  getAdminRegistrations, 
  updateTeamVerification,
  type AdminRegistration 
} from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { Zap, Search, LogOut, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
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
  
  // Data states
  const [registrations, setRegistrations] = useState<AdminRegistration[]>([]);
  const [selectedReg, setSelectedReg] = useState<AdminRegistration | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [trackFilter, setTrackFilter] = useState('ALL');
  const [isPendingTransition, startTransition] = useTransition();

  const { addToast } = useToast();

  // Load token from sessionStorage on mount
  useEffect(() => {
    const savedToken = sessionStorage.getItem('elevate_admin_token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  // Fetch registrations when token changes
  useEffect(() => {
    if (token) {
      fetchData(token);
    } else {
      setRegistrations([]);
      setSelectedReg(null);
    }
  }, [token]);

  const fetchData = async (authToken: string) => {
    setLoading(true);
    try {
      const data = await getAdminRegistrations(authToken);
      setRegistrations(data);
      if (data.length > 0) {
        setSelectedReg(data[0]);
      }
    } catch (err) {
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

  const handleStatusUpdate = async (id: string, newStatus: 'PENDING' | 'VERIFIED') => {
    if (!token) return;

    startTransition(async () => {
      const result = await updateTeamVerification(token, id, newStatus);
      if (result.success) {
        addToast(`Team status updated to ${newStatus}`, 'success');
        
        // Update local list
        setRegistrations(prev =>
          prev.map(reg => (reg._id === id ? { ...reg, verificationStatus: newStatus } : reg))
        );

        // Update selected registration details
        if (selectedReg && selectedReg._id === id) {
          setSelectedReg(prev => prev ? { ...prev, verificationStatus: newStatus } : null);
        }
      } else {
        addToast(result.message, 'error');
      }
    });
  };

  // Filter registrations
  const filteredRegs = registrations.filter(reg => {
    // 1. Search Query
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      reg.teamName.toLowerCase().includes(query) ||
      reg.teamId.toLowerCase().includes(query) ||
      reg.leaderName.toLowerCase().includes(query) ||
      reg.leaderEmail.toLowerCase().includes(query) ||
      reg.members.some(m => m.name.toLowerCase().includes(query) || m.email.toLowerCase().includes(query));

    // 2. Status Filter
    const matchesStatus = statusFilter === 'ALL' || reg.verificationStatus === statusFilter;

    // 3. Track Filter
    const matchesTrack = trackFilter === 'ALL' || reg.trackId === trackFilter;

    return matchesSearch && matchesStatus && matchesTrack;
  });

  // Calculate Metrics
  const totalCount = registrations.length;
  const verifiedCount = registrations.filter(r => r.verificationStatus === 'VERIFIED').length;
  const pendingCount = registrations.filter(r => r.verificationStatus === 'PENDING').length;

  if (!token) {
    // ─── LOGIN VIEW ───
    return (
      <main className={styles.main}>
        <div aria-hidden="true" className={styles.background} />
        <div className={styles.loginContainer}>
          <div className={styles.loginCard}>
            <div className={styles.brandRow}>
              <Zap size={28} className={styles.brandIcon} aria-hidden="true" />
              <span className={styles.brand}>
                ELEVATE<span className={styles.wordmarkX}>X</span>
              </span>
            </div>
            <h1 className={styles.loginTitle}>Admin Console</h1>
            <p className={styles.loginSubtitle}>Enter password to manage event registrations</p>

            <form onSubmit={handleLogin} className={styles.formGroup}>
              <Input
                id="admin-password-input"
                label="Admin Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={loginError}
              />
              <Button
                variant="primary"
                type="submit"
                className="w-full"
                id="admin-login-submit"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Access Dashboard'}
              </Button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  // ─── DASHBOARD VIEW ───
  return (
    <main className={styles.main}>
      <div aria-hidden="true" className={styles.background} />
      <div className={styles.dashboardContainer}>
        
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerTitleRow}>
            <h1 className={styles.headerTitle}>Elevate Admin</h1>
            <p className={styles.headerSubtitle}>Manually verify payments and review registrations</p>
          </div>
          <div className={styles.headerActions}>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fetchData(token)}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut size={16} className="mr-2" /> Logout
            </Button>
          </div>
        </header>

        {/* Metrics Grid */}
        <section className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total Teams</span>
            <span className={styles.statValue}>{totalCount}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Verified Payments</span>
            <span className={`${styles.statValue} ${styles.statValueYellow}`}>{verifiedCount}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Pending Verification</span>
            <span className={styles.statValue}>{pendingCount}</span>
          </div>
        </section>

        {/* Search & Filter Controls */}
        <section className={styles.controlsRow}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={18} />
            <input
              type="text"
              placeholder="Search by team ID, name, email, college or members..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <select 
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="VERIFIED">Verified</option>
          </select>

          <select 
            className={styles.filterSelect}
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value)}
          >
            <option value="ALL">All Tracks</option>
            {Object.entries(TRACKS_MAP).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </section>

        {/* Main Panel Content (Table + Detail Sidebar) */}
        <div className={styles.panels}>
          
          {/* Table list */}
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
                  {filteredRegs.length > 0 ? (
                    filteredRegs.map((reg) => (
                      <tr 
                        key={reg._id} 
                        onClick={() => setSelectedReg(reg)}
                        className={`${styles.rowSelectable} ${selectedReg?._id === reg._id ? styles.rowActive : ''}`}
                      >
                        <td className="font-mono">{reg.teamId}</td>
                        <td className="font-semibold">{reg.teamName}</td>
                        <td>{TRACKS_MAP[reg.trackId] || reg.trackId}</td>
                        <td>{reg.leaderEmail}</td>
                        <td>
                          <span className={`${styles.badge} ${
                            reg.verificationStatus === 'VERIFIED' 
                              ? styles.badgeVerified 
                              : styles.badgePending
                          }`}>
                            {reg.verificationStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className={styles.emptyState}>
                        {loading ? 'Loading registrations...' : 'No registrations match your search criteria.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Details Sidebar */}
          <div className={styles.detailsPanel}>
            {selectedReg ? (
              <>
                <div className={styles.detailsHeader}>
                  <h2 className={styles.detailsTeamName}>{selectedReg.teamName}</h2>
                  <p className={styles.detailsTeamId}>ID: {selectedReg.teamId}</p>
                </div>

                <div className={styles.detailsSection}>
                  <span className={styles.detailsLabel}>Track</span>
                  <p className={styles.detailsValue}>{TRACKS_MAP[selectedReg.trackId] || selectedReg.trackId}</p>
                </div>

                <div className={styles.detailsSection}>
                  <span className={styles.detailsLabel}>Team Leader</span>
                  <p className={styles.detailsValue}>{selectedReg.leaderName} ({selectedReg.leaderEmail})</p>
                </div>

                <div className={styles.detailsSection}>
                  <span className={styles.detailsLabel}>Members ({selectedReg.members.length})</span>
                  {selectedReg.members.length > 0 ? (
                    <div className={styles.membersList}>
                      {selectedReg.members.map((m, i) => (
                        <div key={i} className={styles.memberCard}>
                          <span className={styles.memberName}>{m.name}</span>
                          <span className={styles.memberEmail}>{m.email}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={`${styles.detailsValue} text-gray-500 italic`}>No additional team members</p>
                  )}
                </div>

                <div className={styles.detailsSection}>
                  <span className={styles.detailsLabel}>Verification Status</span>
                  <div className="mt-1">
                    <span className={`${styles.badge} ${
                      selectedReg.verificationStatus === 'VERIFIED' 
                        ? styles.badgeVerified 
                        : styles.badgePending
                    }`}>
                      {selectedReg.verificationStatus}
                    </span>
                  </div>
                </div>

                {/* Actions Box */}
                <div className={styles.actionsBox}>
                  <span className={styles.detailsLabel}>Actions</span>
                  <div className={styles.statusToggleRow}>
                    <button
                      className={`${styles.statusButton} ${
                        selectedReg.verificationStatus === 'PENDING' ? styles.statusButtonActivePending : ''
                      }`}
                      onClick={() => handleStatusUpdate(selectedReg._id, 'PENDING')}
                      disabled={isPendingTransition}
                    >
                      Mark Pending
                    </button>
                    <button
                      className={`${styles.statusButton} ${
                        selectedReg.verificationStatus === 'VERIFIED' ? styles.statusButtonActiveVerify : ''
                      }`}
                      onClick={() => handleStatusUpdate(selectedReg._id, 'VERIFIED')}
                      disabled={isPendingTransition}
                    >
                      Mark Verified
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                Select a team from the list to view detailed registration information.
              </div>
            )}
          </div>

        </div>

      </div>
    </main>
  );
}
