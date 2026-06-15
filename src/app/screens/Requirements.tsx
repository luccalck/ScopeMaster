import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  MoreVertical,
  ArrowUpDown,
  Loader2,
  UserCheck,
  LayoutDashboard,
  FileText,
  FolderKanban,
  BarChart3,
  Settings,
  LogOut,
  CreditCard,
  Bell,
  BellOff,
  Check,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "../components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Checkbox } from "../components/ui/checkbox";
import { Badge } from "../components/ui/badge";
import { CreateRequirementModal } from "../components/CreateRequirementModal";
import {
  fetchRequisitosComProjeto,
  excluirRequisito,
  fetchProjetosDoUsuario,
  fetchNotificacoes,
  contarNotificacoesNaoLidas,
  marcarNotificacaoComoLida,
  marcarTodasComoLidas,
} from "../lib/api";
import type { Requisito, Notificacao } from "../lib/types";
import "./dashboard-glass.css";

const statusBadge: Record<string, string> = {
  Aprovado: "bg-emerald-500/15 text-emerald-300 border border-emerald-400/25",
  Pendente: "bg-amber-500/15 text-amber-300 border border-amber-400/25",
  Rejeitado: "bg-red-500/15 text-red-300 border border-red-400/25",
};

const tipoBadge: Record<string, string> = {
  Funcional: "bg-[#4cd7f6]/15 text-[#4cd7f6] border border-[#4cd7f6]/25",
  "Não Funcional": "bg-[#d2bbff]/15 text-[#d2bbff] border border-[#d2bbff]/25",
};

