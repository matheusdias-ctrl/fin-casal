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
      className="rounded border border-slate-300 px-3 py-2 text-sm"
    />
  );
}
