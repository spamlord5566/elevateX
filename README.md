# ElevateX 2.0 — Frontend Clone

A pixel-accurate, fully functional UI-only clone of the ElevateX 2.0 hackathon website, built with **Next.js 15 App Router**, **TypeScript**, **Tailwind CSS v4**, **Framer Motion**, and **TanStack React Query**.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (or 20+ recommended)
- npm 9+

### Install & Run

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## ✅ Verification Checklist

After `npm run dev` starts successfully, verify the following:

| Test | Steps | Expected Result |
|------|-------|-----------------|
| Home renders | Visit `http://localhost:3000` | Hero section loads with animated particles |
| Tracks load | Scroll to Tracks section | 6 track cards appear with staggered animation |
| Guidelines load | Scroll to Guidelines | 4 guideline cards + PDF download button |
| Registration modal | Click "Register Now" in hero | Multi-step modal opens |
| Step validation | Leave fields empty, click Continue | Inline validation errors appear |
| Registration submit | Complete all 4 steps, click Submit | Toast notification: "Team registered!" |
| Login page | Visit `http://localhost:3000/login` | Login form renders |
| Mock login | Use `demo@elevatex.in` / `demo123` | Success toast + redirect to /dashboard |
| Dashboard | Visit `http://localhost:3000/dashboard` | Dashboard placeholder renders |
| Mobile nav | Resize to ≤ 768px, click hamburger | Slide-over menu appears |
| Keyboard nav | Tab through nav, press Escape in modal | Focus trap works, Escape closes modal |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout — providers + fonts
│   ├── globals.css         # Design tokens + global styles
│   ├── page.tsx            # Home page (composed from sections)
│   ├── dashboard/page.tsx  # Dashboard placeholder
│   └── login/page.tsx      # Login with mock auth
├── components/
│   ├── layout/
│   │   └── PublicNav.tsx   # Sticky nav with hamburger menu
│   ├── home/
│   │   ├── Hero.tsx        # Full-viewport hero
│   │   ├── SpaceDust.tsx   # Canvas particle animation
│   │   ├── Tracks.tsx      # Tracks grid (react-query)
│   │   ├── GuidelinesSection.tsx
│   │   ├── RegistrationCTA.tsx
│   │   ├── RegistrationModal.tsx  # Multi-step wizard
│   │   └── Footer.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Toast.tsx       # Toast provider + useToast hook
│   │   ├── LazyLoadSection.tsx
│   │   └── LoadingSpinner.tsx
│   └── providers/
│       ├── QueryProvider.tsx
│       └── MotionProvider.tsx
└── lib/
    ├── fonts.ts
    ├── api.ts              # API abstraction layer
    └── mocks/
        └── mockServer.ts   # In-memory mock data
```

---

## 🔄 Switching from Mock to Real API

All data fetching is centralised in `src/lib/api.ts`. Each function has a `TODO` comment showing exactly how to swap it:

```typescript
// src/lib/api.ts

// Current (mock):
export async function fetchTracks(): Promise<Track[]> {
  const res = await mockFetch('/api/mock/tracks');
  return res.data as Track[];
}

// Replace with (real):
export async function fetchTracks(): Promise<Track[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/tracks`);
  return (await res.json()).data as Track[];
}
```

---

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--color-brand-yellow` | `#d4f000` | CTAs, highlights, glows |
| `--color-brand-black` | `#090909` | Base background |
| `--color-surface-1` | `#111111` | Elevated surfaces |
| `--color-glass` | `rgba(255,255,255,0.04)` | Card backgrounds |
| `--font-display` | Space Grotesk | Headings |
| `--font-sans` | Inter | Body text |

CSS utilities: `.glass-card`, `.text-glow`, `.btn-glow`, `.container-section`, `.heading-xl/lg/md`

---

## 🛠 Available Scripts

```bash
npm run dev         # Start dev server (port 3000)
npm run build       # Production build
npm start           # Serve production build
npm run lint        # ESLint
npm run type-check  # TypeScript check (no emit)
```

---

## 🌐 Environment Variables

Copy `.env.example` to `.env.local` and fill in values for production:

```bash
cp .env.example .env.local
```

All variables are optional for the UI-only clone — the app runs fully on mocks.

---

## 📦 Key Dependencies

| Package | Purpose |
|---------|---------|
| `next@15` | App Router, SSR, dynamic imports |
| `react@19` | UI framework |
| `framer-motion@11` | Entrance animations, gesture effects |
| `@tanstack/react-query@5` | Server state + caching |
| `tailwindcss@4` | Utility-first styling |
| `zod@3` | Runtime schema validation |
| `lucide-react` | Icon library |
| `clsx` | Conditional class merging |

---

## 🔮 Future Integrations (TODOs)

- **Auth**: NextAuth.js with credentials + OAuth providers
- **Database**: Prisma + PostgreSQL for teams/submissions
- **File uploads**: Cloudinary for project assets + logo
- **Email**: Resend for registration confirmation
- **Realtime**: Pusher/Ably for live leaderboard updates
