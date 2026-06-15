import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link, useLocation } from "react-router";
import {
  Plus,
  Search,
  MoreVertical,
  Users,
  FileText,
  Calendar,
  Loader2,
  Eye,
  Pencil,
  Trash2,
  UserCheck,
  LayoutDashboard,
  BarChart3,
  FolderKanban,
  Settings,
  User,
  LogOut,
  TrendingUp,
  LayoutGrid,
  List,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "../components/ui/dropdown-menu";
import { CreateProjectModal } from "../components/CreateProjectModal";
import { EditProjectModal } from "../components/EditProjectModal";
import { ConfirmDeleteDialog } from "../components/ConfirmDeleteDialog";
import {
  fetchProjetosComDetalhes,
  excluirProjeto,
  notificarMembrosProjeto,
  fetchProjetosDoUsuario,
  fetchRequisitosComProjeto,
  fetchUsuarios,
} from "../lib/api";
import type { Requisito, Usuario } from "../lib/types";
import "./dashboard-glass.css";

interface ProjetoListItem {
  id_projeto: string;
  nome: string;
  descricao: string | null;
  data_criacao: string;
  totalRequisitos: number;
  aprovados: number;
  pendentes: number;
  rejeitados: number;
  membros: {
    id_projeto: string;
    id_usuario: string;
    papel_no_projeto: string;
    usuario?: {
      id_usuario: string;
      nome: string;
      email: string;
      perfil: string;
    };
  }[];
}

const statusBadge: Record<string, string> = {
  Aprovado: "bg-emerald-500/15 text-emerald-300 border border-emerald-400/25",
  Pendente: "bg-amber-500/15 text-amber-300 border border-amber-400/25",
  Rejeitado: "bg-red-500/15 text-red-300 border border-red-400/25",
};

export function Projects() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<ProjetoListItem[]>([]);
  const [requisitos, setRequisitos] = useState<(Requisito & { projeto_nome?: string })[]>([]);
  const [membrosEquipe, setMembrosEquipe] = useState<Usuario[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [myProjectIds, setMyProjectIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Edit modal state
  const [editProject, setEditProject] = useState<ProjetoListItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Delete dialog state
  const [deleteProject, setDeleteProject] = useState<ProjetoListItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [projetosData, reqsData, usuariosData] = await Promise.all([
        fetchProjetosComDetalhes(),
        fetchRequisitosComProjeto(),
        fetchUsuarios(),
      ]);
      setProjects(projetosData);
      setRequisitos(reqsData);
      setMembrosEquipe(usuariosData);
    } catch (err) {
      console.error("Erro ao carregar dados do board de projetos:", err);
    } finally {
      setLoading(false);
    }
  };

  // Obter dados do usuário logado
  const userDataString = localStorage.getItem("scopemaster_user");
  const userData = userDataString ? JSON.parse(userDataString) : null;
  const currentUserId = userData?.id || "";
  const currentUserName = userData?.name || "Usuário";
  const currentUserRole = userData?.role || "Membro";
  const isCliente = currentUserRole === "Cliente";
  const isDesenvolvedor = currentUserRole === "Desenvolvedor";
  const isAdmin = currentUserRole === "Administrador";

  const firstName = currentUserName.split(" ")[0];
  const userInitials = currentUserName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    carregarDados();
    if (currentUserId) {
      fetchProjetosDoUsuario(currentUserId).then(setMyProjectIds).catch(console.error);
    }
    if (isCliente || isDesenvolvedor) {
      setShowOnlyMine(true);
    }
  }, []);

  const handleExcluir = async () => {
    if (!deleteProject) return;
    await notificarMembrosProjeto(
      deleteProject.id_projeto,
      currentUserId,
      `${currentUserName} excluiu o projeto "${deleteProject.nome}".`,
      "projeto_excluido"
    );
    await excluirProjeto(deleteProject.id_projeto);
    carregarDados();
  };

  // Filtragem dos elementos para o Quadro/Board
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.descricao && p.descricao.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesParticipation = showOnlyMine
        ? myProjectIds.includes(p.id_projeto)
        : true;
      return matchesSearch && matchesParticipation;
    });
  }, [projects, searchTerm, showOnlyMine, myProjectIds]);

  const filteredRequisitos = useMemo(() => {
    return requisitos.filter((r) => {
      const matchesSearch = r.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.projeto_nome && r.projeto_nome.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesParticipation = showOnlyMine
        ? myProjectIds.includes(r.id_projeto)
        : true;
      return matchesSearch && matchesParticipation;
    });
  }, [requisitos, searchTerm, showOnlyMine, myProjectIds]);

  const filteredMembros = useMemo(() => {
    return membrosEquipe.filter((m) => {
      const matchesSearch = m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Se showOnlyMine estiver ativo, filtra membros que compartilham algum projeto com o usuário atual
      const matchesParticipation = showOnlyMine
        ? projects
            .filter((p) => myProjectIds.includes(p.id_projeto))
            .flatMap((p) => p.membros.map((mb) => mb.id_usuario))
            .includes(m.id_usuario)
        : true;
      return matchesSearch && matchesParticipation;
    });
  }, [membrosEquipe, projects, searchTerm, showOnlyMine, myProjectIds]);

  const getInitials = (nome: string) =>
    nome
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const getProgress = (p: ProjetoListItem) =>
    p.totalRequisitos > 0
      ? Math.round((p.aprovados / p.totalRequisitos) * 100)
      : 0;

  // KPIs do topo: restritos ao ESCOPO DE ACESSO do usuário (não os totais
  // globais). Admin sem o filtro "Participação" vê tudo; demais usuários (ou
  // Admin com o filtro ligado) veem apenas os projetos em que participam.
  // Independe da busca textual — só do acesso/participação.
  const accessProjects = useMemo(
    () =>
      isAdmin && !showOnlyMine
        ? projects
        : projects.filter((p) => myProjectIds.includes(p.id_projeto)),
    [projects, isAdmin, showOnlyMine, myProjectIds]
  );

  const totalRequisitosAcesso = useMemo(() => {
    const ids = new Set(accessProjects.map((p) => p.id_projeto));
    return requisitos.filter((r) => ids.has(r.id_projeto)).length;
  }, [accessProjects, requisitos]);

  const totalMembrosEquipe = useMemo(() => {
    const ids = new Set<string>();
    accessProjects.forEach((p) => p.membros.forEach((m) => ids.add(m.id_usuario)));
    return ids.size;
  }, [accessProjects]);

  const aprovacaoMedia = useMemo(() => {
    if (accessProjects.length === 0) return 0;
    const soma = accessProjects.reduce((acc, p) => acc + getProgress(p), 0);
    return Math.round(soma / accessProjects.length);
  }, [accessProjects]);

  const kpis = [
    {
      label: "Projetos Ativos",
      value: String(accessProjects.length),
      Icon: FolderKanban,
      tint: "bg-[#7c3aed]/15 text-[#d2bbff]",
    },
    {
      label: "Total de Requisitos",
      value: String(totalRequisitosAcesso),
      Icon: FileText,
      tint: "bg-emerald-500/15 text-emerald-300",
    },
    {
      label: "Membros da Equipe",
      value: String(totalMembrosEquipe),
      Icon: Users,
      tint: "bg-[#d2bbff]/15 text-[#d2bbff]",
    },
    {
      label: "Aprovação Média",
      value: `${aprovacaoMedia}%`,
      Icon: TrendingUp,
      tint: "bg-[#ffb95f]/15 text-[#ffb95f]",
    },
  ];

  // Barra lateral
  const nav = [
    { name: "Painel de Propostas", href: "/dashboard", icon: LayoutDashboard },
    { name: "Fluxo de Ideias", href: "/requirements", icon: FileText },
    { name: "Projetos Aprovados", href: "/projects", icon: FolderKanban },
    { name: "Métricas de Aprovação", href: "/analytics", icon: BarChart3 },
  ];
  if (currentUserRole === "Administrador")
    nav.push({ name: "Autorizar Usuários", href: "/autorizar-usuarios", icon: UserCheck });

  const navSecundaria = [
    { name: "Configurações", href: "/settings", icon: Settings },
  ];

  const isActive = (href: string) =>
    href === "/" ? location.pathname === "/" : location.pathname.startsWith(href);

  const handleLogout = () => {
    localStorage.removeItem("scopemaster_authenticated");
    localStorage.removeItem("scopemaster_user");
    navigate("/login");
  };

  const renderDropdown = (project: ProjetoListItem) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <button className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 text-[#ccc3d8] transition">
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 border-white/10 bg-[#201e27] text-[#e6e0ec]">
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/projects/${project.id_projeto}`);
          }}
          className="focus:bg-white/10 focus:text-white cursor-pointer"
        >
          <Eye className="mr-2 h-4 w-4" />
          Visualizar
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            setEditProject(project);
            setIsEditModalOpen(true);
          }}
          className="text-amber-300 focus:bg-white/10 focus:text-amber-200 cursor-pointer"
        >
          <Pencil className="mr-2 h-4 w-4" />
          Modificar
        </DropdownMenuItem>

        {isAdmin && (
          <>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setDeleteProject(project);
                setIsDeleteDialogOpen(true);
              }}
              className="text-red-400 focus:bg-white/10 focus:text-red-300 cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (loading) {
    return (
      <div className="sm-dash items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#d2bbff]" />
        <span className="ml-3 text-[#ccc3d8]">Carregando projetos...</span>
      </div>
    );
  }

  return (
    <div className="sm-dash">
      {/* ============================ Sidebar ============================ */}
      <nav className="sm-sidebar z-10 flex h-full w-[260px] flex-shrink-0 flex-col pt-8">
        <div className="flex items-center gap-3 px-6 pb-8">
          <img
            src="/ScopeMasterLogoReal.png"
            alt="ScopeMaster"
            className="h-9 w-9 flex-shrink-0 object-contain drop-shadow-[0_2px_8px_rgba(124,58,237,0.45)]"
          />
          <h1 className="bg-gradient-to-r from-[#ffc27a] via-[#d2bbff] to-[#a06bff] bg-clip-text text-xl font-bold tracking-tight text-transparent">
            ScopeMaster
          </h1>
        </div>

        <div className="sm-noscroll flex-1 space-y-1 overflow-y-auto px-4">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-4 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-[#ccc3d8] hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
          <div className="pt-6">
            {navSecundaria.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-4 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    active
                      ? "bg-white/10 text-white"
                      : "text-[#ccc3d8] hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Usuário — canto inferior esquerdo */}
        <div className="mt-auto border-t border-white/10 p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/5">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-[#7c3aed] to-[#4cd7f6] text-sm font-semibold text-white">
                  {userInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{currentUserName}</p>
                  <p className="truncate text-xs text-[#ccc3d8]">{currentUserRole}</p>
                </div>
                <MoreVertical className="h-4 w-4 flex-shrink-0 text-[#ccc3d8]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-white/10 bg-[#201e27] text-[#e6e0ec]">
              <DropdownMenuLabel className="text-white">Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="focus:bg-white/10" onClick={() => navigate("/settings")}>
                <Settings className="mr-2 h-4 w-4" /> Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="text-red-400 focus:bg-white/10" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* ============================ Conteúdo principal =========================== */}
      <main className="sm-noscroll relative z-0 flex h-full min-w-0 flex-1 flex-col overflow-y-auto">
        <header className="shrink-0 px-8 pb-6 pt-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Projetos Aprovados</h2>
              <p className="mt-1 text-[#ccc3d8]">
                Gerencie projetos ativos, acompanhe requisitos e confira os membros da equipe.
              </p>
            </div>
            {/* Botão Novo Projeto — Visível apenas para Administrador/Desenvolvedor */}
            {!isCliente && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="sm-glass-btn flex flex-shrink-0 items-center gap-3 rounded-full px-4 py-2 text-sm font-medium text-white"
              >
                Novo Projeto
                <span className="sm-primary-btn flex h-6 w-6 items-center justify-center rounded-full">
                  <Plus className="h-4 w-4 text-white" />
                </span>
              </button>
            )}
          </div>
        </header>

        {/* Conteúdo: KPIs + barra de ferramentas + grade de projetos (estilo glass) */}
        <div className="px-8 pb-8">
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {kpis.map((kpi) => {
              const Icon = kpi.Icon;
              return (
                <div key={kpi.label} className="sm-panel sm-panel-hover p-5">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${kpi.tint}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-2xl font-bold leading-none text-white">{kpi.value}</p>
                  <p className="mt-1.5 text-sm text-[#ccc3d8]">{kpi.label}</p>
                </div>
              );
            })}
          </div>

          {/* Barra de ferramentas: busca + participação + alternância de visualização */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#ccc3d8]" />
                <input
                  type="search"
                  placeholder="Buscar projetos..."
                  className="w-full rounded-full border border-white/10 bg-black/30 py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-[#ccc3d8]/70 focus:border-[#7c3aed]/60 focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {isAdmin && (
                <button
                  onClick={() => setShowOnlyMine(!showOnlyMine)}
                  className={`sm-glass-btn flex flex-shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    showOnlyMine ? "bg-white/20 text-white" : "text-[#ccc3d8]"
                  }`}
                >
                  <UserCheck className="h-4 w-4" />
                  Participação
                </button>
              )}
            </div>

            <div className="flex flex-shrink-0 items-center gap-1 rounded-full border border-white/10 bg-black/30 p-1">
              <button
                onClick={() => setViewMode("grid")}
                aria-label="Visualizar em grade"
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                  viewMode === "grid" ? "bg-white/15 text-white" : "text-[#ccc3d8] hover:text-white"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                aria-label="Visualizar em lista"
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                  viewMode === "list" ? "bg-white/15 text-white" : "text-[#ccc3d8] hover:text-white"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Grade / lista de projetos */}
          {filteredProjects.length === 0 ? (
            <div className="sm-panel mt-6 flex flex-col items-center justify-center gap-2 py-16 text-center">
              <FolderKanban className="h-10 w-10 text-white/20" />
              <p className="text-sm text-[#ccc3d8]">Nenhum projeto encontrado.</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredProjects.map((project) => {
                const progress = getProgress(project);
                return (
                  <div
                    key={project.id_projeto}
                    onClick={() => navigate(`/projects/${project.id_projeto}`)}
                    className="sm-panel sm-panel-hover relative flex cursor-pointer flex-col overflow-hidden p-5"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h4 className="truncate text-base font-bold text-white">{project.nome}</h4>
                      {renderDropdown(project)}
                    </div>
                    <p className="mb-5 line-clamp-2 min-h-[2.5rem] text-sm text-[#ccc3d8]/90">
                      {project.descricao || "Sem descrição cadastrada."}
                    </p>
                    <div className="mb-3 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#ccc3d8]/80">Aprovação</span>
                        <span className="font-bold text-white">{progress}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#4cd7f6]"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="mb-4 flex items-center gap-1.5 text-xs text-[#ccc3d8]/90">
                      <FileText className="h-3.5 w-3.5" />
                      <span>
                        {project.aprovados}/{project.totalRequisitos} requisitos
                      </span>
                    </div>
                    <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-3">
                      <div className="flex -space-x-2">
                        {project.membros.slice(0, 3).map((member, i) => (
                          <Avatar key={i} className="h-6 w-6 border border-[#1c1a22]">
                            <AvatarFallback className="bg-gradient-to-br from-[#7c3aed] to-[#4cd7f6] text-[9px] font-bold text-white">
                              {member.usuario ? getInitials(member.usuario.nome) : "?"}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {project.membros.length > 3 && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[#1c1a22] bg-white/10 text-[9px] font-bold text-white">
                            +{project.membros.length - 3}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#ccc3d8]/80">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(project.data_criacao).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-3">
              {filteredProjects.map((project) => {
                const progress = getProgress(project);
                return (
                  <div
                    key={project.id_projeto}
                    onClick={() => navigate(`/projects/${project.id_projeto}`)}
                    className="sm-panel sm-panel-hover flex cursor-pointer items-center gap-4 p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-bold text-white">{project.nome}</h4>
                      <p className="truncate text-xs text-[#ccc3d8]/80">
                        {project.descricao || "Sem descrição cadastrada."}
                      </p>
                    </div>
                    <div className="hidden w-40 shrink-0 sm:block">
                      <div className="mb-1 flex items-center justify-between text-[11px]">
                        <span className="text-[#ccc3d8]/80">Aprovação</span>
                        <span className="font-bold text-white">{progress}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#4cd7f6]"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="hidden items-center gap-1.5 text-xs text-[#ccc3d8]/90 md:flex">
                      <FileText className="h-3.5 w-3.5" />
                      <span>
                        {project.aprovados}/{project.totalRequisitos}
                      </span>
                    </div>
                    <div className="hidden items-center gap-1.5 text-xs text-[#ccc3d8]/80 lg:flex">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(project.data_criacao).toLocaleDateString("pt-BR")}</span>
                    </div>
                    {renderDropdown(project)}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Modais mantidos do original */}
      <CreateProjectModal
        open={isCreateModalOpen}
        onOpenChange={(open) => {
          setIsCreateModalOpen(open);
          if (!open) carregarDados();
        }}
      />

      <EditProjectModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        project={editProject}
        onSaved={carregarDados}
      />

      {isAdmin && (
        <ConfirmDeleteDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title="Excluir Projeto"
          description={
            deleteProject
              ? `Tem certeza que deseja excluir o projeto "${deleteProject.nome}"? Todos os ${deleteProject.totalRequisitos} requisito(s) e ${deleteProject.membros.length} membro(s) associados também serão removidos. Esta ação não pode ser desfeita.`
              : ""
          }
          onConfirm={handleExcluir}
        />
      )}
    </div>
  );
}
