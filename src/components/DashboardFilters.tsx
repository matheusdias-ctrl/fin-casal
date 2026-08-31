"use client";

import { usePathname, useRouter } from "next/navigation";

export function DashboardFilters({ month, person }: { month: string; person: string }) {
  const router = useRouter();
  const pathname = usePathname();

  function navigate(nextMonth: string, nextPerson: string) {
    const params = new URLSearchParams();
    if (nextMonth) params.set("month", nextMonth);
    if (nextPerson) params.set("person", nextPerson);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="month"
        defaultValue={month}
        onChange={(e) => navigate(e.target.value, person)}
        className="rounded border border-slate-300 px-3 py-2 text-sm"
      />
      <select
        defaultValue={person}
        onChange={(e) => navigate(month, e.target.value)}
        className="rounded border border-slate-300 px-3 py-2 text-sm"
      >
        <option value="">Todos</option>
        <option value="MATHEUS">Matheus</option>
        <option value="BIA">Bia</option>
        <option value="CASAL">Casal</option>
      </select>
    </div>
  );
}
