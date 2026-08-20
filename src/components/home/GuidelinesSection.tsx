'use client';

import { m } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchGuidelines, type GuidelineSection } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { CheckCircle, Download, FileText, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// ─── Guideline Card ────────────────────────────────────────

function GuidelineCard({
  section,
  index,
}: {
  section: GuidelineSection;
  index: number;
}) {
  const icons = [
    <BookOpen key="book" className="w-5 h-5" />,
    <FileText key="file" className="w-5 h-5" />,
    <CheckCircle key="check" className="w-5 h-5" />,
    <FileText key="file2" className="w-5 h-5" />,
  ];

  return (
    <m.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="glass-card p-6 flex flex-col gap-4"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-yellow)]/10 flex items-center justify-center text-[var(--color-brand-yellow)]">
          {icons[index % icons.length]}
        </div>
        <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
          {section.title}
        </h3>
      </div>
      <ul className="flex flex-col gap-2.5" role="list">
        {section.items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--color-text-muted)] leading-relaxed">
            <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full border border-[var(--color-brand-yellow)]/40 flex items-center justify-center">
              <span
                className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-yellow)]"
                aria-hidden="true"
              />
            </span>
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
      className="relative py-24 px-6"
    >
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 80% 50%, rgba(212,240,0,0.04) 0%, transparent 60%)',
        }}
      />

      <div className="container-section relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase text-[var(--color-brand-yellow)] border border-[var(--color-brand-yellow)]/30 mb-4">
            Rules & Regulations
          </span>
          <h2
            id="guidelines-heading"
            className="heading-lg text-[var(--color-text-primary)] mb-4"
          >
            Hackathon{' '}
            <span className="text-[var(--color-brand-yellow)] text-glow">
              Guidelines
            </span>
          </h2>
          <p className="text-[var(--color-text-muted)] max-w-xl mx-auto leading-relaxed">
            Before you register, know the rules. Fair play, genuine innovation,
            and mutual respect are the foundations of ElevateX.
          </p>
        </div>

        {/* States */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" label="Loading guidelines…" />
          </div>
        )}

        {isError && (
          <div role="alert" className="text-center py-16 text-red-400">
            Failed to load guidelines.
          </div>
        )}

        {/* Guidelines Grid */}
        {guidelines && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
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
          className="flex flex-col sm:flex-row items-center justify-center gap-4 glass-card p-8 border border-[var(--color-brand-yellow)]/20"
        >
          <div className="flex items-center gap-3 text-left">
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-brand-yellow)]/10 flex items-center justify-center text-[var(--color-brand-yellow)] shrink-0">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-[var(--color-text-primary)]">
                Full Guidelines Document
              </p>
              <p className="text-sm text-[var(--color-text-muted)]">
                PDF · 8 pages · Last updated Aug 2025
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="md"
            leftIcon={<Download className="w-4 h-4" />}
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
