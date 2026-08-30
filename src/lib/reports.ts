"use server";

import { prisma } from "./prisma";
import type { Person, TransactionType } from "@prisma/client";

export type PersonTotal = {
  person: Person;
  incomeCents: number;
  expenseCents: number;
};

const ALL_PERSONS: Person[] = ["MATHEUS", "BIA", "CASAL"];

export async function getPersonTotals(start: Date, end: Date): Promise<PersonTotal[]> {
  const rows = await prisma.transaction.groupBy({
    by: ["person", "type"],
    where: { date: { gte: start, lt: end } },
    _sum: { amountCents: true },
  });

  return ALL_PERSONS.map((person) => {
    const income = rows.find((r) => r.person === person && r.type === "INCOME");
    const expense = rows.find((r) => r.person === person && r.type === "EXPENSE");
    return {
      person,
      incomeCents: income?._sum.amountCents ?? 0,
      expenseCents: expense?._sum.amountCents ?? 0,
    };
  });
}

export type CategoryTotal = {
  categoryId: string;
  categoryName: string;
  type: TransactionType;
  totalCents: number;
};

export async function getCategoryTotals(start: Date, end: Date): Promise<CategoryTotal[]> {
  const rows = await prisma.transaction.groupBy({
    by: ["categoryId", "type"],
    where: { date: { gte: start, lt: end } },
    _sum: { amountCents: true },
  });

  const categories = await prisma.category.findMany();
  const categoryById = new Map(categories.map((c) => [c.id, c.name]));

  return rows
    .map((r) => ({
      categoryId: r.categoryId,
      categoryName: categoryById.get(r.categoryId) ?? "Sem categoria",
      type: r.type,
      totalCents: r._sum.amountCents ?? 0,
    }))
    .sort((a, b) => b.totalCents - a.totalCents);
}

export async function getTopExpenses(start: Date, end: Date, limit = 5) {
  return prisma.transaction.findMany({
    where: { date: { gte: start, lt: end }, type: "EXPENSE" },
    orderBy: { amountCents: "desc" },
    take: limit,
    include: { category: true },
  });
}
