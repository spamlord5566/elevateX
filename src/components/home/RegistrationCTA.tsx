'use client';

import { m } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ChevronRight, Star, Clock, MapPin } from 'lucide-react';

interface RegistrationCTAProps {
  onRegisterClick: () => void;
}

const perks = [
  { icon: <Star className="w-4 h-4" />, text: 'Mentorship from industry leaders' },
  { icon: <Clock className="w-4 h-4" />, text: '36 hours of non-stop hacking' },
  { icon: <MapPin className="w-4 h-4" />, text: 'Venue + meals provided' },
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
      className="relative py-24 px-6 overflow-hidden"
    >
      {/* Animated gradient background */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, rgba(212,240,0,0.06) 0%, transparent 40%, rgba(212,240,0,0.04) 100%)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-10"
        style={{ background: 'var(--color-brand-yellow)' }}
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-10"
        style={{ background: 'var(--color-brand-yellow)' }}
      />

      <div className="container-section relative z-10">
        <m.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card border border-[var(--color-brand-yellow)]/25 p-10 md:p-16 text-center max-w-3xl mx-auto"
        >
          {/* Countdown-style badge */}
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase text-[var(--color-brand-yellow)] border border-[var(--color-brand-yellow)]/30 mb-6">
            <span className="w-2 h-2 rounded-full bg-[var(--color-brand-yellow)] animate-pulse" />
            Registrations close Sept 1, 2025
          </span>

          <h2
            id="cta-heading"
            className="heading-lg text-[var(--color-text-primary)] mb-4"
          >
            Ready to{' '}
            <span className="text-[var(--color-brand-yellow)] text-glow">
              Elevate
            </span>{' '}
            Your Game?
          </h2>

          <p className="text-[var(--color-text-muted)] mb-8 leading-relaxed max-w-xl mx-auto">
            Join 2,000+ innovators from across India. Build the future in 36
            hours, win life-changing prizes, and make connections that last a
            lifetime.
          </p>

          {/* Perks */}
          <ul
            className="flex flex-col sm:flex-row justify-center gap-4 mb-10"
            aria-label="Registration perks"
          >
            {perks.map((perk) => (
              <li
                key={perk.text}
                className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]"
              >
                <span className="text-[var(--color-brand-yellow)]" aria-hidden="true">
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
            rightIcon={<ChevronRight className="w-5 h-5" />}
            id="cta-register-btn"
            aria-label="Open registration wizard"
            className="text-lg px-10"
          >
            Register Your Team
          </Button>

          <p className="text-xs text-[var(--color-text-muted)]/60 mt-4">
            Free to participate · No entry fee
          </p>
        </m.div>
      </div>
    </section>
  );
}
