import { createBrowserRouter } from "react-router";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./screens/Login";
import { Landing } from "./screens/Landing";
import { Dashboard } from "./screens/Dashboard";
import { Requirements } from "./screens/Requirements";
import { RequirementDetails } from "./screens/RequirementDetails";
import { Projects } from "./screens/Projects";
import { ProjectDetails } from "./screens/ProjectDetails";
import { Analytics } from "./screens/Analytics";
import { AutorizarUsuarios } from "./screens/AutorizarUsuarios";
import { Pagamentos } from "./screens/Pagamentos";
import { Settings } from "./screens/Settings";

export const router = createBrowserRouter([
  {
    // Landing page pública — primeira tela ao abrir o projeto.
    path: "/",
    Component: Landing,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    // Dashboard (Painel de Propostas) — agora em /dashboard, autossuficiente
    // (sidebar + header próprios no estilo glass), fora do Layout compartilhado.
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    // Projects agora também é uma página de tela cheia no estilo glassmorphism.
    path: "/projects",
    element: (
      <ProtectedRoute>
        <Projects />
      </ProtectedRoute>
    ),
  },
  {
    // Detalhe do Projeto — agora também em tela cheia no estilo glassmorphism
    // (sidebar própria via GlassSidebar), fora do Layout compartilhado.
    path: "/projects/:id",
    element: (
      <ProtectedRoute>
        <ProjectDetails />
      </ProtectedRoute>
    ),
  },
  {
    // Analytics agora também é uma página de tela cheia no estilo glassmorphism.
    path: "/analytics",
    element: (
      <ProtectedRoute>
        <Analytics />
      </ProtectedRoute>
    ),
  },
  {
    // Autorizar Usuários também é uma página de tela cheia no estilo glassmorphism.
    path: "/autorizar-usuarios",
    element: (
      <ProtectedRoute>
        <AutorizarUsuarios />
      </ProtectedRoute>
    ),
  },
  {
    // Fluxo de Ideias agora também é uma página de tela cheia no estilo glassmorphism.
    path: "/requirements",
    element: (
      <ProtectedRoute>
        <Requirements />
      </ProtectedRoute>
    ),
  },
  {
    // Configurações também é uma página de tela cheia no estilo glassmorphism.
    path: "/settings",
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
  },
  {
    // Detalhe do Requisito — tela cheia no estilo glassmorphism.
    path: "/requirements/:id",
    element: (
      <ProtectedRoute>
        <RequirementDetails />
      </ProtectedRoute>
    ),
  },
  {
    // Planos e Pagamentos — tela cheia no estilo glassmorphism.
    path: "/pagamentos",
    element: (
      <ProtectedRoute>
        <Pagamentos />
      </ProtectedRoute>
    ),
  },
]);

