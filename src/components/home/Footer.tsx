'use client';

import { Github, Instagram, Linkedin, Twitter, Zap } from 'lucide-react';

const navLinks = [
  { label: 'Home', href: '#hero' },
  { label: 'Tracks', href: '#tracks' },
  { label: 'Guidelines', href: '#guidelines' },
  { label: 'Register', href: '#register' },
  { label: 'Schedule', href: '#schedule' },
];

const socialLinks = [
  { label: 'Twitter / X', href: 'https://twitter.com', icon: <Twitter className="w-4 h-4" /> },
  { label: 'Instagram', href: 'https://instagram.com', icon: <Instagram className="w-4 h-4" /> },
  { label: 'LinkedIn', href: 'https://linkedin.com', icon: <Linkedin className="w-4 h-4" /> },
  { label: 'GitHub', href: 'https://github.com', icon: <Github className="w-4 h-4" /> },
];

/**
 * Site footer with brand, navigation links, social icons, and legal text.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      className="relative border-t border-[var(--color-glass-border)] py-16 px-6"
    >
      {/* Subtle top glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(212,240,0,0.4), transparent)',
        }}
      />

      <div className="container-section">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-[var(--color-brand-yellow)]" aria-hidden="true" />
              <span
                className="text-2xl font-black tracking-tight text-[var(--color-text-primary)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                ELEVATE
                <span style={{ color: 'var(--color-brand-yellow)' }}>X</span>
              </span>
              <span className="text-xs font-bold bg-[var(--color-brand-yellow)] text-[var(--color-brand-black)] px-1.5 py-0.5 rounded">
                2.0
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed max-w-xs">
              India&apos;s premier hackathon experience. Prepared to be amazed.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3" aria-label="Social media links">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 rounded-xl glass-card flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-brand-yellow)] hover:border-[var(--color-brand-yellow)]/40 transition-all duration-200"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <nav aria-label="Footer navigation">
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-widest mb-4">
              Quick Links
            </h3>
            <ul className="flex flex-col gap-2.5" role="list">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-brand-yellow)] transition-colors duration-150"
                    onClick={(e) => {
                      e.preventDefault();
                      document
                        .querySelector(link.href)
                        ?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact / Info */}
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-widest mb-4">
              Contact
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm text-[var(--color-text-muted)]" role="list">
              <li>
                <a
                  href="mailto:hello@elevatex.in"
                  className="hover:text-[var(--color-brand-yellow)] transition-colors"
                  aria-label="Email us at hello@elevatex.in"
                >
                  hello@elevatex.in
                </a>
              </li>
              <li>📍 IIT Bombay, Mumbai, Maharashtra</li>
              <li>📅 September 13–14, 2025</li>
            </ul>
          </div>
        </div>

        {/* Divider + Legal */}
        <div className="border-t border-[var(--color-glass-border)] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-text-muted)]">
          <p>© {currentYear} ElevateX. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="/privacy" className="hover:text-[var(--color-brand-yellow)] transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-[var(--color-brand-yellow)] transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
