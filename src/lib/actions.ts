"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import type { TransactionType } from "@prisma/client";

const DEFAULT_CATEGORIES: { name: string; type: TransactionType }[] = [
  { name: "Salário", type: "INCOME" },
  { name: "Outras receitas", type: "INCOME" },
  { name: "Moradia", type: "EXPENSE" },
  { name: "Mercado", type: "EXPENSE" },
  { name: "Transporte", type: "EXPENSE" },
  { name: "Lazer", type: "EXPENSE" },
  { name: "Saúde", type: "EXPENSE" },
  { name: "Outras despesas", type: "EXPENSE" },
];

/** Lista as categorias, criando um conjunto padrão automaticamente na primeira vez. */
export async function getCategories() {
  const count = await prisma.category.count();
  if (count === 0) {
    await prisma.category.createMany({
      data: DEFAULT_CATEGORIES,
      skipDuplicates: true,
    });
  }
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function getTransactions() {
  return prisma.transaction.findMany({
    include: { category: true },
    orderBy: { date: "desc" },
  });
}

/** Soma todas as transações e retorna o saldo em centavos (receitas - despesas). */
export async function getBalance(): Promise<number> {
  const transactions = await prisma.transaction.findMany({
    select: { amountCents: true, type: true },
  });
  return transactions.reduce((total, t) => {
    return t.type === "INCOME" ? total + t.amountCents : total - t.amountCents;
  }, 0);
}

export async function createCategory(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "");

  if (!name) {
    throw new Error("Informe um nome para a categoria.");
  }
  if (type !== "INCOME" && type !== "EXPENSE") {
    throw new Error("Tipo de categoria inválido.");
  }

  await prisma.category.create({ data: { name, type } });
  revalidatePath("/");
}

export async function createTransaction(formData: FormData) {
  const description = String(formData.get("description") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "").trim().replace(",", ".");
  const type = String(formData.get("type") ?? "");
  const categoryId = String(formData.get("categoryId") ?? "");
  const dateRaw = String(formData.get("date") ?? "");

  const amount = Number.parseFloat(amountRaw);

  if (!description) {
    throw new Error("Informe uma descrição.");
  }
  if (type !== "INCOME" && type !== "EXPENSE") {
    throw new Error("Selecione o tipo do lançamento.");
  }
  if (!categoryId) {
    throw new Error("Selecione uma categoria.");
  }
  if (Number.isNaN(amount) || amount <= 0) {
    throw new Error("Informe um valor válido, maior que zero.");
  }

  await prisma.transaction.create({
    data: {
      description,
      amountCents: Math.round(amount * 100),
      type,
      categoryId,
      date: dateRaw ? new Date(`${dateRaw}T12:00:00.000Z`) : new Date(),
    },
  });

  revalidatePath("/");
}

export async function deleteTransaction(id: string) {
  await prisma.transaction.delete({ where: { id } });
  revalidatePath("/");
}
