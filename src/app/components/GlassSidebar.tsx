import { Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  BarChart3,
  UserCheck,
  CreditCard,
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
} from "./ui/dropdown-menu";

/**
 * Sidebar glassmorphism compartilhada pelas telas full-screen
 * (Dashboard, Projetos, Detalhe do Projeto, etc.). Mantém o mesmo
 * visual/navegação para todas as abas.
 */
export function GlassSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

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

  const navSecundaria = [{ name: "Configurações", href: "/settings", icon: Settings }];

  const isActive = (href: string) =>
    href === "/" ? location.pathname === "/" : location.pathname.startsWith(href);

  const handleLogout = () => {
    localStorage.removeItem("scopemaster_authenticated");
    localStorage.removeItem("scopemaster_user");
    navigate("/login");
  };

  return (
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
  );
}
