"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryForm } from "@/components/forms/CategoryForm";
import { Category } from "@/lib/types";
import { Trash2 } from "lucide-react";

export function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/categories");
    setCategories(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  async function deleteCategory(id: number) {
    if (!confirm("¿Eliminar categoría? Se borran todos sus snapshots.")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    fetchCategories();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categorías</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Gestiona las etiquetas de tu patrimonio
          </p>
        </div>
        <CategoryForm onSave={fetchCategories} />
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Cargando...</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Card key={cat.id} className="group">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                      style={{ background: cat.color }}
                    />
                    <CardTitle className="text-base">{cat.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <CategoryForm editCategory={cat} onSave={fetchCategories} />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => deleteCategory(cat.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Badge
                  variant="secondary"
                  className="text-xs font-mono"
                  style={{ background: `${cat.color}22`, color: cat.color }}
                >
                  {cat.color}
                </Badge>
              </CardContent>
            </Card>
          ))}

          {categories.length === 0 && (
            <div className="col-span-full text-sm text-muted-foreground py-8 text-center">
              Sin categorías. Crea una para empezar.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
