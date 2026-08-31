"use client";

import { useTransition } from "react";
import { deleteInvestment } from "@/lib/investmentActions";
import { formatCurrency } from "@/lib/format";

type Investment = {
  id: string;
  person: "MATHEUS" | "BIA" | "CASAL";
  description: string | null;
  amountCents: number;
  type: { name: string };
};

const PERSON_LABELS: Record<Investment["person"], string> = {
  MATHEUS: "Matheus",
  BIA: "Bia",
  CASAL: "Casal",
};

export function InvestmentList({ investments }: { investments: Investment[] }) {
  const [isPending, startTransition] = useTransition();

  if (investments.length === 0) {
    return <p className="text-sm text-slate-500">Nenhum investimento cadastrado ainda.</p>;
  }

  return (
    <ul className="divide-y divide-slate-100">
      {investments.map((inv) => (
        <li key={inv.id} className="flex items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900">{inv.description || inv.type.name}</p>
            <p className="text-sm text-slate-500">
              {inv.type.name} · {PERSON_LABELS[inv.person]}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="text-sm font-medium text-slate-900">
              {formatCurrency(inv.amountCents)}
            </span>
            <button
              type="button"
              onClick={() => startTransition(() => deleteInvestment(inv.id))}
              disabled={isPending}
              aria-label="Excluir investimento"
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
