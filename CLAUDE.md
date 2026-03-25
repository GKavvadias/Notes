# CLAUDE.md

We are building the app described in @SPEC.MD. Read the file for general architectural tasks or to double-check the exact database structure, tech stack or application architecture.

Keep your replies extremely concise and focus on conveying the key information. No unnecessary fluff, no long code snippets.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev        # Start development server
bun build      # Production build
bun start      # Start production server
bun lint       # Run ESLint
```

## Environment Setup

Copy `.env.example` to `.env.local` and fill in:

- `BETTER_AUTH_SECRET` – must be 32+ characters
- `DB_PATH` – path to SQLite file (e.g. `data/app.db`)

## Architecture

This is a **Next.js 16 App Router** app using **Bun** as the runtime and package manager. It's a note-taking app with auth, rich-text editing, and public note sharing.

### Key layers

**Database (`lib/db.ts`)** – Singleton Bun SQLite connection with helper wrappers (`query<T>`, `get<T>`, `run`). Uses raw SQL, no ORM.

**Note repository (`lib/notes.ts`)** – All note DB operations. Every query scopes to `user_id` to prevent cross-user access. Notes store TipTap content as stringified JSON in `content_json`.

**API routes (`app/api/`)** – REST-like route handlers under `/api/notes` (list, create, get, update, delete, share toggle) and `/api/public-notes/[slug]` for unauthenticated reads.

**Auth** – `better-auth` handles session management. All `/dashboard` and `/notes/[id]` routes check auth server-side. A server helper (e.g. `lib/auth.ts`) exposes `getCurrentUser()` / `getSession()`.

**Editor** – TipTap with `StarterKit` (headings H1–H3, bold, italic, bullet lists, horizontal rule), inline `Code`, and `CodeBlock`. Content is always stored/retrieved as `JSON.stringify`/`JSON.parse` of TipTap's JSON format.

### Route structure

- `/` – Landing page
- `/dashboard` – Authenticated notes list
- `/notes/[id]` – Note editor (TipTap, title, share toggle, delete)
- `/p/[slug]` – Public read-only note view
- `/auth/login`, `/auth/register` – Auth pages

### Database schema

- `better-auth` manages: `user`, `session`, `account`, `verification` tables
- App manages: `notes` table with `id`, `user_id`, `title`, `content_json`, `is_public`, `public_slug`, `created_at`, `updated_at`
- Indexes on `notes.user_id`, `notes.public_slug`, `notes.is_public`

DB initialization runs via a script (e.g. `scripts/init-db.ts`) or manual SQL.

### Sharing

When a note is made public (`POST /api/notes/:id/share` with `isPublic: true`), a `nanoid`-generated slug is assigned. Disabling sharing clears the slug. Public pages resolve via `public_slug` and return 404 if `is_public = 0`.

### Styling

Tailwind CSS v4 (configured via `postcss.config.mjs`). Minimal neutral design with card-like note containers. Consider `@tailwindcss/typography` for read-only prose rendering.
