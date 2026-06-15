import { Link, useLocation } from "react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  BarChart3,
  Settings,
  UserCheck,
  CreditCard,
  Sparkles,
  X,
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("scopemaster_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
      } catch (e) {}
    }
  }, []);

  const navigation = [
    { name: "Painel de Propostas", href: "/dashboard", icon: LayoutDashboard },
    { name: "Fluxo de Ideias", href: "/requirements", icon: FileText },
    { name: "Projetos Aprovados", href: "/projects", icon: FolderKanban },
    { name: "Métricas de Aprovação", href: "/analytics", icon: BarChart3 },
  ];

  if (userRole === "Administrador") {
    navigation.push({ name: "Autorizar Usuários", href: "/autorizar-usuarios", icon: UserCheck });
  }

  if (userRole === "Cliente") {
    navigation.push({ name: "Planos e Pagamentos", href: "/pagamentos", icon: CreditCard });
  }

  const secondaryNavigation = [
    { name: "Configurações", href: "/settings", icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  const renderLink = (item: { name: string; href: string; icon: typeof FileText }) => {
    const Icon = item.icon;
    const active = isActive(item.href);

    return (
      <Link
        key={item.name}
        to={item.href}
        onClick={onClose}
        className={`
          group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200
          ${
            active
              ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
              : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
          }
        `}
      >
        {/* Indicador lateral azul quando ativo */}
        <span
          className={`absolute left-0 top-1/2 h-5 -translate-y-1/2 rounded-r-full bg-primary transition-all duration-200 ${
            active ? "w-1 opacity-100" : "w-0 opacity-0"
          }`}
        />
        <Icon
          className={`h-5 w-5 flex-shrink-0 transition-colors ${
            active ? "text-primary" : "text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground"
          }`}
        />
        <span className="truncate">{item.name}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Backdrop — só aparece em mobile quando aberto */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — em md+ fica fixa no fluxo; em < md é drawer */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border
          transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo e botão fechar (mobile) */}
        <div className="flex h-16 items-center justify-between gap-2 px-4 sm:px-5 border-b border-sidebar-border">
          <Link to="/dashboard" onClick={onClose} className="flex items-center gap-2.5 min-w-0">
            <img
              src="/ScopeMasterLogoReal.png"
              alt="ScopeMaster"
              className="h-9 w-9 flex-shrink-0 object-contain drop-shadow-[0_2px_8px_rgba(124,58,237,0.45)]"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-lg font-bold leading-tight truncate bg-gradient-to-r from-[#ffc27a] via-[#d2bbff] to-[#a06bff] bg-clip-text text-transparent">
                ScopeMaster
              </span>
              <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60 leading-tight">
                Requisitos
              </span>
            </div>
          </Link>
          {/* Botão fechar visível só em mobile */}
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded-md text-sidebar-foreground hover:bg-sidebar-accent"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            Menu
          </p>
          {navigation.map(renderLink)}
        </nav>

        {/* Secondary Navigation */}
        <div className="border-t border-sidebar-border px-3 py-4 space-y-1">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            Geral
          </p>
          {secondaryNavigation.map(renderLink)}
        </div>

        {/* Card promocional — base da sidebar */}
        <div className="px-3 pb-4">
          <Link
            to="/pagamentos"
            onClick={onClose}
            className="block relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-4 text-white shadow-lg shadow-blue-600/20 transition-transform hover:scale-[1.02]"
          >
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
            <div className="absolute -right-2 bottom-0 h-12 w-12 rounded-full bg-white/10" />
            <div className="relative">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 mb-2">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <p className="text-sm font-semibold leading-snug">Eleve seus projetos</p>
              <p className="mt-0.5 text-xs text-blue-100/90">
                Conheça os planos premium
              </p>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}
