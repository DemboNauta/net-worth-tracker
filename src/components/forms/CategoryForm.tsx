"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Category } from "@/lib/types";
import { Plus, Pencil } from "lucide-react";

const PRESET_COLORS = [
  "#22c55e", "#3b82f6", "#f59e0b", "#8b5cf6",
  "#ef4444", "#06b6d4", "#f97316", "#ec4899",
  "#14b8a6", "#6366f1",
];

interface Props {
  onSave: () => void;
  editCategory?: Category;
}

export function CategoryForm({ onSave, editCategory }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(editCategory?.name ?? "");
  const [color, setColor] = useState(editCategory?.color ?? "#6366f1");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const body = { name: name.trim(), color, icon: "wallet" };
      const url = editCategory ? `/api/categories/${editCategory.id}` : "/api/categories";
      await fetch(url, {
        method: editCategory ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setOpen(false);
      onSave();
    } finally {
      setLoading(false);
    }
  }

  const trigger = editCategory ? (
    <Button size="icon" variant="ghost" className="h-7 w-7">
      <Pencil className="w-3.5 h-3.5" />
    </Button>
  ) : (
    <Button size="sm" variant="outline">
      <Plus className="w-4 h-4 mr-1" />
      Nueva categoría
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {editCategory ? "Editar categoría" : "Nueva categoría"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Nombre</Label>
            <Input
              placeholder="Ej: Efectivo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                    color === c ? "border-foreground scale-110" : "border-transparent"
                  }`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-7 h-7 rounded-full cursor-pointer border-0 p-0 bg-transparent"
                title="Color personalizado"
              />
            </div>
            <div
              className="h-2 rounded-full mt-1"
              style={{ background: color }}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
