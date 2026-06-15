import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Download,
  Lightbulb,
  FileCheck,
  PlayCircle,
  Users,
  Clock,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  LayoutDashboard,
  FileText,
  FolderKanban,
  BarChart3,
  UserCheck,
  CreditCard,
  Settings,
  LogOut,
  MoreVertical,
  Search,
  Bell,
  BellOff,
  Check,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Sector,
  CartesianGrid,
} from "recharts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { toast } from "sonner";
import {
  fetchEstatisticasParaUsuario,
  fetchNotificacoes,
  contarNotificacoesNaoLidas,
  marcarNotificacaoComoLida,
  marcarTodasComoLidas,
} from "../lib/api";
import type { Requisito, Projeto, Usuario, Notificacao } from "../lib/types";
import "./dashboard-glass.css";

const smTooltip = {
  backgroundColor: "#201e27",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "10px",
  color: "#e6e0ec",
  fontSize: "12px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
};

const statusBadge: Record<string, string> = {
  Aprovado: "bg-emerald-500/15 text-emerald-300 border border-emerald-400/25",
  Pendente: "bg-amber-500/15 text-amber-300 border border-amber-400/25",
  Rejeitado: "bg-red-500/15 text-red-300 border border-red-400/25",
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

export function Analytics() {
  const navigate = useNavigate();
  const location = useLocation();

  const userDataString = localStorage.getItem("scopemaster_user");
  const userData = userDataString ? JSON.parse(userDataString) : null;
  const userId: string = userData?.id || "";
  const userRole: string = userData?.role || "Membro";
  const userName: string = userData?.name || "Usuário";
  const firstName = userName.split(" ")[0];
  const userInitials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRequisitos: 0,
    aprovados: 0,
    pendentes: 0,
    rejeitados: 0,
    totalProjetos: 0,
    totalUsuarios: 0,
  });
  const [requisitos, setRequisitos] = useState<Requisito[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  const [activeStatus, setActiveStatus] = useState<number | null>(null);
  const [activePerfil, setActivePerfil] = useState<number | null>(null);

  useEffect(() => {
    const carregar = async () => {
      try {
        setLoading(true);
        const data = await fetchEstatisticasParaUsuario(userId, userRole);
        setStats({
          totalRequisitos: data.totalRequisitos,
          aprovados: data.aprovados,
          pendentes: data.pendentes,
          rejeitados: data.rejeitados,
          totalProjetos: data.totalProjetos,
          totalUsuarios: data.totalUsuarios,
        });
        setRequisitos(data.requisitos);
        setProjetos(data.projetos);
        setUsuarios(data.usuarios);
      } catch (err) {
        console.error("Erro ao carregar analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [userId, userRole]);

  const {
    statusDistribution,
    reqsPorProjeto,
    perfilCount,
    perfilDistribution,
    reqsFuncionais,
    reqsNaoFuncionais,
  } = useMemo(() => {
    const statusDistribution = [
      { name: "Aprovados", value: stats.aprovados, color: "#4cd7f6" },
      { name: "Pendentes", value: stats.pendentes, color: "#ffb95f" },
      { name: "Rejeitados", value: stats.rejeitados, color: "#ff8a80" },
    ];

    const reqsPorProjeto = projetos.map((p) => {
      const reqs = requisitos.filter((r) => r.id_projeto === p.id_projeto);
      return {
        name: p.nome.length > 14 ? p.nome.slice(0, 14) + "…" : p.nome,
        aprovados: reqs.filter((r) => r.status_validacao === "Aprovado").length,
        pendentes: reqs.filter((r) => r.status_validacao === "Pendente").length,
        rejeitados: reqs.filter((r) => r.status_validacao === "Rejeitado").length,
      };
    });

    const perfilCount = {
      Administrador: usuarios.filter((u) => u.perfil === "Administrador").length,
      Desenvolvedor: usuarios.filter((u) => u.perfil === "Desenvolvedor").length,
      Cliente: usuarios.filter((u) => u.perfil === "Cliente").length,
    };

    const perfilDistribution = [
      { name: "Administradores", value: perfilCount.Administrador, color: "#7c3aed" },
      { name: "Desenvolvedores", value: perfilCount.Desenvolvedor, color: "#4cd7f6" },
      { name: "Clientes", value: perfilCount.Cliente, color: "#ffb95f" },
    ];

    return {
      statusDistribution,
      reqsPorProjeto,
      perfilCount,
      perfilDistribution,
      reqsFuncionais: requisitos.filter((r) => r.tipo === "Funcional").length,
      reqsNaoFuncionais: requisitos.filter((r) => r.tipo === "Não Funcional").length,
    };
  }, [requisitos, projetos, usuarios, stats]);

  const handleExport = () => {
    toast.success("Relatório exportado com sucesso!");
  };

  if (loading) {
    return (
      <div className="sm-dash items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#d2bbff]" />
        <span className="ml-3 text-[#ccc3d8]">Carregando relatórios...</span>
      </div>
    );
  }

  const taxaAprov =
    stats.totalRequisitos > 0
      ? Math.round((stats.aprovados / stats.totalRequisitos) * 100)
      : 0;

  const kpis = [
    {
      name: "Total de Requisitos",
      value: stats.totalRequisitos,
      hint: "no sistema",
      icon: Lightbulb,
      tint: "text-[#d2bbff]",
      bg: "bg-[#7c3aed]/10 border border-[#7c3aed]/25",
    },
    {
      name: "Aprovados",
      value: stats.aprovados,
      hint: `${taxaAprov}% do total`,
      delta: taxaAprov,
      icon: FileCheck,
      tint: "text-[#4cd7f6]",
      bg: "bg-[#4cd7f6]/10 border border-[#4cd7f6]/25",
    },
    {
      name: "Projetos Ativos",
      value: stats.totalProjetos,
      hint: "cadastrados",
      icon: PlayCircle,
      tint: "text-[#ffb95f]",
      bg: "bg-[#ffb95f]/10 border border-[#ffb95f]/25",
    },
    {
      name: "Usuários",
      value: stats.totalUsuarios,
      hint: `${perfilCount.Desenvolvedor} devs · ${perfilCount.Cliente} clientes`,
      icon: Users,
      tint: "text-[#ff8a80]",
      bg: "bg-[#ff8a80]/10 border border-[#ff8a80]/25",
    },
  ];

  // ---- Navegação (mesmas abas da sidebar original) --------------------
  const nav = [
    { name: "Painel de Propostas", href: "/dashboard", icon: LayoutDashboard },
    { name: "Fluxo de Ideias", href: "/requirements", icon: FileText },
    { name: "Projetos Aprovados", href: "/projects", icon: FolderKanban },
    { name: "Métricas de Aprovação", href: "/analytics", icon: BarChart3 },
  ];
  if (userRole === "Administrador")
    nav.push({ name: "Autorizar Usuários", href: "/autorizar-usuarios", icon: UserCheck });
  if (userRole === "Cliente")
    nav.push({ name: "Planos e Pagamentos", href: "/pagamentos", icon: CreditCard });

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

  // Realça o setor sob o cursor (sem o tooltip "bugado" sobre o gráfico).
  const renderActiveStatusShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          cornerRadius={4}
        />
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={outerRadius + 8}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.4}
        />
      </g>
    );
  };

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
                  <p className="truncate text-sm font-medium text-white">{userName}</p>
                  <p className="truncate text-xs text-[#ccc3d8]">{userRole}</p>
                </div>
                <MoreVertical className="h-4 w-4 flex-shrink-0 text-[#ccc3d8]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-white/10 bg-[#201e27] text-[#e6e0ec]">
              <DropdownMenuLabel className="text-white">Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="focus:bg-white/10 cursor-pointer" onClick={() => navigate("/settings")}>
                <Settings className="mr-2 h-4 w-4" /> Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="text-red-400 focus:bg-white/10 cursor-pointer" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* ============================ Conteúdo principal =========================== */}
      <main className="sm-noscroll relative z-0 flex h-full min-w-0 flex-1 flex-col overflow-y-auto">
        <header className="shrink-0 px-8 pb-6 pt-8">
          {/* Caixa de Pesquisa integrada no estilo glass */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigate("/requirements");
            }}
            className="mb-6 max-w-xl"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#ccc3d8]" />
              <input
                type="search"
                placeholder="Buscar requisitos, projetos..."
                className="w-full rounded-full border border-white/10 bg-black/30 py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-[#ccc3d8]/70 focus:border-[#7c3aed]/60 focus:outline-none"
              />
            </div>
          </form>

          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Relatórios e Métricas</h2>
              <p className="mt-1 text-[#ccc3d8]">
                Estatísticas de requisitos, projetos e equipe em tempo real.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <NotificacoesBell userId={userId} />
              <button
                onClick={handleExport}
                className="sm-glass-btn flex items-center gap-3 rounded-full px-4 py-2 text-sm font-medium text-white"
              >
                Exportar Relatório
                <span className="sm-primary-btn flex h-6 w-6 items-center justify-center rounded-full">
                  <Download className="h-3.5 w-3.5 text-white" />
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Conteúdo rolável */}
        <div className="flex-1 px-8 pb-8 space-y-6">
          {/* KPIs */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((k) => {
              const Icon = k.icon;
              const positivo = (k.delta ?? 0) >= 0;
              return (
                <div key={k.name} className="sm-panel sm-panel-hover p-5 relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl overflow-hidden flex flex-col justify-between">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent rounded-xl pointer-events-none opacity-20" />
                  <div className="flex items-center justify-between z-10 relative">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${k.bg}`}>
                      <Icon className={`h-5 w-5 ${k.tint}`} />
                    </div>
                    {k.delta !== undefined && (
                      <span className={`flex items-center gap-0.5 text-xs font-semibold rounded-full px-2 py-1 text-emerald-300 bg-emerald-500/15 border border-emerald-400/25`}>
                        <ArrowUpRight className="h-3 w-3" />
                        {Math.abs(k.delta)}%
                      </span>
                    )}
                  </div>
                  <div className="mt-4 z-10 relative">
                    <div className="text-3xl font-bold text-white leading-none">{k.value}</div>
                    <div className="text-xs text-[#ccc3d8] mt-2">{k.name} · {k.hint}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gráficos Linha 1 */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            {/* Requisitos por Projeto */}
            <div className="lg:col-span-2 sm-panel sm-panel-hover p-6 relative overflow-hidden flex flex-col justify-between bg-black/25 min-h-[360px]">
              <div className="sm-grid-bg pointer-events-none absolute inset-0 opacity-10" />
              <div className="flex items-center justify-between mb-6 z-10 relative">
                <div>
                  <h3 className="text-lg font-semibold text-white">Requisitos por Projeto</h3>
                  <p className="text-sm text-[#ccc3d8]">Distribuição por status</p>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-[#ccc3d8]"><span className="h-2.5 w-2.5 rounded-full bg-[#4cd7f6]" />Aprov.</span>
                  <span className="flex items-center gap-1.5 text-[#ccc3d8]"><span className="h-2.5 w-2.5 rounded-full bg-[#ffb95f]" />Pend.</span>
                  <span className="flex items-center gap-1.5 text-[#ccc3d8]"><span className="h-2.5 w-2.5 rounded-full bg-[#ff8a80]" />Rejeit.</span>
                </div>
              </div>
              {reqsPorProjeto.length > 0 ? (
                <div className="h-72 z-10 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reqsPorProjeto} margin={{ top: 10, right: 5, left: -22, bottom: 20 }} barGap={4}>
                      <defs>
                        <linearGradient id="barAprovados" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4cd7f6" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#2563eb" stopOpacity={0.25} />
                        </linearGradient>
                        <linearGradient id="barPendentes" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ffb95f" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#d97706" stopOpacity={0.25} />
                        </linearGradient>
                        <linearGradient id="barRejeitados" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ff8a80" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#dc2626" stopOpacity={0.25} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#ccc3d8", fontSize: 11 }} angle={-15} textAnchor="end" height={45} interval={0} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#ccc3d8", fontSize: 12 }} allowDecimals={false} width={36} />
                      <Tooltip contentStyle={smTooltip} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                      <Bar dataKey="aprovados" name="Aprovados" fill="url(#barAprovados)" radius={[4, 4, 0, 0]} maxBarSize={16} />
                      <Bar dataKey="pendentes" name="Pendentes" fill="url(#barPendentes)" radius={[4, 4, 0, 0]} maxBarSize={16} />
                      <Bar dataKey="rejeitados" name="Rejeitados" fill="url(#barRejeitados)" radius={[4, 4, 0, 0]} maxBarSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-[#ccc3d8] py-12 z-10 relative">Sem dados para exibir.</p>
              )}
            </div>

            {/* Donut Status */}
            <div className="sm-panel sm-panel-hover p-6 flex flex-col justify-between bg-black/25 min-h-[360px]">
              <div>
                <h3 className="text-lg font-semibold text-white">Distribuição por Status</h3>
                <p className="text-sm text-[#ccc3d8] mb-2">Total de {stats.totalRequisitos}</p>
              </div>
              <div className="relative flex-1 min-h-[180px] flex items-center justify-center my-2">
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      dataKey="value"
                      innerRadius={56}
                      outerRadius={76}
                      paddingAngle={3}
                      stroke="none"
                      activeIndex={activeStatus ?? undefined}
                      activeShape={renderActiveStatusShape}
                      onMouseEnter={(_, i) => setActiveStatus(i)}
                      onMouseLeave={() => setActiveStatus(null)}
                    >
                      {statusDistribution.map((s, i) => (
                        <Cell
                          key={i}
                          fill={s.color}
                          opacity={activeStatus === null || activeStatus === i ? 1 : 0.35}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span
                    className="text-3xl font-bold leading-none transition-all duration-200"
                    style={{ color: activeStatus !== null ? statusDistribution[activeStatus].color : "#ffffff" }}
                  >
                    {activeStatus !== null ? statusDistribution[activeStatus].value : `${taxaAprov}%`}
                  </span>
                  <span className="text-xs text-[#ccc3d8] mt-1.5">
                    {activeStatus !== null ? statusDistribution[activeStatus].name.toLowerCase() : "aprovados"}
                  </span>
                </div>
              </div>
              <div className="space-y-2 mt-2">
                {statusDistribution.map((s, i) => (
                  <div
                    key={s.name}
                    onMouseEnter={() => setActiveStatus(i)}
                    onMouseLeave={() => setActiveStatus(null)}
                    className={`flex cursor-default items-center justify-between rounded-lg px-2 py-1 text-sm transition-colors ${
                      activeStatus === i ? "bg-white/5" : ""
                    }`}
                  >
                    <span className="flex items-center gap-2 text-[#ccc3d8]">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      {s.name}
                    </span>
                    <span className="font-semibold text-white">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resumo por Tipo + Equipe */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            {/* Resumo por Tipo */}
            <div className="lg:col-span-2 sm-panel sm-panel-hover p-6 flex flex-col justify-between bg-black/25">
              <h3 className="text-lg font-semibold text-white mb-5">Resumo por Tipo de Requisito</h3>
              <div className="grid grid-cols-2 gap-6 h-full items-stretch">
                <div className="rounded-xl border border-[#4cd7f6]/20 p-5 sm:p-6 bg-gradient-to-br from-[#4cd7f6]/10 to-[#4cd7f6]/5 flex flex-col justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4cd7f6]/20 mb-4 border border-[#4cd7f6]/30">
                    <FileCheck className="h-5 w-5 text-[#4cd7f6]" />
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-white leading-none">{reqsFuncionais}</div>
                    <div className="text-sm text-[#ccc3d8] mt-2 font-medium">Requisitos Funcionais</div>
                  </div>
                </div>
                <div className="rounded-xl border border-[#7c3aed]/20 p-5 sm:p-6 bg-gradient-to-br from-[#7c3aed]/10 to-[#7c3aed]/5 flex flex-col justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7c3aed]/20 mb-4 border border-[#7c3aed]/30">
                    <Lightbulb className="h-5 w-5 text-[#d2bbff]" />
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-white leading-none">{reqsNaoFuncionais}</div>
                    <div className="text-sm text-[#ccc3d8] mt-2 font-medium">Requisitos Não Funcionais</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Equipe por Perfil */}
            <div className="sm-panel sm-panel-hover p-6 flex flex-col justify-between bg-black/25">
              <div>
                <h3 className="text-lg font-semibold text-white">Equipe por Perfil</h3>
                <p className="text-sm text-[#ccc3d8]">Total de {stats.totalUsuarios} integrantes</p>
              </div>
              <div className="relative h-36 w-full flex items-center justify-center my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={perfilDistribution}
                      dataKey="value"
                      innerRadius={36}
                      outerRadius={54}
                      paddingAngle={3}
                      stroke="none"
                      activeIndex={activePerfil ?? undefined}
                      activeShape={renderActiveStatusShape}
                      onMouseEnter={(_, i) => setActivePerfil(i)}
                      onMouseLeave={() => setActivePerfil(null)}
                    >
                      {perfilDistribution.map((s, i) => (
                        <Cell
                          key={i}
                          fill={s.color}
                          opacity={activePerfil === null || activePerfil === i ? 1 : 0.35}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span
                    className="text-2xl font-bold leading-none"
                    style={{ color: activePerfil !== null ? perfilDistribution[activePerfil].color : "#ffffff" }}
                  >
                    {activePerfil !== null ? perfilDistribution[activePerfil].value : stats.totalUsuarios}
                  </span>
                  <span className="mt-1 text-[10px] text-[#ccc3d8]">
                    {activePerfil !== null ? perfilDistribution[activePerfil].name.toLowerCase() : "membros"}
                  </span>
                </div>
              </div>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1 sm-noscroll border-t border-white/5 pt-3">
                {usuarios.map((user) => (
                  <div key={user.id_usuario} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                    <Avatar className="h-8 w-8 border border-white/10 flex-shrink-0 bg-gradient-to-br from-[#7c3aed] to-[#4cd7f6] text-white text-[10px] font-bold">
                      <AvatarFallback className="bg-transparent text-white font-bold">
                        {user.nome.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white text-xs truncate">{user.nome}</div>
                      <div className="text-[10px] text-[#ccc3d8]">{user.perfil}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lista de todos os requisitos */}
          <div className="sm-panel overflow-hidden bg-black/20 border border-white/10 rounded-xl">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">Todos os Requisitos</h3>
              <p className="text-sm text-[#ccc3d8]">{requisitos.length} no total</p>
            </div>
            <div className="divide-y divide-white/5 max-h-96 overflow-y-auto sm-noscroll">
              {requisitos.map((req) => {
                const projetoNome = projetos.find((p) => p.id_projeto === req.id_projeto)?.nome || "Desconhecido";
                const status = req.status_validacao;
                return (
                  <div key={req.id_requisito} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.03] transition-colors">
                    <span className={`flex h-9 w-12 flex-shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${req.tipo === "Funcional" ? "bg-[#4cd7f6]/15 text-[#4cd7f6] border border-[#4cd7f6]/25" : "bg-[#d2bbff]/15 text-[#d2bbff] border border-[#d2bbff]/25"}`}>
                      {req.codigo}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{req.descricao}</p>
                      <p className="text-xs text-[#ccc3d8] truncate">{projetoNome} · {req.tipo}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusBadge[status] || ""}`}>
                      {status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
