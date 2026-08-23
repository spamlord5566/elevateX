'use client';

import { m } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ChevronRight, Star, Clock, MapPin } from 'lucide-react';
import styles from './RegistrationCTA.module.css';

interface RegistrationCTAProps {
  onRegisterClick: () => void;
}

const perks = [
  { icon: <Star size={16} />, text: 'Mentorship from industry leaders' },
  { icon: <Clock size={16} />, text: '36 hours of non-stop hacking' },
  { icon: <MapPin size={16} />, text: 'Venue + meals provided' },
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
          {/* Countdown-style badge */}
          <span className={styles.badge}>
            <span className={styles.dot} />
            Registrations close Sept 1, 2025
          </span>

          <h2
            id="cta-heading"
            className={`heading-lg ${styles.heading}`}
          >
            Ready to{' '}
            <span className={`text-glow ${styles.accent}`}>
              Elevate
            </span>{' '}
            Your Game?
          </h2>

          <p className={styles.copy}>
            Join 2,000+ innovators from across India. Build the future in 36
            hours, win life-changing prizes, and make connections that last a
            lifetime.
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
            Register as a Participant
          </Button>

          <p className={styles.buttonNote}>
            Free to participate · No entry fee
          </p>
        </m.div>
      </div>
    </section>
  );
}
