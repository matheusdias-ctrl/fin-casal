// Ordem categórica fixa da paleta de referência (8 tons, validados p/ acessibilidade
// CVD e contraste). Nunca gerar/ciclar cores além destas.
export const CATEGORICAL_COLORS = [
  "#2a78d6", // blue
  "#eb6834", // orange
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#e87ba4", // magenta
  "#008300", // green
  "#4a3aa7", // violet
];
export const OTHER_COLOR = "#898781";

/**
 * Atribui uma cor fixa a cada categoria com base numa ordem estável (ex:
 * alfabética sobre TODAS as categorias do sistema) — para que a cor de uma
 * categoria nunca mude quando o filtro (mês/pessoa) reordena os totais por
 * valor. Categorias além da 7ª posição dividem a cor cinza "Outros".
 */
export function buildCategoryColorMap(categoryIdsInStableOrder: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  categoryIdsInStableOrder.forEach((id, i) => {
    map[id] = CATEGORICAL_COLORS[i] ?? OTHER_COLOR;
  });
  return map;
}
