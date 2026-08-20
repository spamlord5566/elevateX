import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';

/**
 * Primary body font — clean, modern sans-serif
 */
export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

/**
 * Display / heading font — geometric, impactful
 */
export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

/**
 * Monospace font — used for code snippets & leaderboard IDs
 */
export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

/** Combined class string to apply to <html> */
export const fontVariables = `${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`;
