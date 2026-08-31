import { getCategories } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const categories = await getCategories();
  const expense = categories.filter((c) => c.type === "EXPENSE");
  const income = categories.filter((c) => c.type === "INCOME");

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Configurações</h1>
      <p className="mt-1 text-sm text-slate-500">
        Categorias e pessoas usadas para classificar os gastos importados.
      </p>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">Categorias de despesa</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {expense.map((c) => (
            <span
              key={c.id}
              className="rounded-full bg-brand-light px-3 py-1 text-xs font-medium text-brand-dark"
            >
              {c.name}
            </span>
          ))}
        </div>
      </section>

      {income.length > 0 && (
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">Categorias de receita</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {income.map((c) => (
              <span
                key={c.id}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
              >
                {c.name}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">Pessoas</h2>
        <p className="mt-2 text-sm text-slate-600">Matheus, Bia e Casal (gasto compartilhado).</p>
      </section>

      <p className="mt-6 text-xs text-slate-400">
        A lista de categorias é fixa por enquanto — se precisar adicionar, remover ou renomear
        alguma, é só pedir.
      </p>
    </main>
  );
}
