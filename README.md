# ScopeMaster — Collaborative Software Requirements Management Platform

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deployment-000000?style=for-the-badge&logo=vercel&logoColor=white)

ScopeMaster is a modern collaborative platform for agile software requirements management and visual scope tracking. Developed as a Capstone Integrator Project (SENAI), it bridges the communication gap between clients and engineering teams through real-time validation workflows and automated PDF specification generation.

---

## Key Features

- **Secure Authentication & RBAC:** Role-Based Access Control (Admin, Developer, Client) integrated with Supabase Auth and Row-Level Security (RLS).
- **Multi-Tenant Project Workspaces:** Isolated project environments with custom requirement backlogs.
- **Requirement Lifecycle Management:** Technical detailing for Functional (FR) and Non-Functional Requirements (NFR).
- **Client Consensus & Approval Flow:** Interactive approval voting system allowing clients to accept or request revisions on scope items.
- **Automated Specification PDF Generation:** Client-side compiled PDF exports of approved technical specifications powered by `pdf-lib`.

---

## Tech Stack & Architecture

- **Frontend:** React 18, Vite, TypeScript
- **UI Components & Styling:** Tailwind CSS, Shadcn UI, Material UI
- **Database & Auth:** Supabase (PostgreSQL), Row-Level Security (RLS) policies
- **PDF Compilation:** `pdf-lib`

---

## Evaluation Credentials (Demo Access)

To test the platform with full **Administrator** privileges:

* **Email:** `avaliador@senai.br`
* **Password:** `senai123`

---

## Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/luccalck/scope-master.git
   cd scope-master
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

---

*Developed by the ScopeMaster Engineering Team — SENAI (2026).*
