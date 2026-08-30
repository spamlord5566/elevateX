'use client';

import { m } from 'framer-motion';
import styles from './Activities.module.css';

// ─── Animation Variants ───────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

// ─── Activity Data ─────────────────────────────────────────

interface Activity {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const ACTIVITIES: Activity[] = [
  {
    id: 'alumni-talk',
    name: 'Alumni Talk',
    description:
      'Hear inspiring stories, experiences and advice from alumni and seniors who have already walked the path.',
    icon: '🎤',
    color: '#d4f000',
  },
  {
    id: 'fun-games',
    name: 'Fun & Games',
    description:
      'Interactive games and activities designed to break the ice, meet batchmates and get everyone involved.',
    icon: '🎮',
    color: '#fb923c',
  },
  {
    id: 'jamming-session',
    name: 'Jamming Session',
    description:
      'Music, good vibes and a relaxed session to enjoy together and make memories.',
    icon: '🎸',
    color: '#a78bfa',
  },
];

// ─── Activity Card ─────────────────────────────────────────

function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <m.article
      variants={cardVariants}
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ duration: 0.25 }}
      className={styles.card}
      aria-label={activity.name}
    >
      {/* Coloured top-edge accent */}
      <div
        className={styles.accent}
        style={{ background: `linear-gradient(90deg, ${activity.color}, transparent)` }}
      />

      {/* Glow blob on hover */}
      <div
        className={styles.glow}
        style={{ background: activity.color }}
        aria-hidden="true"
      />

      {/* Main Content Area */}
      <div className={styles.content}>
        {/* Icon */}
        <div
          className={styles.icon}
          style={{ background: `${activity.color}18` }}
          aria-hidden="true"
        >
          {activity.icon}
        </div>

        {/* Content */}
        <div className={styles.copy}>
          <h3 className={styles.title}>{activity.name}</h3>
          <p className={styles.cardDescription}>{activity.description}</p>
        </div>
      </div>
    </m.article>
  );
}

// ─── Main Section ─────────────────────────────────────────

/**
 * Activities section — showcases the events happening during ElevateX
 * (Alumni Talk, Fun & Games, Jamming Session). These are simply things
 * happening at the program, not selectable options like the old tracks.
 */
export default function Activities() {
  return (
    <section
      id="activities"
      aria-labelledby="activities-heading"
      className={styles.section}
    >
      <div className="container-section">
        {/* Section Header */}
        <div className={styles.header}>
          <span className={styles.eyebrow}>What&apos;s Happening</span>
          <h2 id="activities-heading" className={`heading-lg ${styles.heading}`}>
            Activities{' '}
            <span className={`text-glow ${styles.headingAccent}`}>
              &amp; Experiences
            </span>
          </h2>
          <p className={styles.description}>
            A day packed with moments to connect, laugh, and settle into your
            new college life alongside your batchmates, seniors, and alumni.
          </p>
        </div>

        <m.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className={styles.activityGrid}
        >
          {ACTIVITIES.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </m.div>
      </div>
    </section>
  );
}
