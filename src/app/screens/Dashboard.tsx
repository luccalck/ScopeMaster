import { useState, useEffect, useMemo, useCallback, useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import {
  FileText,
  CheckCircle2,
  Clock,
  FolderKanban,
  Plus,
  Loader2,
  Search,
  Bell,
  BellOff,
  Check,
  LogOut,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  LayoutDashboard,
  BarChart3,
  Settings,
  UserCheck,
  CreditCard,
  MoreVertical,
  Eye,
  MapPin,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  PieChart,
  Pie,
  Sector,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { CreateRequirementModal } from "../components/CreateRequirementModal";
import { BrazilProjectsMap } from "../components/BrazilProjectsMap";
import {
  fetchEstatisticasParaUsuario,
  fetchNotificacoes,
  contarNotificacoesNaoLidas,
  marcarNotificacaoComoLida,
  marcarTodasComoLidas,
} from "../lib/api";
import { toast } from "sonner";
import type { Requisito, Projeto, Notificacao } from "../lib/types";
import "./dashboard-glass.css";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const statusBadge: Record<string, string> = {
  Aprovado: "bg-emerald-500/15 text-emerald-300 border border-emerald-400/25",
  Pendente: "bg-amber-500/15 text-amber-300 border border-amber-400/25",
  Rejeitado: "bg-red-500/15 text-red-300 border border-red-400/25",
};

const smTooltip = {
  backgroundColor: "#201e27",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "10px",
  color: "#e6e0ec",
  fontSize: "12px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
};

/** Gera o atributo `d` de uma sparkline fina (estilo dashboard.html). */
function buildSpark(data: { v: number }[], w = 120, h = 34) {
  if (!data.length) return "";
  const vals = data.map((d) => d.v);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 1;
  const step = data.length > 1 ? w / (data.length - 1) : w;
  return data
    .map((d, i) => {
      const x = i * step;
      const y = h - ((d.v - min) / span) * (h - 4) - 2;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

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

export function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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
  const isCliente = userRole === "Cliente";

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRequisitos: 0,
    aprovados: 0,
    pendentes: 0,
    rejeitados: 0,
    totalProjetos: 0,
    totalUsuarios: 0,
  });
  const [requisitos, setRequisitos] = useState<(Requisito & { projeto_nome?: string })[]>([]);
  const [projetos, setProjetos] = useState<
    (Projeto & {
      totalReqs: number;
      aprovadosReqs: number;
      pendentesReqs: number;
      rejeitadosReqs: number;
    })[]
  >([]);
  const [activeStatus, setActiveStatus] = useState<number | null>(null);

  const carregarDados = async (silencioso = false) => {
    try {
      if (!silencioso) setLoading(true);
      const data = await fetchEstatisticasParaUsuario(userId, userRole);
      setStats({
        totalRequisitos: data.totalRequisitos,
        aprovados: data.aprovados,
        pendentes: data.pendentes,
        rejeitados: data.rejeitados,
        totalProjetos: data.totalProjetos,
        totalUsuarios: data.totalUsuarios,
      });
      const projetoMap = new Map(data.projetos.map((p) => [p.id_projeto, p.nome]));
      setRequisitos(
        data.requisitos.map((r) => ({
          ...r,
          projeto_nome: projetoMap.get(r.id_projeto) || "Desconhecido",
        }))
      );
      setProjetos(
        data.projetos.map((p) => {
          const reqs = data.requisitos.filter((r) => r.id_projeto === p.id_projeto);
          return {
            ...p,
            totalReqs: reqs.length,
            aprovadosReqs: reqs.filter((r) => r.status_validacao === "Aprovado").length,
            pendentesReqs: reqs.filter((r) => r.status_validacao === "Pendente").length,
            rejeitadosReqs: reqs.filter((r) => r.status_validacao === "Rejeitado").length,
          };
        })
      );
    } catch (err) {
      console.error("Erro ao carregar dados do dashboard:", err);
    } finally {
      if (!silencioso) setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    serieMensal,
    atividadeSemana,
    diaMaisAtivo,
    deltaCriados,
    taxaAprovacao,
    statusPie,
    sparkTotal,
    sparkAprovados,
    sparkPendentes,
    criadosMesAtual,
  } = useMemo(() => {
    const now = new Date();
    const meses: { label: string; criados: number; aprovados: number }[] = [];
    const keys: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      keys.push(`${d.getFullYear()}-${d.getMonth()}`);
      meses.push({
        label: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
        criados: 0,
        aprovados: 0,
      });
    }
    const idx = new Map(keys.map((k, i) => [k, i]));
    const semana = WEEKDAYS.map((dia) => ({ dia, total: 0 }));

    requisitos.forEach((r) => {
      const d = r.data_criacao ? new Date(r.data_criacao) : null;
      if (d && !isNaN(d.getTime())) {
        const k = `${d.getFullYear()}-${d.getMonth()}`;
        if (idx.has(k)) {
          const i = idx.get(k)!;
          meses[i].criados += 1;
          if (r.status_validacao === "Aprovado") meses[i].aprovados += 1;
        }
        semana[d.getDay()].total += 1;
      }
    });

    const ultimo = meses[meses.length - 1]?.criados ?? 0;
    const penultimo = meses[meses.length - 2]?.criados ?? 0;
    const delta =
      penultimo === 0 ? (ultimo > 0 ? 100 : 0) : Math.round(((ultimo - penultimo) / penultimo) * 100);
    const maxDia = semana.reduce((a, b) => (b.total > a.total ? b : a), semana[0]);
    const taxa =
      stats.totalRequisitos > 0 ? Math.round((stats.aprovados / stats.totalRequisitos) * 100) : 0;

    let accT = 0;
    const sT = meses.map((m) => ({ v: (accT += m.criados) }));
    let accA = 0;
    const sA = meses.map((m) => ({ v: (accA += m.aprovados) }));
    const sP = meses.map((m) => ({ v: Math.max(0, m.criados - m.aprovados) }));

    return {
      serieMensal: meses,
      atividadeSemana: semana,
      diaMaisAtivo: maxDia,
      deltaCriados: delta,
      taxaAprovacao: taxa,
      statusPie: [
        { name: "Aprovados", value: stats.aprovados, color: "#4cd7f6" },
        { name: "Pendentes", value: stats.pendentes, color: "#ffb95f" },
        { name: "Rejeitados", value: stats.rejeitados, color: "#ff8a80" },
      ],
      sparkTotal: sT,
      sparkAprovados: sA,
      sparkPendentes: sP,
      criadosMesAtual: ultimo,
    };
  }, [requisitos, stats]);

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

  const kpiCards = [
    {
      name: "Total de Requisitos",
      value: stats.totalRequisitos,
      delta: deltaCriados,
      icon: FileText,
      spark: sparkTotal,
      stroke: "#4ade80",
    },
    {
      name: "Aprovados",
      value: stats.aprovados,
      delta: taxaAprovacao,
      icon: CheckCircle2,
      spark: sparkAprovados,
      stroke: "#4cd7f6",
    },
    {
      name: "Pendentes",
      value: stats.pendentes,
      delta: undefined as number | undefined,
      icon: Clock,
      spark: sparkPendentes,
      stroke: "#ffb95f",
    },
  ];

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

  if (loading) {
    return (
      <div className="sm-dash items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#d2bbff]" />
        <span className="ml-3 text-[#ccc3d8]">Carregando dados...</span>
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
                  <p className="truncate text-sm font-medium text-white">{userName}</p>
                  <p className="truncate text-xs text-[#ccc3d8]">{userRole}</p>
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
        {/* Top bar */}
        <header className="shrink-0 px-8 pb-6 pt-8">
          {/* Busca — acima do greeting */}
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
              <h2 className="text-2xl font-bold text-white">Olá, {firstName}.</h2>
              <p className="mt-1 text-[#ccc3d8]">
                Bem-vindo de volta, veja o que está acontecendo hoje.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <NotificacoesBell userId={userId} />
              {!isCliente && (
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="sm-glass-btn flex items-center gap-3 rounded-full px-4 py-2 text-sm font-medium text-white"
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

        {/* Grid */}
        <div className="grid flex-1 grid-cols-1 gap-6 px-8 pb-8 lg:grid-cols-12">
          {/* ---------------- Coluna esquerda ---------------- */}
          <div className="flex flex-col gap-6 lg:col-span-8">
            {/* (4) Evolução de Requisitos — painel grande */}
            <div className="sm-panel sm-panel-hover relative flex flex-col overflow-hidden p-6">
              <div className="sm-grid-bg pointer-events-none absolute inset-0 opacity-20" />
              <div className="relative z-10 mb-6 flex items-start justify-between">
                <div>
                  <p className="mb-1 text-sm text-[#ccc3d8]">Evolução de Requisitos</p>
                  <div className="flex items-center gap-3">
                    <h3 className="text-4xl font-bold leading-none text-white">{stats.totalRequisitos}</h3>
                    <Eye className="h-5 w-5 cursor-pointer text-[#ccc3d8]" />
                  </div>
                  <p
                    className={`mt-2 text-sm font-medium ${
                      deltaCriados >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {deltaCriados >= 0 ? "+" : ""}
                    {deltaCriados}% <span className="opacity-70">no último mês</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-[#ccc3d8]">
                  Criados x Aprovados
                </div>
              </div>

              <div className="relative z-10 min-h-[260px] flex-1 rounded-xl border border-white/5 bg-black/20 p-5">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">
                      {criadosMesAtual}{" "}
                      <span className="ml-2 text-xs font-normal text-[#ccc3d8]">criados este mês</span>
                    </p>
                    <p className="mt-0.5 text-xs text-[#ccc3d8]">Últimos 6 meses</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5 text-[#ccc3d8]">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#d2bbff]" /> Criados
                    </span>
                    <span className="flex items-center gap-1.5 text-[#ccc3d8]">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#4cd7f6]" /> Aprovados
                    </span>
                  </div>
                </div>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={serieMensal} margin={{ top: 8, right: 6, left: -22, bottom: 0 }}>
                      <defs>
                        <linearGradient id="smAreaCriados" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.45} />
                          <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="smLineCriados" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#4cd7f6" />
                          <stop offset="50%" stopColor="#d2bbff" />
                          <stop offset="100%" stopColor="#ffb95f" />
                        </linearGradient>
                        <linearGradient id="smAreaAprov" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4cd7f6" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="#4cd7f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#ccc3d8", fontSize: 11 }}
                        dy={6}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#ccc3d8", fontSize: 11 }}
                        allowDecimals={false}
                        width={38}
                      />
                      <Tooltip contentStyle={smTooltip} cursor={{ stroke: "rgba(255,255,255,0.2)" }} />
                      <Area
                        type="monotone"
                        dataKey="criados"
                        name="Criados"
                        stroke="url(#smLineCriados)"
                        strokeWidth={2.5}
                        fill="url(#smAreaCriados)"
                        className="sm-glow"
                      />
                      <Area
                        type="monotone"
                        dataKey="aprovados"
                        name="Aprovados"
                        stroke="#4cd7f6"
                        strokeWidth={2}
                        fill="url(#smAreaAprov)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* (2) Indicadores — substitui "Today's Market" */}
            <div className="sm-panel sm-panel-hover p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Indicadores</h3>
                  <p className="text-sm text-[#ccc3d8]">Visão geral dos seus requisitos.</p>
                </div>
                <Link
                  to="/requirements"
                  className="flex items-center gap-1 text-sm text-[#ccc3d8] transition hover:text-white"
                >
                  Ver todos <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <p className="mb-4 text-[10px] font-bold uppercase tracking-wider text-[#ccc3d8]">
                Principais métricas
              </p>
              <div className="sm-noscroll flex gap-4 overflow-x-auto pb-2">
                {kpiCards.map((k) => {
                  const Icon = k.icon;
                  const positivo = (k.delta ?? 0) >= 0;
                  return (
                    <div
                      key={k.name}
                      className="min-w-[190px] flex-1 flex-shrink-0 cursor-default rounded-xl border border-white/5 bg-black/20 p-4 transition hover:bg-white/5"
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          <p className="text-2xl font-bold leading-none text-white">{k.value}</p>
                          <p className="mt-1.5 text-xs text-[#ccc3d8]">{k.name}</p>
                        </div>
                        {k.delta !== undefined ? (
                          <span
                            className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              positivo
                                ? "bg-emerald-500/15 text-emerald-300"
                                : "bg-red-500/15 text-red-300"
                            }`}
                          >
                            {positivo ? (
                              <ArrowUpRight className="h-3 w-3" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3" />
                            )}
                            {Math.abs(k.delta)}%
                          </span>
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                            <Icon className="h-3.5 w-3.5 text-[#ffb95f]" />
                          </div>
                        )}
                      </div>
                      <svg className="h-8 w-full" preserveAspectRatio="none" viewBox="0 0 120 34">
                        <path d={buildSpark(k.spark)} fill="none" stroke={k.stroke} strokeWidth="1.5" />
                      </svg>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* (8) Projetos Ativos — área verde da print */}
            <div className="sm-panel sm-panel-hover p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Projetos Ativos</h3>
                  <p className="text-sm text-[#ccc3d8]">{stats.totalProjetos} projetos em andamento.</p>
                </div>
                <Link
                  to="/projects"
                  className="flex items-center gap-1 text-sm text-[#ccc3d8] transition hover:text-white"
                >
                  Ver todos <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              {projetos.length === 0 ? (
                <p className="py-8 text-center text-sm text-[#ccc3d8]">Nenhum projeto encontrado.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {projetos.slice(0, 6).map((p) => {
                    const prog = p.totalReqs > 0 ? Math.round((p.aprovadosReqs / p.totalReqs) * 100) : 0;
                    return (
                      <Link
                        key={p.id_projeto}
                        to={`/projects/${p.id_projeto}`}
                        className="rounded-xl border border-white/5 bg-black/20 p-4 transition hover:border-[#7c3aed]/40 hover:bg-white/5"
                      >
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <h4 className="truncate text-sm font-semibold text-white">{p.nome}</h4>
                          <span className="flex-shrink-0 text-xs font-bold text-[#d2bbff]">{prog}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#4cd7f6]"
                            style={{ width: `${prog}%` }}
                          />
                        </div>
                        <p className="mt-2 text-xs text-[#ccc3d8]">{p.totalReqs} requisitos</p>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* (9) Mapa do Brasil — embaixo de Projetos Ativos */}
            <div className="sm-panel sm-panel-hover flex flex-col p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#d2bbff]" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Colaboradores</h3>
                    <p className="text-sm text-[#ccc3d8]">
                      Cada ponto desenhado, é uma empresa que confia na ScopeMaster.
                    </p>
                  </div>
                </div>
                <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-[#ccc3d8]">
                  {projetos.length} projetos
                </span>
              </div>
              <div className="h-[340px] overflow-hidden rounded-xl border border-white/5 bg-black/20">
                <BrazilProjectsMap
                  projetos={projetos.map((p) => ({
                    id: p.id_projeto,
                    nome: p.nome,
                    aprovados: p.aprovadosReqs,
                    pendentes: p.pendentesReqs,
                    rejeitados: p.rejeitadosReqs,
                  }))}
                />
              </div>
            </div>
          </div>

          {/* ---------------- Coluna direita ---------------- */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            {/* (5) Pilha de requisitos recentes — substitui banner promo */}
            <div>
              <RecentStack
                requisitos={requisitos}
                onNew={() => setIsCreateOpen(true)}
                isCliente={isCliente}
              />
              <div className="mt-3 text-center">
                <span className="text-xs text-[#ccc3d8]">Últimos 6 meses</span>
              </div>
            </div>

            {/* (3) Desempenho — Taxa de Aprovação + Atividade + Status */}
            <div className="sm-panel sm-panel-hover flex flex-1 flex-col gap-6 p-6">
              {/* Taxa de Aprovação */}
              <div>
                <h3 className="text-lg font-semibold text-white">Taxa de Aprovação</h3>
                <p className="text-sm text-[#ccc3d8]">
                  {stats.aprovados} de {stats.totalRequisitos} requisitos
                </p>
                <div className="relative mx-auto flex h-[150px] items-center justify-center">
                  <ResponsiveContainer width="100%" height={170}>
                    <RadialBarChart
                      innerRadius="74%"
                      outerRadius="100%"
                      data={[{ name: "taxa", value: taxaAprovacao, fill: "#7c3aed" }]}
                      startAngle={210}
                      endAngle={-30}
                    >
                      <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                      <RadialBar
                        background={{ fill: "rgba(255,255,255,0.08)" }}
                        dataKey="value"
                        cornerRadius={20}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-white">{taxaAprovacao}%</span>
                    <span className="text-xs text-[#ccc3d8]">aprovados</span>
                  </div>
                </div>
              </div>

              {/* Atividade da Semana */}
              <div className="border-t border-white/10 pt-5">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-base font-semibold text-white">Atividade da Semana</h4>
                  <span className="text-xs text-[#ccc3d8]">
                    Pico:{" "}
                    <span className="font-semibold text-white">
                      {diaMaisAtivo && diaMaisAtivo.total > 0 ? diaMaisAtivo.dia : "—"}
                    </span>
                  </span>
                </div>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={atividadeSemana} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                      <XAxis
                        dataKey="dia"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#ccc3d8", fontSize: 10 }}
                      />
                      <YAxis hide allowDecimals={false} />
                      <Tooltip contentStyle={smTooltip} cursor={{ fill: "rgba(255,255,255,0.06)" }} />
                      <Bar dataKey="total" radius={[6, 6, 6, 6]} maxBarSize={22}>
                        {atividadeSemana.map((d, i) => (
                          <Cell
                            key={i}
                            fill={
                              d.dia === diaMaisAtivo?.dia && d.total > 0
                                ? "#d2bbff"
                                : "rgba(255,255,255,0.18)"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Status dos Requisitos */}
              <div className="border-t border-white/10 pt-5">
                <h4 className="mb-3 text-base font-semibold text-white">Status dos Requisitos</h4>
                <div className="flex items-center gap-4">
                  <div className="relative h-32 w-32 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusPie}
                          dataKey="value"
                          innerRadius={38}
                          outerRadius={52}
                          paddingAngle={2}
                          stroke="none"
                          activeIndex={activeStatus ?? undefined}
                          activeShape={renderActiveStatusShape}
                          onMouseEnter={(_, i) => setActiveStatus(i)}
                          onMouseLeave={() => setActiveStatus(null)}
                        >
                          {statusPie.map((s, i) => (
                            <Cell
                              key={i}
                              fill={s.color}
                              opacity={activeStatus === null || activeStatus === i ? 1 : 0.35}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span
                        className="text-xl font-bold leading-none"
                        style={{ color: activeStatus !== null ? statusPie[activeStatus].color : "#ffffff" }}
                      >
                        {activeStatus !== null ? statusPie[activeStatus].value : stats.totalRequisitos}
                      </span>
                      <span className="mt-0.5 text-[10px] text-[#ccc3d8]">
                        {activeStatus !== null ? statusPie[activeStatus].name : "total"}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    {statusPie.map((s, i) => (
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
            </div>
          </div>
        </div>
      </main>

      <CreateRequirementModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={() => {
          toast.success("Requisito criado com sucesso!");
          carregarDados(true);
        }}
      />
    </div>
  );
}

// =====================================================================
// (5) Pilha de requisitos recentes — cada novo requisito aparece
//     "um atrás do outro", como no design da terceira print.
// =====================================================================
function RecentStack({
  requisitos,
  onNew,
  isCliente,
}: {
  requisitos: (Requisito & { projeto_nome?: string })[];
  onNew: () => void;
  isCliente: boolean;
}) {
  const total = requisitos.length;
  // `offset` = índice do requisito que está na FRENTE da pilha.
  const [offset, setOffset] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const mounted = useRef(false);
  const VISIBLE = 4;
  const GAP = 16;

  // Sempre que a lista muda (ex.: novo requisito criado), volta para o topo.
  useEffect(() => {
    setOffset(0);
  }, [total]);

  // Scroll do mouse sobre a pilha avança/recua os cards (sem rolar a página).
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (total <= 1) return;
      e.preventDefault();
      setOffset((o) => Math.min(total - 1, Math.max(0, o + (e.deltaY > 0 ? 1 : -1))));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [total]);

  // Posição-alvo de um card conforme sua "profundidade" (index - offset).
  const layout = (depth: number) => {
    if (depth < 0) {
      // já passou: desliza para cima e some (efeito de "passar por cima").
      return { y: -38, scale: 1.06, opacity: 0, blur: 4, z: 30, pe: "none" as const };
    }
    if (depth >= VISIBLE) {
      // ainda escondido, embaixo da pilha.
      return {
        y: (VISIBLE - 1) * GAP + 10,
        scale: 1 - VISIBLE * 0.05,
        opacity: 0,
        blur: 2,
        z: 0,
        pe: "none" as const,
      };
    }
    return {
      y: depth * GAP,
      scale: 1 - depth * 0.05,
      opacity: depth === 0 ? 1 : Math.max(0.22, 0.6 - depth * 0.13),
      blur: depth === 0 ? 0 : depth * 0.5,
      z: 50 - depth,
      pe: depth === 0 ? ("auto" as const) : ("none" as const),
    };
  };

  // Anima (GSAP) cada card para sua posição sempre que o `offset` muda.
  // O card da frente desliza para cima e some, enquanto o próximo assume o topo
  // — efeito de "um passando pelo outro".
  useLayoutEffect(() => {
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const t = layout(i - offset);
      gsap.set(el, { zIndex: t.z, pointerEvents: t.pe, transformOrigin: "center top" });
      const props = { y: t.y, scale: t.scale, opacity: t.opacity, filter: `blur(${t.blur}px)` };
      if (mounted.current) {
        gsap.to(el, { ...props, duration: 0.55, ease: "power3.out", overwrite: "auto" });
      } else {
        gsap.set(el, props);
      }
    });
    mounted.current = true;
  }, [offset, total]);

  if (total === 0) {
    return (
      <div className="sm-panel flex items-center justify-between gap-3 rounded-xl border border-white/10 p-4">
        <p className="text-sm text-[#ccc3d8]">Nenhum requisito recente.</p>
        {!isCliente && (
          <button
            onClick={onNew}
            className="sm-primary-btn rounded-full px-4 py-1.5 text-xs font-medium text-white"
          >
            Criar
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        ref={stageRef}
        className="sm-stack overscroll-contain"
        style={{ height: 100 + (Math.min(VISIBLE, total) - 1) * GAP, overflow: "visible" }}
      >
        {requisitos.map((r, i) => {
          const front = i === offset;
          return (
            <Link
              key={r.id_requisito}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              to={`/requirements/${r.id_requisito}`}
              className="sm-stack-card absolute left-0 right-0 top-0 will-change-transform"
            >
              <div
                className={`rounded-xl border p-4 ${
                  front
                    ? "border-white/15 bg-gradient-to-br from-[#2b2d31] to-[#1f2024] shadow-lg shadow-black/40"
                    : "border-white/10 bg-[#202225]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          r.tipo === "Funcional"
                            ? "bg-[#4cd7f6]/15 text-[#4cd7f6]"
                            : "bg-[#d2bbff]/15 text-[#d2bbff]"
                        }`}
                      >
                        {r.codigo}
                      </span>
                      <span className="truncate text-[11px] text-[#ccc3d8]">{r.projeto_nome}</span>
                    </div>
                    <p className="truncate text-sm font-medium text-white">{r.descricao}</p>
                  </div>
                  <span
                    className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      statusBadge[r.status_validacao] || ""
                    }`}
                  >
                    {r.status_validacao}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      {total > 1 && (
        <div className="mt-2 flex items-center justify-between px-1">
          <span className="text-[11px] text-[#ccc3d8]/70">Role para navegar</span>
          <span className="text-[11px] font-medium text-[#ccc3d8]">
            {offset + 1}/{total}
          </span>
        </div>
      )}
    </div>
  );
}
