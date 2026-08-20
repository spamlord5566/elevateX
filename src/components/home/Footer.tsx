'use client';

import { Github, Instagram, Linkedin, Twitter, Zap } from 'lucide-react';
import styles from './Footer.module.css';

const navLinks = [
  { label: 'Home', href: '#hero' },
  { label: 'Tracks', href: '#tracks' },
  { label: 'Guidelines', href: '#guidelines' },
  { label: 'Register', href: '#register' },
  { label: 'Schedule', href: '#schedule' },
];

const socialLinks = [
  { label: 'Twitter / X', href: 'https://twitter.com', icon: <Twitter size={16} /> },
  { label: 'Instagram', href: 'https://instagram.com', icon: <Instagram size={16} /> },
  { label: 'LinkedIn', href: 'https://linkedin.com', icon: <Linkedin size={16} /> },
  { label: 'GitHub', href: 'https://github.com', icon: <Github size={16} /> },
];

/**
 * Site footer with brand, navigation links, social icons, and legal text.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      className={styles.footer}
    >
      {/* Subtle top glow */}
      <div
        aria-hidden="true"
        className={styles.glow}
      />

      <div className="container-section">
        <div className={styles.columns}>
          {/* Brand */}
          <div className={styles.brandColumn}>
            <div className={styles.brandRow}>
              <Zap size={24} className={styles.brandIcon} aria-hidden="true" />
              <span
                className={styles.brand}
              >
                ELEVATE
                <span className={styles.wordmarkX}>X</span>
              </span>
            </div>
            <p className={styles.description}>
              India&apos;s premier hackathon experience. Prepared to be amazed.
            </p>
            {/* Social links */}
            <div className={styles.socials} aria-label="Social media links">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={styles.social}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <nav aria-label="Footer navigation">
            <h3 className={styles.heading}>
              Quick Links
            </h3>
            <ul className={styles.list} role="list">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className={styles.link}
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
            <h3 className={styles.heading}>
              Contact
            </h3>
            <ul className={styles.list} role="list">
              <li>
                <a
                  href="mailto:hello@elevatex.in"
                  className={styles.link}
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
        <div className={styles.legal}>
          <p>© {currentYear} ElevateX. All rights reserved.</p>
          <div className={styles.legalLinks}>
            <a href="/privacy" className={styles.link}>
              Privacy Policy
            </a>
            <a href="/terms" className={styles.link}>
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
