"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import type { TransactionType } from "@prisma/client";

// Lista inicial de categorias do casal, usada apenas para semear o banco na
// primeira vez. Depois disso a lista é totalmente editável em /configuracoes.
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
  // Fallback para valores negativos da fatura (estorno/pagamento).
  { name: "Estorno / Pagamento", type: "INCOME" },
];

/** Lista as categorias, semeando o conjunto inicial só se o banco estiver vazio. */
export async function getCategories() {
  const count = await prisma.category.count();
  if (count === 0) {
    await prisma.category.createMany({ data: DEFAULT_CATEGORIES, skipDuplicates: true });
  }
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function createCategory(type: TransactionType, name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Informe um nome para a categoria.");
  }
  await prisma.category.create({ data: { name: trimmed, type } });
  revalidatePath("/configuracoes");
  revalidatePath("/importar");
  revalidatePath("/");
}

export async function renameCategory(id: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Informe um nome para a categoria.");
  }
  await prisma.category.update({ where: { id }, data: { name: trimmed } });
  revalidatePath("/configuracoes");
  revalidatePath("/importar");
  revalidatePath("/");
}

export async function deleteCategory(id: string) {
  const usageCount = await prisma.transaction.count({ where: { categoryId: id } });
  if (usageCount > 0) {
    throw new Error(
      `Essa categoria tem ${usageCount} lançamento(s) e não pode ser excluída. Renomeie em vez de apagar.`
    );
  }
  await prisma.categoryRule.deleteMany({ where: { categoryId: id } });
  await prisma.category.delete({ where: { id } });
  revalidatePath("/configuracoes");
  revalidatePath("/importar");
  revalidatePath("/");
}
