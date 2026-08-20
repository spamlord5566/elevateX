'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Menu, X, Zap } from 'lucide-react';
import clsx from 'clsx';

interface PublicNavProps {
  onRegisterClick: () => void;
}

const navLinks = [
  { label: 'Home', href: '#hero' },
  { label: 'Schedule', href: '#schedule' },
  { label: 'Tracks', href: '#tracks' },
  { label: 'Leaderboard', href: '/dashboard' },
  { label: 'Login', href: '/login' },
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
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-[var(--color-brand-black)]/90 backdrop-blur-xl border-b border-[var(--color-glass-border)]'
            : 'bg-transparent',
        )}
      >
        <div className="container-section">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Brand Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 group focus-visible:ring-2 focus-visible:ring-[var(--color-brand-yellow)] rounded-lg p-1"
              aria-label="ElevateX home"
            >
              <Zap
                className="w-6 h-6 text-[var(--color-brand-yellow)] group-hover:scale-110 transition-transform"
                aria-hidden="true"
              />
              <span
                className="text-xl font-black tracking-tight text-[var(--color-text-primary)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                ELEVATE
                <span style={{ color: 'var(--color-brand-yellow)' }}>X</span>
              </span>
              <span className="hidden sm:inline text-xs font-bold bg-[var(--color-brand-yellow)] text-[var(--color-brand-black)] px-1.5 py-0.5 rounded leading-none">
                2.0
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <ul
              className="hidden md:flex items-center gap-1"
              role="list"
              aria-label="Navigation links"
            >
              {navLinks.map((link) =>
                link.href.startsWith('#') ? (
                  <li key={link.label}>
                    <button
                      onClick={() => scrollToSection(link.href)}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-brand-yellow)] hover:bg-[var(--color-glass)] transition-all duration-150"
                    >
                      {link.label}
                    </button>
                  </li>
                ) : (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-brand-yellow)] hover:bg-[var(--color-glass)] transition-all duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center">
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
              className="md:hidden p-2 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-brand-yellow)] hover:bg-[var(--color-glass)] transition-all"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-Over Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
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
          'fixed top-0 right-0 bottom-0 z-50 w-72 md:hidden',
          'flex flex-col pt-20 pb-8 px-6',
          'bg-[var(--color-surface-1)] border-l border-[var(--color-glass-border)]',
          'transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Close button inside panel */}
        <button
          onClick={() => setIsOpen(false)}
          aria-label="Close menu"
          className="absolute top-4 right-4 p-2 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-brand-yellow)] hover:bg-[var(--color-glass)] transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Links */}
        <nav aria-label="Mobile navigation links">
          <ul className="flex flex-col gap-1 mb-8" role="list">
            {navLinks.map((link) => (
              <li key={link.label}>
                {link.href.startsWith('#') ? (
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="w-full text-left px-4 py-3 rounded-xl text-base font-medium text-[var(--color-text-muted)] hover:text-[var(--color-brand-yellow)] hover:bg-[var(--color-glass)] transition-all"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 rounded-xl text-base font-medium text-[var(--color-text-muted)] hover:text-[var(--color-brand-yellow)] hover:bg-[var(--color-glass)] transition-all"
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
          className="w-full"
          id="mobile-register-btn"
        >
          Register Now
        </Button>
      </div>
    </>
  );
}
