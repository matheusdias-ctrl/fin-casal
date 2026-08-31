"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/format";
import { OTHER_COLOR } from "@/lib/chartColors";

type CategorySlice = { categoryId: string; categoryName: string; totalCents: number };

export function CategoryBarChart({
  categories,
  colorByCategoryId,
  emptyMessage = "Sem despesas no período.",
}: {
  categories: CategorySlice[];
  /** categoryId -> cor, atribuída de forma estável (independe do filtro atual). */
  colorByCategoryId: Record<string, string>;
  emptyMessage?: string;
}) {
  const [hoverId, setHoverId] = useState<string | null>(null);

  if (categories.length === 0) {
    return <p className="text-sm text-slate-500">{emptyMessage}</p>;
  }

  const maxValue = Math.max(1, ...categories.map((c) => c.totalCents));
  const total = categories.reduce((acc, c) => acc + c.totalCents, 0);

  return (
    <ul className="space-y-3">
      {categories.map((c) => {
        const color = colorByCategoryId[c.categoryId] ?? OTHER_COLOR;
        const pct = total > 0 ? (c.totalCents / total) * 100 : 0;
        const widthPct = Math.max(2, (c.totalCents / maxValue) * 100);
        const dimmed = hoverId !== null && hoverId !== c.categoryId;

        return (
          <li key={c.categoryId}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} />
                {c.categoryName}
              </span>
              <span className="font-medium text-slate-900">
                {formatCurrency(c.totalCents)} <span className="text-slate-400">({pct.toFixed(0)}%)</span>
              </span>
            </div>
            <div
              className="h-3 rounded-full bg-slate-100"
              onPointerEnter={() => setHoverId(c.categoryId)}
              onPointerLeave={() => setHoverId(null)}
            >
              <div
                className="h-3 rounded-full transition-opacity"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: color,
                  opacity: dimmed ? 0.45 : 1,
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
