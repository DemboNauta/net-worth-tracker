import { NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb();
  const { id } = await params;
  const { name, color, icon } = await req.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  try {
    db.prepare(
      "UPDATE categories SET name = ?, color = ?, icon = ? WHERE id = ?"
    ).run(name.trim(), color, icon, id);

    const category = db
      .prepare("SELECT * FROM categories WHERE id = ?")
      .get(id);

    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: "Name already exists" }, { status: 409 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb();
  const { id } = await params;
  db.prepare("DELETE FROM categories WHERE id = ?").run(id);
  return NextResponse.json({ ok: true });
}
