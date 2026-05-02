import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(
  process.cwd(),
  "data",
  process.env.DB_FILE ?? "example.db"
);

let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    const fs = require("fs");
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    migrate(db);
  }
  return db;
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#6366f1',
      icon TEXT NOT NULL DEFAULT 'wallet',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_snapshots_date ON snapshots(date);
    CREATE INDEX IF NOT EXISTS idx_snapshots_category ON snapshots(category_id);
  `);

  // Add account column if not exists, migrate data from notes
  const cols = db.prepare("PRAGMA table_info(snapshots)").all() as { name: string }[];
  if (!cols.some((c) => c.name === "account")) {
    db.exec(`
      ALTER TABLE snapshots ADD COLUMN account TEXT;
      UPDATE snapshots SET account = notes WHERE notes IS NOT NULL;
    `);
  }

  // Seed default categories if empty
  const count = (db.prepare("SELECT COUNT(*) as c FROM categories").get() as { c: number }).c;
  if (count === 0) {
    const insert = db.prepare(
      "INSERT INTO categories (name, color, icon) VALUES (?, ?, ?)"
    );
    const seed = db.transaction(() => {
      insert.run("Efectivo", "#22c55e", "banknotes");
      insert.run("Banco", "#3b82f6", "building-columns");
      insert.run("Crypto", "#f59e0b", "bitcoin");
      insert.run("Invertido", "#8b5cf6", "trending-up");
    });
    seed();
  }
}

export default getDb;
