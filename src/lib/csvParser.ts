// Parser tolerante para faturas de cartão exportadas em CSV. Cobre os
// formatos mais comuns do Nubank ("date,title,amount") e do Itaú
// ("data;lançamento;valor", com vírgula decimal) e, se o cabeçalho não for
// reconhecido, tenta a ordem posicional data/descrição/valor como fallback.

export type ParsedCsvRow = {
  date: Date | null;
  description: string;
  amountCents: number | null;
  type: "INCOME" | "EXPENSE";
  raw: { date: string; description: string; amount: string };
  error: string | null;
};

const DATE_HEADER_ALIASES = ["date", "data"];
const DESC_HEADER_ALIASES = [
  "title",
  "lancamento",
  "descricao",
  "estabelecimento",
  "historico",
];
const AMOUNT_HEADER_ALIASES = ["amount", "valor", "valor (r$)", "valor(r$)"];

function detectDelimiter(headerLine: string): "," | ";" {
  const commaCount = (headerLine.match(/,/g) ?? []).length;
  const semicolonCount = (headerLine.match(/;/g) ?? []).length;
  return semicolonCount > commaCount ? ";" : ",";
}

/** Split simples de linha CSV, respeitando valores entre aspas. */
function splitCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result.map((v) => v.trim());
}

function parseAmount(raw: string): number | null {
  let s = raw.trim().replace(/^r\$\s*/i, "");
  if (!s) return null;

  const negative = s.startsWith("-") || (s.startsWith("(") && s.endsWith(")"));
  s = s.replace(/[()]/g, "").replace(/^-/, "");

  const hasComma = s.includes(",");
  const hasDot = s.includes(".");
  if (hasComma && hasDot) {
    // formato brasileiro: ponto = separador de milhar, vírgula = decimal
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (hasComma) {
    s = s.replace(",", ".");
  }

  const value = Number.parseFloat(s);
  if (Number.isNaN(value)) return null;
  return negative ? -value : value;
}

function parseDate(raw: string): Date | null {
  const s = raw.trim();

  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));

  m = s.match(/^(\d{2})[/-](\d{2})[/-](\d{4})/);
  if (m) return new Date(Date.UTC(Number(m[3]), Number(m[2]) - 1, Number(m[1])));

  return null;
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase();
}

export function parseCsv(text: string): ParsedCsvRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  const delimiter = detectDelimiter(lines[0]);
  const header = splitCsvLine(lines[0], delimiter).map(normalizeHeader);

  const dateIdx = header.findIndex((h) => DATE_HEADER_ALIASES.includes(h));
  const descIdx = header.findIndex((h) => DESC_HEADER_ALIASES.includes(h));
  const amountIdx = header.findIndex((h) => AMOUNT_HEADER_ALIASES.includes(h));

  const hasRecognizedHeader = dateIdx !== -1 && descIdx !== -1 && amountIdx !== -1;
  const dataLines = hasRecognizedHeader ? lines.slice(1) : lines;

  // Sem cabeçalho reconhecido: assume a ordem mais comum (data, descrição, valor).
  const finalDateIdx = hasRecognizedHeader ? dateIdx : 0;
  const finalDescIdx = hasRecognizedHeader ? descIdx : 1;
  const finalAmountIdx = hasRecognizedHeader ? amountIdx : 2;

  return dataLines.map((line) => {
    const cols = splitCsvLine(line, delimiter);
    const rawDate = cols[finalDateIdx] ?? "";
    const rawDescription = cols[finalDescIdx] ?? "";
    const rawAmount = cols[finalAmountIdx] ?? "";

    const date = parseDate(rawDate);
    const amount = parseAmount(rawAmount);

    let error: string | null = null;
    if (!date) error = "Data não reconhecida";
    else if (amount === null) error = "Valor não reconhecido";
    else if (!rawDescription) error = "Descrição vazia";

    return {
      date,
      description: rawDescription,
      amountCents: amount === null ? null : Math.round(Math.abs(amount) * 100),
      type: amount !== null && amount < 0 ? "INCOME" : "EXPENSE",
      raw: { date: rawDate, description: rawDescription, amount: rawAmount },
      error,
    };
  });
}
