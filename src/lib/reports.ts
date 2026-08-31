"use server";

import { prisma } from "./prisma";
import { getPreviousMonthRange, type MonthRange } from "./dateRange";
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

export async function getCategoryTotals(
  start: Date,
  end: Date,
  person?: Person
): Promise<CategoryTotal[]> {
  const rows = await prisma.transaction.groupBy({
    by: ["categoryId", "type"],
    where: { date: { gte: start, lt: end }, ...(person ? { person } : {}) },
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

export type PeriodSummary = { incomeCents: number; expenseCents: number };

/** Soma receitas/despesas de um período, opcionalmente restrito a uma pessoa. */
export async function getPeriodSummary(
  start: Date,
  end: Date,
  person?: Person
): Promise<PeriodSummary> {
  const rows = await prisma.transaction.groupBy({
    by: ["type"],
    where: { date: { gte: start, lt: end }, ...(person ? { person } : {}) },
    _sum: { amountCents: true },
  });

  return {
    incomeCents: rows.find((r) => r.type === "INCOME")?._sum.amountCents ?? 0,
    expenseCents: rows.find((r) => r.type === "EXPENSE")?._sum.amountCents ?? 0,
  };
}

export type MonthPoint = {
  value: string;
  label: string;
  incomeCents: number;
  expenseCents: number;
};

/** Série de receita/despesa por mês, terminando em `anchorRange`, opcionalmente restrita a uma pessoa. */
export async function getMonthlySeries(
  anchorRange: MonthRange,
  monthsCount: number,
  person?: Person
): Promise<MonthPoint[]> {
  const ranges: MonthRange[] = [anchorRange];
  for (let i = 1; i < monthsCount; i++) {
    ranges.unshift(getPreviousMonthRange(ranges[0]));
  }

  return Promise.all(
    ranges.map(async (range) => {
      const summary = await getPeriodSummary(range.start, range.end, person);
      return {
        value: range.value,
        label: range.start.toLocaleDateString("pt-BR", { month: "short", timeZone: "UTC" }),
        incomeCents: summary.incomeCents,
        expenseCents: summary.expenseCents,
      };
    })
  );
}
