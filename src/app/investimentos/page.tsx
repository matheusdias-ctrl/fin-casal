import { getInvestments, getInvestmentTypes } from "@/lib/investmentActions";
import { buildCategoryColorMap } from "@/lib/chartColors";
import { formatCurrency } from "@/lib/format";
import { CategoryBarChart } from "@/components/CategoryBarChart";
import { InvestmentForm } from "@/components/InvestmentForm";
import { InvestmentList } from "@/components/InvestmentList";
import { PersonFilterBar } from "@/components/PersonFilterBar";

export const dynamic = "force-dynamic";

type PersonFilter = "MATHEUS" | "BIA" | "CASAL";
const VALID_PERSONS: PersonFilter[] = ["MATHEUS", "BIA", "CASAL"];
const PERSON_LABELS: Record<PersonFilter, string> = {
  MATHEUS: "Matheus",
  BIA: "Bia",
  CASAL: "Casal",
};

export default async function InvestimentosPage({
  searchParams,
}: {
  searchParams: { person?: string };
}) {
  const [investments, types] = await Promise.all([getInvestments(), getInvestmentTypes()]);

  const personFilter = VALID_PERSONS.includes(searchParams.person as PersonFilter)
    ? (searchParams.person as PersonFilter)
    : undefined;

  const filtered = personFilter ? investments.filter((i) => i.person === personFilter) : investments;

  // Totais por pessoa sempre sobre TODOS os investimentos (para os cards de resumo
  // não mudarem de significado quando o filtro muda o que aparece na lista/gráfico).
  const totalsByPerson = VALID_PERSONS.map((person) => ({
    person,
    totalCents: investments
      .filter((i) => i.person === person)
      .reduce((acc, i) => acc + i.amountCents, 0),
  }));
  const combinedTotal = totalsByPerson.reduce((acc, t) => acc + t.totalCents, 0);

  const distributionByType = new Map<string, { name: string; totalCents: number }>();
  filtered.forEach((i) => {
    const existing = distributionByType.get(i.typeId);
    if (existing) {
      existing.totalCents += i.amountCents;
    } else {
      distributionByType.set(i.typeId, { name: i.type.name, totalCents: i.amountCents });
    }
  });
  const distribution = Array.from(distributionByType.entries())
    .map(([typeId, v]) => ({ categoryId: typeId, categoryName: v.name, totalCents: v.totalCents }))
    .sort((a, b) => b.totalCents - a.totalCents);

  const stableTypeIds = [...types].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")).map((t) => t.id);
  const colorMap = buildCategoryColorMap(stableTypeIds);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Investimentos</h1>
          <p className="mt-1 text-sm text-slate-500">Saldo consolidado e por pessoa.</p>
        </div>
        <PersonFilterBar person={personFilter ?? ""} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-3">
          <p className="text-sm font-medium text-slate-500">Saldo geral do casal</p>
          <p className="mt-1.5 text-3xl font-bold tracking-tight text-slate-900">
            {formatCurrency(combinedTotal)}
          </p>
        </div>
        {totalsByPerson.map((t) => (
          <div key={t.person} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{PERSON_LABELS[t.person]}</p>
            <p className="mt-1.5 text-xl font-bold text-slate-900">{formatCurrency(t.totalCents)}</p>
            <p className="text-xs text-slate-400">
              {combinedTotal > 0 ? ((t.totalCents / combinedTotal) * 100).toFixed(0) : 0}% do total
            </p>
          </div>
        ))}
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">
          Distribuição por tipo — {personFilter ? PERSON_LABELS[personFilter] : "Todos (casal)"}
        </h2>
        <div className="mt-4">
          <CategoryBarChart
            categories={distribution}
            colorByCategoryId={colorMap}
            emptyMessage="Nenhum investimento cadastrado ainda."
          />
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">Adicionar investimento</h2>
        <div className="mt-4">
          <InvestmentForm types={types} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">
          Investimentos {personFilter ? `— ${PERSON_LABELS[personFilter]}` : ""}
        </h2>
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <InvestmentList investments={filtered} />
        </div>
      </section>
    </main>
  );
}
