'use client';

import { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import PublicNav from '@/components/layout/PublicNav';
import Hero from '@/components/home/Hero';
import SpaceDust from '@/components/home/SpaceDust';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import LazyLoadSection from '@/components/ui/LazyLoadSection';
import styles from './Page.module.css';

// ─── Dynamic Imports (SSR disabled for heavy client components) ──────────

const AboutSection = dynamic(() => import('@/components/home/AboutSection'), {
  ssr: false,
  loading: () => (
    <div className={styles.loading}>
      <LoadingSpinner size="lg" label="Loading…" />
    </div>
  ),
});

const Activities = dynamic(() => import('@/components/home/Activities'), {
  ssr: false,
  loading: () => (
    <div className={styles.loading}>
      <LoadingSpinner size="lg" label="Loading activities…" />
    </div>
  ),
});

const RegistrationCTA = dynamic(
  () => import('@/components/home/RegistrationCTA'),
  { ssr: false },
);

const Footer = dynamic(() => import('@/components/home/Footer'), { ssr: false });

const RegistrationModal = dynamic(
  () => import('@/components/home/RegistrationModal'),
  { ssr: false },
);

/**
 * Home page — assembles SpaceDust, PublicNav, Hero, all lazy sections,
 * and the registration modal (toggled from Nav + Hero CTAs).
 */
export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <main className={`${styles.main} noise-overlay`}>
      {/* Background particles */}
      <SpaceDust />

      {/* Navigation */}
      <PublicNav onRegisterClick={openModal} />

      {/* Hero — server-rendered immediately */}
      <Hero onRegisterClick={openModal} />

      {/* Lazy-loaded sections — deferred until scrolled into view */}
      <LazyLoadSection
        placeholderHeight="400px"
        rootMargin="0px 0px -100px 0px"
      >
        <AboutSection />
      </LazyLoadSection>

      {/* Divider */}
      <div
        aria-hidden="true"
        className={`container-section ${styles.divider}`}
      >
        <div
          className={styles.dividerLine}
        />
      </div>

      <LazyLoadSection
        placeholderHeight="500px"
        rootMargin="0px 0px -100px 0px"
      >
        <Activities />
      </LazyLoadSection>

      <LazyLoadSection
        placeholderHeight="300px"
        rootMargin="0px 0px -60px 0px"
      >
        <RegistrationCTA onRegisterClick={openModal} />
      </LazyLoadSection>

      <LazyLoadSection placeholderHeight="200px">
        <Footer />
      </LazyLoadSection>

      {/* Registration Modal — portaled via Next.js Suspense boundary */}
      <Suspense>
        <RegistrationModal isOpen={isModalOpen} onClose={closeModal} />
      </Suspense>
    </main>
  );
}
