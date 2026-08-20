/**
 * ElevateX 2.0 — Next.js API Route Mock
 *
 * In the UI-only clone, we use client-side mocks rather than
 * API routes to keep the project dependency-free.
 *
 * If you prefer API route-based mocking, you can create files:
 *   src/app/api/mock/tracks/route.ts
 *   src/app/api/mock/guidelines/route.ts
 *   src/app/api/mock/leaderboard/route.ts
 *
 * Example route handler:
 *
 * import { NextResponse } from 'next/server';
 * import { MOCK_TRACKS } from '@/lib/mocks/mockServer';
 *
 * export async function GET() {
 *   await new Promise(r => setTimeout(r, 200)); // simulate delay
 *   return NextResponse.json({ data: MOCK_TRACKS });
 * }
 *
 * Then in api.ts, replace mockFetch with:
 *   const res = await fetch('/api/mock/tracks');
 *   return res.json();
 */
