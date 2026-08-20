'use client';

import { m } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ChevronRight, Zap, Users, Trophy } from 'lucide-react';
import Image from 'next/image';
import styles from './Hero.module.css';

interface HeroProps {
  onRegisterClick: () => void;
}

const stats = [
  { icon: <Users size={20} />, value: '2,000+', label: 'Participants' },
  { icon: <Trophy size={20} />, value: '₹4,50,000', label: 'Prize Pool' },
  { icon: <Zap size={20} />, value: '36 hrs', label: 'Duration' },
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
      aria-label="ElevateX — Main Introduction"
      className={styles.hero}
    >
      {/* Radial glow behind headline */}
      <div
        aria-hidden="true"
        className={styles.glowLayer}
      >
        <div
          className={styles.glow}
        />
      </div>

      <m.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={styles.content}
      >
        {/* Badge */}
        <m.div variants={itemVariants}>
          <span className={`${styles.badge} glass-card`}>
            <span className={styles.pulseDot} />
            Registration Open — Sept 2026
          </span>
        </m.div>

        {/* Logo / Brand Name */}
        <m.div variants={itemVariants} className={styles.brandWrap}>
          <div className={styles.brand}>
            {/* Large stylized brand text */}
            <h1 className="heading-xl">
              ELEVATE
              <span className={`text-glow ${styles.brandAccent}`}>
                X
              </span>
            </h1>
          </div>
        </m.div>

        {/* Tagline */}
        <m.p
          variants={itemVariants}
          className={styles.tagline}
        >
          Prepared to be{' '}
          <span className={styles.taglineAccent}>
            Amazed
          </span>
        </m.p>

        {/* Sub-copy */}
        <m.p
          variants={itemVariants}
          className={styles.subcopy}
        >
          India&apos;s most electrifying hackathon returns. 36 hours of raw
          innovation, real challenges, and life-changing prizes. Show the world
          what you&apos;re built for.
        </m.p>

        {/* CTAs */}
        <m.div
          variants={itemVariants}
          className={styles.actions}
        >
          <Button
            size="lg"
            variant="primary"
            onClick={onRegisterClick}
            rightIcon={<ChevronRight size={20} />}
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
          className={styles.stats}
        >
          {stats.map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <span className={styles.statLabel}>
                {stat.label}
              </span>
              <div className={styles.statValue}>
                {stat.icon}
                <span>
                  {stat.value}
                </span>
              </div>
            </div>
          ))}
        </m.div>
      </m.div>


    </section>
  );
}
