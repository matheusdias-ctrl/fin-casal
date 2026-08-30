import { formatCurrency } from "@/lib/format";

export function BalanceCard({ balanceCents }: { balanceCents: number }) {
  const isNegative = balanceCents < 0;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">Saldo atual</p>
      <p
        className={`mt-1 text-3xl font-bold ${
          isNegative ? "text-red-600" : "text-emerald-600"
        }`}
      >
        {formatCurrency(balanceCents)}
      </p>
    </div>
  );
}
