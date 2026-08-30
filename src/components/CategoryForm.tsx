"use client";

import { useRef, useState, useTransition } from "react";
import { createCategory } from "@/lib/actions";

export function CategoryForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await createCategory(formData);
        formRef.current?.reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao salvar categoria.");
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-wrap items-end gap-2">
      <div className="flex flex-col gap-1">
        <label htmlFor="cat-name" className="text-xs font-medium text-slate-500">
          Nova categoria
        </label>
        <input
          id="cat-name"
          name="name"
          required
          placeholder="Ex: Educação"
          className="rounded border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <select
        name="type"
        defaultValue="EXPENSE"
        className="rounded border border-slate-300 px-3 py-2 text-sm"
      >
        <option value="EXPENSE">Despesa</option>
        <option value="INCOME">Receita</option>
      </select>

      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-slate-800 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        Adicionar
      </button>

      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );
}
