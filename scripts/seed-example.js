const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'data', 'example.db');
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    account TEXT,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );
`);

const insertCat = db.prepare(`INSERT INTO categories (name, color, icon, created_at) VALUES (?, ?, ?, ?)`);
const insertSnap = db.prepare(`INSERT INTO snapshots (category_id, amount, date, notes, created_at, account) VALUES (?, ?, ?, ?, ?, ?)`);

const cats = [
  { name: 'Efectivo',  color: '#22c55e', icon: 'banknotes' },
  { name: 'Banco',     color: '#3b82f6', icon: 'building-columns' },
  { name: 'Crypto',    color: '#f59e0b', icon: 'bitcoin' },
  { name: 'Invertido', color: '#8b5cf6', icon: 'trending-up' },
];

const catIds = {};
for (const c of cats) {
  const r = insertCat.run(c.name, c.color, c.icon, '2025-09-01 10:00:00');
  catIds[c.name] = r.lastInsertRowid;
}

// Accounts per category (fictional)
// Efectivo: Cartera
// Banco: BBVA, ING
// Crypto: Binance, Kraken
// Invertido: MyFunds, Degiro

const months = [
  '2025-09-01',
  '2025-10-01',
  '2025-11-01',
  '2025-12-01',
  '2026-01-01',
  '2026-02-01',
  '2026-03-01',
  '2026-04-01',
  '2026-05-01',
];

// Base amounts that evolve month-to-month with realistic drift
const series = {
  Cartera:  [320, 290, 410, 380, 450, 510, 475, 390, 440],
  BBVA:     [3100, 3250, 2980, 3400, 3150, 2800, 3600, 3720, 3890],
  ING:      [820, 940, 1050, 880, 1100, 1230, 1180, 1340, 1420],
  Binance:  [1450, 1280, 1590, 2100, 1870, 2340, 2050, 2680, 2490],
  Kraken:   [430, 390, 520, 710, 650, 820, 740, 960, 890],
  MyFunds:  [5200, 5380, 5290, 5610, 5740, 5530, 5890, 6120, 6250],
  Degiro:   [2100, 2050, 2230, 2380, 2290, 2450, 2600, 2710, 2880],
};

const accountCategory = {
  Cartera:  'Efectivo',
  BBVA:     'Banco',
  ING:      'Banco',
  Binance:  'Crypto',
  Kraken:   'Crypto',
  MyFunds:  'Invertido',
  Degiro:   'Invertido',
};

let id = 1;
for (let mi = 0; mi < months.length; mi++) {
  const date = months[mi];
  const createdAt = date.replace('01', '01') + ' 09:00:00';
  for (const [account, amounts] of Object.entries(series)) {
    const cat = accountCategory[account];
    const catId = catIds[cat];
    const amount = amounts[mi];
    insertSnap.run(catId, amount, date, account, createdAt, account);
    id++;
  }
}

console.log(`Created example.db with ${id - 1} snapshots across ${months.length} months.`);
db.close();
