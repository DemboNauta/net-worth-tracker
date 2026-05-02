import { NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function GET(req: Request) {
  const db = getDb();
  const { searchParams } = new URL(req.url);
  const years = searchParams.get("years")?.split(",").filter(Boolean) || [];

  // Latest snapshot per account per category
  const latestPerCategory = db
    .prepare(
      `SELECT c.id as category_id, c.name as category_name, c.color as category_color,
              c.icon as category_icon,
              COALESCE((
                SELECT SUM(s.amount)
                FROM snapshots s
                WHERE s.id IN (
                  SELECT MAX(id) FROM snapshots
                  WHERE category_id = c.id
                  GROUP BY COALESCE(account, '__unnamed__')
                )
              ), 0) as total
       FROM categories c
       ORDER BY c.name`
    )
    .all();

  // Monthly totals with carry-forward: for each month, use last known value per account
  const yearFilter =
    years.length > 0
      ? `WHERE strftime('%Y', date) IN (${years.map(() => "?").join(",")})`
      : "";

  const monthlyRaw = db
    .prepare(
      `WITH all_months AS (
         SELECT DISTINCT strftime('%Y-%m', date) as month FROM snapshots ${yearFilter}
       ),
       all_accounts AS (
         SELECT DISTINCT category_id, COALESCE(account, '__unnamed__') as acct FROM snapshots
       ),
       carry_forward AS (
         SELECT
           m.month,
           a.category_id,
           a.acct,
           (
             SELECT s.amount FROM snapshots s
             WHERE s.category_id = a.category_id
               AND COALESCE(s.account, '__unnamed__') = a.acct
               AND strftime('%Y-%m', s.date) <= m.month
             ORDER BY s.date DESC, s.id DESC
             LIMIT 1
           ) as amount
         FROM all_months m
         CROSS JOIN all_accounts a
       )
       SELECT month, category_id, SUM(amount) as amount
       FROM carry_forward
       WHERE amount IS NOT NULL
       GROUP BY month, category_id
       ORDER BY month`
    )
    .all(...years) as { month: string; category_id: number; amount: number }[];

  // Get all categories for pivot
  const categories = db
    .prepare("SELECT * FROM categories ORDER BY name")
    .all() as { id: number; name: string; color: string; icon: string }[];

  // Pivot monthly data
  const monthMap = new Map<string, Record<string, number>>();
  for (const row of monthlyRaw) {
    if (!monthMap.has(row.month)) monthMap.set(row.month, { month: row.month as unknown as number });
    monthMap.get(row.month)![row.category_id] = row.amount;
  }
  const monthlyTotals = Array.from(monthMap.values()).map((m) => {
    let total = 0;
    for (const cat of categories) {
      const val = (m[cat.id] as number) || 0;
      m[cat.id] = val;
      total += val;
    }
    m.total = total;
    return m;
  });

  // Yearly totals with carry-forward
  const yearlyRaw = db
    .prepare(
      `WITH all_years AS (
         SELECT DISTINCT strftime('%Y', date) as year FROM snapshots
       ),
       all_accounts AS (
         SELECT DISTINCT category_id, COALESCE(account, '__unnamed__') as acct FROM snapshots
       ),
       carry_forward AS (
         SELECT
           y.year,
           a.category_id,
           a.acct,
           (
             SELECT s.amount FROM snapshots s
             WHERE s.category_id = a.category_id
               AND COALESCE(s.account, '__unnamed__') = a.acct
               AND strftime('%Y', s.date) <= y.year
             ORDER BY s.date DESC, s.id DESC
             LIMIT 1
           ) as amount
         FROM all_years y
         CROSS JOIN all_accounts a
       )
       SELECT year, category_id, SUM(amount) as amount
       FROM carry_forward
       WHERE amount IS NOT NULL
       GROUP BY year, category_id
       ORDER BY year`
    )
    .all() as { year: string; category_id: number; amount: number }[];

  const yearMap = new Map<string, Record<string, number>>();
  for (const row of yearlyRaw) {
    if (!yearMap.has(row.year)) yearMap.set(row.year, { year: row.year as unknown as number });
    yearMap.get(row.year)![row.category_id] = row.amount;
  }
  const yearlyTotals = Array.from(yearMap.values()).map((y) => {
    let total = 0;
    for (const cat of categories) {
      const val = (y[cat.id] as number) || 0;
      y[cat.id] = val;
      total += val;
    }
    y.total = total;
    return y;
  });

  // Available years
  const availableYears = db
    .prepare(
      "SELECT DISTINCT strftime('%Y', date) as year FROM snapshots ORDER BY year DESC"
    )
    .all() as { year: string }[];

  // Distinct accounts per category for autocomplete
  const accountsList = db
    .prepare(
      `SELECT DISTINCT category_id, account FROM snapshots
       WHERE account IS NOT NULL AND account != ''
       ORDER BY account`
    )
    .all() as { category_id: number; account: string }[];

  return NextResponse.json({
    categories,
    latestPerCategory,
    monthlyTotals,
    yearlyTotals,
    availableYears: availableYears.map((r) => r.year),
    accounts: accountsList,
  });
}
