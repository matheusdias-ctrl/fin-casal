"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Lançamentos" },
  { href: "/importar", label: "Importar CSV" },
  { href: "/dashboard/pessoa", label: "Por Pessoa" },
  { href: "/dashboard/categoria", label: "Por Categoria" },
  { href: "/dashboard/insights", label: "Insights" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-3xl flex-wrap gap-1 px-4 py-2 text-sm">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded px-3 py-1.5 font-medium ${
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
