import { NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb();
  const { id } = await params;
  const { category_id, amount, date, account } = await req.json();

  db.prepare(
    "UPDATE snapshots SET category_id = ?, amount = ?, date = ?, account = ? WHERE id = ?"
  ).run(category_id, amount, date, account || null, id);

  const snapshot = db
    .prepare(
      `SELECT s.*, c.name as category_name, c.color as category_color, c.icon as category_icon
       FROM snapshots s JOIN categories c ON s.category_id = c.id WHERE s.id = ?`
    )
    .get(id);

  return NextResponse.json(snapshot);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb();
  const { id } = await params;
  db.prepare("DELETE FROM snapshots WHERE id = ?").run(id);
  return NextResponse.json({ ok: true });
}
