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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Loader2 } from "lucide-react";
import { fetchProjetos, criarRequisito, CodigoRequisitoDuplicadoError } from "../lib/api";
import type { Projeto, TipoRequisito } from "../lib/types";
import "../screens/dashboard-glass.css";

// Classes reutilizadas para os campos no estilo glass
const inputGlass =
  "border-white/10 bg-black/30 text-white placeholder:text-[#ccc3d8]/50 focus-visible:border-[#7c3aed]/60 focus-visible:ring-[#7c3aed]/30";
const selectContentGlass = "border-white/10 bg-[#201e27] text-[#e6e0ec]";

interface CreateRequirementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Quando informado, o projeto vem pré-selecionado e o seletor fica bloqueado.
   * Usado quando o modal é aberto a partir do painel de um projeto específico.
   */
  preselectedProjectId?: string;
  /** Callback opcional disparado após criar com sucesso (ex: recarregar painel) */
  onCreated?: () => void;
}

export function CreateRequirementModal({
  open,
  onOpenChange,
  preselectedProjectId,
  onCreated,
}: CreateRequirementModalProps) {
  const [codigo, setCodigo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [projetoId, setProjetoId] = useState(preselectedProjectId || "");
  const [tipo, setTipo] = useState<TipoRequisito | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loadingProjetos, setLoadingProjetos] = useState(false);

  useEffect(() => {
    if (open) {
      // Sincroniza o projeto pré-selecionado sempre que o modal abrir
      if (preselectedProjectId) {
        setProjetoId(preselectedProjectId);
      }
      const carregar = async () => {
        try {
          setLoadingProjetos(true);
          const data = await fetchProjetos();
          setProjetos(data);
        } catch (err) {
          console.error("Erro ao carregar projetos:", err);
        } finally {
          setLoadingProjetos(false);
        }
      };
      carregar();
    }
  }, [open, preselectedProjectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!codigo.trim() || !descricao.trim() || !projetoId || !tipo) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setIsSubmitting(true);
      await criarRequisito({
        id_projeto: projetoId,
        codigo: codigo.trim(),
        tipo: tipo as TipoRequisito,
        descricao: descricao.trim(),
      });
      onOpenChange(false);
      // Reset form (mantém o projeto pré-selecionado se houver)
      setCodigo("");
      setDescricao("");
      setProjetoId(preselectedProjectId || "");
      setTipo("");
      onCreated?.();
    } catch (err) {
      console.error("Erro ao criar requisito:", err);
      if (err instanceof CodigoRequisitoDuplicadoError) {
        // A3 — Código de Requisito Duplicado / RN002
        setError(err.message);
      } else {
        setError("Erro ao criar o requisito. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-white/10 bg-[#201e27] text-[#e6e0ec]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Criar Novo Requisito
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          {error && (
            <div className="rounded-lg border border-red-400/25 bg-red-500/10 p-3">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="codigo" className="text-sm font-medium text-[#ccc3d8]">
              Código
            </Label>
            <Input
              id="codigo"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ex: RF01, RNF02"
              className={inputGlass}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao" className="text-sm font-medium text-[#ccc3d8]">
              Descrição
            </Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o requisito em detalhes"
              className={`min-h-[120px] ${inputGlass}`}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#ccc3d8]">Projeto</Label>
              <Select
                value={projetoId}
                onValueChange={setProjetoId}
                required
                disabled={!!preselectedProjectId}
              >
                <SelectTrigger className={inputGlass}>
                  <SelectValue placeholder={loadingProjetos ? "Carregando..." : "Selecione o projeto"} />
                </SelectTrigger>
                <SelectContent className={selectContentGlass}>
                  {projetos.map((proj) => (
                    <SelectItem key={proj.id_projeto} value={proj.id_projeto} className="focus:bg-white/10">
                      {proj.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {preselectedProjectId && (
                <p className="text-xs text-[#ccc3d8]/70">
                  Requisito será cadastrado neste projeto.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#ccc3d8]">Tipo</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as TipoRequisito)} required>
                <SelectTrigger className={inputGlass}>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className={selectContentGlass}>
                  <SelectItem value="Funcional" className="focus:bg-white/10">
                    Funcional
                  </SelectItem>
                  <SelectItem value="Não Funcional" className="focus:bg-white/10">
                    Não Funcional
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Requisito"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
