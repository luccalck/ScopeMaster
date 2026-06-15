import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  MoreVertical,
  Calendar,
  Tag,
  CheckCircle2,
  Check,
  Loader2,
  XCircle,
  MessageSquareWarning,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { GlassSidebar } from "../components/GlassSidebar";
import { toast } from "sonner";
import {
  fetchRequisitoPorId,
  atualizarStatusRequisito,
  notificarMembrosProjeto,
  excluirRequisito,
  fetchVotosRequisito,
  registrarVotoRequisito,
  atualizarRodadaVotacao,
  notificarParticipantesExcluindoDevs,
  fetchMembrosProjeto,
} from "../lib/api";
import { EditRequirementModal } from "../components/EditRequirementModal";
import { ConfirmDeleteDialog } from "../components/ConfirmDeleteDialog";
import type { RequisitoComProjeto, Requisito, RequisitoVoto } from "../lib/types";
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

export function RequirementDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [requirement, setRequirement] = useState<RequisitoComProjeto | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Votação por Consenso
  const [votes, setVotes] = useState<RequisitoVoto[]>([]);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [voteDialogOpen, setVoteDialogOpen] = useState(false);
  const [selectedVoteOption, setSelectedVoteOption] = useState<'Aprovado' | 'Rejeitado' | null>(null);
  const [voteJustification, setVoteJustification] = useState("");
  const [voteError, setVoteError] = useState<string | null>(null);

  // Edição (RF07) e exclusão (RF08)
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const userDataString = localStorage.getItem("scopemaster_user");
  const userData = userDataString ? JSON.parse(userDataString) : null;
  const currentUserId: string = userData?.id || "";
  const currentUserName: string = userData?.name || "Cliente";
  const currentUserRole: string = userData?.role || "";

  // RN006 — Cliente não cria/edita/exclui requisitos
  const podeEditarOuExcluir = currentUserRole !== "Cliente";

  const carregarDados = async (showLoading = true) => {
    if (!id) return;
    try {
      if (showLoading) setLoading(true);
      const data = await fetchRequisitoPorId(id);
      setRequirement(data);
      if (data) {
        const [votosData, membrosData] = await Promise.all([
          fetchVotosRequisito(data.id_requisito),
          fetchMembrosProjeto(data.id_projeto),
        ]);
        setVotes(votosData);
        setProjectMembers(membrosData);
      }
    } catch (err) {
      console.error("Erro ao carregar dados do requisito:", err);
      toast.error("Falha ao carregar dados do requisito.");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados(true);
  }, [id]);

  const abrirDialogoVoto = (opcao: 'Aprovado' | 'Rejeitado') => {
    setSelectedVoteOption(opcao);
    const rodadaVigente = requirement?.rodada_votacao || 1;
    const votoExistente = votes.find(
      (v) => v.id_usuario === currentUserId && v.rodada === rodadaVigente
    );
    setVoteJustification(votoExistente ? votoExistente.justificativa : "");
    setVoteError(null);
    setVoteDialogOpen(true);
  };

  const handleSubmeterVoto = async () => {
    if (!requirement || !selectedVoteOption) return;

    if (!voteJustification.trim()) {
      setVoteError("A justificativa é obrigatória para registrar seu voto.");
      return;
    }

    try {
      setUpdating(true);
      const rodadaVigente = requirement.rodada_votacao || 1;

      // 1. Registrar o voto
      await registrarVotoRequisito({
        id_requisito: requirement.id_requisito,
        id_usuario: currentUserId,
        voto: selectedVoteOption,
        justificativa: voteJustification.trim(),
        rodada: rodadaVigente,
      });

      // 2. Buscar dados atualizados
      const [votosAtualizados, membrosProjeto] = await Promise.all([
        fetchVotosRequisito(requirement.id_requisito),
        fetchMembrosProjeto(requirement.id_projeto),
      ]);

      // 3. Filtrar votantes elegíveis (Apenas Cliente)
      const votantesElegiveis = membrosProjeto.filter(
        (m) =>
          m.usuario &&
          m.usuario.perfil === "Cliente"
      );
      const N = votantesElegiveis.length;
      const threshold = Math.floor(N / 2) + 1;

      // Votos elegíveis na rodada atual
      const votosRodada = votosAtualizados.filter(
        (v) =>
          v.rodada === rodadaVigente &&
          votantesElegiveis.some((e) => e.id_usuario === v.id_usuario)
      );

      const aprovados = votosRodada.filter((v) => v.voto === "Aprovado");
      const rejeitados = votosRodada.filter((v) => v.voto === "Rejeitado");

      let statusAtualizado = requirement.status_validacao;
      let feedbackAtualizado = requirement.feedback_validacao;
      let novaRodada = rodadaVigente;

      if (aprovados.length >= threshold) {
        // Aprovado por maioria!
        statusAtualizado = "Aprovado";
        feedbackAtualizado = null;
        await atualizarStatusRequisito(requirement.id_requisito, "Aprovado", null);
        await notificarMembrosProjeto(
          requirement.id_projeto,
          currentUserId,
          `O requisito ${requirement.codigo} foi APROVADO por maioria absoluta dos votos (Rodada ${rodadaVigente}).`,
          "requisito_aprovado"
        );
        toast.success("Requisito aprovado por maioria absoluta dos votos!");
        setVoteDialogOpen(false);
      } else if (rejeitados.length >= threshold) {
        // Rejeitado por maioria!
        statusAtualizado = "Rejeitado";
        // Compilar as justificativas de rejeição para mostrar ao analista/desenvolvedor
        const compilado = rejeitados
          .map((v) => `${v.usuario?.nome || "Cliente"}: ${v.justificativa}`)
          .join("\n");
        feedbackAtualizado = compilado;
        await atualizarStatusRequisito(requirement.id_requisito, "Rejeitado", compilado);
        await notificarMembrosProjeto(
          requirement.id_projeto,
          currentUserId,
          `O requisito ${requirement.codigo} foi REJEITADO por maioria absoluta dos votos (Rodada ${rodadaVigente}).`,
          "requisito_rejeitado"
        );
        toast.success("Requisito rejeitado por maioria absoluta dos votos.");
        setVoteDialogOpen(false);
      } else if (votosRodada.length === N) {
        // Empate ou Sem Maioria (todos votaram, mas nenhum atingiu a maioria absoluta)
        novaRodada = rodadaVigente + 1;
        await atualizarRodadaVotacao(requirement.id_requisito, novaRodada);
        
        // Notificar todos os participantes (menos desenvolvedor) sobre o empate
        const msgNotificacao = `Empate na votação do requisito ${requirement.codigo}. Uma nova rodada (Rodada ${novaRodada}) foi iniciada. Veja a opinião de todos e vote novamente.`;
        await notificarParticipantesExcluindoDevs(requirement.id_projeto, msgNotificacao, "voto_empate");

        statusAtualizado = "Pendente";
        feedbackAtualizado = null;

        toast.info(
          `Houve um empate na votação (Rodada ${rodadaVigente})! Todos os participantes do projeto foram notificados para iniciar a Rodada ${novaRodada}.`
        );
        setVoteDialogOpen(false);
      } else {
        // Voto registrado com sucesso, mas a votação ainda está pendente de outros votos
        toast.success(`Voto registrado com sucesso para a Rodada ${rodadaVigente}. Aguardando os demais votos.`);
        setVoteDialogOpen(false);
      }

      // 4. Recarregar todos os dados da tela
      await carregarDados(false);
    } catch (err) {
      console.error("Erro ao processar voto:", err);
      const msg = err instanceof Error ? err.message : "Falha ao registrar voto.";
      setVoteError(msg);
    } finally {
      setUpdating(false);
    }
  };

  const handleRequisitoSalvo = (atualizado: Requisito) => {
    setRequirement((prev) => (prev ? { ...prev, ...atualizado } : prev));
    carregarDados(false);
    if (atualizado.status_validacao !== requirement?.status_validacao) {
      toast.info(
        'O status do requisito foi retornado para "Pendente" para nova validação (RN004).'
      );
    } else {
      toast.success("Requisito atualizado com sucesso.");
    }
  };

  const handleExcluirRequisito = async () => {
    if (!requirement) return;
    try {
      await excluirRequisito(requirement.id_requisito);
      if (requirement.id_projeto) {
        await notificarMembrosProjeto(
          requirement.id_projeto,
          currentUserId,
          `${currentUserName} excluiu o requisito ${requirement.codigo}.`,
          "requisito_excluido"
        );
      }
      toast.success("Requisito excluído.");
      navigate("/requirements");
    } catch (err) {
      console.error("Erro ao excluir requisito:", err);
      toast.error("Falha ao excluir o requisito.");
    }
  };

  if (loading) {
    return (
      <div className="sm-dash items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#d2bbff]" />
        <span className="ml-3 text-[#ccc3d8]">Carregando requisito...</span>
      </div>
    );
  }

  if (!requirement) {
    return (
      <div className="sm-dash">
        <GlassSidebar />
        <main className="relative z-0 flex h-full flex-1 flex-col items-center justify-center px-8 text-center">
          <h2 className="text-2xl font-bold text-white">Requisito não encontrado</h2>
          <p className="mt-2 text-[#ccc3d8]">
            O requisito que você está procurando não existe.
          </p>
          <Link
            to="/requirements"
            className="sm-glass-btn mt-4 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar aos Requisitos
          </Link>
        </main>
      </div>
    );
  }

  const isAprovado = requirement.status_validacao === "Aprovado";
  const isRejeitado = requirement.status_validacao === "Rejeitado";
  const isPendente = requirement.status_validacao === "Pendente";

  // RF09 / RN006 — apenas o perfil "Cliente" pode aprovar ou rejeitar.
  // O Administrador também valida (papel de gestor pleno).
  // O Desenvolvedor NUNCA aprova nem rejeita.
  const isCliente = currentUserRole === "Cliente";
  const isAdmin = currentUserRole === "Administrador";
  const podeValidar = isPendente && isCliente;

  const votantesElegiveis = projectMembers.filter(
    (m) =>
      m.usuario &&
      m.usuario.perfil === "Cliente"
  );
  const rodadaVigente = requirement.rodada_votacao || 1;
  const votosRodada = votes.filter(
    (v) =>
      v.rodada === rodadaVigente &&
      votantesElegiveis.some((e) => e.id_usuario === v.id_usuario)
  );
  const votosAnteriores = votes.filter((v) => v.rodada < rodadaVigente);

  return (
    <div className="sm-dash">
      <GlassSidebar />

      <main className="sm-noscroll relative z-0 flex h-full min-w-0 flex-1 flex-col overflow-y-auto">
        <div className="px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-[#ccc3d8]">
            <Link to="/requirements" className="hover:text-white">
              Requisitos
            </Link>
            <span>/</span>
            <span className="truncate text-white">{requirement.codigo}</span>
          </div>

          {/* Header */}
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <Link
                  to="/requirements"
                  className="sm-glass-btn flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Link>
                <span className="text-sm font-medium text-white">{requirement.codigo}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    tipoBadge[requirement.tipo] || "bg-white/10 text-[#ccc3d8]"
                  }`}
                >
                  {requirement.tipo}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    statusBadge[requirement.status_validacao] || ""
                  }`}
                >
                  {requirement.status_validacao}
                </span>
              </div>
              <h1 className="mb-2 break-words text-2xl font-bold text-white">
                {requirement.descricao}
              </h1>
              {requirement.projeto && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#ccc3d8]">
                  <span className="flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    Projeto: {requirement.projeto.nome}
                  </span>
                  {requirement.projeto.data_criacao && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Criado em{" "}
                        {new Date(requirement.projeto.data_criacao).toLocaleDateString("pt-BR")}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-shrink-0 flex-wrap gap-2">
              {podeValidar ? (
                <>
                  <button
                    className="flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-60"
                    onClick={() => abrirDialogoVoto('Aprovado')}
                    disabled={updating}
                  >
                    <Check className="h-4 w-4" />
                    Votar Aprovar
                  </button>
                  <button
                    className="sm-glass-btn flex items-center gap-2 rounded-full border-red-400/30 px-4 py-2 text-sm font-medium text-red-300 disabled:opacity-60"
                    onClick={() => abrirDialogoVoto('Rejeitado')}
                    disabled={updating}
                  >
                    <XCircle className="h-4 w-4" />
                    Votar Rejeitar
                  </button>
                </>
              ) : isAprovado ? (
                <button
                  className="flex items-center gap-2 rounded-full bg-emerald-600/80 px-4 py-2 text-sm font-medium text-white"
                  disabled
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Aprovado
                </button>
              ) : isRejeitado ? (
                <button
                  className="flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/15 px-4 py-2 text-sm font-medium text-red-300"
                  disabled
                >
                  <XCircle className="h-4 w-4" />
                  Rejeitado
                </button>
              ) : (
                <button
                  className="flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-500/15 px-4 py-2 text-sm font-medium text-yellow-300"
                  disabled
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Pendente
                </button>
              )}
              {podeEditarOuExcluir && (
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
                      onClick={() => setEditOpen(true)}
                      className="cursor-pointer focus:bg-white/10 focus:text-white"
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar Requisito
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem
                      onClick={() => setDeleteOpen(true)}
                      className="cursor-pointer text-red-400 focus:bg-white/10 focus:text-red-300"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir Requisito
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Feedback de rejeição visível quando aplicável */}
          {isRejeitado && requirement.feedback_validacao && (
            <div className="sm-panel mt-6 border-red-400/25 bg-red-500/10 p-5">
              <h3 className="flex items-center gap-2 text-base font-semibold text-red-300">
                <MessageSquareWarning className="h-5 w-5" />
                Justificativa da Rejeição
              </h3>
              <p className="mt-2 whitespace-pre-line text-sm text-red-200/90">
                {requirement.feedback_validacao}
              </p>
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-6 lg:col-span-2">
              <div className="sm-panel p-6">
                <h3 className="text-lg font-semibold text-white">Descrição do Requisito</h3>
                <p className="mt-4 leading-relaxed text-[#e6e0ec]">{requirement.descricao}</p>
              </div>

              <div className="sm-panel p-6">
                <h3 className="text-lg font-semibold text-white">Informações Técnicas</h3>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <span className="text-xs font-medium uppercase text-[#ccc3d8]">Código</span>
                    <p className="mt-1 text-sm font-medium text-white">{requirement.codigo}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium uppercase text-[#ccc3d8]">Tipo</span>
                    <p className="mt-1 text-sm font-medium text-white">{requirement.tipo}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium uppercase text-[#ccc3d8]">
                      Status de Validação
                    </span>
                    <div className="mt-1">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          statusBadge[requirement.status_validacao] || ""
                        }`}
                      >
                        {requirement.status_validacao}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-medium uppercase text-[#ccc3d8]">
                      ID do Requisito
                    </span>
                    <p className="mt-1 font-mono text-sm text-[#ccc3d8]">
                      {requirement.id_requisito.slice(0, 8)}...
                    </p>
                  </div>
                </div>
              </div>

              {/* Painel de Votação por Consenso */}
              <div className="sm-panel p-6 mt-6">
                <div className="flex flex-col gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Votação por Consenso</h3>
                    <p className="mt-1 text-xs text-[#ccc3d8]">
                      Rodada {rodadaVigente} • Maioria absoluta necessária ({Math.floor(votantesElegiveis.length / 2) + 1} de {votantesElegiveis.length} votos)
                    </p>
                  </div>
                  <span className="self-start rounded-full bg-[#7c3aed]/15 border border-[#7c3aed]/25 px-2.5 py-1 text-xs font-semibold text-[#d2bbff] sm:self-auto">
                    Rodada {rodadaVigente}
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  <h4 className="text-sm font-semibold text-white">Status dos Votos nesta Rodada</h4>
                  {votantesElegiveis.length === 0 ? (
                    <p className="text-sm text-[#ccc3d8]">Nenhum membro do projeto (Administrador ou Cliente) elegível para votar.</p>
                  ) : (
                    <div className="space-y-3">
                      {votantesElegiveis.map((membro) => {
                        const votoMembro = votosRodada.find(v => v.id_usuario === membro.id_usuario);
                        return (
                          <div key={membro.id_usuario} className="flex flex-col justify-between gap-3 rounded-xl border border-white/5 bg-white/5 p-4 sm:flex-row sm:items-start">
                            <div className="min-w-0 flex-1">
                              <span className="text-sm font-medium text-white block">
                                {membro.usuario?.nome} {membro.id_usuario === currentUserId && "(Você)"}
                              </span>
                              <span className="text-xs text-[#ccc3d8]">
                                {membro.usuario?.perfil} • {membro.papel_no_projeto || "Participante"}
                              </span>
                              {votoMembro && (
                                <div className="mt-2 rounded-lg bg-black/35 p-3 text-xs border border-white/5 text-[#e6e0ec] break-words italic">
                                  "{votoMembro.justificativa}"
                                </div>
                              )}
                            </div>
                            <div className="flex-shrink-0">
                              {votoMembro ? (
                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border ${
                                  votoMembro.voto === 'Aprovado' 
                                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35' 
                                    : 'bg-red-500/15 text-red-300 border-red-500/35'
                                }`}>
                                  {votoMembro.voto}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-xs font-medium text-[#ccc3d8]">
                                  Pendente
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Histórico de Rodadas Anteriores */}
                {votosAnteriores.length > 0 && (
                  <div className="mt-8 border-t border-white/10 pt-6">
                    <h4 className="text-sm font-semibold text-white mb-4">Opiniões de Rodadas Anteriores</h4>
                    <div className="space-y-4">
                      {Array.from(new Set(votosAnteriores.map(v => v.rodada))).sort((a,b) => b - a).map(rodadaNum => {
                        const votosDessaRodada = votosAnteriores.filter(v => v.rodada === rodadaNum);
                        return (
                          <div key={rodadaNum} className="rounded-xl border border-white/5 bg-black/20 p-4">
                            <span className="text-xs font-bold text-[#d2bbff] uppercase">Rodada {rodadaNum}</span>
                            <div className="mt-3 space-y-2.5">
                              {votosDessaRodada.map(v => (
                                <div key={v.id_voto} className="text-xs border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-white">{v.usuario?.nome || "Membro"} ({v.usuario?.perfil})</span>
                                    <span className={v.voto === 'Aprovado' ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>{v.voto}</span>
                                  </div>
                                  <p className="mt-1 text-[#ccc3d8] italic">"{v.justificativa}"</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar de detalhes */}
            <div className="space-y-6">
              <div className="sm-panel p-6">
                <h3 className="text-lg font-semibold text-white">Detalhes</h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <span className="text-xs font-medium uppercase text-[#ccc3d8]">Projeto</span>
                    <p className="mt-1 text-sm font-medium text-white">
                      {requirement.projeto?.nome || "Desconhecido"}
                    </p>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <span className="text-xs font-medium uppercase text-[#ccc3d8]">
                      Descrição do Projeto
                    </span>
                    <p className="mt-1 text-sm text-[#ccc3d8]">
                      {requirement.projeto?.descricao || "Sem descrição"}
                    </p>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <span className="text-xs font-medium uppercase text-[#ccc3d8]">
                      Data de Criação do Projeto
                    </span>
                    <p className="mt-1 text-sm font-medium text-white">
                      {requirement.projeto
                        ? new Date(requirement.projeto.data_criacao).toLocaleDateString("pt-BR")
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="sm-panel p-6">
                <h3 className="text-lg font-semibold text-white">Tags</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-[#ccc3d8]">
                    <Tag className="h-3 w-3" />
                    {requirement.tipo}
                  </span>
                  <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-[#ccc3d8]">
                    <Tag className="h-3 w-3" />
                    {requirement.codigo}
                  </span>
                  {requirement.projeto && (
                    <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-[#ccc3d8]">
                      <Tag className="h-3 w-3" />
                      {requirement.projeto.nome}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Diálogo de Votação por Consenso (Aprovar / Rejeitar) */}
        <Dialog open={voteDialogOpen} onOpenChange={setVoteDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Votar no Requisito {requirement.codigo}: {selectedVoteOption}
              </DialogTitle>
              <DialogDescription>
                Informe a justificativa/motivo de sua escolha. Todos os membros do projeto poderão ver sua opinião.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2">
              <div className="flex gap-4">
                <button
                  type="button"
                  className={`flex-1 py-3 px-4 rounded-xl border text-sm font-semibold transition flex items-center justify-center gap-2 ${
                    selectedVoteOption === "Aprovado"
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                  }`}
                  onClick={() => setSelectedVoteOption("Aprovado")}
                >
                  <Check className="h-4 w-4" />
                  Aprovar
                </button>
                <button
                  type="button"
                  className={`flex-1 py-3 px-4 rounded-xl border text-sm font-semibold transition flex items-center justify-center gap-2 ${
                    selectedVoteOption === "Rejeitado"
                      ? "bg-red-500/15 border-red-500/40 text-red-300"
                      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                  }`}
                  onClick={() => setSelectedVoteOption("Rejeitado")}
                >
                  <XCircle className="h-4 w-4" />
                  Rejeitar
                </button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="justification">Justificativa *</Label>
                <Textarea
                  id="justification"
                  value={voteJustification}
                  onChange={(e) => {
                    setVoteJustification(e.target.value);
                    if (voteError) setVoteError(null);
                  }}
                  placeholder="Explique detalhadamente o porquê de sua escolha..."
                  rows={5}
                  className={voteError ? "border-red-400 focus-visible:ring-red-400" : ""}
                />
                {voteError && <p className="text-sm text-red-500">{voteError}</p>}
              </div>
            </div>

            <DialogFooter>
              <button
                className="sm-glass-btn rounded-full px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                onClick={() => setVoteDialogOpen(false)}
                disabled={updating}
              >
                Cancelar
              </button>
              <button
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white transition disabled:opacity-60 ${
                  selectedVoteOption === "Aprovado" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-red-600 hover:bg-red-500"
                }`}
                onClick={handleSubmeterVoto}
                disabled={updating}
              >
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando voto...
                  </>
                ) : (
                  <>Confirmar Voto</>
                )}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* RF07 — Edição de Requisito */}
        <EditRequirementModal
          open={editOpen}
          onOpenChange={setEditOpen}
          requirement={requirement}
          onSaved={handleRequisitoSalvo}
        />

        {/* RF08 — Exclusão de Requisito */}
        <ConfirmDeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Excluir Requisito"
          description={`Tem certeza que deseja excluir o requisito ${requirement.codigo}? Esta ação não pode ser desfeita.`}
          onConfirm={handleExcluirRequisito}
        />
      </main>
    </div>
  );
}
