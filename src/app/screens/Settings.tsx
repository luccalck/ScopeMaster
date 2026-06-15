import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  Save,
  Type,
  User,
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  LayoutDashboard,
  FileText,
  FolderKanban,
  BarChart3,
  UserCheck,
  CreditCard,
  Settings as SettingsIcon,
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
import bcrypt from "bcryptjs";
import { fetchUsuarioPorId, atualizarUsuario } from "../lib/api";
import "./dashboard-glass.css";
import "./landing.css";

const inputCls =
  "w-full rounded-lg border border-white/10 bg-black/30 px-3.5 py-2.5 text-sm text-white placeholder:text-[#ccc3d8]/45 outline-none transition focus:border-[#7c3aed]/60 focus:ring-2 focus:ring-[#7c3aed]/20";
const labelCls = "lp-mono mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-[#a89fb5]";

function SectionHead({
  n,
  icon: Icon,
  tint,
  title,
  desc,
}: {
  n: string;
  icon: typeof Type;
  tint: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-4 border-b border-white/10 px-6 py-5">
      <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 ${tint}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <div className="lp-mono mb-1 text-[11px] tracking-[0.14em] text-[#6f6878]">{n} / CONFIGURAÇÃO</div>
        <h3 className="text-base font-semibold tracking-tight text-white">{title}</h3>
        <p className="mt-0.5 text-sm text-[#a89fb5]">{desc}</p>
      </div>
    </div>
  );
}

