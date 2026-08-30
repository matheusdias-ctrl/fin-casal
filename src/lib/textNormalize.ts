// Faixa Unicode dos "combining diacritical marks" (acentos separados que o
// .normalize("NFD") produz a partir de letras acentuadas, ex: "e" + acento).
const DIACRITIC_RANGE_START = 0x0300;
const DIACRITIC_RANGE_END = 0x036f;

function stripDiacritics(value: string): string {
  let result = "";
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    if (code < DIACRITIC_RANGE_START || code > DIACRITIC_RANGE_END) {
      result += char;
    }
  }
  return result;
}

/** Remove acentos, deixa minusculo e tira pontuacao - para comparar descricoes de forma tolerante. */
export function normalizeDescription(raw: string): string {
  return stripDiacritics(raw.normalize("NFD"))
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Chave usada para "aprender" categorias: pega as duas primeiras palavras
 * significativas (mais de 2 letras) da descricao normalizada, que
 * normalmente identificam o estabelecimento. Ex: "UBER *TRIP 123" -> "uber trip".
 */
export function ruleKeyFor(normalized: string): string {
  const words = normalized.split(" ").filter((w) => w.length > 2);
  return words.slice(0, 2).join(" ") || normalized;
}
