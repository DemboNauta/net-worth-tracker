# 💰 Net Worth Tracker

> Track your personal wealth over time — snapshots, categories, charts.

<!-- SCREENSHOT: Hero / Dashboard overview -->
<!-- ![Dashboard](docs/screenshots/dashboard.png) -->

---

## ✨ Features

- **Snapshots** — record your net worth at any point in time
- **Categories** — organize assets and liabilities (savings, investments, debt…)
- **Charts** — area chart, bar chart, pie allocation, trend lines
- **History** — full log of all past snapshots

<!-- SCREENSHOT: Charts section -->
<!-- ![Charts](docs/screenshots/charts.png) -->

---

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | shadcn v4 (Base UI) + Tailwind CSS v4 |
| Database | better-sqlite3 (local SQLite) |
| Charts | Recharts |
| Language | TypeScript |

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

<!-- SCREENSHOT: Categories manager -->
<!-- ![Categories](docs/screenshots/categories.png) -->

---

## 🗄 Database

SQLite file lives at `data/net-worth-tracker.db` — created automatically on first run. Not committed to git.

Seed example data:

```bash
node scripts/seed-example.js
```

<!-- SCREENSHOT: Snapshot history / table view -->
<!-- ![History](docs/screenshots/history.png) -->

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/          # REST endpoints (categories, snapshots, stats)
│   ├── categorias/   # Categories page
│   ├── historial/    # History page
│   └── page.tsx      # Dashboard
├── components/
│   ├── charts/       # Recharts wrappers
│   ├── forms/        # Category & snapshot forms
│   └── ui/           # shadcn components
└── lib/
    ├── db.ts         # SQLite client + queries
    ├── types.ts      # Shared types
    └── utils.ts      # Helpers
```

---

## 📄 License

MIT
