import { NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function GET(req: Request) {
  const db = getDb();
  const { searchParams } = new URL(req.url);
  const year = searchParams.get("year");
  const categoryId = searchParams.get("category_id");

  let query = `
    SELECT s.*, c.name as category_name, c.color as category_color, c.icon as category_icon
    FROM snapshots s
    JOIN categories c ON s.category_id = c.id
    WHERE 1=1
  `;
  const args: (string | number)[] = [];

  if (year) {
    query += " AND strftime('%Y', s.date) = ?";
    args.push(year);
  }
  if (categoryId) {
    query += " AND s.category_id = ?";
    args.push(categoryId);
  }

  query += " ORDER BY s.date DESC";

  const snapshots = db.prepare(query).all(...args);
  return NextResponse.json(snapshots);
}

export async function POST(req: Request) {
  const db = getDb();
  const { category_id, amount, date, account } = await req.json();

  if (!category_id || amount === undefined || !date) {
    return NextResponse.json(
      { error: "category_id, amount, date required" },
      { status: 400 }
    );
  }

  const result = db
    .prepare(
      "INSERT INTO snapshots (category_id, amount, date, account) VALUES (?, ?, ?, ?)"
    )
    .run(category_id, amount, date, account || null);

  const snapshot = db
    .prepare(
      `SELECT s.*, c.name as category_name, c.color as category_color, c.icon as category_icon
       FROM snapshots s JOIN categories c ON s.category_id = c.id WHERE s.id = ?`
    )
    .get(result.lastInsertRowid);

  return NextResponse.json(snapshot, { status: 201 });
}
