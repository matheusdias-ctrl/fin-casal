import { getMonthRange } from "@/lib/dateRange";
import { getCategoryTotals } from "@/lib/reports";
import { formatCurrency } from "@/lib/format";
import { MonthFilter } from "@/components/MonthFilter";

export const dynamic = "force-dynamic";

export default async function CategoryDashboardPage({
  searchParams,
}: {
  searchParams: { month?: string };
}) {
  const range = getMonthRange(searchParams.month);
  const totals = await getCategoryTotals(range.start, range.end);
  const expenseTotals = totals.filter((t) => t.type === "EXPENSE");
  const incomeTotals = totals.filter((t) => t.type === "INCOME");
  const maxExpense = Math.max(1, ...expenseTotals.map((t) => t.totalCents));

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Gastos por categoria</h1>
        <MonthFilter value={range.value} />
      </div>
      <p className="mt-1 text-sm capitalize text-slate-500">{range.label}</p>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">Despesas</h2>
        {expenseTotals.length === 0 && (
          <p className="mt-2 text-sm text-slate-500">Sem despesas no período.</p>
        )}
        <ul className="mt-3 space-y-2">
          {expenseTotals.map((t) => (
            <li key={t.categoryId}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{t.categoryName}</span>
                <span className="font-medium text-red-600">{formatCurrency(t.totalCents)}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-red-500"
                  style={{ width: `${Math.max(4, (t.totalCents / maxExpense) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      {incomeTotals.length > 0 && (
        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">Receitas</h2>
          <ul className="mt-3 space-y-2">
            {incomeTotals.map((t) => (
              <li key={t.categoryId} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{t.categoryName}</span>
                <span className="font-medium text-emerald-600">
                  {formatCurrency(t.totalCents)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
