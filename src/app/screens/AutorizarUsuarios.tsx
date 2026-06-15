import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  Loader2,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Code2,
  UserRound,
  LayoutDashboard,
  FileText,
  FolderKanban,
  BarChart3,
  UserCheck,
  Settings,
  MoreVertical,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { fetchUsuarios, autorizarUsuario } from "../lib/api";
import type { Usuario } from "../lib/types";
import { toast } from "sonner";
import "./dashboard-glass.css";

const PENDENTE_TAG = "[PENDENTE]";

// Cor do avatar a partir da inicial — determinística e bonita.
const AVATAR_COLORS = [
  "from-[#7c3aed] to-[#4cd7f6]",
  "from-[#ffb95f] to-[#ff8a80]",
  "from-[#4cd7f6] to-[#7c3aed]",
  "from-[#d2bbff] to-[#7c3aed]",
  "from-[#ff8a80] to-[#ffb95f]",
  "from-[#4cd7f6] to-[#34d399]",
];
function avatarGradient(nome: string) {
  let h = 0;
  for (let i = 0; i < nome.length; i++) h = (h * 31 + nome.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

const roleBadge: Record<string, string> = {
  Administrador: "bg-[#d2bbff]/15 text-[#d2bbff] border border-[#d2bbff]/25",
  Desenvolvedor: "bg-[#4cd7f6]/15 text-[#4cd7f6] border border-[#4cd7f6]/25",
  Cliente: "bg-[#ffb95f]/15 text-[#ffb95f] border border-[#ffb95f]/25",
};

function Avatar({ nome }: { nome: string }) {
  const inicial = nome.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/15 bg-gradient-to-br ${avatarGradient(
        nome
      )} text-sm font-bold text-white`}
    >
      {inicial}
    </div>
  );
}

export function AutorizarUsuarios() {
  const location = useLocation();
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [busca, setBusca] = useState("");

  const userDataString = localStorage.getItem("scopemaster_user");
  const userData = userDataString ? JSON.parse(userDataString) : null;
  const userName: string = userData?.name || "Usuário";
  const userRole: string = userData?.role || "Membro";
  const userInitials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      setIsLoading(true);
      const data = await fetchUsuarios();
      setUsuarios(data);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutorizar = async (
    id: string,
    nomeOriginal: string,
    perfil: "Administrador" | "Desenvolvedor" | "Cliente"
  ) => {
    try {
      setIsProcessing(id);
      const novoNome = nomeOriginal.replace(`${PENDENTE_TAG} `, "");
      await autorizarUsuario(id, novoNome, perfil);
      setUsuarios((prev) =>
        prev.map((u) => (u.id_usuario === id ? { ...u, nome: novoNome, perfil } : u))
      );
      toast.success(`${novoNome} autorizado como ${perfil}.`);
    } catch (error) {
      console.error("Erro ao autorizar usuário:", error);
      toast.error("Erro ao autorizar o usuário.");
    } finally {
      setIsProcessing(null);
    }
  };

  const { cadastrados, pendentes } = useMemo(() => {
    const q = busca.trim().toLowerCase();
    const match = (u: Usuario) => {
      const nome = u.nome.replace(`${PENDENTE_TAG} `, "");
      return !q || nome.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    };
    const filtrados = usuarios.filter(match);
    return {
      cadastrados: filtrados.filter((u) => !u.nome.startsWith(PENDENTE_TAG)),
      pendentes: filtrados.filter((u) => u.nome.startsWith(PENDENTE_TAG)),
    };
  }, [usuarios, busca]);

  // ---- Navegação (mesmas abas do painel de propostas) -----------------
  const nav = [
    { name: "Painel de Propostas", href: "/dashboard", icon: LayoutDashboard },
    { name: "Fluxo de Ideias", href: "/requirements", icon: FileText },
    { name: "Projetos Aprovados", href: "/projects", icon: FolderKanban },
    { name: "Métricas de Aprovação", href: "/analytics", icon: BarChart3 },
  ];
  if (userRole === "Administrador")
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

  const roleButtons = (u: Usuario) => {
    const opcoes = [
      { perfil: "Administrador" as const, icon: ShieldCheck, cls: "hover:bg-[#d2bbff]/15 hover:text-[#d2bbff] hover:border-[#d2bbff]/40" },
      { perfil: "Desenvolvedor" as const, icon: Code2, cls: "hover:bg-[#4cd7f6]/15 hover:text-[#4cd7f6] hover:border-[#4cd7f6]/40" },
      { perfil: "Cliente" as const, icon: UserRound, cls: "hover:bg-[#ffb95f]/15 hover:text-[#ffb95f] hover:border-[#ffb95f]/40" },
    ];
    return (
      <div className="flex flex-wrap items-center gap-2">
        {opcoes.map(({ perfil, icon: Icon, cls }) => (
          <button
            key={perfil}
            disabled={isProcessing === u.id_usuario}
            onClick={() => handleAutorizar(u.id_usuario, u.nome, perfil)}
            className={`flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-[#ccc3d8] transition disabled:opacity-50 ${cls}`}
          >
            {isProcessing === u.id_usuario ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Icon className="h-3.5 w-3.5" />
            )}
            {perfil}
          </button>
        ))}
      </div>
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
          <div className="mb-6 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#ccc3d8]" />
              <input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar usuários por nome ou e-mail..."
                className="w-full rounded-full border border-white/10 bg-black/30 py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-[#ccc3d8]/70 focus:border-[#7c3aed]/60 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">Autorizar Usuários</h2>
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-sm font-semibold text-white">
              {usuarios.length}
            </span>
          </div>
          <p className="mt-1 text-[#ccc3d8]">
            Gerencie os membros da equipe e defina as permissões de cada conta.
          </p>
        </header>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#d2bbff]" />
            <span className="ml-3 text-[#ccc3d8]">Carregando usuários...</span>
          </div>
        ) : (
          <div className="flex flex-col gap-6 px-8 pb-8">
            {/* ============ AUTORIZAÇÃO PENDENTE ============ */}
            <section className="sm-panel p-5">
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ffb95f] shadow-[0_0_6px_#ffb95f]" />
                  <h3 className="flex items-center gap-2 text-base font-bold text-white">
                    <Clock className="h-4 w-4 text-[#ffb95f]" /> Autorização Pendente
                  </h3>
                </div>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white">
                  {pendentes.length}
                </span>
              </div>

              {pendentes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <CheckCircle2 className="mb-3 h-10 w-10 text-emerald-400/70" />
                  <p className="text-sm font-medium text-white">Nenhum usuário pendente</p>
                  <p className="text-xs text-[#ccc3d8]/80">Todos os cadastros já foram avaliados.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pendentes.map((u) => {
                    const nomeLimpo = u.nome.replace(`${PENDENTE_TAG} `, "");
                    return (
                      <div
                        key={u.id_usuario}
                        className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 lg:flex-row lg:items-center lg:justify-between"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar nome={nomeLimpo} />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">{nomeLimpo}</p>
                            <p className="truncate text-xs text-[#ccc3d8]/80">{u.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 lg:flex-shrink-0">
                          <span className="hidden text-xs text-[#ccc3d8]/70 sm:inline">Conceder cargo:</span>
                          {roleButtons(u)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ============ USUÁRIOS CADASTRADOS ============ */}
            <section className="sm-panel p-5">
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#7c3aed] shadow-[0_0_6px_#7c3aed]" />
                  <h3 className="flex items-center gap-2 text-base font-bold text-white">
                    <UserCheck className="h-4 w-4 text-[#d2bbff]" /> Usuários Cadastrados
                  </h3>
                </div>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white">
                  {cadastrados.length}
                </span>
              </div>

              {/* Cabeçalho da tabela */}
              <div className="hidden grid-cols-[1.4fr_1.4fr_1fr_0.8fr] gap-4 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#ccc3d8]/60 md:grid">
                <span>Nome completo</span>
                <span>E-mail</span>
                <span>Cargo</span>
                <span>Status</span>
              </div>

              {cadastrados.length === 0 ? (
                <p className="py-8 text-center text-sm text-[#ccc3d8]/80">Nenhum usuário encontrado.</p>
              ) : (
                <div className="space-y-1">
                  {cadastrados.map((u) => (
                    <div
                      key={u.id_usuario}
                      className="grid grid-cols-1 items-center gap-2 rounded-xl border border-transparent px-3 py-2.5 transition hover:border-white/10 hover:bg-white/[0.04] md:grid-cols-[1.4fr_1.4fr_1fr_0.8fr] md:gap-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar nome={u.nome} />
                        <span className="truncate text-sm font-medium text-white">{u.nome}</span>
                      </div>
                      <span className="truncate text-sm text-[#ccc3d8]">{u.email}</span>
                      <span>
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            roleBadge[u.perfil] || "bg-white/10 text-[#ccc3d8]"
                          }`}
                        >
                          {u.perfil}
                        </span>
                      </span>
                      <span className="flex items-center gap-1.5 text-sm text-emerald-300">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" /> Ativo
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
