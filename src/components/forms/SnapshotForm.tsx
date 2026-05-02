"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Category, Snapshot } from "@/lib/types";
import { currentDate } from "@/lib/format";
import { Plus } from "lucide-react";

interface Props {
  categories: Category[];
  accounts?: { category_id: number; account: string }[];
  onSave: () => void;
  editSnapshot?: Snapshot & { category_name: string };
  trigger?: React.ReactElement;
}

export function SnapshotForm({ categories, accounts = [], onSave, editSnapshot, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categoryId, setCategoryId] = useState(
    editSnapshot ? String(editSnapshot.category_id) : ""
  );
  const [amount, setAmount] = useState(editSnapshot ? String(editSnapshot.amount) : "");
  const [date, setDate] = useState(editSnapshot ? editSnapshot.date : currentDate());
  const [account, setAccount] = useState(editSnapshot?.account ?? "");

  const categoryAccounts = accounts
    .filter((a) => String(a.category_id) === categoryId)
    .map((a) => a.account);

  const datalistId = `accounts-${categoryId}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        category_id: parseInt(categoryId),
        amount: parseFloat(amount),
        date,
        account: account.trim() || null,
      };
      const url = editSnapshot ? `/api/snapshots/${editSnapshot.id}` : "/api/snapshots";
      await fetch(url, {
        method: editSnapshot ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setOpen(false);
      onSave();
    } finally {
      setLoading(false);
    }
  }

  const defaultTrigger = (
    <Button size="sm">
      <Plus className="w-4 h-4 mr-1" />
      Agregar
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger ?? defaultTrigger} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editSnapshot ? "Editar registro" : "Nuevo registro"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Categoría</Label>
            <Select
              value={categoryId}
              onValueChange={(v) => { setCategoryId(v ?? ""); setAccount(""); }}
              items={categories.map((cat) => ({ value: String(cat.id), label: cat.name }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ background: cat.color }}
                      />
                      {cat.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Cuenta / Cartera</Label>
            {categoryAccounts.length > 0 && (
              <datalist id={datalistId}>
                {categoryAccounts.map((a) => (
                  <option key={a} value={a} />
                ))}
              </datalist>
            )}
            <Input
              list={categoryAccounts.length > 0 ? datalistId : undefined}
              placeholder="Ej: Santander, Coinbase, MyInvestor..."
              value={account}
              onChange={(e) => setAccount(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Total (€)</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Fecha</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !categoryId || !amount || !date}>
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
