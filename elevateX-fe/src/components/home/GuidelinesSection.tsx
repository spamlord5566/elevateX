'use client';

import { m } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchGuidelines, type GuidelineSection } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { CheckCircle, Download, FileText, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import styles from './GuidelinesSection.module.css';

// ─── Guideline Card ────────────────────────────────────────

function GuidelineCard({
  section,
  index,
}: {
  section: GuidelineSection;
  index: number;
}) {
  const icons = [
    <BookOpen key="book" size={20} />,
    <FileText key="file" size={20} />,
    <CheckCircle key="check" size={20} />,
    <FileText key="file2" size={20} />,
  ];

  return (
    <m.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className={styles.card}
    >
      <div className={styles.cardHeader}>
        <div className={styles.icon}>
          {icons[index % icons.length]}
        </div>
        <h3 className={styles.cardTitle}>
          {section.title}
        </h3>
      </div>
      <ul className={styles.itemList} role="list">
        {section.items.map((item, i) => (
          <li key={i} className={styles.item}>
            <span className={styles.marker} aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </m.div>
  );
}

// ─── Main Section ─────────────────────────────────────────

/**
 * Guidelines & Rules section — fetches from mock API,
 * renders cards grid, and provides a PDF download link.
 *
 * TODO: Replace '/files/guidelines.pdf' with a real Cloudinary/S3 URL.
 */
export default function GuidelinesSection() {
  const { data: guidelines, isLoading, isError } = useQuery({
    queryKey: ['guidelines'],
    queryFn: fetchGuidelines,
  });

  return (
    <section
      id="guidelines"
      aria-labelledby="guidelines-heading"
      className={styles.section}
    >
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className={styles.background}
      />

      <div className={`container-section ${styles.inner}`}>
        {/* Section Header */}
        <div className={styles.header}>
          <span className={styles.eyebrow}>
            Rules & Regulations
          </span>
          <h2
            id="guidelines-heading"
            className={`heading-lg ${styles.heading}`}
          >
            Hackathon{' '}
            <span className={`text-glow ${styles.accent}`}>
              Guidelines
            </span>
          </h2>
          <p className={styles.description}>
            Before you register, know the rules. Fair play, genuine innovation,
            and mutual respect are the foundations of ElevateX.
          </p>
        </div>

        {/* States */}
        {isLoading && (
          <div className={styles.loadingState}>
            <LoadingSpinner size="lg" label="Loading guidelines…" />
          </div>
        )}

        {isError && (
          <div role="alert" className={styles.errorState}>
            Failed to load guidelines.
          </div>
        )}

        {/* Guidelines Grid */}
        {guidelines && (
          <div className={styles.grid}>
            {guidelines.map((section, i) => (
              <GuidelineCard key={section.id} section={section} index={i} />
            ))}
          </div>
        )}

        {/* PDF Download CTA */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className={`glass-card ${styles.download}`}
        >
          <div className={styles.downloadInfo}>
            <div className={styles.icon}>
              <Download size={24} />
            </div>
            <div className={styles.downloadText}>
              <p className={styles.downloadTitle}>
                Full Guidelines Document
              </p>
              <p className={styles.downloadMeta}>
                PDF · 8 pages · Last updated Aug 2025
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="md"
            leftIcon={<Download size={16} />}
            onClick={() => {
              // TODO: Replace with real file path from Cloudinary/S3
              const link = document.createElement('a');
              link.href = '/files/guidelines.pdf';
              link.download = 'ElevateX-2.0-Guidelines.pdf';
              link.click();
            }}
            aria-label="Download ElevateX 2.0 guidelines PDF"
          >
            Download PDF
          </Button>
        </m.div>
      </div>
    </section>
  );
}
