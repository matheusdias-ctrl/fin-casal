import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Finanças do Casal",
  description: "Controle financeiro do casal: importação de fatura, categorias e dashboards.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-slate-50`}>
        <div className="flex min-h-screen flex-col sm:flex-row">
          <Sidebar />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}
