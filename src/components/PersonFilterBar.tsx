"use client";

import { usePathname, useRouter } from "next/navigation";

export function PersonFilterBar({ person }: { person: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <select
      defaultValue={person}
      onChange={(e) => {
        const params = new URLSearchParams();
        if (e.target.value) params.set("person", e.target.value);
        router.push(`${pathname}?${params.toString()}`);
      }}
      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light"
    >
      <option value="">Todos (casal)</option>
      <option value="MATHEUS">Matheus</option>
      <option value="BIA">Bia</option>
      <option value="CASAL">Casal (compartilhado)</option>
    </select>
  );
}
