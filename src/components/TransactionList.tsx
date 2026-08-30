"use client";

import { useTransition } from "react";
import { deleteTransaction } from "@/lib/actions";
import { formatCurrency, formatDate } from "@/lib/format";

type Transaction = {
  id: string;
  description: string;
  amountCents: number;
  type: "INCOME" | "EXPENSE";
  date: Date;
  person: "MATHEUS" | "BIA" | "CASAL";
  category: { name: string };
};

const PERSON_LABELS: Record<Transaction["person"], string> = {
  MATHEUS: "Matheus",
  BIA: "Bia",
  CASAL: "Casal",
};

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  const [isPending, startTransition] = useTransition();

  if (transactions.length === 0) {
    return <p className="text-sm text-slate-500">Nenhum lançamento ainda.</p>;
  }

  return (
    <ul className="divide-y divide-slate-200">
      {transactions.map((t) => (
        <li key={t.id} className="flex items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900">{t.description}</p>
            <p className="text-sm text-slate-500">
              {t.category.name} · {PERSON_LABELS[t.person]} · {formatDate(t.date)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span
              className={`text-sm font-medium ${
                t.type === "INCOME" ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {t.type === "INCOME" ? "+" : "-"} {formatCurrency(t.amountCents)}
            </span>
            <button
              type="button"
              onClick={() => startTransition(() => deleteTransaction(t.id))}
              disabled={isPending}
              aria-label="Excluir lançamento"
              className="text-slate-400 hover:text-red-600 disabled:opacity-50"
            >
              ✕
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
