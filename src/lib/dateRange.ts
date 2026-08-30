export type MonthRange = {
  start: Date;
  end: Date;
  value: string; // yyyy-mm
  label: string; // "agosto de 2026"
};

/** Monta o intervalo [início, fim) de um mês a partir de "yyyy-mm"; sem parâmetro, usa o mês atual. */
export function getMonthRange(monthParam?: string, referenceNow?: Date): MonthRange {
  const now = referenceNow ?? new Date();
  let year = now.getUTCFullYear();
  let month = now.getUTCMonth() + 1; // 1-12

  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [y, m] = monthParam.split("-").map(Number);
    year = y;
    month = m;
  }

  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  const value = `${year}-${String(month).padStart(2, "0")}`;
  const label = start.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return { start, end, value, label };
}

export function getPreviousMonthRange(range: MonthRange): MonthRange {
  const prevDate = new Date(range.start);
  prevDate.setUTCMonth(prevDate.getUTCMonth() - 1);
  const value = `${prevDate.getUTCFullYear()}-${String(prevDate.getUTCMonth() + 1).padStart(2, "0")}`;
  return getMonthRange(value);
}
