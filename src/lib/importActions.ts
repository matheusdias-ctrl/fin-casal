"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { parseCsv } from "./csvParser";
import { normalizeDescription, ruleKeyFor } from "./textNormalize";
import type { Person, TransactionType } from "@prisma/client";

export type ImportRowPreview = {
  key: string;
  date: string; // yyyy-mm-dd, vazio se não reconhecido
  description: string;
  amountCents: number;
  type: TransactionType;
  suggestedCategoryId: string | null;
  suggestedPerson: Person | null;
  error: string | null;
};

/** Lê o texto de um CSV de fatura e devolve linhas prontas para revisão, já com sugestão de categoria/pessoa quando existir uma regra aprendida. */
export async function parseImportText(text: string): Promise<ImportRowPreview[]> {
  const rows = parseCsv(text);
  const rules = await prisma.categoryRule.findMany();
  const rulesByKey = new Map(rules.map((r) => [r.pattern, r]));

  return rows.map((row, index) => {
    const ruleKey = ruleKeyFor(normalizeDescription(row.description));
    const rule = rulesByKey.get(ruleKey);

    return {
      key: String(index),
      date: row.date ? row.date.toISOString().slice(0, 10) : "",
      description: row.description,
      amountCents: row.amountCents ?? 0,
      type: row.type,
      suggestedCategoryId: rule?.categoryId ?? null,
      suggestedPerson: rule?.person ?? null,
      error: row.error,
    };
  });
}

export type ConfirmedImportRow = {
  date: string;
  description: string;
  amountCents: number;
  type: TransactionType;
  categoryId: string;
  person: Person;
};

/** Grava as linhas confirmadas como lançamentos e memoriza a escolha de categoria/pessoa para a próxima importação. */
export async function commitImport(rows: ConfirmedImportRow[]) {
  if (rows.length === 0) return { count: 0 };

  await prisma.transaction.createMany({
    data: rows.map((row) => ({
      description: row.description,
      amountCents: row.amountCents,
      type: row.type,
      categoryId: row.categoryId,
      person: row.person,
      date: new Date(`${row.date}T12:00:00.000Z`),
    })),
  });

  for (const row of rows) {
    const key = ruleKeyFor(normalizeDescription(row.description));
    await prisma.categoryRule.upsert({
      where: { pattern: key },
      update: { categoryId: row.categoryId, person: row.person },
      create: { pattern: key, categoryId: row.categoryId, person: row.person },
    });
  }

  revalidatePath("/");
  revalidatePath("/dashboard/pessoa");
  revalidatePath("/dashboard/categoria");
  revalidatePath("/dashboard/insights");

  return { count: rows.length };
}
