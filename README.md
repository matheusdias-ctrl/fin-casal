# Finanças do Casal

Controle financeiro do casal: lançamentos, categorias, importação de fatura em CSV
(Nubank/Itaú) com identificação de pessoa (Matheus/Bia/Casal), e dashboards por
pessoa, por categoria e de insights.

Stack: Next.js (App Router) + TypeScript + Tailwind CSS + Prisma + Postgres.

## Funcionalidades

- **Lançamentos manuais**: receita/despesa, categoria, pessoa, data.
- **Importar CSV** (`/importar`): upload da fatura exportada do Nubank ou do Itaú.
  O parser detecta automaticamente o formato (vírgula ou ponto e vírgula, data
  ISO ou BR, valor com vírgula ou ponto decimal). Cada linha é revisada antes de
  confirmar — você escolhe pessoa e categoria por gasto.
- **Aprendizado de categoria**: ao confirmar uma importação, o sistema memoriza
  a combinação estabelecimento → categoria/pessoa (`CategoryRule`). Da próxima
  vez que um gasto parecido aparecer, a sugestão já vem preenchida.
- **Dashboards**:
  - `/dashboard/pessoa` — total gasto por pessoa no mês.
  - `/dashboard/categoria` — total por categoria (despesas e receitas).
  - `/dashboard/insights` — comparação com o mês anterior, categoria que mais
    subiu/caiu, participação de cada pessoa no gasto, maiores gastos do mês.

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

### 2. Subir o código para o GitHub
1. Crie um repositório novo (vazio) em https://github.com/new — ex: `fin-casal`.
2. Copie a URL do repositório (ex: `https://github.com/SEU_USUARIO/fin-casal.git`).
3. Me avise a URL para eu configurar o remote e enviar o código, ou rode você
   mesmo (substituindo a URL):
   ```
   git remote add origin https://github.com/SEU_USUARIO/fin-casal.git
   git push -u origin main
   ```

### 3. Importar na Vercel
1. Crie uma conta em https://vercel.com (recomendado: entrar com GitHub).
2. Clique em **"Add New… > Project"** e importe o repositório `fin-casal`.
3. Em **"Environment Variables"**, adicione:
   - `DATABASE_URL` = connection string pooled do Neon
   - `DIRECT_URL` = connection string direta do Neon
4. Clique em **Deploy**. O comando de build (`prisma migrate deploy && next
   build`) cria as tabelas no banco automaticamente na primeira vez.
5. Ao terminar, a Vercel mostra a URL pública (ex:
   `https://fin-casal.vercel.app`) — é esse link que você compartilha com a
   outra pessoa.

Cada novo `git push` no repositório gera um novo deploy automático na Vercel.

## Rodando localmente (opcional, requer Node.js 18+)

```bash
npm install
cp .env.example .env   # preencha DATABASE_URL e DIRECT_URL
npm run dev
```

Acesse http://localhost:3000.

## Sobre o formato do CSV

O importador (`src/lib/csvParser.ts`) foi feito para reconhecer automaticamente:
- **Nubank**: cabeçalho `date,title,amount`.
- **Itaú**: cabeçalho com `data`/`lançamento`/`valor`, separado por `;`, valor com vírgula decimal.
- Se o cabeçalho não bater com nenhum desses, ele tenta a ordem posicional
  (1ª coluna = data, 2ª = descrição, 3ª = valor).

Como não testei contra um arquivo real do seu banco, é possível que a primeira
importação precise de ajuste fino no parser — se algumas linhas vierem com erro
("Data não reconhecida" / "Valor não reconhecido"), me mostre um trecho do CSV
(pode remover/mascarar os valores se preferir, só preciso ver o formato das
colunas) que eu ajusto o parser.

## Estrutura

- `prisma/schema.prisma` — modelos `Category` e `Transaction`.
- `prisma/migrations/` — migration inicial (cria as tabelas no Postgres).
- `src/lib/actions.ts` — Server Actions (criar/listar/excluir lançamentos e categorias; categorias padrão são criadas automaticamente na primeira consulta).
- `src/app/page.tsx` — dashboard com saldo, formulário de lançamento e lista.
- `src/components/` — `BalanceCard`, `TransactionForm`, `TransactionList`, `CategoryForm`.
