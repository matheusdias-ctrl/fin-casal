import { getCategories, createCategory, renameCategory, deleteCategory } from "@/lib/actions";
import {
  getInvestmentTypes,
  createInvestmentType,
  renameInvestmentType,
  deleteInvestmentType,
} from "@/lib/investmentActions";
import { EditableChipList } from "@/components/EditableChipList";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const [categories, investmentTypes] = await Promise.all([getCategories(), getInvestmentTypes()]);
  const expense = categories.filter((c) => c.type === "EXPENSE");
  const income = categories.filter((c) => c.type === "INCOME");

  const addExpenseCategory = createCategory.bind(null, "EXPENSE");
  const addIncomeCategory = createCategory.bind(null, "INCOME");

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Configurações</h1>
      <p className="mt-1 text-sm text-slate-500">
        Categorias, tipos de investimento e pessoas usadas para classificar os lançamentos.
        Clique em um item para renomear, ou no × para excluir.
      </p>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">Categorias de despesa</h2>
        <div className="mt-3">
          <EditableChipList
            items={expense}
            onAdd={addExpenseCategory}
            onRename={renameCategory}
            onDelete={deleteCategory}
            placeholder="Nova categoria de despesa"
          />
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">Categorias de receita</h2>
        <div className="mt-3">
          <EditableChipList
            items={income}
            onAdd={addIncomeCategory}
            onRename={renameCategory}
            onDelete={deleteCategory}
            placeholder="Nova categoria de receita"
          />
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">Tipos de investimento</h2>
        <div className="mt-3">
          <EditableChipList
            items={investmentTypes}
            onAdd={createInvestmentType}
            onRename={renameInvestmentType}
            onDelete={deleteInvestmentType}
            placeholder="Novo tipo de investimento"
          />
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">Pessoas</h2>
        <p className="mt-2 text-sm text-slate-600">Matheus, Bia e Casal (gasto compartilhado).</p>
      </section>
    </main>
  );
}
