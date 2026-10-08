# JAMB CBT Platform

A production-minded JAMB/UTME preparation platform with:
- Practice mode
- Real CBT simulation
- Quick practice
- Question import pipeline
- Admin dashboard
- Server-side exam integrity
- Performance analytics

## Architecture update

This project now follows a keyboard-first, offline-capable CBT architecture aligned to exam-day reliability:

- Offline-first shell: the app can install as a PWA and keep its core UI available when connectivity is intermittent.
- Keyboard-first exam experience: answer selection and navigation are designed to work without a mouse, using predictable focus states and keyboard shortcuts.
- Progressive web app support: manifest metadata, installability, and a service worker support a native-app-like experience on desktop and mobile.
- Local-first question flow: reusable question models and import validation keep the exam logic deterministic and resilient even when network conditions change.

## Key files

- `app/layout.tsx` — app metadata and PWA registration hook
- `components/pwa-register.tsx` — client-side registration of the service worker
- `public/manifest.webmanifest` — installable app manifest
- `public/sw.js` — offline caching for core assets and fallback handling
- `public/offline.html` — offline page shown when the network is unavailable

## Stack
- Next.js
- TypeScript
- Tailwind CSS
- Prisma + SQLite (local)
- Zod validation
- bcryptjs + JWT session cookies

## Local setup
1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` (the default database is `prisma/dev.db`)
3. Run: `npx prisma format`
4. Run: `npx prisma validate`
5. Run: `npx prisma generate`
6. Run: `npx prisma db push`
7. Run: `npm run prisma:seed` to import the canonical JSON question bank
8. Run: `npm run dev`

## Environment
Copy `.env.example` to `.env`. A local development auth key is generated for the lifetime of the server process; sessions expire when the server restarts. Production deployments must configure a stable `AUTH_SECRET`.

The local database URL is `DATABASE_URL="file:./dev.db"`; Prisma resolves this path relative to `prisma/schema.prisma`.

## Prisma commands
- `npx prisma generate`
- `npx prisma db push`
- `npx prisma studio`
- `npx prisma migrate dev`

## Seed data
- `npm run prisma:seed` imports validated JSON question-bank files into SQLite and can be run repeatedly.

## Question bank
The source question data lives in `question-bank/` and follows the canonical JSON schema.

Example:
```json
{
  "version": "1.0",
  "subject": "Biology",
  "year": 2024,
  "questions": [
    {
      "topic": "Cell Biology",
      "subtopic": "Cell Organelles",
      "questionNumber": 1,
      "questionText": "Which organelle is responsible for energy production in a cell?",
      "options": { "A": "Ribosome", "B": "Mitochondrion", "C": "Nucleus", "D": "Golgi apparatus" },
      "correctAnswer": "B",
      "explanation": "The mitochondrion produces ATP.",
      "difficulty": "medium",
      "questionType": "TEXT",
      "source": "Question Bank",
      "isActive": true
    }
  ]
}
```

## Importing data
The files in `question-bank/` are the canonical source dataset. Run `npm run prisma:seed` to validate and import them locally. The admin API currently validates uploads but does not persist them.

## Scripts
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — production server
- `npm run lint` — lint the app
- `npm run prisma:generate` — generate Prisma client
- `npm run prisma:push` — push schema to database
