"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { formatCurrency } from "@/lib/format";
import { Category } from "@/lib/types";

interface Props {
  data: Record<string, number | string>[];
  categories: Category[];
}

function CustomLegend({ payload }: { payload?: { value: string; color: string }[] }) {
  if (!payload) return null;
  return (
    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-1">
      {payload.map((entry) => (
        <li key={entry.value} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: entry.color }} />
          {entry.value}
        </li>
      ))}
    </ul>
  );
}

export function YearlyBarChart({ data, categories }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Sin datos anuales.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 16, left: 8, bottom: 0 }} barCategoryGap="28%">
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          strokeOpacity={0.6}
          vertical={false}
        />
        <XAxis
          dataKey="year"
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
          dy={4}
        />
        <YAxis
          tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
          width={52}
        />
        <Tooltip
          cursor={{ fill: "var(--muted)", opacity: 0.5, radius: 6 }}
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            fontSize: 12,
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            padding: "8px 12px",
            color: "var(--foreground)",
          }}
          labelStyle={{ fontWeight: 600, marginBottom: 4 }}
          formatter={(value, name) => {
            const cat = categories.find((c) => String(c.id) === String(name));
            return [formatCurrency(Number(value)), cat?.name ?? String(name)];
          }}
        />
        <Legend
          content={({ payload }) => (
            <CustomLegend
              payload={payload?.map((p) => {
                const cat = categories.find((c) => String(c.id) === p.value);
                return { value: cat?.name ?? p.value ?? "", color: (p.color as string) ?? "#888" };
              })}
            />
          )}
        />
        {categories.map((cat, idx) => {
          const isTop = idx === categories.length - 1;
          return (
            <Bar
              key={cat.id}
              dataKey={String(cat.id)}
              stackId="a"
              fill={cat.color}
              radius={isTop ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              opacity={0.9}
            />
          );
        })}
      </BarChart>
    </ResponsiveContainer>
  );
}
