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
- Prisma + PostgreSQL
- Zod validation
- bcryptjs + JWT session cookies

## Local setup
1. Install dependencies: `npm install`
2. Create a PostgreSQL database and update `DATABASE_URL` in `.env.local`
3. Run: `npx prisma generate`
4. Run: `npx prisma db push`
5. Run: `npm run dev`

## Environment
Copy `.env.example` to `.env.local` and configure:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/jamb_cbt"
AUTH_SECRET="replace-with-secure-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Prisma commands
- `npx prisma generate`
- `npx prisma db push`
- `npx prisma studio`
- `npx prisma migrate dev`

## Seed data
- `npx prisma db push`
- `npx ts-node prisma/seed.ts`

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
Use the admin import panel or the API route `/api/questions/import` with a JSON or CSV file.

## Scripts
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — production server
- `npm run lint` — lint the app
- `npm run prisma:generate` — generate Prisma client
- `npm run prisma:push` — push schema to database
