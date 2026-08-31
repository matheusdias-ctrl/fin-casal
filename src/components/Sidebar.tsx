"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  IconHome,
  IconUpload,
  IconUsers,
  IconTag,
  IconChart,
  IconSettings,
  IconMenu,
  IconClose,
} from "./icons";

const LINKS = [
  { href: "/", label: "Dashboard", Icon: IconHome },
  { href: "/importar", label: "Importar CSV", Icon: IconUpload },
  { href: "/dashboard/pessoa", label: "Pessoas", Icon: IconUsers },
  { href: "/dashboard/categoria", label: "Categorias", Icon: IconTag },
  { href: "/dashboard/insights", label: "Insights", Icon: IconChart },
  { href: "/configuracoes", label: "Configurações", Icon: IconSettings },
];

function Brand() {
  return (
    <div className="flex items-center gap-2 px-4 py-5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
        FC
      </div>
      <span className="text-sm font-semibold text-slate-900">Finanças do Casal</span>
    </div>
  );
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-0.5 px-2">
      {LINKS.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* barra superior só no mobile, com botão para abrir o menu */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:hidden">
        <span className="text-sm font-semibold text-slate-900">Finanças do Casal</span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          className="text-slate-600"
        >
          <IconMenu className="h-6 w-6" />
        </button>
      </header>

      {/* sidebar fixa no desktop */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-slate-200 bg-white sm:flex">
        <Brand />
        <NavLinks pathname={pathname} />
      </aside>

      {/* sidebar em overlay no mobile */}
      {open && (
        <div className="fixed inset-0 z-40 sm:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-sm font-semibold text-slate-900">Finanças do Casal</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
                className="text-slate-600"
              >
                <IconClose className="h-5 w-5" />
              </button>
            </div>
            <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
