'use client';

import { m } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchTracks, type Track } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Users, Trophy, Tag } from 'lucide-react';
import styles from './Tracks.module.css';

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

// ─── Track Card ───────────────────────────────────────────

function TrackCard({ track }: { track: Track }) {
  return (
    <m.article
      variants={cardVariants}
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ duration: 0.25 }}
      className={styles.card}
      aria-label={`Track: ${track.name}`}
    >
      {/* Coloured top-edge accent */}
      <div
        className={styles.accent}
        style={{ background: `linear-gradient(90deg, ${track.color}, transparent)` }}
      />

      {/* Glow blob on hover */}
      <div
        className={styles.glow}
        style={{ background: track.color }}
        aria-hidden="true"
      />

      {/* Main Content Area */}
      <div className={styles.content}>
        {/* Icon */}
        <div
          className={styles.icon}
          style={{ background: `${track.color}18` }}
          aria-hidden="true"
        >
        {track.icon}
      </div>

        {/* Content */}
        <div className={styles.copy}>
          <h3
            className={styles.title}
          >
            {track.name}
          </h3>
          <p className={styles.cardDescription}>
            {track.description}
          </p>
        </div>

        {/* Tags */}
        <div className={styles.tags} aria-label="Technologies">
        {track.tags.map((tag) => (
          <span
            key={tag}
            className={styles.tag}
            style={{
              background: `${track.color}14`,
              color: track.color,
              border: `1px solid ${track.color}30`,
            }}
          >
            <Tag size={12} aria-hidden="true" />
            {tag}
          </span>
        ))}
        </div>
      </div>

      {/* Footer: registration mode + prize */}
      <div className={styles.footer}>
        <span className={styles.teamInfo}>
          <Users size={16} aria-hidden="true" />
          <span>Individual entry</span>
        </span>
        <span className={styles.prize}>
          <Trophy size={16} aria-hidden="true" />
          {track.prizePool}
        </span>
      </div>
    </m.article>
  );
}

// ─── Main Section ─────────────────────────────────────────

/**
 * Tracks section — fetches track data via react-query,
 * shows loading/error states, and renders a responsive grid of cards.
 */
export default function Tracks() {
  const {
    data: tracks,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['tracks'],
    queryFn: fetchTracks,
  });

  return (
    <section
      id="tracks"
      aria-labelledby="tracks-heading"
      className={styles.section}
    >
      <div className="container-section">
        {/* Section Header */}
        <div className={styles.header}>
          <span className={styles.eyebrow}>
            Choose Your Arena
          </span>
          <h2
            id="tracks-heading"
            className={`heading-lg ${styles.heading}`}
          >
            Hackathon{' '}
            <span className={`text-glow ${styles.headingAccent}`}>
              Tracks
            </span>
          </h2>
          <p className={styles.description}>
            Six domains. Six opportunities to make history. Pick your track,
            choose your track, and build something legendary.
          </p>
        </div>

        {/* States */}
        {isLoading && (
          <div className={styles.loadingState}>
            <LoadingSpinner size="lg" label="Loading tracks…" />
          </div>
        )}

        {isError && (
          <div
            role="alert"
            className={styles.errorState}
          >
            <p className={styles.errorTitle}>Failed to load tracks</p>
            <p className={styles.errorMessage}>
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        )}

        {tracks && (
          <m.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className={styles.trackGrid}
          >
            {tracks.map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </m.div>
        )}
      </div>
    </section>
  );
}
