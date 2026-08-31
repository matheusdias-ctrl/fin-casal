"use client";

import { useState } from "react";
import { formatCurrency, formatCompactCurrency } from "@/lib/format";

type MonthPoint = {
  value: string;
  label: string;
  incomeCents: number;
  expenseCents: number;
};

// Par divergente (receita = entra / despesa = sai) da paleta de referência.
const COLOR_INCOME = "#2a78d6";
const COLOR_EXPENSE = "#e34948";
const GRID_LINE = "#e1e0d9";
const MUTED_INK = "#898781";
const CHART_SURFACE = "#ffffff";

const WIDTH = 640;
const HEIGHT = 220;
const PAD_LEFT = 8;
const PAD_RIGHT = 8;
const PAD_TOP = 16;
const PAD_BOTTOM = 24;

export function EvolutionChart({ data }: { data: MonthPoint[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return <p className="text-sm text-slate-500">Sem dados para o período.</p>;
  }

  const maxValue = Math.max(1, ...data.flatMap((d) => [d.incomeCents, d.expenseCents]));
  const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const stepX = data.length > 1 ? plotWidth / (data.length - 1) : 0;

  const xFor = (i: number) => PAD_LEFT + stepX * i;
  const yFor = (cents: number) => PAD_TOP + plotHeight - (cents / maxValue) * plotHeight;

  const pathFor = (key: "incomeCents" | "expenseCents") =>
    data.map((d, i) => `${i === 0 ? "M" : "L"} ${xFor(i).toFixed(1)} ${yFor(d[key]).toFixed(1)}`).join(" ");

  const lastIndex = data.length - 1;
  const baselineY = PAD_TOP + plotHeight;
  const areaExpense = `${pathFor("expenseCents")} L ${xFor(lastIndex).toFixed(1)} ${baselineY.toFixed(1)} L ${xFor(0).toFixed(1)} ${baselineY.toFixed(1)} Z`;

  const hovered = hoverIndex !== null ? data[hoverIndex] : null;
  const hoveredLeftPct = hoverIndex !== null ? (xFor(hoverIndex) / WIDTH) * 100 : 0;

  return (
    <div>
      <div className="relative">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full"
          role="img"
          aria-label="Evolução de receitas e despesas por mês"
        >
          {[0, 0.25, 0.5, 0.75, 1].map((g) => (
            <line
              key={g}
              x1={PAD_LEFT}
              x2={WIDTH - PAD_RIGHT}
              y1={PAD_TOP + plotHeight * (1 - g)}
              y2={PAD_TOP + plotHeight * (1 - g)}
              stroke={GRID_LINE}
              strokeWidth={1}
            />
          ))}

          {/* rótulos do eixo Y: só o topo e a base, o resto fica no tooltip */}
          <text x={PAD_LEFT} y={PAD_TOP - 4} fontSize={10} fill={MUTED_INK}>
            {formatCompactCurrency(maxValue)}
          </text>
          <text x={PAD_LEFT} y={baselineY - 4} fontSize={10} fill={MUTED_INK}>
            R$ 0
          </text>

          <path d={areaExpense} fill={COLOR_EXPENSE} opacity={0.08} />

          <path
            d={pathFor("incomeCents")}
            fill="none"
            stroke={COLOR_INCOME}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d={pathFor("expenseCents")}
            fill="none"
            stroke={COLOR_EXPENSE}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          <circle
            cx={xFor(lastIndex)}
            cy={yFor(data[lastIndex].incomeCents)}
            r={4}
            fill={COLOR_INCOME}
            stroke={CHART_SURFACE}
            strokeWidth={2}
          />
          <circle
            cx={xFor(lastIndex)}
            cy={yFor(data[lastIndex].expenseCents)}
            r={4}
            fill={COLOR_EXPENSE}
            stroke={CHART_SURFACE}
            strokeWidth={2}
          />

          {hoverIndex !== null && (
            <line
              x1={xFor(hoverIndex)}
              x2={xFor(hoverIndex)}
              y1={PAD_TOP}
              y2={baselineY}
              stroke={MUTED_INK}
              strokeWidth={1}
            />
          )}

          {data.map((d, i) => (
            <rect
              key={d.value}
              x={xFor(i) - (stepX || plotWidth) / 2}
              y={PAD_TOP}
              width={stepX || plotWidth}
              height={plotHeight}
              fill="transparent"
              onPointerEnter={() => setHoverIndex(i)}
              onPointerMove={() => setHoverIndex(i)}
              onPointerLeave={() => setHoverIndex(null)}
            />
          ))}

          {data.map((d, i) => (
            <text key={d.value} x={xFor(i)} y={HEIGHT - 6} textAnchor="middle" fontSize={10} fill={MUTED_INK}>
              {d.label}
            </text>
          ))}
        </svg>

        {hovered && (
          <div
            className="pointer-events-none absolute top-2 min-w-[9rem] rounded-md border border-slate-200 bg-white px-3 py-2 text-xs shadow-md"
            style={{
              left: `${Math.min(Math.max(hoveredLeftPct, 18), 82)}%`,
              transform: "translateX(-50%)",
            }}
          >
            <p className="font-medium capitalize text-slate-900">{hovered.label}</p>
            <p className="mt-1 flex items-center gap-1.5 text-slate-600">
              <span className="inline-block h-0.5 w-3" style={{ backgroundColor: COLOR_INCOME }} />
              Receita
              <span className="ml-auto font-semibold text-slate-900">
                {formatCurrency(hovered.incomeCents)}
              </span>
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-slate-600">
              <span className="inline-block h-0.5 w-3" style={{ backgroundColor: COLOR_EXPENSE }} />
              Despesa
              <span className="ml-auto font-semibold text-slate-900">
                {formatCurrency(hovered.expenseCents)}
              </span>
            </p>
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-3" style={{ backgroundColor: COLOR_INCOME }} />
          Receita
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-3" style={{ backgroundColor: COLOR_EXPENSE }} />
          Despesa
        </span>
      </div>
    </div>
  );
}
