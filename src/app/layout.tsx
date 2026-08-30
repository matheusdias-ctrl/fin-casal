import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finanças do Casal",
  description: "Controle financeiro simples para o casal: lançamentos, categorias e saldo.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
