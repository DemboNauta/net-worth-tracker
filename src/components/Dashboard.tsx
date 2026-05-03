"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NetWorthAreaChart } from "@/components/charts/NetWorthAreaChart";
import { YearlyBarChart } from "@/components/charts/YearlyBarChart";
import { AllocationPieChart } from "@/components/charts/AllocationPieChart";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { SnapshotForm } from "@/components/forms/SnapshotForm";
import { Category } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { TrendingUp, TrendingDown, Wallet, RefreshCw } from "lucide-react";

interface StatsData {
  categories: Category[];
  latestPerCategory: {
    category_id: number;
    category_name: string;
    category_color: string;
    category_icon: string;
    total: number;
  }[];
  monthlyTotals: Record<string, number | string>[];
  yearlyTotals: Record<string, number | string>[];
  availableYears: string[];
  accounts: { category_id: number; account: string }[];
}

export function Dashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/stats");
    const data = await res.json();
    setStats(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const totalWealth =
    stats?.latestPerCategory.reduce((s, c) => s + c.total, 0) ?? 0;

  const monthlyData = (stats?.monthlyTotals ?? []) as {
    month: string;
    total: number;
  }[];

  const prevMonthTotal =
    monthlyData.length >= 2
      ? monthlyData[monthlyData.length - 2].total
      : null;
  const thisMonthTotal =
    monthlyData.length >= 1
      ? monthlyData[monthlyData.length - 1].total
      : null;
  const monthChange =
    prevMonthTotal != null && thisMonthTotal != null
      ? thisMonthTotal - prevMonthTotal
      : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Patrimonio</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Seguimiento de activos personales
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchStats}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          {stats && (
            <SnapshotForm
              categories={stats.categories}
              accounts={stats.accounts}
              onSave={fetchStats}
            />
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="col-span-1 sm:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Wallet className="w-4 h-4" />
              Patrimonio total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalWealth)}</div>
            {monthChange !== null && (
              <div
                className={`flex items-center gap-1 text-sm mt-1 ${
                  monthChange >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {monthChange >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {monthChange >= 0 ? "+" : ""}
                {formatCurrency(monthChange)} este mes
              </div>
            )}
          </CardContent>
        </Card>

        {stats?.latestPerCategory
          .filter((c) => c.total > 0)
          .slice(0, 2)
          .map((cat) => (
            <Card key={cat.category_id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: cat.category_color }}
                  />
                  {cat.category_name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(cat.total)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {totalWealth > 0
                    ? ((cat.total / totalWealth) * 100).toFixed(1)
                    : "0"}
                  % del total
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Category badges */}
      {stats && stats.latestPerCategory.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {stats.latestPerCategory.map((cat) => (
            <Badge
              key={cat.category_id}
              variant="secondary"
              className="gap-1.5 px-3 py-1"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: cat.category_color }}
              />
              {cat.category_name}:{" "}
              <span className="font-semibold">{formatCurrency(cat.total)}</span>
            </Badge>
          ))}
        </div>
      )}

      {/* Charts */}
      <Tabs defaultValue="evolucion" className="space-y-4">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="evolucion" className="flex-1 md:flex-none text-xs md:text-sm">
            <span className="md:hidden">Evolución</span>
            <span className="hidden md:inline">Evolución mensual</span>
          </TabsTrigger>
          <TabsTrigger value="tendencia" className="flex-1 md:flex-none text-xs md:text-sm">Tendencia</TabsTrigger>
          <TabsTrigger value="anual" className="flex-1 md:flex-none text-xs md:text-sm">Anual</TabsTrigger>
          <TabsTrigger value="distribucion" className="flex-1 md:flex-none text-xs md:text-sm">
            <span className="md:hidden">Distrib.</span>
            <span className="hidden md:inline">Distribución</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="evolucion">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Patrimonio por categoría</CardTitle>
            </CardHeader>
            <CardContent>
              {stats && (
                <NetWorthAreaChart
                  data={stats.monthlyTotals}
                  categories={stats.categories}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tendencia">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tendencia del patrimonio total</CardTitle>
            </CardHeader>
            <CardContent>
              {stats && <TrendLineChart data={monthlyData} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anual">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Evolución anual</CardTitle>
            </CardHeader>
            <CardContent>
              {stats && (
                <YearlyBarChart
                  data={stats.yearlyTotals}
                  categories={stats.categories}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribucion">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Distribución actual</CardTitle>
            </CardHeader>
            <CardContent>
              {stats && (
                <AllocationPieChart data={stats.latestPerCategory} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
