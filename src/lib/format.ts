/** Formata um valor em centavos (inteiro) como moeda BRL, ex: 150050 -> "R$ 1.500,50". */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

/** Versão compacta para eixos de gráfico, ex: 150050 -> "R$ 1,5k". */
export function formatCompactCurrency(cents: number): string {
  const value = cents / 100;
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `R$ ${(value / 1_000).toFixed(1)}k`;
  return `R$ ${value.toFixed(0)}`;
}

/** Formata uma data como dd/mm/aaaa no padrão brasileiro. */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}
