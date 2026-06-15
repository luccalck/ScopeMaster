import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Loader2, UserMinus, UserPlus, Search, Pencil } from "lucide-react";
import {
  atualizarProjeto,
  fetchUsuarios,
  fetchMembrosProjeto,
  adicionarMembroProjeto,
  removerMembroProjeto,
  notificarMembrosProjeto,
} from "../lib/api";
import type { Usuario, ProjetoUsuario } from "../lib/types";
import "../screens/dashboard-glass.css";

const inputGlass =
  "border-white/10 bg-black/30 text-white placeholder:text-[#ccc3d8]/50 focus-visible:border-[#7c3aed]/60 focus-visible:ring-[#7c3aed]/30";

interface EditProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: {
    id_projeto: string;
    nome: string;
    descricao: string | null;
  } | null;
  onSaved: () => void;
}

export function EditProjectModal({
  open,
  onOpenChange,
  project,
  onSaved,
}: EditProjectModalProps) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Membros
  const [membros, setMembros] = useState<(ProjetoUsuario & { usuario?: Usuario })[]>([]);
  const [todosUsuarios, setTodosUsuarios] = useState<Usuario[]>([]);
  const [loadingMembros, setLoadingMembros] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);
  const [novoPapel, setNovoPapel] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [addingMember, setAddingMember] = useState(false);

  // Obter dados do usuário logado
  const userDataString = localStorage.getItem("scopemaster_user");
  const userData = userDataString ? JSON.parse(userDataString) : null;
  const currentUserId = userData?.id || "";
  const currentUserName = userData?.name || "Alguém";

  // Preencher campos quando o projeto mudar
  useEffect(() => {
    if (project && open) {
      setNome(project.nome);
      setDescricao(project.descricao || "");
      setShowAddMember(false);
      setSearchUser("");
      setNovoPapel("");
      setSelectedUserId("");
      carregarDados();
    }
  }, [project, open]);

  const carregarDados = async () => {
    if (!project) return;
    try {
      setLoadingMembros(true);
      const [membrosData, usuariosData] = await Promise.all([
        fetchMembrosProjeto(project.id_projeto),
        fetchUsuarios(),
      ]);
      setMembros(membrosData);
      setTodosUsuarios(usuariosData);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoadingMembros(false);
    }
  };

  const getInitials = (nome: string) =>
    nome
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const usuariosDisponiveis = todosUsuarios.filter(
    (u) =>
      !membros.some((m) => m.id_usuario === u.id_usuario) &&
      u.nome.toLowerCase().includes(searchUser.toLowerCase())
  );

  const handleAdicionarMembro = async () => {
    if (!project || !selectedUserId || !novoPapel.trim()) return;
    try {
      setAddingMember(true);
      await adicionarMembroProjeto(project.id_projeto, selectedUserId, novoPapel.trim());

      // Criar notificação
      const nomeUsuarioAdd = todosUsuarios.find(u => u.id_usuario === selectedUserId)?.nome || "Um novo membro";
      await notificarMembrosProjeto(
        project.id_projeto,
        currentUserId,
        `${currentUserName} adicionou ${nomeUsuarioAdd} ao projeto "${project.nome}".`,
        "membro_adicionado"
      );

      setSelectedUserId("");
      setNovoPapel("");
      setShowAddMember(false);
      await carregarDados();
    } catch (err) {
      console.error("Erro ao adicionar membro:", err);
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoverMembro = async (idUsuario: string) => {
    if (!project) return;
    const membroNome = membros.find(m => m.id_usuario === idUsuario)?.usuario?.nome || "Um membro";
    try {
      await removerMembroProjeto(project.id_projeto, idUsuario);

      await notificarMembrosProjeto(
        project.id_projeto,
        currentUserId,
        `${currentUserName} removeu ${membroNome} do projeto "${project.nome}".`,
        "membro_removido"
      );

      await carregarDados();
    } catch (err) {
      console.error("Erro ao remover membro:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nome.trim()) {
      setError("O nome do projeto é obrigatório.");
      return;
    }

    if (!project) return;

    try {
      setIsSubmitting(true);
      await atualizarProjeto(project.id_projeto, {
        nome: nome.trim(),
        descricao: descricao.trim(),
      });

      // Notificar membros sobre a edição
      await notificarMembrosProjeto(
        project.id_projeto,
        currentUserId,
        `${currentUserName} editou o projeto "${nome.trim()}".`,
        "projeto_editado"
      );

      onOpenChange(false);
      onSaved();
    } catch (err) {
      console.error("Erro ao atualizar projeto:", err);
      setError("Erro ao atualizar o projeto. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-white/10 bg-[#201e27] text-[#e6e0ec]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/15">
              <Pencil className="h-5 w-5 text-amber-400" />
            </div>
            Editar Projeto
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          {error && (
            <div className="rounded-lg border border-red-400/25 bg-red-500/10 p-3">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Nome do Projeto */}
          <div className="space-y-2">
            <Label htmlFor="editProjectName" className="text-sm font-medium text-[#ccc3d8]">
              Nome do Projeto
            </Label>
            <Input
              id="editProjectName"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite o nome do projeto"
              className={inputGlass}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="editDescription" className="text-sm font-medium text-[#ccc3d8]">
              Descrição
            </Label>
            <Textarea
              id="editDescription"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o objetivo e escopo do projeto"
              className={`min-h-[100px] ${inputGlass}`}
              disabled={isSubmitting}
            />
          </div>

          {/* Membros da Equipe */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-[#ccc3d8]">
                Membros da Equipe ({membros.length})
              </Label>
              <button
                type="button"
                className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-[#d2bbff] transition-colors hover:bg-white/5"
                onClick={() => setShowAddMember(!showAddMember)}
              >
                <UserPlus className="h-4 w-4" />
                {showAddMember ? "Cancelar" : "Adicionar"}
              </button>
            </div>

            {/* Adicionar membro inline */}
            {showAddMember && (
              <div className="space-y-3 rounded-lg border border-white/10 bg-black/20 p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#ccc3d8]" />
                  <Input
                    type="search"
                    placeholder="Buscar usuário por nome..."
                    className={`pl-10 ${inputGlass}`}
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                  />
                </div>

                {usuariosDisponiveis.length > 0 ? (
                  <div className="max-h-32 space-y-1 overflow-y-auto">
                    {usuariosDisponiveis.map((user) => (
                      <div
                        key={user.id_usuario}
                        onClick={() => setSelectedUserId(user.id_usuario)}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg p-2 text-sm transition-all ${
                          selectedUserId === user.id_usuario
                            ? "border border-[#7c3aed]/50 bg-white/10"
                            : "border border-transparent hover:bg-white/5"
                        }`}
                      >
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="bg-gradient-to-br from-[#7c3aed] to-[#4cd7f6] text-xs font-bold text-white">
                            {getInitials(user.nome)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-white">{user.nome}</span>
                        <span className="ml-auto text-xs text-[#ccc3d8]">{user.perfil}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-2 text-center text-xs text-[#ccc3d8]">
                    Nenhum usuário disponível.
                  </p>
                )}

                {selectedUserId && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Papel no projeto (ex: Dev Backend)"
                      className={`flex-1 ${inputGlass}`}
                      value={novoPapel}
                      onChange={(e) => setNovoPapel(e.target.value)}
                    />
                    <button
                      type="button"
                      className="sm-primary-btn flex items-center rounded-full px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                      onClick={handleAdicionarMembro}
                      disabled={addingMember || !novoPapel.trim()}
                    >
                      {addingMember ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Adicionar"
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Lista de membros atuais */}
            {loadingMembros ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-[#d2bbff]" />
                <span className="ml-2 text-sm text-[#ccc3d8]">Carregando membros...</span>
              </div>
            ) : membros.length === 0 ? (
              <p className="rounded-lg border border-dashed border-white/15 py-4 text-center text-sm text-[#ccc3d8]">
                Nenhum membro associado a este projeto.
              </p>
            ) : (
              <div className="space-y-2">
                {membros.map((member, i) => (
                  <div
                    key={i}
                    className="group flex items-center gap-3 rounded-lg border border-white/10 p-3 transition-colors hover:border-white/20"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-gradient-to-br from-[#7c3aed] to-[#4cd7f6] text-xs font-bold text-white">
                        {member.usuario ? getInitials(member.usuario.nome) : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">
                        {member.usuario?.nome || "Desconhecido"}
                      </p>
                      <p className="text-xs text-[#ccc3d8]">{member.papel_no_projeto}</p>
                    </div>
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-red-400 opacity-0 transition-opacity hover:bg-red-500/10 hover:text-red-300 group-hover:opacity-100"
                      onClick={() => handleRemoverMembro(member.id_usuario)}
                    >
                      <UserMinus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="sm-glass-btn rounded-full px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2 text-sm font-medium text-[#231400] transition hover:bg-amber-400 disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
