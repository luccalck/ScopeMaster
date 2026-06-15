import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Loader2, Search, UserPlus } from "lucide-react";
import { fetchUsuarios, adicionarMembroProjeto, notificarMembrosProjeto } from "../lib/api";
import type { Usuario } from "../lib/types";
import "../screens/dashboard-glass.css";

const inputGlass =
  "border-white/10 bg-black/30 text-white placeholder:text-[#ccc3d8]/50 focus-visible:border-[#7c3aed]/60 focus-visible:ring-[#7c3aed]/30";

interface AddMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  currentMemberIds: string[]; // IDs de membros já no projeto
  onAdded: () => void;
}

export function AddMemberModal({
  open,
  onOpenChange,
  projectId,
  currentMemberIds,
  onAdded,
}: AddMemberModalProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [papel, setPapel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (open) {
      const carregar = async () => {
        try {
          setLoadingUsuarios(true);
          const data = await fetchUsuarios();
          setUsuarios(data);
        } catch (err) {
          console.error("Erro ao carregar usuários:", err);
        } finally {
          setLoadingUsuarios(false);
        }
      };
      carregar();
      // Reset
      setSelectedUserId("");
      setPapel("");
      setError("");
      setSearchTerm("");
    }
  }, [open]);

  const getInitials = (nome: string) =>
    nome
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  // Filtrar usuários que NÃO estão no projeto e pelo termo de busca
  const availableUsers = usuarios.filter(
    (u) =>
      !currentMemberIds.includes(u.id_usuario) &&
      u.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedUser = usuarios.find((u) => u.id_usuario === selectedUserId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedUserId) {
      setError("Selecione um usuário.");
      return;
    }
    if (!papel.trim()) {
      setError("Informe o papel do membro no projeto.");
      return;
    }

    try {
      setIsSubmitting(true);
      await adicionarMembroProjeto(projectId, selectedUserId, papel.trim());

      // Notificar membros do projeto
      const userDataString = localStorage.getItem("scopemaster_user");
      const userData = userDataString ? JSON.parse(userDataString) : null;
      const currentUserId = userData?.id || "";
      const currentUserName = userData?.name || "Alguém";
      const nomeUsuarioAdd = usuarios.find(u => u.id_usuario === selectedUserId)?.nome || "Um novo membro";

      await notificarMembrosProjeto(
        projectId,
        currentUserId,
        `${currentUserName} adicionou ${nomeUsuarioAdd} ao projeto.`,
        "membro_adicionado"
      );

      onOpenChange(false);
      onAdded();
    } catch (err) {
      console.error("Erro ao adicionar membro:", err);
      setError("Erro ao adicionar membro. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto border-white/10 bg-[#201e27] text-[#e6e0ec]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7c3aed]/15">
              <UserPlus className="h-5 w-5 text-[#d2bbff]" />
            </div>
            Adicionar Membro
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          {error && (
            <div className="rounded-lg border border-red-400/25 bg-red-500/10 p-3">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Buscar usuário */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#ccc3d8]">Buscar Usuário</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#ccc3d8]" />
              <Input
                type="search"
                placeholder="Buscar por nome..."
                className={`pl-10 ${inputGlass}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Lista de usuários disponíveis */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#ccc3d8]">Selecionar Usuário</Label>
            {loadingUsuarios ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-[#d2bbff]" />
                <span className="ml-2 text-sm text-[#ccc3d8]">Carregando...</span>
              </div>
            ) : availableUsers.length === 0 ? (
              <p className="rounded-lg border border-dashed border-white/15 py-4 text-center text-sm text-[#ccc3d8]">
                {searchTerm
                  ? "Nenhum usuário encontrado com esse nome."
                  : "Todos os usuários já são membros deste projeto."}
              </p>
            ) : (
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-white/10 p-2">
                {availableUsers.map((user) => (
                  <div
                    key={user.id_usuario}
                    onClick={() => setSelectedUserId(user.id_usuario)}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-all ${
                      selectedUserId === user.id_usuario
                        ? "border border-[#7c3aed]/50 bg-white/10"
                        : "border border-transparent hover:bg-white/5"
                    }`}
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-gradient-to-br from-[#7c3aed] to-[#4cd7f6] text-xs font-bold text-white">
                        {getInitials(user.nome)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">{user.nome}</p>
                      <p className="text-xs text-[#ccc3d8]">{user.email}</p>
                    </div>
                    <span className="rounded bg-white/10 px-2 py-1 text-xs font-medium text-[#ccc3d8]">
                      {user.perfil}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Papel no projeto */}
          <div className="space-y-2">
            <Label htmlFor="papel" className="text-sm font-medium text-[#ccc3d8]">
              Papel no Projeto
            </Label>
            <Input
              id="papel"
              value={papel}
              onChange={(e) => setPapel(e.target.value)}
              placeholder="Ex: Desenvolvedor Backend, Product Owner, QA..."
              className={inputGlass}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Resumo do selecionado */}
          {selectedUser && (
            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-[#7c3aed] to-[#4cd7f6] text-xs font-bold text-white">
                  {getInitials(selectedUser.nome)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-white">{selectedUser.nome}</p>
                <p className="text-xs text-[#ccc3d8]">{selectedUser.email}</p>
              </div>
            </div>
          )}

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
              className="sm-primary-btn flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
              disabled={isSubmitting || !selectedUserId}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adicionando...
                </>
              ) : (
                "Adicionar Membro"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
