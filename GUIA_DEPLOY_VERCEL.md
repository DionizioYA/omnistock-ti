# 🚀 Guia Completo de Deploy - OmniStock TI (Service Desk)

Este guia prático ensina passo a passo como colocar o sistema de controle de estoque **OmniStock TI** no ar para que toda a equipe de Service Desk e colaboradores possam acessar pela internet.

---

## 1️⃣ Como Funciona a Arquitetura de Produção

O sistema é dividido em duas partes modernas e separadas:
1. **Frontend (`/frontend`)**: Aplicação web em **React + Vite + Tailwind CSS**.
2. **Backend (`/backend`)**: API REST em **Node.js + Express + Prisma ORM**.

---

## 2️⃣ OPÇÃO A: Deploy do Frontend na VERCEL + Backend no RENDER (Recomendado & Gratuito)

Como a Vercel utiliza funções *Serverless* (sem disco permanente para SQLite local), a arquitetura mais recomendada para evitar perda de dados é hospedar o **Frontend na Vercel** e o **Backend em um serviço Node.js contínuo com PostgreSQL (como Render.com ou Railway)**.

### Passo 1: Subir o Código para o GitHub
1. Crie um repositório no **GitHub** e envie a pasta do projeto (`frontend` e `backend`).

### Passo 2: Publicar o Backend no Render.com (Grátis)
1. Crie uma conta gratuita em [render.com](https://render.com/).
2. Clique em **New -> Web Service** e conecte o seu repositório GitHub.
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm run start` (ou `npm run dev` para testes)
4. (Opcional - Recomendado para Produção) Adicione um banco de dados gratuito **PostgreSQL** no Render/Neon e coloque a URL na variável de ambiente `DATABASE_URL`.
5. Copie a URL gerada para o seu backend (exemplo: `https://omnistock-backend.onrender.com`).

### Passo 3: Publicar o Frontend na VERCEL
1. Crie uma conta gratuita em [vercel.com](https://vercel.com/) e faça login com seu GitHub.
2. Clique em **Add New -> Project** e selecione o seu repositório GitHub.
3. Em **Framework Preset**, deixe selecionado **Vite** (ou selecione manualmente).
4. Em **Root Directory**, clique em **Edit** e selecione a pasta `frontend`.
5. Em **Environment Variables (Variáveis de Ambiente)**, adicione:
   - **Nome (`Name`)**: `VITE_API_URL`
   - **Valor (`Value`)**: `https://sua-url-do-backend.onrender.com/api` (substitua pela URL real do passo anterior).
6. Clique em **Deploy**!
7. Em 1 minuto o seu site estará disponível no endereço `.vercel.app` para todos os colaboradores!

---

## 3️⃣ OPÇÃO B: Deploy 100% na VERCEL (com Vercel Postgres / Neon DB)

Se desejar manter tudo dentro da Vercel:
1. Crie um banco de dados **Neon Postgres** gratuito ou **Vercel Postgres** no painel da Vercel.
2. No arquivo `backend/prisma/schema.prisma`, altere de `provider = "sqlite"` para:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Rode `npx prisma db push` apontando para a sua `DATABASE_URL` do Postgres na nuvem para criar as tabelas.
4. Conecte o repositório na Vercel configurando o frontend para se conectar às funções serverless da API.

---

## 4️⃣ Validação dos Fluxos de Estoque (Service Desk)

Após o deploy ou executando localmente, o sistema suporta os seguintes fluxos operacionais:
- **Cadastro e Exclusão de Equipamentos**: Na aba **Estoque**, botão **+ Novo Equipamento TI** ou no ícone de lixeira (**Excluir item logicamente sem quebrar o histórico de movimentação**).
- **Entrada e Validação de Recebimento (`ENTRADA`)**: Na aba **Movimentações -> + Nova Movimentação -> Entrada**, registrando a chegada de notebooks, monitores, fontes ou cabos.
- **Alteração e Ajuste de Estoque (`AJUSTE` / `SAIDA`)**: Em caso de inventário físico ou entrega para colaborador, registrando a saída ou ajuste com motivo e departamento.
- **Perfil de Acesso (`X-User-Role`)**: Alterne entre **Administrador**, **Técnico Service Desk** e **Consulta TI** diretamente no topo do Dashboard.
