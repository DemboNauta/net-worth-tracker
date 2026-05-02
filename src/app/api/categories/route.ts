import { NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function GET() {
  const db = getDb();
  const categories = db.prepare("SELECT * FROM categories ORDER BY name").all();
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const db = getDb();
  const { name, color, icon } = await req.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  try {
    const result = db
      .prepare("INSERT INTO categories (name, color, icon) VALUES (?, ?, ?)")
      .run(name.trim(), color || "#6366f1", icon || "wallet");

    const category = db
      .prepare("SELECT * FROM categories WHERE id = ?")
      .get(result.lastInsertRowid);

    return NextResponse.json(category, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Name already exists" }, { status: 409 });
  }
}
