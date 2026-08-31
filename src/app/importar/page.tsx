import { getCategories } from "@/lib/actions";
import { ImportWizard } from "@/components/ImportWizard";

export const dynamic = "force-dynamic";

export default async function ImportarPage() {
  const categories = await getCategories();

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Importar fatura (CSV)</h1>
      <p className="mt-1 text-sm text-slate-500">
        Envie o CSV exportado do Nubank ou do Itaú. Confira e ajuste a pessoa e a categoria de
        cada gasto antes de confirmar — nada é salvo até você clicar em &quot;Confirmar
        importação&quot;.
      </p>
      <div className="mt-6">
        <ImportWizard categories={categories} />
      </div>
    </main>
  );
}
