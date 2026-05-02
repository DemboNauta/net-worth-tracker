"use client";

import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { formatCurrency, formatMonth } from "@/lib/format";

interface Props {
  data: { month: string; total: number }[];
}

export function TrendLineChart({ data }: Props) {
  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Necesitas al menos 2 meses de datos para ver la tendencia.
      </div>
    );
  }

  const n = data.length;
  const xMean = (n - 1) / 2;
  const yMean = data.reduce((s, d) => s + d.total, 0) / n;
  const num = data.reduce((s, d, i) => s + (i - xMean) * (d.total - yMean), 0);
  const den = data.reduce((s, _, i) => s + (i - xMean) ** 2, 0);
  const slope = den !== 0 ? num / den : 0;
  const intercept = yMean - slope * xMean;

  const enriched = data.map((d, i) => ({
    ...d,
    trend: Math.round(slope * i + intercept),
  }));

  const latestChange =
    data.length >= 2 ? data[data.length - 1].total - data[data.length - 2].total : 0;

  const isPositive = latestChange >= 0;
  const isTrendUp = slope >= 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${
          isPositive
            ? "bg-green-500/10 text-green-600 dark:text-green-400"
            : "bg-red-500/10 text-red-600 dark:text-red-400"
        }`}>
          <span>{isPositive ? "▲" : "▼"}</span>
          <span>{isPositive ? "+" : ""}{formatCurrency(latestChange)} este mes</span>
        </div>
        <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ml-auto ${
          isTrendUp
            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
            : "bg-orange-500/10 text-orange-600 dark:text-orange-400"
        }`}>
          <span>{isTrendUp ? "↗" : "↘"}</span>
          <span>Tendencia: {formatCurrency(Math.abs(slope))}/mes</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={enriched} margin={{ top: 10, right: 16, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
            </linearGradient>
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
            formatter={(value, name) => [
              formatCurrency(Number(value)),
              name === "total" ? "Patrimonio" : "Tendencia",
            ]}
          />
          <ReferenceLine y={0} stroke="var(--border)" strokeOpacity={0.6} />
          <Area
            type="monotone"
            dataKey="total"
            stroke="none"
            fill="url(#totalGrad)"

            dot={false}
            legendType="none"
            tooltipType="none"
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="var(--primary)"
            strokeWidth={2.5}
            dot={{ r: 3.5, fill: "var(--card)", stroke: "var(--primary)", strokeWidth: 2 }}
            activeDot={{ r: 5, fill: "var(--primary)", strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="trend"
            stroke="var(--muted-foreground)"
            strokeWidth={1.5}
            strokeDasharray="6 3"
            dot={false}
            activeDot={false}
            strokeOpacity={0.7}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
