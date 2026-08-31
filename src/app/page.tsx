import Link from "next/link";
import { getCategories } from "@/lib/actions";
import { getMonthRange, getPreviousMonthRange } from "@/lib/dateRange";
import { getCategoryTotals, getMonthlySeries, getPeriodSummary } from "@/lib/reports";
import { formatCurrency } from "@/lib/format";
import { buildCategoryColorMap } from "@/lib/chartColors";
import { DashboardFilters } from "@/components/DashboardFilters";
import { StatTile } from "@/components/StatTile";
import { EvolutionChart } from "@/components/EvolutionChart";
import { CategoryBarChart } from "@/components/CategoryBarChart";

export const dynamic = "force-dynamic";

type PersonFilter = "MATHEUS" | "BIA" | "CASAL";
const VALID_PERSONS: PersonFilter[] = ["MATHEUS", "BIA", "CASAL"];

/** Variação percentual entre dois valores; null quando não há base de comparação. */
function pctDelta(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { month?: string; person?: string };
}) {
  const range = getMonthRange(searchParams.month);
  const previousRange = getPreviousMonthRange(range);
  const person = VALID_PERSONS.includes(searchParams.person as PersonFilter)
    ? (searchParams.person as PersonFilter)
    : undefined;

  const [summary, previousSummary, categoryTotals, monthlySeries, allCategories] = await Promise.all([
    getPeriodSummary(range.start, range.end, person),
    getPeriodSummary(previousRange.start, previousRange.end, person),
    getCategoryTotals(range.start, range.end, person),
    getMonthlySeries(range, 6, person),
    getCategories(),
  ]);

  const expenseCategories = categoryTotals.filter((c) => c.type === "EXPENSE");

  // Ordem alfabética estável sobre TODAS as categorias de despesa do sistema,
  // para que a cor de uma categoria não mude quando o filtro reordena os totais.
  const stableExpenseCategoryIds = allCategories
    .filter((c) => c.type === "EXPENSE")
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
    .map((c) => c.id);
  const categoryColorMap = buildCategoryColorMap(stableExpenseCategoryIds);

  const balance = summary.incomeCents - summary.expenseCents;
  const previousBalance = previousSummary.incomeCents - previousSummary.expenseCents;
  const hasAnyData = monthlySeries.some((m) => m.incomeCents > 0 || m.expenseCents > 0);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm capitalize text-slate-500">{range.label}</p>
        </div>
        <DashboardFilters month={range.value} person={person ?? ""} />
      </div>

      {!hasAnyData && (
        <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center">
          <p className="text-sm text-slate-600">
            Nenhum lançamento nos últimos 6 meses ainda. Importe a fatura do cartão para começar.
          </p>
          <Link
            href="/importar"
            className="mt-3 inline-block rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Importar CSV
          </Link>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatTile
          label="Saldo do mês"
          value={formatCurrency(balance)}
          deltaPct={pctDelta(balance, previousBalance)}
          deltaGoodDirection="up"
        />
        <StatTile
          label="Receitas"
          value={formatCurrency(summary.incomeCents)}
          deltaPct={pctDelta(summary.incomeCents, previousSummary.incomeCents)}
          deltaGoodDirection="up"
        />
        <StatTile
          label="Despesas"
          value={formatCurrency(summary.expenseCents)}
          deltaPct={pctDelta(summary.expenseCents, previousSummary.expenseCents)}
          deltaGoodDirection="down"
        />
      </div>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">Evolução mês a mês</h2>
        <div className="mt-4">
          <EvolutionChart data={monthlySeries} />
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">Distribuição por categoria</h2>
        <div className="mt-4">
          <CategoryBarChart categories={expenseCategories} colorByCategoryId={categoryColorMap} />
        </div>
      </section>
    </main>
  );
}
