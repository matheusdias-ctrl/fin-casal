type StatTileProps = {
  label: string;
  value: string;
  deltaPct: number | null;
  /** Se um valor maior é uma coisa boa ("up", ex: receita) ou ruim ("down", ex: despesa). */
  deltaGoodDirection: "up" | "down";
};

export function StatTile({ label, value, deltaPct, deltaGoodDirection }: StatTileProps) {
  let deltaColor = "text-slate-400";
  let deltaText = "Sem dado do mês anterior";

  if (deltaPct !== null) {
    const isUp = deltaPct > 0;
    const isDown = deltaPct < 0;
    const isGood = deltaGoodDirection === "up" ? isUp : isDown;
    const isBad = deltaGoodDirection === "up" ? isDown : isUp;
    deltaColor = isGood ? "text-emerald-600" : isBad ? "text-red-600" : "text-slate-400";
    const arrow = isUp ? "▲" : isDown ? "▼" : "–";
    deltaText = `${arrow} ${Math.abs(deltaPct).toFixed(0)}% vs mês anterior`;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
      <p className={`mt-1 text-xs ${deltaColor}`}>{deltaText}</p>
    </div>
  );
}
