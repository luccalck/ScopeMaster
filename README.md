<div align="center">

# ScopeMaster

### Collaborative Software Requirements Management Platform

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://scope-master-alpha.vercel.app/)

**[Live Demo](https://scope-master-alpha.vercel.app/)**

</div>

---

## Overview

ScopeMaster is a collaborative web platform for structuring, reviewing, and tracking software requirements. Developed as an **ADS Integrator Project at SENAI**, it centralizes projects, stakeholders, functional and non-functional requirements, validation workflows, analytics, notifications, and document exports in one responsive interface.

The application is implemented as a React single-page application backed by **Supabase/PostgreSQL**. Its database scripts define the relational schema, seed data, constraints, notifications, voting support, and Row Level Security policies used by the academic deployment.

---

## Core Capabilities

- **Project workspaces:** create and manage projects, members, status information, and requirement backlogs.
- **Requirements lifecycle:** register functional and non-functional requirements with codes, priorities, descriptions, acceptance information, and lifecycle states.
- **Validation workflow:** collect approvals, revision requests, feedback, and votes from project participants.
- **Role-aware experience:** provide Administrator, Developer, and Client interfaces and actions according to the profile stored by the application.
- **Analytics dashboard:** consolidate project and requirement indicators with tables, charts, and visual summaries.
- **Document exports:** generate requirements documentation and analytical reports in PDF using `jsPDF` and `jspdf-autotable`.
- **Notifications:** persist and display workflow events associated with projects and requirements.
- **Responsive interface:** support desktop, tablet, and mobile layouts with light and dark themes.

---

## Technical Architecture

```text
React 18 + TypeScript + Vite
            |
            | Supabase JavaScript client
            v
Supabase API + PostgreSQL
            |
            +-- relational project and requirement data
            +-- SQL constraints and seed scripts
            +-- Row Level Security policies
            +-- notifications and validation records
```

### Application layer

- React 18 and TypeScript application built with Vite;
- React Router for client-side navigation and protected-route handling;
- Tailwind CSS, Radix UI primitives, Material UI, and custom styles;
- reusable project, requirement, navigation, modal, and form components;
- `localStorage` session state and role-aware interface behavior;
- password hashing and comparison with `bcryptjs` against the application's user records.

### Data layer

- Supabase JavaScript client configured through environment variables;
- PostgreSQL tables for users, projects, requirements, memberships, feedback, votes, and notifications;
- versioned SQL scripts for schema changes, constraints, seeds, and RLS policies;
- application queries centralized in `src/app/lib/api.ts`;
- mapped TypeScript types for database entities.

> ScopeMaster uses an application-managed authentication flow rather than Supabase Auth. Authorization behavior is represented in the interface and in the SQL policies included with this academic project.

---

## Technology Stack

| Area | Technologies |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, React Router |
| UI | Tailwind CSS 4, Radix UI, Material UI, GSAP |
| Data | Supabase JavaScript SDK, PostgreSQL, SQL |
| Reports | jsPDF, jspdf-autotable |
| Deployment | Vercel |

---

## Project Structure

```text
scope-master/
|-- database/                 # Schema, seed, migration, constraint, and RLS scripts
|-- docs/                     # Requirements specification and interface screenshots
|-- public/                   # Public logos and visual assets
|-- src/
|   |-- app/
|   |   |-- components/       # Reusable application and UI components
|   |   |-- lib/              # Supabase client, queries, types, and document exports
|   |   |-- screens/          # Authentication, dashboard, project, and settings screens
|   |   `-- routes.tsx        # Application routes
|   |-- imports/              # Imported project assets
|   |-- styles/               # Global, theme, and Tailwind styles
|   `-- main.tsx              # Application entry point
|-- .env.example              # Environment-variable template
|-- package.json
`-- vite.config.ts
```

---

## Evaluation Credentials

The public deployment includes a demonstration administrator account for project evaluation:

- **Email:** `avaliador@senai.br`
- **Password:** `senai123`

These credentials are limited to demonstration data and must not be reused in another environment.

---

## Local Setup

### Prerequisites

- Node.js 18 or newer;
- npm;
- a Supabase project with the repository's database scripts applied.

### Installation

```bash
git clone https://github.com/luccalck/scope-master.git
cd scope-master
npm install
```

Copy the environment template and provide your Supabase project values:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Start the development server:

```bash
npm run dev
```

Create a production build with:

```bash
npm run build
```

---

## Academic Context

ScopeMaster was developed collaboratively as a **2026 Systems Analysis and Development Integrator Project at SENAI São Paulo**. The repository documents the implemented application, database model, requirements specification, and responsive interface assets used in the project.
