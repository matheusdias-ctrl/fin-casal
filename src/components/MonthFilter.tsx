"use client";

import { usePathname, useRouter } from "next/navigation";

export function MonthFilter({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <input
      type="month"
      defaultValue={value}
      onChange={(e) => {
        if (e.target.value) {
          router.push(`${pathname}?month=${e.target.value}`);
        }
      }}
      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light"
    />
  );
}
