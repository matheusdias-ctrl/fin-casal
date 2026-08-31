import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Governança de acesso: só estes dois e-mails podem entrar no app, mesmo que
// alguém descubra a URL. Login é feito com a própria conta Google de cada um.
const ALLOWED_EMAILS = new Set(["matheus.dias.adm@gmail.com", "beatriz.bataus@gmail.com"]);

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user }) {
      return !!user.email && ALLOWED_EMAILS.has(user.email.toLowerCase());
    },
  },
};
