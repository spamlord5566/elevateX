'use client';

import { useEffect, useRef } from 'react';
import styles from './SpaceDust.module.css';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
}

/**
 * SpaceDust — subtle canvas-based particle field creating a deep-space feel.
 *
 * - Renders tiny yellow/white particles drifting upward at different speeds.
 * - Particles fade in/out based on their lifecycle.
 * - Respects prefers-reduced-motion by reducing particle count to near zero.
 * - Uses requestAnimationFrame with cleanup to prevent memory leaks.
 */
export default function SpaceDust() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    const PARTICLE_COUNT = prefersReducedMotion ? 8 : 80;

    let animationId: number;
    let width = 0;
    let height = 0;

    function resize() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function createParticle(): Particle {
      const maxLife = 200 + Math.random() * 300;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.2 - Math.random() * 0.5, // float upward
        size: 0.5 + Math.random() * 1.5,
        opacity: 0,
        life: Math.random() * maxLife, // stagger initial positions
        maxLife,
      };
    }

    resize();
    window.addEventListener('resize', resize);

    const particles: Particle[] = Array.from(
      { length: PARTICLE_COUNT },
      createParticle,
    );

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        // Lifecycle
        p.life += 1;
        if (p.life > p.maxLife) {
          // Reset particle at the bottom
          Object.assign(p, createParticle(), { y: height + 10, life: 0 });
        }

        // Fade in for first 20% of life, hold, fade out for last 20%
        const lifeFraction = p.life / p.maxLife;
        if (lifeFraction < 0.2) {
          p.opacity = lifeFraction / 0.2;
        } else if (lifeFraction > 0.8) {
          p.opacity = (1 - lifeFraction) / 0.2;
        } else {
          p.opacity = 1;
        }

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wrap horizontally
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        // Draw — alternate yellow / white for variety
        const isYellow = Math.random() > 0.85;
        const color = isYellow ? '212, 240, 0' : '255, 255, 255';

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${p.opacity * 0.7})`;
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={styles.canvas}
    />
  );
}
