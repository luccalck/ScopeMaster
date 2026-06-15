import { useState, useEffect, useCallback } from "react";
import { Bell, Search, User, LogOut, Check, BellOff, Menu } from "lucide-react";
import { useNavigate } from "react-router";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  fetchNotificacoes,
  contarNotificacoesNaoLidas,
  marcarNotificacaoComoLida,
  marcarTodasComoLidas,
} from "../lib/api";
import type { Notificacao } from "../lib/types";

type NotificacaoComProjeto = Notificacao & { projeto_nome?: string };

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const navigate = useNavigate();
  const [notificacoes, setNotificacoes] = useState<NotificacaoComProjeto[]>([]);
  const [naoLidas, setNaoLidas] = useState(0);

  // Obter dados do usuário do localStorage
  const userDataString = localStorage.getItem("scopemaster_user");
  const userData = userDataString ? JSON.parse(userDataString) : null;
  const userId = userData?.id || "";
  const userName = userData?.name || "Usuário";
  const userRole = userData?.role || "Membro";
  const userInitials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const carregarNotificacoes = useCallback(async () => {
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

  // Carregar notificações ao montar e a cada 30 segundos
  useEffect(() => {
    carregarNotificacoes();
    const interval = setInterval(carregarNotificacoes, 30000);
    return () => clearInterval(interval);
  }, [carregarNotificacoes]);

  const handleClickNotificacao = async (notif: NotificacaoComProjeto) => {
    // Marcar como lida
    if (!notif.lida) {
      await marcarNotificacaoComoLida(notif.id_notificacao);
      setNaoLidas((prev) => Math.max(0, prev - 1));
      setNotificacoes((prev) =>
        prev.map((n) =>
          n.id_notificacao === notif.id_notificacao
            ? { ...n, lida: true }
            : n
        )
      );
    }
    // Navegar para o projeto (se existir)
    if (notif.id_projeto) {
      navigate(`/projects/${notif.id_projeto}`);
    }
  };

  const handleMarcarTodasLidas = async () => {
    if (!userId) return;
    await marcarTodasComoLidas(userId);
    setNaoLidas(0);
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
  };

  const handleLogout = () => {
    localStorage.removeItem("scopemaster_authenticated");
    localStorage.removeItem("scopemaster_user");
    navigate("/login");
  };

  // Formatar a data relativa
  const formatarData = (dataStr: string) => {
    const agora = new Date();
    const data = new Date(dataStr);
    const diffMs = agora.getTime() - data.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMin / 60);
    const diffDias = Math.floor(diffHoras / 24);

    if (diffMin < 1) return "Agora";
    if (diffMin < 60) return `${diffMin}min atrás`;
    if (diffHoras < 24) return `${diffHoras}h atrás`;
    if (diffDias < 7) return `${diffDias}d atrás`;
    return data.toLocaleDateString("pt-BR");
  };

  // Cor do tipo da notificação
  const getTipoCor = (tipo: string) => {
    switch (tipo) {
      case "membro_adicionado":
        return "bg-primary";
      case "membro_removido":
        return "bg-orange-500";
      case "projeto_editado":
        return "bg-amber-500";
      case "projeto_excluido":
        return "bg-red-500";
      case "requisito_criado":
        return "bg-green-500";
      case "requisito_aprovado":
        return "bg-emerald-500";
      case "requisito_rejeitado":
        return "bg-red-400";
      default:
        return "bg-primary";
    }
  };

  return (
    <header className="flex h-16 items-center gap-2 sm:gap-4 border-b border-border bg-card/80 backdrop-blur-md px-3 sm:px-6 flex-shrink-0 sticky top-0 z-30">
      {/* Botão menu mobile (hamburger) — só aparece em < md */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden flex-shrink-0"
        onClick={onToggleSidebar}
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Search — em mobile fica menor, em desktop ocupa largura disponível */}
      <div className="flex-1 max-w-xl min-w-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar requisitos, projetos..."
            className="pl-10 bg-muted border-transparent rounded-full text-foreground w-full focus-visible:bg-card focus-visible:border-primary/40"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-foreground">
              <Bell className="h-5 w-5" />
              {naoLidas > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground ring-2 ring-card">
                  {naoLidas > 9 ? "9+" : naoLidas}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] max-w-96 sm:w-96">
            <div className="flex items-center justify-between px-3 py-2">
              <DropdownMenuLabel className="p-0 text-base">
                Notificações
              </DropdownMenuLabel>
              {naoLidas > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-foreground hover:text-foreground/80"
                  onClick={(e) => {
                    e.preventDefault();
                    handleMarcarTodasLidas();
                  }}
                >
                  <Check className="mr-1 h-3 w-3" />
                  Marcar todas como lidas
                </Button>
              )}
            </div>
            <DropdownMenuSeparator />

            {notificacoes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <BellOff className="h-10 w-10 text-gray-300 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">
                  Sem notificações
                </p>
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  Você será notificado quando alguém modificar um projeto que você participa.
                </p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {notificacoes.map((notif) => (
                  <DropdownMenuItem
                    key={notif.id_notificacao}
                    className={`flex items-start gap-3 px-3 py-3 cursor-pointer ${
                      !notif.lida
                        ? "bg-muted/50 hover:bg-muted"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => handleClickNotificacao(notif)}
                  >
                    {/* Indicador de tipo */}
                    <div className="flex-shrink-0 mt-1">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${getTipoCor(notif.tipo)}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm leading-snug ${
                          !notif.lida
                            ? "font-medium text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {notif.mensagem}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {notif.projeto_nome && (
                          <span className="text-xs text-foreground font-medium">
                            {notif.projeto_nome}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatarData(notif.data_criacao)}
                        </span>
                      </div>
                    </div>
                    {/* Indicador de não lida */}
                    {!notif.lida && (
                      <div className="flex-shrink-0 mt-1">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                    )}
                  </DropdownMenuItem>
                ))}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu — em mobile mostra só avatar, em desktop mostra nome e papel */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-1 sm:px-3">
              <Avatar className="h-9 w-9 flex-shrink-0 ring-2 ring-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-white font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left min-w-0">
                <div className="text-sm font-medium text-foreground truncate max-w-[140px]">
                  {userName}
                </div>
                <div className="text-xs text-muted-foreground truncate max-w-[140px]">
                  {userRole}
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem>Configurações</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}