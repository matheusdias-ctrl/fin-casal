"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { createTransaction } from "@/lib/actions";

type Category = {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
};

function todayISO(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 10);
}

export function TransactionForm({ categories }: { categories: Category[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type]
  );

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await createTransaction(formData);
        formRef.current?.reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao salvar lançamento.");
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="type"
            value="EXPENSE"
            checked={type === "EXPENSE"}
            onChange={() => setType("EXPENSE")}
          />
          Despesa
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="type"
            value="INCOME"
            checked={type === "INCOME"}
            onChange={() => setType("INCOME")}
          />
          Receita
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label htmlFor="description" className="text-xs font-medium text-slate-500">
            Descrição
          </label>
          <input
            id="description"
            name="description"
            required
            placeholder="Ex: Supermercado"
            className="rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="amount" className="text-xs font-medium text-slate-500">
            Valor (R$)
          </label>
          <input
            id="amount"
            name="amount"
            inputMode="decimal"
            required
            placeholder="0,00"
            className="rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="date" className="text-xs font-medium text-slate-500">
            Data
          </label>
          <input
            id="date"
            name="date"
            type="date"
            defaultValue={todayISO()}
            className="rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2">
          <label htmlFor="categoryId" className="text-xs font-medium text-slate-500">
            Categoria
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            disabled={filteredCategories.length === 0}
            className="rounded border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
          >
            {filteredCategories.length === 0 && <option value="">Nenhuma categoria disponível</option>}
            {filteredCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isPending || filteredCategories.length === 0}
        className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {isPending ? "Salvando..." : "Adicionar lançamento"}
      </button>
    </form>
  );
}
