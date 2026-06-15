# ScopeMaster

O ScopeMaster é uma plataforma moderna para o gerenciamento ágil de requisitos de software e acompanhamento visual de escopo. Projetado como um TCC/Projeto Integrador, ele aproxima clientes e equipes de desenvolvimento através de validação em tempo real e documentação automatizada.

## 🚀 Funcionalidades Principais

- **Autenticação Segura:** Login, controle de sessão (JWT) integrado com Supabase Auth.
- **Gestão de Projetos:** Criação de múltiplos ambientes de projetos para diferentes equipes.
- **Backlog de Requisitos:** Cadastro, edição e detalhamento técnico de Requisitos Funcionais (RF) e Não Funcionais (RNF).
- **Validação de Clientes (Consenso):** Clientes aprovam ou reprovam os requisitos via sistema de votação.
- **Geração Automática de Documentação:** Compilação dos requisitos aprovados em formato PDF.

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React, Vite, TypeScript
- **Estilização:** Tailwind CSS, Shadcn UI, MUI
- **Backend/Database:** Supabase (PostgreSQL), Row-Level Security (RLS)
- **PDF Gen:** pdf-lib

## 📦 Como rodar este projeto

1. Clone o repositório:
   ```bash
   git clone https://github.com/luccalck/scope-master.git
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente baseando-se no \`.env.example\`:
   ```bash
   cp .env.example .env
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

---
*Desenvolvido pela equipe ScopeMaster - SENAI Taubaté (2026).*
