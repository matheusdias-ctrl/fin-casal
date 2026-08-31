import { getMonthRange, getPreviousMonthRange } from "@/lib/dateRange";
import { getCategoryTotals, getPersonTotals, getTopExpenses, type CategoryTotal } from "@/lib/reports";
import { formatCurrency, formatDate } from "@/lib/format";
import { MonthFilter } from "@/components/MonthFilter";

export const dynamic = "force-dynamic";

const PERSON_LABELS: Record<string, string> = {
  MATHEUS: "Matheus",
  BIA: "Bia",
  CASAL: "Casal",
};

function sumExpense(totals: CategoryTotal[]): number {
  return totals.filter((t) => t.type === "EXPENSE").reduce((acc, t) => acc + t.totalCents, 0);
}

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: { month?: string };
}) {
  const range = getMonthRange(searchParams.month);
  const previousRange = getPreviousMonthRange(range);

  const [categoryTotals, previousCategoryTotals, personTotals, topExpenses] = await Promise.all([
    getCategoryTotals(range.start, range.end),
    getCategoryTotals(previousRange.start, previousRange.end),
    getPersonTotals(range.start, range.end),
    getTopExpenses(range.start, range.end, 5),
  ]);

  const totalExpense = sumExpense(categoryTotals);
  const previousTotalExpense = sumExpense(previousCategoryTotals);
  const diff = totalExpense - previousTotalExpense;
  const diffPct = previousTotalExpense > 0 ? (diff / previousTotalExpense) * 100 : null;

  const previousByCategory = new Map(
    previousCategoryTotals.filter((t) => t.type === "EXPENSE").map((t) => [t.categoryId, t.totalCents])
  );
  const categoryDeltas = categoryTotals
    .filter((t) => t.type === "EXPENSE")
    .map((t) => ({
      ...t,
      deltaCents: t.totalCents - (previousByCategory.get(t.categoryId) ?? 0),
    }))
    .sort((a, b) => b.deltaCents - a.deltaCents);

  const biggestIncrease = categoryDeltas[0];
  const biggestDecrease = categoryDeltas[categoryDeltas.length - 1];

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Insights</h1>
        <MonthFilter value={range.value} />
      </div>
      <p className="mt-1 text-sm capitalize text-slate-500">{range.label}</p>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-slate-500">Gasto total do mês</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{formatCurrency(totalExpense)}</p>
        {diffPct !== null ? (
          <p className={`mt-1 text-sm ${diff > 0 ? "text-red-600" : "text-emerald-600"}`}>
            {diff > 0 ? "▲" : "▼"} {Math.abs(diffPct).toFixed(0)}% em relação ao mês anterior (
            {formatCurrency(previousTotalExpense)})
          </p>
        ) : (
          <p className="mt-1 text-sm text-slate-400">Sem dados do mês anterior para comparar.</p>
        )}
      </section>

      {(biggestIncrease?.deltaCents > 0 || biggestDecrease?.deltaCents < 0) && (
        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          {biggestIncrease && biggestIncrease.deltaCents > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Categoria que mais subiu</p>
              <p className="mt-1 font-semibold text-slate-900">{biggestIncrease.categoryName}</p>
              <p className="text-sm text-red-600">+ {formatCurrency(biggestIncrease.deltaCents)}</p>
            </div>
          )}
          {biggestDecrease && biggestDecrease.deltaCents < 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Categoria que mais caiu</p>
              <p className="mt-1 font-semibold text-slate-900">{biggestDecrease.categoryName}</p>
              <p className="text-sm text-emerald-600">{formatCurrency(biggestDecrease.deltaCents)}</p>
            </div>
          )}
        </section>
      )}

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">Participação por pessoa no gasto</h2>
        <ul className="mt-3 space-y-2">
          {personTotals.map((t) => {
            const pct = totalExpense > 0 ? (t.expenseCents / totalExpense) * 100 : 0;
            return (
              <li key={t.person} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{PERSON_LABELS[t.person]}</span>
                <span className="font-medium text-slate-900">
                  {formatCurrency(t.expenseCents)} ({pct.toFixed(0)}%)
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">Maiores gastos do mês</h2>
        {topExpenses.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Sem gastos no período.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {topExpenses.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <p className="font-medium text-slate-900">{t.description}</p>
                  <p className="text-xs text-slate-500">
                    {t.category.name} · {formatDate(t.date)}
                  </p>
                </div>
                <span className="font-medium text-red-600">{formatCurrency(t.amountCents)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
