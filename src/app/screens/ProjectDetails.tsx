import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  Users,
  Calendar,
  FileText,
  TrendingUp,
  MoreVertical,
  Plus,
  CheckCircle2,
  Loader2,
  Pencil,
  Trash2,
  UserMinus,
  FileDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  gerarDocumentacaoPdf,
  SemRequisitosAprovadosError,
  FalhaExportacaoError,
} from "../lib/documentExport";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { GlassSidebar } from "../components/GlassSidebar";
import { EditProjectModal } from "../components/EditProjectModal";
import { AddMemberModal } from "../components/AddMemberModal";
import { CreateRequirementModal } from "../components/CreateRequirementModal";
import { ConfirmDeleteDialog } from "../components/ConfirmDeleteDialog";
import {
  fetchProjetoCompleto,
  excluirProjeto,
  removerMembroProjeto,
  notificarMembrosProjeto,
} from "../lib/api";
import type { ProjetoCompleto } from "../lib/types";
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

export function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjetoCompleto | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRemoveMemberDialogOpen, setIsRemoveMemberDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{
    id_usuario: string;
    nome: string;
  } | null>(null);

  // RF10 — Geração de Documentação
  const [exportando, setExportando] = useState(false);

  // RF06 — Criar requisito direto do painel do projeto
  const [isCreateReqModalOpen, setIsCreateReqModalOpen] = useState(false);

  /**
   * Carrega o projeto completo.
   * @param silencioso quando true, não mostra o spinner — usado em refreshes
   *                   após criar/editar para evitar o "flash" da tela.
   */
  const carregarProjeto = async (silencioso = false) => {
    if (!id) return;
    try {
      if (!silencioso) setLoading(true);
      const data = await fetchProjetoCompleto(id);
      setProject(data);
    } catch (err) {
      console.error("Erro ao carregar projeto:", err);
    } finally {
      if (!silencioso) setLoading(false);
    }
  };

  useEffect(() => {
    carregarProjeto();
  }, [id]);

  // Obter dados do usuário logado
  const userDataString = localStorage.getItem("scopemaster_user");
  const userData = userDataString ? JSON.parse(userDataString) : null;
  const currentUserId = userData?.id || "";
  const currentUserName = userData?.name || "Alguém";
  const currentUserRole = userData?.role || "";
  const isAdmin = currentUserRole === "Administrador";
  const isCliente = currentUserRole === "Cliente";

  const handleExcluirProjeto = async () => {
    if (!id || !project) return;
    // Notificar membros antes de excluir
    await notificarMembrosProjeto(
      id,
      currentUserId,
      `${currentUserName} excluiu o projeto "${project.nome}".`,
      "projeto_excluido"
    );
    await excluirProjeto(id);
    navigate("/projects");
  };

  /**
   * RF10 — Geração de Documentação Automática
   * Trata os fluxos alternativos:
   *  - A6: ausência de requisitos aprovados
   *  - A7: falha na exportação
   */
  const handleGerarDocumentacao = async () => {
    if (!id) return;
    try {
      setExportando(true);
      const arquivo = await gerarDocumentacaoPdf(id);
      toast.success(`Documento gerado: ${arquivo}`);
    } catch (err) {
      if (err instanceof SemRequisitosAprovadosError) {
        toast.warning(err.message);
      } else if (err instanceof FalhaExportacaoError) {
        toast.error(err.message);
      } else {
        console.error("Erro inesperado ao gerar documentação:", err);
        toast.error("Erro inesperado ao gerar a documentação.");
      }
    } finally {
      setExportando(false);
    }
  };

  const handleRemoverMembro = async () => {
    if (!id || !memberToRemove || !project) return;
    await removerMembroProjeto(id, memberToRemove.id_usuario);
    await notificarMembrosProjeto(
      id,
      currentUserId,
      `${currentUserName} removeu ${memberToRemove.nome} do projeto "${project.nome}".`,
      "membro_removido"
    );
    carregarProjeto();
  };

  const getInitials = (nome: string) =>
    nome
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  if (loading) {
    return (
      <div className="sm-dash items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#d2bbff]" />
        <span className="ml-3 text-[#ccc3d8]">Carregando projeto...</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="sm-dash">
        <GlassSidebar />
        <main className="relative z-0 flex h-full flex-1 flex-col items-center justify-center px-8 text-center">
          <h2 className="text-2xl font-bold text-white">Projeto não encontrado</h2>
          <p className="mt-2 text-[#ccc3d8]">
            O projeto que você está procurando não existe.
          </p>
          <Link
            to="/projects"
            className="sm-glass-btn mt-4 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar aos Projetos
          </Link>
        </main>
      </div>
    );
  }

  const reqs = project.requisitos || [];
  const membros = project.membros || [];
  const aprovados = reqs.filter((r) => r.status_validacao === "Aprovado").length;
  const progress =
    reqs.length > 0 ? Math.round((aprovados / reqs.length) * 100) : 0;

  const stats = [
    {
      label: "Total de Requisitos",
      value: String(reqs.length),
      Icon: FileText,
      tint: "bg-white/10 text-white",
    },
    {
      label: "Aprovados",
      value: String(aprovados),
      Icon: CheckCircle2,
      tint: "bg-emerald-500/15 text-emerald-300",
    },
    {
      label: "Membros da Equipe",
      value: String(membros.length),
      Icon: Users,
      tint: "bg-[#d2bbff]/15 text-[#d2bbff]",
    },
    {
      label: "Aprovação",
      value: `${progress}%`,
      Icon: TrendingUp,
      tint: "bg-[#ffb95f]/15 text-[#ffb95f]",
    },
  ];

  return (
    <div className="sm-dash">
      <GlassSidebar />

      <main className="sm-noscroll relative z-0 flex h-full min-w-0 flex-1 flex-col overflow-y-auto">
        {/* Header */}
        <header className="shrink-0 px-8 pb-6 pt-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <Link
                to="/projects"
                className="sm-glass-btn flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-white"
                aria-label="Voltar aos projetos"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div className="min-w-0">
                <h1 className="break-words text-2xl font-bold text-white">{project.nome}</h1>
                <p className="mt-1 break-words text-[#ccc3d8]">
                  {project.descricao || "Sem descrição"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3">
              {/* RF06 — Novo Requisito direto neste projeto (RN006: oculto para Cliente) */}
              {!isCliente && (
                <button
                  onClick={() => setIsCreateReqModalOpen(true)}
                  className="sm-glass-btn flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white"
                >
                  <Plus className="h-4 w-4" />
                  Novo Requisito
                </button>
              )}

              {/* RF10 — Gerar Documentação Automática */}
              <button
                onClick={handleGerarDocumentacao}
                disabled={exportando}
                className="sm-primary-btn flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {exportando ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <FileDown className="h-4 w-4" />
                    <span className="hidden sm:inline">Gerar Documentação</span>
                    <span className="sm:hidden">Documentação</span>
                  </>
                )}
              </button>

              {/* Cliente NÃO gerencia equipe nem altera o projeto. */}
              {!isCliente && (
                <>
                  <button
                    onClick={() => setIsAddMemberModalOpen(true)}
                    className="sm-glass-btn flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white"
                  >
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">Gerenciar Equipe</span>
                    <span className="sm:hidden">Equipe</span>
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="sm-glass-btn flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-white">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-48 border-white/10 bg-[#201e27] text-[#e6e0ec]"
                    >
                      <DropdownMenuItem
                        onClick={() => setIsEditModalOpen(true)}
                        className="cursor-pointer text-amber-300 focus:bg-white/10 focus:text-amber-200"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Modificar Projeto
                      </DropdownMenuItem>

                      {isAdmin && (
                        <>
                          <DropdownMenuSeparator className="bg-white/10" />
                          <DropdownMenuItem
                            onClick={() => setIsDeleteDialogOpen(true)}
                            className="cursor-pointer text-red-400 focus:bg-white/10 focus:text-red-300"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir Projeto
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="px-8 pb-8">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {stats.map((s) => {
              const Icon = s.Icon;
              return (
                <div key={s.label} className="sm-panel sm-panel-hover p-5">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.tint}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-2xl font-bold leading-none text-white">{s.value}</p>
                  <p className="mt-1.5 text-sm text-[#ccc3d8]">{s.label}</p>
                </div>
              );
            })}
          </div>

          {/* Informações + Equipe */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Informações do Projeto */}
            <div className="sm-panel p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-white">Informações do Projeto</h3>

              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <div className="flex items-center gap-2 text-[#ccc3d8]">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>
                    Criado em: {new Date(project.data_criacao).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#ccc3d8]">
                  <FileText className="h-4 w-4 flex-shrink-0" />
                  <span>
                    {aprovados} de {reqs.length} requisitos aprovados
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#ccc3d8]">Progresso de Aprovação</span>
                  <span className="font-medium text-white">{progress}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#4cd7f6] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <Tabs defaultValue="requirements" className="mt-6">
                <TabsList className="bg-black/30">
                  <TabsTrigger
                    value="requirements"
                    className="text-[#ccc3d8] data-[state=active]:bg-white/10 data-[state=active]:text-white"
                  >
                    Requisitos
                  </TabsTrigger>
                  <TabsTrigger
                    value="activity"
                    className="text-[#ccc3d8] data-[state=active]:bg-white/10 data-[state=active]:text-white"
                  >
                    Atividade
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="requirements" className="mt-4 space-y-3">
                  {reqs.length === 0 ? (
                    <p className="py-8 text-center text-sm text-[#ccc3d8]">
                      Nenhum requisito cadastrado para este projeto.
                    </p>
                  ) : (
                    reqs.map((req) => (
                      <Link
                        key={req.id_requisito}
                        to={`/requirements/${req.id_requisito}`}
                        className="block rounded-xl border border-white/10 bg-black/20 p-4 transition-colors hover:border-[#7c3aed]/40 hover:bg-white/5"
                      >
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-white">{req.codigo}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                              tipoBadge[req.tipo] || "bg-white/10 text-[#ccc3d8]"
                            }`}
                          >
                            {req.tipo}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                              statusBadge[req.status_validacao] || ""
                            }`}
                          >
                            {req.status_validacao}
                          </span>
                        </div>
                        <h4 className="break-words text-sm font-medium text-white">
                          {req.descricao}
                        </h4>
                      </Link>
                    ))
                  )}
                </TabsContent>
                <TabsContent value="activity" className="mt-4">
                  <p className="py-8 text-center text-sm text-[#ccc3d8]">
                    Atividades recentes aparecerão aqui
                  </p>
                </TabsContent>
              </Tabs>
            </div>

            {/* Equipe do Projeto */}
            <div className="sm-panel p-6">
              <h3 className="text-lg font-semibold text-white">Equipe do Projeto</h3>
              <div className="mt-5 space-y-3">
                {membros.length === 0 ? (
                  <p className="py-4 text-center text-sm text-[#ccc3d8]">
                    Nenhum membro associado.
                  </p>
                ) : (
                  membros.map((member, i) => (
                    <div key={i} className="group flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-white/15">
                        <AvatarFallback className="bg-gradient-to-br from-[#7c3aed] to-[#4cd7f6] text-xs font-bold text-white">
                          {member.usuario ? getInitials(member.usuario.nome) : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">
                          {member.usuario?.nome || "Usuário desconhecido"}
                        </p>
                        <p className="truncate text-xs text-[#ccc3d8]">
                          {member.papel_no_projeto}
                        </p>
                      </div>
                      {!isCliente && (
                        <button
                          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-red-400 opacity-100 transition-opacity hover:bg-red-500/10 hover:text-red-300 md:opacity-0 md:group-hover:opacity-100"
                          onClick={() => {
                            setMemberToRemove({
                              id_usuario: member.id_usuario,
                              nome: member.usuario?.nome || "Usuário desconhecido",
                            });
                            setIsRemoveMemberDialogOpen(true);
                          }}
                        >
                          <UserMinus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
              {!isCliente && (
                <button
                  className="sm-glass-btn mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white"
                  onClick={() => setIsAddMemberModalOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Membro
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modais */}
        <EditProjectModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          project={project}
          onSaved={carregarProjeto}
        />

        <AddMemberModal
          open={isAddMemberModalOpen}
          onOpenChange={setIsAddMemberModalOpen}
          projectId={project.id_projeto}
          currentMemberIds={membros.map((m) => m.id_usuario)}
          onAdded={carregarProjeto}
        />

        {/* RF06 — Modal de criação de requisito atrelado ao projeto atual */}
        <CreateRequirementModal
          open={isCreateReqModalOpen}
          onOpenChange={setIsCreateReqModalOpen}
          preselectedProjectId={project.id_projeto}
          onCreated={() => {
            toast.success("Requisito criado com sucesso!");
            carregarProjeto(true); // refresh silencioso, sem flash
          }}
        />

        {/* Dialog de exclusão — apenas Administrador */}
        {isAdmin && (
          <ConfirmDeleteDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            title="Excluir Projeto"
            description={`Tem certeza que deseja excluir o projeto "${project.nome}"? Todos os ${reqs.length} requisito(s) e ${membros.length} membro(s) associados também serão removidos. Esta ação não pode ser desfeita.`}
            onConfirm={handleExcluirProjeto}
          />
        )}

        <ConfirmDeleteDialog
          open={isRemoveMemberDialogOpen}
          onOpenChange={setIsRemoveMemberDialogOpen}
          title="Remover Membro"
          description={
            memberToRemove
              ? `Tem certeza que deseja remover "${memberToRemove.nome}" deste projeto?`
              : ""
          }
          onConfirm={handleRemoverMembro}
        />
      </main>
    </div>
  );
}