// =====================================================================
// Sino de notificações (mantém o backend de notificações funcionando)
// =====================================================================
function NotificacoesBell({ userId }: { userId: string }) {
  const navigate = useNavigate();
  const [notificacoes, setNotificacoes] = useState<
    (Notificacao & { projeto_nome?: string })[]
  >([]);
  const [naoLidas, setNaoLidas] = useState(0);

  const carregar = useCallback(async () => {
    if (!userId) return;
    try {
      const [data, count] = await Promise.all([
        fetchNotificacoes(userId),
        contarNotificacoesNaoLidas(userId),
      ]);
      setNotificacoes(data);
      setNaoLidas(count);
    } catch (err) {
      console.error("Erro ao carregar notificações:", err);
    }
  }, [userId]);

  useEffect(() => {
    carregar();
    const i = setInterval(carregar, 30000);
    return () => clearInterval(i);
  }, [carregar]);

  const onClickNotif = async (n: Notificacao & { projeto_nome?: string }) => {
    if (!n.lida) {
      await marcarNotificacaoComoLida(n.id_notificacao);
      setNaoLidas((p) => Math.max(0, p - 1));
      setNotificacoes((p) =>
        p.map((x) => (x.id_notificacao === n.id_notificacao ? { ...x, lida: true } : x))
      );
    }
    if (n.id_projeto) navigate(`/projects/${n.id_projeto}`);
  };

  const marcarTodas = async () => {
    if (!userId) return;
    await marcarTodasComoLidas(userId);
    setNaoLidas(0);
    setNotificacoes((p) => p.map((n) => ({ ...n, lida: true })));
  };

  const fmt = (s: string) => {
    const diff = Date.now() - new Date(s).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "Agora";
    if (m < 60) return `${m}min atrás`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h atrás`;
    return `${Math.floor(h / 24)}d atrás`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="sm-glass-btn relative flex h-10 w-10 items-center justify-center rounded-full text-white">
          <Bell className="h-5 w-5" />
          {naoLidas > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#7c3aed] text-[10px] font-bold text-white">
              {naoLidas > 9 ? "9+" : naoLidas}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[calc(100vw-2rem)] max-w-96 sm:w-96 border-white/10 bg-[#201e27] text-[#e6e0ec]"
      >
        <div className="flex items-center justify-between px-3 py-2">
          <DropdownMenuLabel className="p-0 text-base text-white">Notificações</DropdownMenuLabel>
          {naoLidas > 0 && (
            <button
              className="flex items-center gap-1 text-xs text-[#ccc3d8] hover:text-white"
              onClick={(e) => {
                e.preventDefault();
                marcarTodas();
              }}
            >
              <Check className="h-3 w-3" /> Marcar todas
            </button>
          )}
        </div>
        <DropdownMenuSeparator className="bg-white/10" />
        {notificacoes.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-8">
            <BellOff className="mb-3 h-10 w-10 text-white/20" />
            <p className="text-sm text-[#ccc3d8]">Sem notificações</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notificacoes.map((n) => (
              <DropdownMenuItem
                key={n.id_notificacao}
                onClick={() => onClickNotif(n)}
                className={`flex items-start gap-3 px-3 py-3 ${
                  !n.lida ? "bg-white/5" : ""
                } focus:bg-white/10`}
              >
                <div className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ${n.lida ? "bg-white/20" : "bg-[#7c3aed]"}`} />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm leading-snug ${n.lida ? "text-[#ccc3d8]" : "font-medium text-white"}`}>
                    {n.mensagem}
                  </p>
                  <span className="text-xs text-[#ccc3d8]/70">{fmt(n.data_criacao)}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type RequisitoComProjeto = Requisito & { projeto_nome: string };

export function Requirements() {
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [requirements, setRequirements] = useState<RequisitoComProjeto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tipoFilter, setTipoFilter] = useState("all");
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [myProjectIds, setMyProjectIds] = useState<string[]>([]);

  // Obter dados do usuário logado
  const userDataString = localStorage.getItem("scopemaster_user");
  const userData = userDataString ? JSON.parse(userDataString) : null;
  const currentUserId = userData?.id || "";
  const currentUserRole = userData?.role || "";
  const currentUserName = userData?.name || "Usuário";
  const isCliente = currentUserRole === "Cliente";
  const isAdmin = currentUserRole === "Administrador";

  const userInitials = currentUserName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Cliente e Desenvolvedor NUNCA veem requisitos de projetos que não participam.
  // O Administrador pode optar via botão "Participação".
  const escopoForcado = !isAdmin;

  const carregarRequisitos = async () => {
    try {
      setLoading(true);
      const data = await fetchRequisitosComProjeto();
      setRequirements(data);
    } catch (err) {
      console.error("Erro ao carregar requisitos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarRequisitos();
    // Buscar projetos do usuário
    if (currentUserId) {
      fetchProjetosDoUsuario(currentUserId).then(setMyProjectIds).catch(console.error);
    }
    // Cliente e Desenvolvedor sempre veem apenas requisitos dos seus projetos
    if (escopoForcado) {
      setShowOnlyMine(true);
    }
  }, []);

  const handleExcluir = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este requisito?")) {
      try {
        await excluirRequisito(id);
        carregarRequisitos();
      } catch (err) {
        console.error("Erro ao excluir requisito:", err);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("scopemaster_authenticated");
    localStorage.removeItem("scopemaster_user");
    navigate("/login");
  };

  const filteredRequirements = requirements.filter((req) => {
    const matchesSearch =
      req.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.projeto_nome.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || req.status_validacao === statusFilter;

    const matchesTipo =
      tipoFilter === "all" || req.tipo === tipoFilter;

    const matchesParticipation = showOnlyMine
      ? myProjectIds.includes(req.id_projeto)
      : true;

    return matchesSearch && matchesStatus && matchesTipo && matchesParticipation;
  });

  const toggleRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    setSelectedRows((prev) =>
      prev.length === filteredRequirements.length
        ? []
        : filteredRequirements.map((req) => req.id_requisito)
    );
  };

  // ---- Navegação (mesmas abas do painel de propostas) -----------------
  const nav = [
    { name: "Painel de Propostas", href: "/dashboard", icon: LayoutDashboard },
    { name: "Fluxo de Ideias", href: "/requirements", icon: FileText },
    { name: "Projetos Aprovados", href: "/projects", icon: FolderKanban },
    { name: "Métricas de Aprovação", href: "/analytics", icon: BarChart3 },
  ];
  if (currentUserRole === "Administrador")
    nav.push({ name: "Autorizar Usuários", href: "/autorizar-usuarios", icon: UserCheck });
  if (currentUserRole === "Cliente")
    nav.push({ name: "Planos e Pagamentos", href: "/pagamentos", icon: CreditCard });

  const navSecundaria = [
    { name: "Configurações", href: "/settings", icon: Settings },
  ];

  const isActive = (href: string) =>
    href === "/" ? location.pathname === "/" : location.pathname.startsWith(href);

  if (loading) {
    return (
      <div className="sm-dash items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#d2bbff]" />
        <span className="ml-3 text-[#ccc3d8]">Carregando requisitos...</span>
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
                  active ? "bg-white/10 text-white" : "text-[#ccc3d8] hover:bg-white/5 hover:text-white"
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
                    active ? "bg-white/10 text-white" : "text-[#ccc3d8] hover:bg-white/5 hover:text-white"
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

      {/* ============================ Conteúdo =========================== */}
      <main className="sm-noscroll relative z-0 flex h-full min-w-0 flex-1 flex-col overflow-y-auto">
        {/* Header com busca */}
        <header className="shrink-0 px-8 pb-6 pt-8">
          <div className="mb-6 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#ccc3d8]" />
              <input
                type="search"
                placeholder="Buscar requisitos, códigos, projetos..."
                className="w-full rounded-full border border-white/10 bg-black/30 py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-[#ccc3d8]/70 focus:border-[#7c3aed]/60 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Fluxo de Ideias</h2>
              <p className="mt-1 text-[#ccc3d8]">
                Gerencie e acompanhe todos os requisitos e propostas do projeto.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <NotificacoesBell userId={currentUserId} />
              {!isCliente && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="sm-glass-btn flex items-center gap-2.5 rounded-full px-4 py-2 text-sm font-medium text-white animate-fade-in"
                >
                  Novo Requisito
                  <span className="sm-primary-btn flex h-6 w-6 items-center justify-center rounded-full">
                    <Plus className="h-4 w-4 text-white" />
                  </span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Corpo do conteúdo */}
        <div className="flex flex-col gap-6 px-8 pb-8">
          
          {/* Filtros */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center rounded-2xl border border-white/10 bg-black/20 p-3 shadow-sm sm-panel">
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40 border-white/10 bg-black/30 text-white rounded-xl focus:ring-[#7c3aed]/40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#201e27] text-[#e6e0ec]">
                  <SelectItem value="all" className="focus:bg-white/10">Todos os Status</SelectItem>
                  <SelectItem value="Pendente" className="focus:bg-white/10">Pendente</SelectItem>
                  <SelectItem value="Aprovado" className="focus:bg-white/10">Aprovado</SelectItem>
                  <SelectItem value="Rejeitado" className="focus:bg-white/10">Rejeitado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger className="w-full sm:w-44 border-white/10 bg-black/30 text-white rounded-xl focus:ring-[#7c3aed]/40">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#201e27] text-[#e6e0ec]">
                  <SelectItem value="all" className="focus:bg-white/10">Todos os Tipos</SelectItem>
                  <SelectItem value="Funcional" className="focus:bg-white/10">Funcional</SelectItem>
                  <SelectItem value="Não Funcional" className="focus:bg-white/10">Não Funcional</SelectItem>
                </SelectContent>
              </Select>

              {isAdmin && (
                <button
                  onClick={() => setShowOnlyMine(!showOnlyMine)}
                  className={`sm-glass-btn flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors border-white/10 ${
                    showOnlyMine ? "bg-white/20 text-white" : "text-[#ccc3d8] bg-black/30"
                  }`}
                >
                  <UserCheck className="h-4 w-4" />
                  Participação
                </button>
              )}
            </div>
          </div>

          {/* Results count & multi-select actions */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#ccc3d8]">
              Mostrando{" "}
              <span className="font-semibold text-white">
                {filteredRequirements.length}
              </span>{" "}
              requisitos
            </p>
            {selectedRows.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#ccc3d8]">
                  {selectedRows.length} selecionados
                </span>
                <button
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/20 transition-colors"
                  onClick={async () => {
                    if (
                      confirm(
                        `Tem certeza que deseja excluir ${selectedRows.length} requisitos?`
                      )
                    ) {
                      for (const id of selectedRows) {
                        await excluirRequisito(id);
                      }
                      setSelectedRows([]);
                      carregarRequisitos();
                    }
                  }}
                >
                  Excluir
                </button>
              </div>
            )}
          </div>

          {/* Lista em CARDS — visível abaixo de lg (mobile e tablet) */}
          <div className="lg:hidden space-y-3">
            {filteredRequirements.length === 0 ? (
              <div className="rounded-lg border border-white/10 bg-black/20 p-8 text-center text-[#ccc3d8]/80 text-sm sm-panel">
                Nenhum requisito encontrado.
              </div>
            ) : (
              filteredRequirements.map((req) => (
                <Link
                  key={req.id_requisito}
                  to={`/requirements/${req.id_requisito}`}
                  className="block rounded-2xl border border-white/10 bg-black/20 p-4 shadow-sm hover:border-[#7c3aed]/40 hover:bg-white/5 transition-all sm-panel sm-panel-hover"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                      <span className="font-semibold text-white text-sm">{req.codigo}</span>
                      <Badge variant="outline" className={`${tipoBadge[req.tipo] || ""} rounded-md`}>
                        {req.tipo}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`${statusBadge[req.status_validacao] || ""} rounded-full`}
                      >
                        {req.status_validacao}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-white/90 break-words mb-2">
                    {req.descricao.length > 120 ? req.descricao.slice(0, 120) + "..." : req.descricao}
                  </p>
                  <p className="text-xs text-[#ccc3d8]/85 truncate">
                    {req.projeto_nome}
                  </p>
                </Link>
              ))
            )}
          </div>

          {/* Tabela — visível somente em lg+ */}
          <div className="hidden lg:block rounded-2xl border border-white/10 bg-black/20 shadow-sm overflow-hidden sm-panel">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent bg-white/5">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        filteredRequirements.length > 0 &&
                        selectedRows.length === filteredRequirements.length
                      }
                      onCheckedChange={toggleAll}
                      className="border-white/30 data-[state=checked]:bg-[#7c3aed] data-[state=checked]:border-[#7c3aed]"
                    />
                  </TableHead>
                  <TableHead className="text-[#ccc3d8]">
                    <button className="flex items-center gap-1 hover:text-white transition-colors text-xs font-semibold uppercase tracking-wider">
                      Código
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </TableHead>
                  <TableHead className="text-[#ccc3d8]">
                    <button className="flex items-center gap-1 hover:text-white transition-colors text-xs font-semibold uppercase tracking-wider">
                      Descrição
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </TableHead>
                  <TableHead className="text-[#ccc3d8] text-xs font-semibold uppercase tracking-wider">Projeto</TableHead>
                  <TableHead className="text-[#ccc3d8] text-xs font-semibold uppercase tracking-wider">Tipo</TableHead>
                  <TableHead className="text-[#ccc3d8] text-xs font-semibold uppercase tracking-wider">Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequirements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-[#ccc3d8]/80 hover:bg-transparent border-white/10">
                      Nenhum requisito encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequirements.map((req) => (
                    <TableRow
                      key={req.id_requisito}
                      className="border-white/10 hover:bg-white/5 text-white"
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.includes(req.id_requisito)}
                          onCheckedChange={() => toggleRow(req.id_requisito)}
                          className="border-white/30 data-[state=checked]:bg-[#7c3aed] data-[state=checked]:border-[#7c3aed]"
                        />
                      </TableCell>
                      <TableCell>
                        <Link
                          to={`/requirements/${req.id_requisito}`}
                          className={`inline-flex items-center justify-center rounded-lg px-2 py-1 text-xs font-bold ${
                            req.tipo === "Funcional"
                              ? "bg-[#4cd7f6]/15 text-[#4cd7f6] border border-[#4cd7f6]/25"
                              : "bg-[#d2bbff]/15 text-[#d2bbff] border border-[#d2bbff]/25"
                          }`}
                        >
                          {req.codigo}
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-xs xl:max-w-md truncate">
                        <Link
                          to={`/requirements/${req.id_requisito}`}
                          className="font-medium text-white hover:text-[#d2bbff] transition-colors"
                        >
                          {req.descricao.length > 80
                            ? req.descricao.slice(0, 80) + "..."
                            : req.descricao}
                        </Link>
                      </TableCell>
                      <TableCell className="text-[#ccc3d8]">
                        {req.projeto_nome}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${tipoBadge[req.tipo] || ""} rounded-md font-medium`}
                        >
                          {req.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${statusBadge[req.status_validacao] || ""} rounded-full font-medium`}
                        >
                          {req.status_validacao}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 transition text-white">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 border-white/10 bg-[#201e27] text-[#e6e0ec]">
                            <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer">
                              <Link to={`/requirements/${req.id_requisito}`}>
                                Ver Detalhes
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem
                              className="text-red-400 focus:bg-white/10 focus:text-red-300 cursor-pointer"
                              onClick={() => handleExcluir(req.id_requisito)}
                            >
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      <CreateRequirementModal
        open={isCreateModalOpen}
        onOpenChange={(open) => {
          setIsCreateModalOpen(open);
          if (!open) carregarRequisitos();
        }}
      />
    </div>
  );
}
