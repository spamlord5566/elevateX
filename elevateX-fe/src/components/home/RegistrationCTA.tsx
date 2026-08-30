'use client';

import { m } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ChevronRight, Star, Users, Music } from 'lucide-react';
import styles from './RegistrationCTA.module.css';

interface RegistrationCTAProps {
  onRegisterClick: () => void;
}

const perks = [
  { icon: <Star size={16} />, text: 'Alumni Talk with seniors and alumni' },
  { icon: <Users size={16} />, text: 'Fun & Games to break the ice' },
  { icon: <Music size={16} />, text: 'A relaxed Jamming Session' },
];

/**
 * Registration CTA banner — full-width section before footer.
 * Opens the registration modal when the button is clicked.
 */
export default function RegistrationCTA({ onRegisterClick }: RegistrationCTAProps) {
  return (
    <section
      id="register"
      aria-labelledby="cta-heading"
      className={styles.section}
    >
      {/* Animated gradient background */}
      <div
        aria-hidden="true"
        className={styles.background}
      />
      <div
        aria-hidden="true"
        className={`${styles.orb} ${styles.orbTop}`}
      />
      <div
        aria-hidden="true"
        className={`${styles.orb} ${styles.orbBottom}`}
      />

      <div className={`container-section ${styles.inner}`}>
        <m.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={`glass-card ${styles.card}`}
        >
          {/* Status badge */}
          <span className={styles.badge}>
            <span className={styles.dot} />
            Registration Open
          </span>

          <h2
            id="cta-heading"
            className={`heading-lg ${styles.heading}`}
          >
            Ready to Join{' '}
            <span className={`text-glow ${styles.accent}`}>
              the Fun
            </span>
            ?
          </h2>

          <p className={styles.copy}>
            Meet new people, connect with seniors and alumni, take part in
            exciting activities, and start your college journey with memories
            worth keeping.
          </p>

          {/* Perks */}
          <ul
            className={styles.perks}
            aria-label="Registration perks"
          >
            {perks.map((perk) => (
              <li
                key={perk.text}
                className={styles.perk}
              >
                <span className={styles.perkIcon} aria-hidden="true">
                  {perk.icon}
                </span>
                {perk.text}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Button
            size="lg"
            variant="primary"
            onClick={onRegisterClick}
            rightIcon={<ChevronRight size={20} />}
            id="cta-register-btn"
            aria-label="Open registration wizard"
            className={styles.ctaButton}
          >
            Register Now
          </Button>
        </m.div>
      </div>
    </section>
  );
}
