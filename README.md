# 💰 Net Worth Tracker

> Track your personal wealth over time — snapshots, categories, charts.

<!-- SCREENSHOT: Hero / Dashboard overview -->
<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/270db526-ba0f-4560-b318-fd25c93b704d" />


---

## ✨ Features

- **Snapshots** — record your net worth at any point in time
- **Categories** — organize assets and liabilities (savings, investments, debt…)
- **Charts** — area chart, bar chart, pie allocation, trend lines
- **History** — full log of all past snapshots

<!-- SCREENSHOT: Charts section -->
<img width="1122" height="597" alt="image" src="https://github.com/user-attachments/assets/d6746fbb-3939-4a2a-8adb-de3f2dbb3db4" />
<img width="1089" height="620" alt="image" src="https://github.com/user-attachments/assets/fbcae350-0944-41c7-9c10-e5a8e5bd7378" />


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
<img width="1916" height="653" alt="image" src="https://github.com/user-attachments/assets/dc05b3f8-1a16-4851-ad9f-40e24c3c4b50" />


---

## 🗄 Database

SQLite file lives at `data/net-worth-tracker.db` — created automatically on first run. Not committed to git.

Seed example data:

```bash
node scripts/seed-example.js
```

<!-- SCREENSHOT: Snapshot history / table view -->
<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/c3b2aa5a-abf6-4b1c-b347-1bd718e1b2d2" />


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
