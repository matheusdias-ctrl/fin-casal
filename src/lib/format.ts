/** Formata um valor em centavos (inteiro) como moeda BRL, ex: 150050 -> "R$ 1.500,50". */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

/** Formata uma data como dd/mm/aaaa no padrão brasileiro. */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}
