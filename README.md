# 🧠 Open Trivia

**Challenge your mind with exciting quizzes across categories and climb the global leaderboards.**

A full-stack real-time trivia platform built with **Next.js 15**, **Firebase**, and the **Open Trivia Database API** — featuring live leaderboards, admin moderation, daily challenges, and a "Did You Know?" fact engine.

---

## ✨ What Makes This Project Unique

### 1. Realtime Competitive Leaderboard with Fairness Engine
Unlike typical quiz apps that just store scores, Open Trivia enforces **standardized quiz rules** (fixed question count, randomized difficulty) so every leaderboard entry is an apples-to-apples comparison. The leaderboard updates **in real-time** via Firestore `onSnapshot` subscriptions — no polling, no refresh needed. A dedicated `ScorePill` component color-codes performance thresholds (green/amber/rose) for instant visual feedback, and a podium system highlights the top 3 with medal cards.

### 2. Privacy-First Score Visibility
Players can **hide or unhide** any of their quiz results from the public leaderboard using an optimistic UI toggle with automatic rollback on failure. This is handled at the Firestore query level (`where("hidden", "!=", true)`), so hidden scores never leave the database — a rare attention to user data privacy in a quiz app.

### 3. Admin Moderation with Audit Trail
Admins can **force-rename offensive nicknames** via a Firebase Cloud Function that:
- Renames the user to `Player####` (random 4-digit ID)
- Masks **all** their historical leaderboard entries in a batch write
- Sets a `needsNicknameReset` flag so the user must re-choose their name
- Writes a full **before/after audit log** to `adminAudit` collection

This is a production-grade moderation pattern rarely seen in student/demo projects.

### 4. Daily Challenge with Countdown Timer
The dashboard features a **Daily Challenge** with a live countdown timer to midnight, a visual progress bar showing how much of the day has passed, and a timed quiz mode (90 seconds). This gamification pattern keeps users coming back.

### 5. "Did You Know?" Interactive Fact Engine
A built-in interactive trivia fact widget on the Dashboard with 20 curated true/false facts, reveal/hide mechanics, random shuffle, and auto-play mode — making the app educational even outside of active quizzes.

### 6. Dual-Field Backward Compatibility
When the data schema evolved (e.g., `nickname` → `nicknameSnapshot`, `percentage` → `accuracy`), instead of a risky migration, the system writes **both old and new field names** simultaneously. This means zero downtime, zero data loss, and existing queries continue to work alongside new ones.

### 7. Smart Nickname Resolution Chain
Determining a user's display name follows a 3-tier fallback:
1. Firebase Auth `displayName` (most authoritative)
2. Explicitly passed nickname parameter
3. localStorage legacy nickname (backward compat)

This gracefully handles the migration from a localStorage-only system to full Firebase Auth without breaking any existing users.

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│                     CLIENT (Next.js 15)                │
│                                                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │Categories│  │ QuizPage │  │Leaderboard│  ← Realtime│
│  │  + emoji │  │ + timer  │  │ + podium  │    updates │
│  │  mapping │  │ + score  │  │ + ScorePill│           │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘           │
│       │              │              │                  │
│  ┌────┴──────────────┴──────────────┴──────┐          │
│  │         Firebase Client SDK              │          │
│  │  Auth · Firestore · onSnapshot           │          │
│  └──────────────────┬──────────────────────┘          │
└─────────────────────┼──────────────────────────────────┘
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
   ┌────────────┐ ┌────────┐ ┌─────────────┐
   │  Firestore │ │Firebase│ │ Cloud       │
   │            │ │  Auth  │ │ Functions   │
   │ users      │ │        │ │             │
   │ quizResults│ │ Email/ │ │ moderate-   │
   │ statsDaily │ │ Pass + │ │ Nickname    │
   │ adminAudit │ │ Custom │ │ updateDaily │
   │            │ │ Claims │ │ Stats       │
   └────────────┘ └────────┘ └─────────────┘
          ▲
          │
   ┌──────┴──────────────────────┐
   │  Admin API Routes (Next.js) │
   │  /api/admin/metrics         │
   │  /api/admin/daily-stats     │
   │  Bearer token + admin claim │
   └─────────────────────────────┘
```

### External APIs
- **[Open Trivia Database](https://opentdb.com/)** — Free API with 4,000+ verified questions across 24 categories. Questions are fetched with retry logic, in-memory caching (60s TTL), and rate-limit handling.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript 5.9 |
| **UI Components** | shadcn/ui + Radix Primitives |
| **Styling** | Tailwind CSS 4 |
| **Animation** | Framer Motion |
| **Auth** | Firebase Authentication (email/password + custom claims) |
| **Database** | Cloud Firestore (realtime subscriptions) |
| **Serverless** | Firebase Cloud Functions (moderation triggers) |
| **API Client** | Axios + TanStack React Query |
| **Charts** | Recharts |
| **Deployment** | Vercel |

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/              # Admin dashboard (metrics, moderation, stats)
│   ├── api/admin/          # Server-side admin API routes
│   ├── categories/         # Category browser
│   ├── leaderboard/        # Public leaderboard
│   ├── login/              # Auth with admin mode support
│   ├── quiz/               # Quiz gameplay
│   └── signup/             # Registration
├── components/
│   ├── ui/                 # 50+ shadcn/ui primitives
│   ├── Leaderboard.tsx     # Realtime leaderboard with podium
│   ├── NicknameGate.tsx    # Auth gate component
│   └── auth/               # Protected route wrapper
├── context/
│   └── AuthContext.tsx      # Firebase Auth state provider
├── hooks/                  # Custom hooks (admin auth, theme, toast)
├── lib/                    # Firebase init, admin SDK, constants
├── pages/                  # Page-level components (Dashboard, Quiz, Categories)
├── services/               # Firestore CRUD (quizResults, userProfiles)
└── types/                  # TypeScript interfaces
functions/
└── src/index.ts            # Cloud Functions (moderation, daily stats trigger)
docs/                       # Development documentation (29 files)
```

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Fill in your Firebase config values

# Run development server
npm run dev
```

Visit `http://localhost:3000` — sign up, pick a category, take a quiz, and see your score on the leaderboard in real-time.

---

## 🔑 Key Features Summary

| Feature | Description |
|---------|------------|
| **24 Quiz Categories** | Each with unique emoji + color gradient mapping |
| **Realtime Leaderboard** | Live updates via Firestore subscriptions, podium for top 3 |
| **Fairness Engine** | Standardized 10-question format; non-standard quizzes excluded |
| **Privacy Controls** | Hide/unhide scores with optimistic UI + rollback |
| **Daily Challenge** | Timed quiz mode with countdown-to-midnight widget |
| **Did You Know?** | 20 interactive trivia facts with reveal, shuffle, auto-play |
| **Admin Dashboard** | Metrics, daily stats, user moderation with audit logging |
| **Nickname Moderation** | Cloud Function force-rename + leaderboard masking |
| **Dark Mode** | System-aware theme with manual toggle |
| **Responsive** | Mobile-first design across all pages |
| **SSR-Safe** | All Firebase calls guarded for server-side rendering |

---

## 👥 Team

Built as a capstone project demonstrating full-stack web development with real-time data, cloud functions, role-based access control, and production-grade patterns.

---

## 📄 License

MIT
