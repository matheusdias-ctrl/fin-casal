// Protege todas as páginas: sem sessão válida, redireciona para o login do
// NextAuth (que por sua vez só aceita os e-mails da allowlist em src/lib/auth.ts).
export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
