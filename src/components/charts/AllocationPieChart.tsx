"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/format";

interface Slice {
  category_id: number;
  category_name: string;
  category_color: string;
  total: number;
}

interface Props {
  data: Slice[];
}

const RADIAN = Math.PI / 180;

function renderCustomLabel({
  cx = 0,
  cy = 0,
  midAngle = 0,
  innerRadius = 0,
  outerRadius = 0,
  percent = 0,
}: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
}) {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={600}
      style={{ fontFamily: "inherit", pointerEvents: "none" }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

function CustomLegend({ payload, total }: { payload?: { value: string; color: string; payload: Slice }[]; total: number }) {
  if (!payload) return null;
  return (
    <ul className="flex flex-col gap-1.5 mt-2">
      {payload.map((entry) => (
        <li key={entry.payload.category_id} className="flex items-center justify-between gap-3 text-xs">
          <span className="flex items-center gap-1.5 min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: entry.color }}
            />
            <span className="truncate text-muted-foreground">{entry.value}</span>
          </span>
          <span className="font-semibold tabular-nums text-foreground shrink-0">
            {formatCurrency(entry.payload.total)}
            <span className="text-muted-foreground font-normal ml-1">
              ({total > 0 ? ((entry.payload.total / total) * 100).toFixed(1) : 0}%)
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function AllocationPieChart({ data }: Props) {
  const filtered = data.filter((d) => d.total > 0);
  const total = filtered.reduce((s, d) => s + d.total, 0);

  if (filtered.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        Sin patrimonio registrado.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <defs>
            {filtered.map((entry) => (
              <filter key={entry.category_id} id={`shadow-${entry.category_id}`} x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={entry.category_color} floodOpacity="0.3" />
              </filter>
            ))}
          </defs>
          <Pie
            data={filtered}
            dataKey="total"
            nameKey="category_name"
            cx="50%"
            cy="50%"
            innerRadius={68}
            outerRadius={108}
            paddingAngle={2}
            strokeWidth={0}
            labelLine={false}
            label={renderCustomLabel}
          >
            {filtered.map((entry) => (
              <Cell
                key={entry.category_id}
                fill={entry.category_color}
                opacity={0.92}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              fontSize: 12,
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
              padding: "8px 12px",
              color: "var(--foreground)",
            }}
            formatter={(value, _name, props) => [
              formatCurrency(Number(value)),
              props.payload?.category_name ?? "",
            ]}
            separator=" — "
          />
        </PieChart>
      </ResponsiveContainer>
      <CustomLegend
        payload={filtered.map((d) => ({
          value: d.category_name,
          color: d.category_color,
          payload: d,
        }))}
        total={total}
      />
    </div>
  );
}
