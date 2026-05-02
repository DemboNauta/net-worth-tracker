# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # dev server
npm run build    # production build
npm run start    # start production server
npm run lint     # eslint
node scripts/seed-example.js  # seed DB with example data
```

No test framework configured.

## Architecture

Next.js 16 App Router app. All pages are client components fetching from internal API routes. No server components fetch DB directly — DB access is only in `src/app/api/` route handlers.

**Data flow**: Client component → fetch `/api/*` → Route Handler → `src/lib/db.ts` (better-sqlite3) → `data/money-tracker.db`

### Key layers

- `src/lib/db.ts` — SQLite singleton, schema init, migrations. Schema: `categories` (id, name, color, icon) + `snapshots` (id, category_id FK, amount, date, account). DB file path from `DB_FILE` env var (default: `money-tracker.db`).
- `src/app/api/` — Route handlers: `/categories`, `/categories/[id]`, `/snapshots`, `/snapshots/[id]`, `/stats`
- `src/components/` — UI split into `charts/` (Recharts wrappers), `forms/` (CategoryForm, SnapshotForm), `ui/` (shadcn/base-ui primitives)
- `src/lib/types.ts` — shared interfaces (Category, Snapshot, SnapshotWithCategory, MonthlyTotal, CategoryTotal)
- `src/lib/format.ts` — currency/date formatters for `es-ES` locale

### Pages

| Route | Component |
|-------|-----------|
| `/` | Dashboard — charts + stats |
| `/historial` | Snapshot history list |
| `/categorias` | Category CRUD |

## Stack

- **Next.js 16.2** + React 19 (App Router)
- **better-sqlite3 12** (server-only, listed in `serverExternalPackages`)
- **Tailwind CSS v4** + shadcn 4 (base-ui components)
- **Recharts 3** for charts
- **date-fns 4** + `es-ES` locale throughout
- TypeScript path alias: `@/*` → `src/*`
