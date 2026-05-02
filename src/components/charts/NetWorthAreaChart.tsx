"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency, formatMonth } from "@/lib/format";
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

export function NetWorthAreaChart({ data, categories }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Sin datos. Agrega snapshots para ver la evolución.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data} margin={{ top: 10, right: 16, left: 8, bottom: 0 }}>
        <defs>
          {categories.map((cat) => (
            <linearGradient key={cat.id} id={`grad-${cat.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={cat.color} stopOpacity={0.55} />
              <stop offset="100%" stopColor={cat.color} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          strokeOpacity={0.6}
          vertical={false}
        />
        <XAxis
          dataKey="month"
          tickFormatter={(v) => formatMonth(v as string)}
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
          cursor={{ stroke: "var(--border)", strokeWidth: 1.5, strokeDasharray: "4 2" }}
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
          labelFormatter={(v) => formatMonth(v as string)}
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
        {categories.map((cat) => (
          <Area
            key={cat.id}
            type="monotone"
            dataKey={String(cat.id)}
            stackId="1"
            stroke={cat.color}
            fill={`url(#grad-${cat.id})`}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
