'use client';

import { m } from 'framer-motion';
import { Users, Sparkles, HeartHandshake } from 'lucide-react';
import styles from './AboutSection.module.css';

const points = [
  {
    icon: <Users size={20} />,
    text: 'Meet your batchmates and build friendships from day one.',
  },
  {
    icon: <HeartHandshake size={20} />,
    text: 'Connect with seniors and alumni for guidance and stories.',
  },
  {
    icon: <Sparkles size={20} />,
    text: 'Step outside your comfort zone and have fun doing it.',
  },
];

/**
 * About / event-purpose section — explains what ElevateX actually is
 * for incoming freshers, ahead of the Activities section.
 */
export default function AboutSection() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className={styles.section}
    >
      <div className={`container-section ${styles.inner}`}>
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={styles.header}
        >
          <span className={styles.eyebrow}>Why ElevateX</span>
          <h2 id="about-heading" className={`heading-lg ${styles.heading}`}>
            More Than Just{' '}
            <span className={`text-glow ${styles.accent}`}>an Introduction</span>
          </h2>
          <p className={styles.description}>
            Starting college means stepping into a completely new environment
            and meeting a whole new group of people. ElevateX is designed to
            make those first interactions easier — a space to meet your
            batchmates, connect with seniors and alumni, step outside your
            comfort zone, have fun and create memories together.
          </p>
        </m.div>

        <m.ul
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className={styles.points}
          aria-label="What ElevateX offers"
        >
          {points.map((point) => (
            <li key={point.text} className={styles.point}>
              <span className={styles.pointIcon} aria-hidden="true">
                {point.icon}
              </span>
              <span>{point.text}</span>
            </li>
          ))}
        </m.ul>
      </div>
    </section>
  );
}
