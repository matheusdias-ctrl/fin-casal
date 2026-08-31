"use server";

import { prisma } from "./prisma";
import type { TransactionType } from "@prisma/client";

// Lista canônica de categorias do casal. Não há mais tela de cadastro manual
// de categoria — este é o conjunto oficial usado na classificação dos gastos
// importados via CSV.
const DEFAULT_CATEGORIES: { name: string; type: TransactionType }[] = [
  { name: "Moradia", type: "EXPENSE" },
  { name: "Financiamento", type: "EXPENSE" },
  { name: "Casa", type: "EXPENSE" },
  { name: "Supermercado", type: "EXPENSE" },
  { name: "Alimentação", type: "EXPENSE" },
  { name: "Suplemento/farmacia", type: "EXPENSE" },
  { name: "Pet", type: "EXPENSE" },
  { name: "Lazer", type: "EXPENSE" },
  { name: "Assinatura", type: "EXPENSE" },
  { name: "Viagem", type: "EXPENSE" },
  { name: "Combustível", type: "EXPENSE" },
  { name: "Seguro Veículo", type: "EXPENSE" },
  { name: "Estacionamento", type: "EXPENSE" },
  { name: "Lavagem carro", type: "EXPENSE" },
  { name: "Uber / Taxi / 99Pop", type: "EXPENSE" },
  { name: "Presente", type: "EXPENSE" },
  { name: "Educação", type: "EXPENSE" },
  { name: "Roupa", type: "EXPENSE" },
  { name: "Saúde", type: "EXPENSE" },
  { name: "Trabalho", type: "EXPENSE" },
  { name: "Beleza", type: "EXPENSE" },
  { name: "Telefonia", type: "EXPENSE" },
  { name: "Doação", type: "EXPENSE" },
  // Fallback para valores negativos da fatura (estorno/pagamento), já que não
  // há mais lançamento manual de receita.
  { name: "Estorno / Pagamento", type: "INCOME" },
];

/**
 * Lista as categorias, sincronizando com a lista canônica acima: cria as que
 * faltam e remove as antigas que não têm nenhum lançamento associado (para
 * não deixar "lixo" de listas anteriores, sem risco de perder dados reais).
 */
export async function getCategories() {
  await Promise.all(
    DEFAULT_CATEGORIES.map((c) =>
      prisma.category.upsert({
        where: { name_type: { name: c.name, type: c.type } },
        update: {},
        create: c,
      })
    )
  );

  const canonicalKeys = new Set(DEFAULT_CATEGORIES.map((c) => `${c.name}::${c.type}`));
  const existing = await prisma.category.findMany({
    include: { _count: { select: { transactions: true, categoryRules: true } } },
  });
  const staleIds = existing
    .filter(
      (c) =>
        !canonicalKeys.has(`${c.name}::${c.type}`) &&
        c._count.transactions === 0 &&
        c._count.categoryRules === 0
    )
    .map((c) => c.id);

  if (staleIds.length > 0) {
    try {
      await prisma.category.deleteMany({ where: { id: { in: staleIds } } });
    } catch {
      // Se algo passou a referenciar a categoria entre a checagem e o delete,
      // apenas ignora e mantém a categoria antiga — nunca falha a página por causa disso.
    }
  }

  return prisma.category.findMany({ orderBy: { name: "asc" } });
}
