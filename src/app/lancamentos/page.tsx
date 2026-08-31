import { getBalance, getCategories, getTransactions } from "@/lib/actions";
import { BalanceCard } from "@/components/BalanceCard";
import { CategoryForm } from "@/components/CategoryForm";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";

// Sempre busca os dados mais recentes do banco (sem cache estático de página).
export const dynamic = "force-dynamic";

export default async function LancamentosPage() {
  const [balanceCents, categories, transactions] = await Promise.all([
    getBalance(),
    getCategories(),
    getTransactions(),
  ]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Lançamentos</h1>
      <p className="mt-1 text-sm text-slate-500">
        Adicione um gasto ou receita manualmente, ou gerencie as categorias.
      </p>

      <div className="mt-6">
        <BalanceCard balanceCents={balanceCents} />
      </div>

      <section className="mt-8 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Novo lançamento</h2>
        <div className="mt-4">
          <TransactionForm categories={categories} />
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">Categorias</h2>
        <div className="mt-3">
          <CategoryForm />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">Histórico</h2>
        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <TransactionList transactions={transactions} />
        </div>
      </section>
    </main>
  );
}
