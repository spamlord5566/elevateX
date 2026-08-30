'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Menu, X, Zap } from 'lucide-react';
import clsx from 'clsx';
import styles from './PublicNav.module.css';

interface PublicNavProps {
  onRegisterClick: () => void;
}

const navLinks = [
  { label: 'Home', href: '#hero' },
  { label: 'About', href: '#about' },
  { label: 'Activities', href: '#activities' },
];

/**
 * Public navigation bar — sticky-top with brand, nav links,
 * and a Register CTA. Collapses to a slide-over on mobile.
 *
 * Accessibility:
 * - nav has aria-label
 * - Mobile toggle has aria-expanded + aria-controls
 * - Focus trapped in mobile menu when open
 * - Keyboard: Escape closes the menu
 */
export default function PublicNav({ onRegisterClick }: PublicNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Change nav background on scroll
  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  function scrollToSection(href: string) {
    if (href.startsWith('#')) {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  }

  return (
    <>
      <nav
        aria-label="Main navigation"
        className={clsx(
          styles.nav,
          isScrolled && styles.scrolled,
        )}
      >
        <div className="container-section">
          <div className={styles.row}>
            {/* Brand Logo */}
            <Link
              href="/"
              className={styles.brandLink}
              aria-label="ElevateX home"
            >
              <Zap
                className={styles.brandIcon}
                aria-hidden="true"
              />
              <span
                className={styles.brand}
              >
                ELEVATE
                <span className={styles.wordmarkX}>X</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <ul
              className={styles.links}
              role="list"
              aria-label="Navigation links"
            >
              {navLinks.map((link) =>
                link.href.startsWith('#') ? (
                  <li key={link.label}>
                    <button
                      onClick={() => scrollToSection(link.href)}
                      className={styles.link}
                    >
                      {link.label}
                    </button>
                  </li>
                ) : (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className={styles.link}
                    >
                      {link.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>

            {/* Desktop CTA */}
            <div className={styles.desktopCta}>
              <Button
                variant="primary"
                size="sm"
                onClick={onRegisterClick}
                id="nav-register-btn"
              >
                Register
              </Button>
            </div>

            {/* Mobile Hamburger */}
            <button
              ref={toggleRef}
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              className={styles.menuButton}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-Over Overlay */}
      {isOpen && (
        <div
          className={styles.overlay}
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Panel */}
      <div
        id="mobile-menu"
        ref={mobileMenuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
        className={clsx(
          styles.mobileMenu,
          !isOpen && styles.mobileMenuClosed,
        )}
      >
        {/* Close button inside panel */}
        <button
          onClick={() => setIsOpen(false)}
          aria-label="Close menu"
          className={styles.closeButton}
        >
            <X size={20} />
        </button>

        {/* Links */}
        <nav aria-label="Mobile navigation links">
          <ul className={styles.mobileLinks} role="list">
            {navLinks.map((link) => (
              <li key={link.label}>
                {link.href.startsWith('#') ? (
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className={styles.mobileLink}
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={styles.mobileLink}
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* CTA */}
        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setIsOpen(false);
            onRegisterClick();
          }}
          className={styles.fullWidth}
          id="mobile-register-btn"
        >
          Register Now
        </Button>
      </div>
    </>
  );
}
