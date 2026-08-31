"use client";

import { useMemo, useState, useTransition } from "react";
import { commitImport, parseImportText, type ImportRowPreview } from "@/lib/importActions";
import { formatCurrency } from "@/lib/format";

type Category = { id: string; name: string; type: "INCOME" | "EXPENSE" };
type PersonValue = "MATHEUS" | "BIA" | "CASAL";

type EditableRow = ImportRowPreview & {
  include: boolean;
  categoryId: string;
  person: PersonValue;
};

const PERSON_OPTIONS: { value: PersonValue; label: string }[] = [
  { value: "MATHEUS", label: "Matheus" },
  { value: "BIA", label: "Bia" },
  { value: "CASAL", label: "Casal" },
];

export function ImportWizard({ categories }: { categories: Category[] }) {
  const [rows, setRows] = useState<EditableRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const categoriesByType = useMemo(
    () => ({
      EXPENSE: categories.filter((c) => c.type === "EXPENSE"),
      INCOME: categories.filter((c) => c.type === "INCOME"),
    }),
    [categories]
  );

  async function handleFile(file: File) {
    setError(null);
    setResult(null);
    setIsParsing(true);
    try {
      const text = await file.text();
      const parsed = await parseImportText(text);

      if (parsed.length === 0) {
        setError("Não encontrei nenhuma linha de lançamento nesse arquivo.");
        setRows([]);
        return;
      }

      setRows(
        parsed.map((row) => {
          const options = categoriesByType[row.type];
          const defaultCategory = row.suggestedCategoryId ?? options[0]?.id ?? "";
          return {
            ...row,
            include: !row.error,
            categoryId: defaultCategory,
            person: row.suggestedPerson ?? "CASAL",
          };
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível ler o arquivo.");
    } finally {
      setIsParsing(false);
    }
  }

  function updateRow(key: string, patch: Partial<EditableRow>) {
    setRows((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function handleSubmit() {
    setError(null);
    setResult(null);
    const toImport = rows.filter((row) => row.include && row.categoryId && !row.error);

    if (toImport.length === 0) {
      setError("Nenhuma linha válida selecionada para importar.");
      return;
    }

    startSubmitTransition(async () => {
      try {
        const { count } = await commitImport(
          toImport.map((row) => ({
            date: row.date,
            description: row.description,
            amountCents: row.amountCents,
            type: row.type,
            categoryId: row.categoryId,
            person: row.person,
          }))
        );
        setResult(`${count} lançamento(s) importado(s) com sucesso.`);
        setRows([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao importar.");
      }
    });
  }

  const selectedCount = rows.filter((r) => r.include).length;

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 bg-white px-6 py-10 text-center transition-colors hover:border-brand hover:bg-brand-light/40">
        <span className="text-sm font-medium text-slate-700">Clique para escolher o arquivo CSV</span>
        <span className="text-xs text-slate-400">Fatura exportada do Nubank ou do Itaú</span>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
          className="sr-only"
        />
      </label>

      {isParsing && <p className="text-sm text-slate-500">Lendo arquivo...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {result && <p className="text-sm text-emerald-600">{result}</p>}

      {rows.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2.5">Incluir</th>
                  <th className="px-3 py-2.5">Data</th>
                  <th className="px-3 py-2.5">Descrição</th>
                  <th className="px-3 py-2.5">Valor</th>
                  <th className="px-3 py-2.5">Pessoa</th>
                  <th className="px-3 py-2.5">Categoria</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={row.key} className={row.error ? "bg-red-50" : "hover:bg-slate-50"}>
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={row.include}
                        onChange={(e) => updateRow(row.key, { include: e.target.checked })}
                      />
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">{row.date || "—"}</td>
                    <td className="px-3 py-2">
                      {row.description}
                      {row.error && <p className="text-xs text-red-600">{row.error}</p>}
                    </td>
                    <td
                      className={`whitespace-nowrap px-3 py-2 font-medium ${
                        row.type === "INCOME" ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {row.type === "INCOME" ? "+" : "-"} {formatCurrency(row.amountCents)}
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={row.person}
                        onChange={(e) =>
                          updateRow(row.key, { person: e.target.value as PersonValue })
                        }
                        className="rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light"
                      >
                        {PERSON_OPTIONS.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={row.categoryId}
                        onChange={(e) => updateRow(row.key, { categoryId: e.target.value })}
                        className="rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light"
                      >
                        <option value="">Selecione</option>
                        {categoriesByType[row.type].map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || selectedCount === 0}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
          >
            {isSubmitting ? "Importando..." : `Confirmar importação (${selectedCount})`}
          </button>
        </>
      )}
    </div>
  );
}
