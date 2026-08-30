import { getMonthRange } from "@/lib/dateRange";
import { getPersonTotals } from "@/lib/reports";
import { formatCurrency } from "@/lib/format";
import { MonthFilter } from "@/components/MonthFilter";

export const dynamic = "force-dynamic";

const PERSON_LABELS: Record<string, string> = {
  MATHEUS: "Matheus",
  BIA: "Bia",
  CASAL: "Casal",
};

export default async function PersonDashboardPage({
  searchParams,
}: {
  searchParams: { month?: string };
}) {
  const range = getMonthRange(searchParams.month);
  const totals = await getPersonTotals(range.start, range.end);
  const totalExpense = totals.reduce((acc, t) => acc + t.expenseCents, 0);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Gastos por pessoa</h1>
        <MonthFilter value={range.value} />
      </div>
      <p className="mt-1 text-sm capitalize text-slate-500">{range.label}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {totals.map((t) => {
          const pct = totalExpense > 0 ? (t.expenseCents / totalExpense) * 100 : 0;
          return (
            <div key={t.person} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-slate-500">{PERSON_LABELS[t.person]}</p>
              <p className="mt-1 text-xl font-bold text-red-600">
                {formatCurrency(t.expenseCents)}
              </p>
              <p className="text-xs text-slate-400">{pct.toFixed(0)}% do gasto do mês</p>
              {t.incomeCents > 0 && (
                <p className="mt-2 text-sm text-emerald-600">
                  + {formatCurrency(t.incomeCents)} receita
                </p>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
