"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SnapshotForm } from "@/components/forms/SnapshotForm";
import { Category, SnapshotWithCategory } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { Pencil, Trash2 } from "lucide-react";

export function SnapshotsList() {
  const [snapshots, setSnapshots] = useState<SnapshotWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<{ category_id: number; account: string }[]>([]);
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [snapsRes, catRes, statsRes] = await Promise.all([
      fetch(`/api/snapshots${yearFilter !== "all" ? `?year=${yearFilter}` : ""}`),
      fetch("/api/categories"),
      fetch("/api/stats"),
    ]);
    setSnapshots(await snapsRes.json());
    setCategories(await catRes.json());
    const stats = await statsRes.json();
    setAvailableYears(stats.availableYears ?? []);
    setAccounts(stats.accounts ?? []);
    setLoading(false);
  }, [yearFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function deleteSnapshot(id: number) {
    if (!confirm("¿Eliminar este snapshot?")) return;
    await fetch(`/api/snapshots/${id}`, { method: "DELETE" });
    fetchData();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Historial</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Todos los registros de patrimonio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={yearFilter} onValueChange={(v) => setYearFilter(v ?? "all")}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {availableYears.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <SnapshotForm categories={categories} accounts={accounts} onSave={fetchData} />
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Cargando...</div>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {snapshots.length} registros
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {snapshots.length === 0 ? (
              <div className="text-sm text-muted-foreground py-8 text-center">
                Sin registros. Agrega tu primer snapshot.
              </div>
            ) : (
              <div className="divide-y">
                {snapshots.map((snap) => (
                  <div
                    key={snap.id}
                    className="flex items-center justify-between px-6 py-3 group hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: snap.category_color }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="text-xs px-1.5 py-0"
                            style={{
                              background: `${snap.category_color}22`,
                              color: snap.category_color,
                            }}
                          >
                            {snap.category_name}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(snap.date)}
                          </span>
                        </div>
                        {snap.account && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {snap.account}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold tabular-nums">
                        {formatCurrency(snap.amount)}
                      </span>
                      <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <SnapshotForm
                          categories={categories}
                          accounts={accounts}
                          onSave={fetchData}
                          editSnapshot={snap}
                          trigger={
                            <Button size="icon" variant="ghost" className="h-7 w-7">
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                          }
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => deleteSnapshot(snap.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
