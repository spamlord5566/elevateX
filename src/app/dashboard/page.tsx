import type { Metadata } from 'next';
import Link from 'next/link';
import { LayoutDashboard, Trophy, Users, Zap } from 'lucide-react';
import styles from './Dashboard.module.css';

export const metadata: Metadata = {
  title: 'Dashboard — ElevateX 2.0',
  description: 'ElevateX 2.0 participant dashboard — manage your team, view leaderboard, and track submissions.',
};

const quickLinks = [
  {
    href: '/dashboard/leaderboard',
    icon: <Trophy size={24} />,
    label: 'Leaderboard',
    desc: 'See top teams & scores',
    color: '#d4f000',
  },
  {
    href: '/dashboard/team',
    icon: <Users size={24} />,
    label: 'My Team',
    desc: 'Manage members & track',
    color: '#a78bfa',
  },
  {
    href: '/dashboard/submissions',
    icon: <LayoutDashboard size={24} />,
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
    <main className={styles.main}>
      {/* Glow */}
      <div
        aria-hidden="true"
        className={styles.background}
      />

      <div className={styles.content}>
        {/* Brand */}
        <div className={styles.brandRow}>
          <Zap size={28} className={styles.brandIcon} aria-hidden="true" />
          <span
            className={styles.brand}
          >
            ELEVATE
            <span className={styles.wordmarkX}>X</span>
          </span>
        </div>

        <h1 className={`heading-lg ${styles.heading}`}>
          Participant{' '}
          <span className={`text-glow ${styles.highlight}`}>Dashboard</span>
        </h1>

        <p className={styles.copy}>
          Welcome back, hacker! Your command centre is being assembled.
          {' '}
          <span className={styles.highlight}>
            Full dashboard coming soon.
          </span>
        </p>

        {/* Quick Links grid */}
        <div
          className={styles.links}
          role="list"
          aria-label="Dashboard sections"
        >
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="listitem"
              className={styles.linkCard}
              aria-label={`Go to ${item.label}`}
            >
              <div
                className={styles.linkIcon}
                style={{ background: `${item.color}18`, color: item.color }}
                aria-hidden="true"
              >
                {item.icon}
              </div>
              <div>
                <p className={styles.linkLabel}>{item.label}</p>
                <p className={styles.linkDescription}>{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Back link */}
        <Link
          href="/"
          className={styles.back}
        >
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}
