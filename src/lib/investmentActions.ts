"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import type { Person } from "@prisma/client";

const DEFAULT_INVESTMENT_TYPES = [
  "Reserva de emergência",
  "Renda fixa",
  "Fundos imobiliários",
  "Ações",
  "Criptomoedas",
  "Previdência privada",
  "Outros",
];

/** Lista os tipos de investimento, semeando o conjunto inicial só se estiver vazio. */
export async function getInvestmentTypes() {
  const count = await prisma.investmentType.count();
  if (count === 0) {
    await prisma.investmentType.createMany({
      data: DEFAULT_INVESTMENT_TYPES.map((name) => ({ name })),
      skipDuplicates: true,
    });
  }
  return prisma.investmentType.findMany({ orderBy: { name: "asc" } });
}

export async function createInvestmentType(name: string) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Informe um nome para o tipo de investimento.");
  await prisma.investmentType.create({ data: { name: trimmed } });
  revalidatePath("/configuracoes");
  revalidatePath("/investimentos");
}

export async function renameInvestmentType(id: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Informe um nome para o tipo de investimento.");
  await prisma.investmentType.update({ where: { id }, data: { name: trimmed } });
  revalidatePath("/configuracoes");
  revalidatePath("/investimentos");
}

export async function deleteInvestmentType(id: string) {
  const usageCount = await prisma.investment.count({ where: { typeId: id } });
  if (usageCount > 0) {
    throw new Error(
      `Esse tipo tem ${usageCount} investimento(s) e não pode ser excluído. Renomeie em vez de apagar.`
    );
  }
  await prisma.investmentType.delete({ where: { id } });
  revalidatePath("/configuracoes");
  revalidatePath("/investimentos");
}

export async function getInvestments() {
  return prisma.investment.findMany({
    include: { type: true },
    orderBy: { createdAt: "desc" },
  });
}

export type InvestmentInput = {
  person: Person;
  typeId: string;
  description: string;
  amountCents: number;
};

export async function createInvestment(input: InvestmentInput) {
  if (!input.typeId) throw new Error("Selecione um tipo de investimento.");
  if (!Number.isFinite(input.amountCents) || input.amountCents <= 0) {
    throw new Error("Informe um valor válido, maior que zero.");
  }
  await prisma.investment.create({
    data: {
      person: input.person,
      typeId: input.typeId,
      description: input.description.trim() || null,
      amountCents: input.amountCents,
    },
  });
  revalidatePath("/investimentos");
}

export async function updateInvestment(id: string, input: InvestmentInput) {
  if (!input.typeId) throw new Error("Selecione um tipo de investimento.");
  if (!Number.isFinite(input.amountCents) || input.amountCents <= 0) {
    throw new Error("Informe um valor válido, maior que zero.");
  }
  await prisma.investment.update({
    where: { id },
    data: {
      person: input.person,
      typeId: input.typeId,
      description: input.description.trim() || null,
      amountCents: input.amountCents,
    },
  });
  revalidatePath("/investimentos");
}

export async function deleteInvestment(id: string) {
  await prisma.investment.delete({ where: { id } });
  revalidatePath("/investimentos");
}
