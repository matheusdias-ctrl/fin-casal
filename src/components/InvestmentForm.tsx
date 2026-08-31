"use client";

import { useRef, useState, useTransition } from "react";
import { createInvestment } from "@/lib/investmentActions";

type InvestmentType = { id: string; name: string };

export function InvestmentForm({ types }: { types: InvestmentType[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    const person = String(formData.get("person") ?? "CASAL") as "MATHEUS" | "BIA" | "CASAL";
    const typeId = String(formData.get("typeId") ?? "");
    const description = String(formData.get("description") ?? "");
    const amountRaw = String(formData.get("amount") ?? "").trim().replace(",", ".");
    const amountCents = Math.round(Number.parseFloat(amountRaw) * 100);

    startTransition(async () => {
      try {
        await createInvestment({ person, typeId, description, amountCents });
        formRef.current?.reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao salvar.");
      }
    });
  }

  const inputClass =
    "rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light";

  return (
    <form ref={formRef} action={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="flex flex-col gap-1">
        <label htmlFor="inv-person" className="text-xs font-medium text-slate-500">
          De quem é
        </label>
        <select id="inv-person" name="person" defaultValue="CASAL" className={inputClass}>
          <option value="MATHEUS">Matheus</option>
          <option value="BIA">Bia</option>
          <option value="CASAL">Casal (compartilhado)</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="inv-type" className="text-xs font-medium text-slate-500">
          Tipo
        </label>
        <select
          id="inv-type"
          name="typeId"
          required
          disabled={types.length === 0}
          className={`${inputClass} disabled:bg-slate-100`}
        >
          {types.length === 0 && <option value="">Nenhum tipo disponível</option>}
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1 sm:col-span-2">
        <label htmlFor="inv-desc" className="text-xs font-medium text-slate-500">
          Descrição (opcional)
        </label>
        <input
          id="inv-desc"
          name="description"
          placeholder="Ex: Tesouro Selic 2029"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="inv-amount" className="text-xs font-medium text-slate-500">
          Saldo atual (R$)
        </label>
        <input
          id="inv-amount"
          name="amount"
          inputMode="decimal"
          required
          placeholder="0,00"
          className={inputClass}
        />
      </div>

      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}

      <button
        type="submit"
        disabled={isPending || types.length === 0}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-50 sm:col-span-2 sm:w-fit"
      >
        {isPending ? "Salvando..." : "Adicionar"}
      </button>
    </form>
  );
}
