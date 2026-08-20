import type { Metadata } from 'next';
import Link from 'next/link';
import { LayoutDashboard, Trophy, Users, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dashboard — ElevateX 2.0',
  description: 'ElevateX 2.0 participant dashboard — manage your team, view leaderboard, and track submissions.',
};

const quickLinks = [
  {
    href: '/dashboard/leaderboard',
    icon: <Trophy className="w-6 h-6" />,
    label: 'Leaderboard',
    desc: 'See top teams & scores',
    color: '#d4f000',
  },
  {
    href: '/dashboard/team',
    icon: <Users className="w-6 h-6" />,
    label: 'My Team',
    desc: 'Manage members & track',
    color: '#a78bfa',
  },
  {
    href: '/dashboard/submissions',
    icon: <LayoutDashboard className="w-6 h-6" />,
    label: 'Submissions',
    desc: 'Submit your project',
    color: '#38bdf8',
  },
];

/**
 * Dashboard placeholder page.
 *
 * TODO: Gate this page behind an auth check (e.g. NextAuth session).
 * TODO: Integrate with real backend to load team/submission data.
 */
export default function DashboardPage() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 py-24">
      {/* Glow */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 30% 30%, rgba(212,240,0,0.05) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 max-w-3xl w-full text-center">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Zap className="w-7 h-7 text-[var(--color-brand-yellow)]" aria-hidden="true" />
          <span
            className="text-3xl font-black tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
          >
            ELEVATE
            <span style={{ color: 'var(--color-brand-yellow)' }}>X</span>
          </span>
          <span className="text-xs font-bold bg-[var(--color-brand-yellow)] text-[var(--color-brand-black)] px-1.5 py-0.5 rounded">
            2.0
          </span>
        </div>

        <h1 className="heading-lg text-[var(--color-text-primary)] mb-3">
          Participant{' '}
          <span className="text-[var(--color-brand-yellow)] text-glow">Dashboard</span>
        </h1>

        <p className="text-[var(--color-text-muted)] mb-10 leading-relaxed">
          Welcome back, hacker! Your command centre is being assembled.
          {' '}
          <span className="text-[var(--color-brand-yellow)] font-medium">
            Full dashboard coming soon.
          </span>
        </p>

        {/* Quick Links grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
          role="list"
          aria-label="Dashboard sections"
        >
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="listitem"
              className="glass-card p-6 flex flex-col items-center gap-3 hover:border-[var(--color-brand-yellow)]/40 transition-all duration-200 group"
              aria-label={`Go to ${item.label}`}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
                style={{ background: `${item.color}18`, color: item.color }}
                aria-hidden="true"
              >
                {item.icon}
              </div>
              <div>
                <p className="font-bold text-[var(--color-text-primary)]">{item.label}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Back link */}
        <Link
          href="/"
          className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-brand-yellow)] transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}
