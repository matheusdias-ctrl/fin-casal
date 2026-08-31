# Finanças do Casal

Controle financeiro do casal: importação de fatura em CSV (Nubank/Itaú) com
classificação por pessoa (Matheus/Bia/Casal) e categoria, dashboards, e
controle de investimentos. Acesso restrito por login Google a dois e-mails.

Stack: Next.js (App Router) + TypeScript + Tailwind CSS + Prisma + Postgres + NextAuth.

## Funcionalidades

- **Login restrito**: só entra quem logar com um dos e-mails do Google
  autorizados em `src/lib/auth.ts` — qualquer outra conta é recusada.
- **Importar CSV** (`/importar`): upload da fatura exportada do Nubank ou do Itaú,
  com revisão de pessoa/categoria linha a linha antes de confirmar, e
  aprendizado de categoria por estabelecimento (`CategoryRule`).
- **Dashboard** (`/`): evolução mês a mês, distribuição por categoria, filtros
  de mês e pessoa.
- **Investimentos** (`/investimentos`): saldo consolidado do casal, saldo por
  pessoa e distribuição por tipo de investimento.
- **Configurações** (`/configuracoes`): categorias de despesa/receita e tipos
  de investimento totalmente editáveis (adicionar, renomear, excluir).
- Dashboards complementares: `/dashboard/pessoa`, `/dashboard/categoria`,
  `/dashboard/insights`.

## Publicar online (Vercel + Neon) — passo a passo

Nesta máquina não há Node.js instalado, então os passos abaixo usam apenas o
site do Neon, o site do GitHub e o site da Vercel (sem precisar rodar `npm`
localmente). O próprio deploy da Vercel instala tudo e aplica as migrations
do banco automaticamente.

### 1. Criar o banco Postgres gratuito (Neon)
1. Crie uma conta em https://neon.tech (pode entrar com GitHub/Google).
2. Crie um novo projeto (ex: nome "fin-casal").
3. No dashboard do projeto, abra **"Connection Details"** e copie:
   - A connection string com **"Pooled connection"** marcado (host contém `-pooler`).
   - A connection string **sem** pooling (host sem `-pooler`).
4. Guarde as duas — vamos usá-las na Vercel como `DATABASE_URL` (pooled) e
   `DIRECT_URL` (direta). O formato está em `.env.example`.

### 2. Criar as credenciais de login (Google Cloud Console)
1. Acesse https://console.cloud.google.com/ e crie (ou selecione) um projeto.
2. Vá em **APIs & Services → OAuth consent screen**:
   - User type: **External**.
   - Preencha nome do app ("Finanças do Casal"), e-mail de suporte e de contato.
   - Em **Test users**, adicione os dois e-mails: `matheus.dias.adm@gmail.com`
     e `beatriz.bataus@gmail.com`. **Isso é obrigatório** — sem isso o Google
     bloqueia o login antes mesmo de chegar na checagem do app.
3. Vá em **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**.
   - Authorized redirect URIs: `https://fin-casal-3z4r.vercel.app/api/auth/callback/google`
4. Copie o **Client ID** e o **Client Secret** — cole direto nas env vars da
   Vercel no próximo passo (não precisa me mostrar).

### 3. Subir o código para o GitHub
1. Crie um repositório novo (vazio) em https://github.com/new — ex: `fin-casal`.
2. Copie a URL do repositório (ex: `https://github.com/SEU_USUARIO/fin-casal.git`).
3. Me avise a URL para eu configurar o remote e enviar o código.

### 4. Importar na Vercel
1. Crie uma conta em https://vercel.com (recomendado: entrar com GitHub).
2. Clique em **"Add New… > Project"** e importe o repositório `fin-casal`.
3. Em **"Environment Variables"**, adicione:
   - `DATABASE_URL` = connection string pooled do Neon
   - `DIRECT_URL` = connection string direta do Neon
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` = do passo 2
   - `NEXTAUTH_SECRET` = uma string aleatória (veja `.env.example` para gerar a sua)
   - `NEXTAUTH_URL` = `https://fin-casal-3z4r.vercel.app`
4. Clique em **Deploy**. O comando de build (`prisma migrate deploy && next
   build`) cria as tabelas no banco automaticamente na primeira vez.
5. Ao terminar, a Vercel mostra a URL pública — é esse link que você
   compartilha com a outra pessoa (ela também precisa logar com o e-mail dela).

Cada novo `git push` no repositório gera um novo deploy automático na Vercel.

## Rodando localmente (opcional, requer Node.js 18+)

```bash
npm install
cp .env.example .env   # preencha as variáveis
npm run dev
```

Acesse http://localhost:3000. Para o login funcionar localmente, adicione
`http://localhost:3000/api/auth/callback/google` como redirect URI extra no
Google Cloud Console.

## Sobre o formato do CSV

O importador (`src/lib/csvParser.ts`) foi feito para reconhecer automaticamente:
- **Nubank**: cabeçalho `date,title,amount`.
- **Itaú**: cabeçalho com `data`/`lançamento`/`valor`, separado por `;`, valor com vírgula decimal.
- Se o cabeçalho não bater com nenhum desses, ele tenta a ordem posicional
  (1ª coluna = data, 2ª = descrição, 3ª = valor).

Se alguma linha vier com erro ("Data não reconhecida" / "Valor não
reconhecido"), me mostre um trecho do CSV (pode mascarar valores/estabelecimentos)
que eu ajusto o parser.

## Estrutura

- `prisma/schema.prisma` — `Category`, `Transaction`, `CategoryRule`, `InvestmentType`, `Investment`.
- `src/lib/auth.ts` — configuração do login (NextAuth + allowlist de e-mails).
- `src/middleware.ts` — protege todas as rotas, exceto o próprio fluxo de login.
- `src/lib/actions.ts` — categorias (CRUD).
- `src/lib/importActions.ts` / `csvParser.ts` / `textNormalize.ts` — importação de CSV.
- `src/lib/reports.ts` / `dateRange.ts` / `chartColors.ts` — agregações e cores dos gráficos.
- `src/lib/investmentActions.ts` — investimentos (CRUD) e tipos de investimento.
