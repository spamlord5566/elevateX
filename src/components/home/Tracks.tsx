'use client';

import { m } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchTracks, type Track } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Users, Trophy, Tag } from 'lucide-react';

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
      className="glass-card group relative overflow-hidden flex flex-col p-6 sm:p-7 h-full cursor-default"
      aria-label={`Track: ${track.name}`}
    >
      {/* Coloured top-edge accent */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: `linear-gradient(90deg, ${track.color}, transparent)` }}
      />

      {/* Glow blob on hover */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-2xl pointer-events-none"
        style={{ background: track.color }}
        aria-hidden="true"
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 gap-5">
        {/* Icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
          style={{ background: `${track.color}18` }}
          aria-hidden="true"
        >
        {track.icon}
      </div>

        {/* Content */}
        <div className="flex flex-col gap-2.5">
          <h3
            className="heading-md text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-yellow)] transition-colors duration-200 leading-tight"
            style={{ fontSize: '1.25rem' }}
          >
            {track.name}
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed min-w-0">
            {track.description}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-1" aria-label="Technologies">
        {track.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{
              background: `${track.color}14`,
              color: track.color,
              border: `1px solid ${track.color}30`,
            }}
          >
            <Tag className="w-3 h-3" aria-hidden="true" />
            {tag}
          </span>
        ))}
        </div>
      </div>

      {/* Footer: team size + prize */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-5 mt-8 border-t border-[var(--color-glass-border)]">
        <span className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] min-w-0">
          <Users className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span className="truncate">Up to {track.maxTeamSize} members</span>
        </span>
        <span className="flex items-center gap-1.5 text-[0.8rem] font-bold text-[var(--color-brand-yellow)] shrink-0">
          <Trophy className="w-4 h-4 shrink-0" aria-hidden="true" />
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
      className="relative py-24 px-6"
    >
      <div className="container-section">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase text-[var(--color-brand-yellow)] border border-[var(--color-brand-yellow)]/30 mb-4">
            Choose Your Arena
          </span>
          <h2
            id="tracks-heading"
            className="heading-lg text-[var(--color-text-primary)] mb-4"
          >
            Hackathon{' '}
            <span className="text-[var(--color-brand-yellow)] text-glow">
              Tracks
            </span>
          </h2>
          <p className="text-[var(--color-text-muted)] max-w-xl mx-auto text-base leading-relaxed">
            Six domains. Six opportunities to make history. Pick your track,
            assemble your team, and build something legendary.
          </p>
        </div>

        {/* States */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" label="Loading tracks…" />
          </div>
        )}

        {isError && (
          <div
            role="alert"
            className="text-center py-16 text-red-400 glass-card max-w-md mx-auto p-8"
          >
            <p className="font-semibold">Failed to load tracks</p>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
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
