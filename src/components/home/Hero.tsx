'use client';

import { m } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ChevronRight, Zap, Users, Trophy } from 'lucide-react';
import Image from 'next/image';

interface HeroProps {
  onRegisterClick: () => void;
}

const stats = [
  { icon: <Users className="w-5 h-5" />, value: '2,000+', label: 'Participants' },
  { icon: <Trophy className="w-5 h-5" />, value: '₹4,50,000', label: 'Prize Pool' },
  { icon: <Zap className="w-5 h-5" />, value: '36 hrs', label: 'of Hacking' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

/**
 * Hero section — full-viewport height with brand headline,
 * animated tagline, stat strip, and dual CTA buttons.
 */
export default function Hero({ onRegisterClick }: HeroProps) {
  return (
    <section
      id="hero"
      aria-label="ElevateX 2.0 — Main Introduction"
      className="relative min-h-dvh flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 overflow-hidden"
    >
      {/* Radial glow behind headline */}
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div
          style={{
            width: '700px',
            height: '700px',
            background:
              'radial-gradient(circle, rgba(212,240,0,0.08) 0%, rgba(212,240,0,0.03) 40%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
      </div>

      <m.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center max-w-4xl mx-auto gap-6"
      >
        {/* Badge */}
        <m.div variants={itemVariants}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase glass-card border border-[var(--color-brand-yellow)]/30 text-[var(--color-brand-yellow)]">
            <span className="w-2 h-2 rounded-full bg-[var(--color-brand-yellow)] animate-pulse" />
            Registration Open — Sept 2025
          </span>
        </m.div>

        {/* Logo / Brand Name */}
        <m.div variants={itemVariants} className="flex flex-col items-center gap-2">
          <div className="relative">
            {/* Large stylized brand text */}
            <h1 className="heading-xl text-[var(--color-text-primary)] tracking-tight">
              ELEVATE
              <span className="text-glow" style={{ color: 'var(--color-brand-yellow)' }}>
                X
              </span>
            </h1>
            {/* Version badge */}
            <span
              className="absolute -top-2 -right-10 text-xs font-bold text-[var(--color-brand-black)] bg-[var(--color-brand-yellow)] px-2 py-0.5 rounded-md"
              aria-label="Version 2.0"
            >
              2.0
            </span>
          </div>
        </m.div>

        {/* Tagline */}
        <m.p
          variants={itemVariants}
          className="text-lg md:text-2xl font-medium tracking-widest uppercase text-[var(--color-text-muted)]"
        >
          Prepared to be{' '}
          <span className="text-[var(--color-brand-yellow)] font-bold">
            Amazed
          </span>
        </m.p>

        {/* Sub-copy */}
        <m.p
          variants={itemVariants}
          className="text-base md:text-lg text-[var(--color-text-muted)] max-w-2xl leading-relaxed"
        >
          India&apos;s most electrifying hackathon returns. 36 hours of raw
          innovation, real challenges, and life-changing prizes. Show the world
          what you&apos;re built for.
        </m.p>

        {/* CTAs */}
        <m.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 mt-2"
        >
          <Button
            size="lg"
            variant="primary"
            onClick={onRegisterClick}
            rightIcon={<ChevronRight className="w-5 h-5" />}
            id="hero-register-btn"
            aria-label="Open registration wizard"
          >
            Register Now
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() =>
              document
                .getElementById('tracks')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
            id="hero-explore-btn"
          >
            Explore Tracks
          </Button>
        </m.div>

        {/* Stat strip */}
        <m.div
          variants={itemVariants}
          className="flex flex-wrap justify-center gap-6 sm:gap-10 mt-8 w-full max-w-lg"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-1.5 text-[var(--color-brand-yellow)]">
                {stat.icon}
                <span className="text-xl md:text-2xl font-bold font-display">
                  {stat.value}
                </span>
              </div>
              <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest">
                {stat.label}
              </span>
            </div>
          ))}
        </m.div>
      </m.div>

      {/* Scroll indicator */}
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        aria-hidden="true"
      >
        <span className="text-xs text-[var(--color-text-muted)] tracking-widest uppercase">
          Scroll
        </span>
        <div className="w-px h-12 bg-gradient-to-b from-[var(--color-brand-yellow)]/60 to-transparent" />
      </m.div>
    </section>
  );
}