export function Settings() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [fontFamily, setFontFamily] = useState("Inter");
  const [fontSize, setFontSize] = useState("16");

  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const userDataString = localStorage.getItem("scopemaster_user");
  const userData = userDataString ? JSON.parse(userDataString) : null;
  const userRole: string = userData?.role || "Usuário";
  const sidebarName: string = userData?.name || "Usuário";
  const sidebarInitials = sidebarName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    setFontFamily(localStorage.getItem("scopemaster_font_family") || "Inter");
    setFontSize(localStorage.getItem("scopemaster_font_size") || "16");
    if (userData) {
      setUserId(userData.id);
      fetchUsuarioPorId(userData.id).then((user) => {
        if (user) {
          const parts = user.nome.split(" ");
          setNome(parts[0] || "");
          setSobrenome(parts.slice(1).join(" ") || "");
          setEmail(user.email);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyAppearance = () => {
    localStorage.setItem("scopemaster_font_family", fontFamily);
    localStorage.setItem("scopemaster_font_size", fontSize);
    document.documentElement.style.setProperty("--font-size", `${fontSize}px`);
    document.documentElement.style.fontFamily =
      fontFamily === "Inter"
        ? "Inter, sans-serif"
        : fontFamily === "Roboto"
        ? "Roboto, sans-serif"
        : fontFamily === "Outfit"
        ? "Outfit, sans-serif"
        : "serif";
    showMessage("Aparência atualizada com sucesso!", "success");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !sobrenome) {
      showMessage("Nome e sobrenome são obrigatórios.", "error");
      return;
    }
    setIsLoading(true);
    try {
      const nomeCompleto = `${nome} ${sobrenome}`.trim();
      await atualizarUsuario(userId, { nome: nomeCompleto });
      if (userDataString) {
        const u = JSON.parse(userDataString);
        u.name = nomeCompleto;
        localStorage.setItem("scopemaster_user", JSON.stringify(u));
        window.dispatchEvent(new Event("storage"));
      }
      showMessage("Perfil atualizado com sucesso!", "success");
    } catch (err) {
      console.error(err);
      showMessage("Erro ao atualizar o perfil.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      showMessage("Preencha todos os campos de senha.", "error");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      showMessage("A nova senha e a confirmação não coincidem.", "error");
      return;
    }
    if (novaSenha.length < 6) {
      showMessage("A nova senha deve ter pelo menos 6 caracteres.", "error");
      return;
    }
    setIsLoading(true);
    try {
      const user = await fetchUsuarioPorId(userId);
      const isBcrypt = user?.senha_hash?.startsWith("$2");
      const senhaCorreta =
        user && (isBcrypt ? await bcrypt.compare(senhaAtual, user.senha_hash) : senhaAtual === user.senha_hash);
      if (!senhaCorreta) {
        showMessage("Usuário ou senha incorretas.", "error");
        setIsLoading(false);
        return;
      }
      const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
      await atualizarUsuario(userId, { senha_hash: novaSenhaHash });
      showMessage("Senha atualizada com sucesso!", "success");
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (err) {
      console.error(err);
      showMessage("Erro ao atualizar a senha.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (text: string, type: string) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  const initials = `${(nome[0] || "").toUpperCase()}${(sobrenome[0] || "").toUpperCase()}` || "U";

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
  const navSecundaria = [{ name: "Configurações", href: "/settings", icon: SettingsIcon }];
  const isActive = (href: string) => location.pathname.startsWith(href);

  const handleLogout = () => {
    localStorage.removeItem("scopemaster_authenticated");
    localStorage.removeItem("scopemaster_user");
    navigate("/login");
  };

  const primaryBtn =
    "inline-flex items-center justify-center gap-2 rounded-lg bg-[#7c3aed] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#8b5cf6] disabled:opacity-60";

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

        <div className="mt-auto border-t border-white/10 p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/5">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-[#7c3aed] to-[#4cd7f6] text-sm font-semibold text-white">
                  {sidebarInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{sidebarName}</p>
                  <p className="truncate text-xs text-[#ccc3d8]">{userRole}</p>
                </div>
                <MoreVertical className="h-4 w-4 flex-shrink-0 text-[#ccc3d8]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-white/10 bg-[#201e27] text-[#e6e0ec]">
              <DropdownMenuLabel className="text-white">Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="focus:bg-white/10" onClick={() => navigate("/settings")}>
                <SettingsIcon className="mr-2 h-4 w-4" /> Configurações
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
        <header className="shrink-0 px-8 pb-2 pt-10">
          <div className="lp-mono text-[11px] tracking-[0.18em] text-[#6f6878]">CONTA &amp; PREFERÊNCIAS</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-white">Configurações</h2>
          <p className="mt-1 text-[#a89fb5]">Personalize sua experiência e gerencie sua conta.</p>
        </header>

        <div className="mx-auto w-full max-w-3xl space-y-6 px-8 py-6">
          {/* Perfil em destaque */}
          <div className="sm-panel overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-[#7c3aed] via-[#6d28d9] to-[#4cd7f6]" />
            <div className="-mt-10 flex items-end gap-4 px-6 pb-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#4cd7f6] text-2xl font-bold text-white ring-4 ring-[#1a1620]">
                {initials}
              </div>
              <div className="min-w-0 pb-1">
                <h2 className="truncate text-lg font-semibold text-white">
                  {nome || "Seu nome"} {sobrenome}
                </h2>
                <p className="truncate text-sm text-[#a89fb5]">{email}</p>
              </div>
              <span className="mb-1 ml-auto flex-shrink-0 rounded-full border border-[#d2bbff]/25 bg-[#d2bbff]/10 px-3 py-1 text-xs font-semibold text-[#d2bbff]">
                {userRole}
              </span>
            </div>
          </div>

          {message.text && (
            <div
              className={`flex items-center gap-3 rounded-lg border p-4 ${
                message.type === "success"
                  ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-300"
                  : "border-red-400/25 bg-red-500/10 text-red-300"
              }`}
            >
              {message.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              <p className="font-medium">{message.text}</p>
            </div>
          )}

          {/* Aparência */}
          <section className="sm-panel overflow-hidden">
            <SectionHead
              n="01"
              icon={Type}
              tint="bg-[#d2bbff]/10 text-[#d2bbff]"
              title="Aparência e Acessibilidade"
              desc="Ajuste a fonte e o tamanho do texto para melhor leitura."
            />
            <div className="space-y-6 p-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className={labelCls}>Fonte</label>
                  <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className={inputCls}>
                    <option value="Inter">Inter (Padrão)</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Outfit">Outfit</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Tamanho da Letra ({fontSize}px)</label>
                  <input
                    type="range"
                    min="12"
                    max="24"
                    step="1"
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    className="mt-2 w-full accent-[#7c3aed]"
                  />
                  <div className="mt-1 flex justify-between text-xs text-[#6f6878]">
                    <span>Pequeno</span>
                    <span>Normal</span>
                    <span>Grande</span>
                  </div>
                </div>
              </div>
              <button onClick={handleApplyAppearance} className={primaryBtn}>
                Aplicar Estilo
              </button>
            </div>
          </section>

          {/* Perfil */}
          <section className="sm-panel overflow-hidden">
            <SectionHead
              n="02"
              icon={User}
              tint="bg-[#4cd7f6]/10 text-[#4cd7f6]"
              title="Perfil do Usuário"
              desc="Atualize suas informações pessoais."
            />
            <form onSubmit={handleUpdateProfile} className="space-y-6 p-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className={labelCls}>Nome</label>
                  <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Sobrenome</label>
                  <input value={sobrenome} onChange={(e) => setSobrenome(e.target.value)} placeholder="Seu sobrenome" className={inputCls} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelCls}>E-mail (não pode ser alterado)</label>
                  <input value={email} disabled className={`${inputCls} cursor-not-allowed opacity-60`} />
                </div>
              </div>
              <button type="submit" disabled={isLoading} className={primaryBtn}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar Perfil
              </button>
            </form>
          </section>

          {/* Segurança */}
          <section className="sm-panel overflow-hidden">
            <SectionHead
              n="03"
              icon={Lock}
              tint="bg-[#ffb95f]/10 text-[#ffb95f]"
              title="Segurança"
              desc="Atualize sua senha de acesso."
            />
            <form onSubmit={handleUpdatePassword} className="space-y-6 p-6">
              <div className="max-w-md space-y-4">
                <div>
                  <label className={labelCls}>Senha Atual</label>
                  <input type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} placeholder="••••••••" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Nova Senha</label>
                  <input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="••••••••" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Confirmar Nova Senha</label>
                  <input type="password" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} placeholder="••••••••" className={inputCls} />
                </div>
              </div>
              <button type="submit" disabled={isLoading} className={primaryBtn}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                Alterar Senha
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
