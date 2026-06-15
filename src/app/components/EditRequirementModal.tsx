import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Loader2, AlertTriangle } from "lucide-react";
import { atualizarRequisito, CodigoRequisitoDuplicadoError } from "../lib/api";
import type { Requisito, TipoRequisito } from "../lib/types";
import "../screens/dashboard-glass.css";

const inputGlass =
  "border-white/10 bg-black/30 text-white placeholder:text-[#ccc3d8]/50 focus-visible:border-[#7c3aed]/60 focus-visible:ring-[#7c3aed]/30";
const selectContentGlass = "border-white/10 bg-[#201e27] text-[#e6e0ec]";

interface EditRequirementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requirement: Requisito;
  onSaved: (atualizado: Requisito) => void;
}

/**
 * Modal de edição de requisito (RF07).
 * Implementa também a RN004: ao editar um requisito "Aprovado",
 * o sistema avisa o usuário que o status voltará para "Pendente".
 */
export function EditRequirementModal({
  open,
  onOpenChange,
  requirement,
  onSaved,
}: EditRequirementModalProps) {
  const [codigo, setCodigo] = useState(requirement.codigo);
  const [descricao, setDescricao] = useState(requirement.descricao);
  const [tipo, setTipo] = useState<TipoRequisito>(requirement.tipo);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setCodigo(requirement.codigo);
      setDescricao(requirement.descricao);
      setTipo(requirement.tipo);
      setError(null);
    }
  }, [open, requirement]);

  const eraAprovado = requirement.status_validacao === "Aprovado";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!codigo.trim() || !descricao.trim()) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setSaving(true);
      const atualizado = await atualizarRequisito(requirement.id_requisito, {
        codigo: codigo.trim(),
        descricao: descricao.trim(),
        tipo,
      });
      onSaved(atualizado);
      onOpenChange(false);
    } catch (err) {
      console.error("Erro ao editar requisito:", err);
      if (err instanceof CodigoRequisitoDuplicadoError) {
        setError(err.message);
      } else {
        setError("Falha ao salvar a edição. Tente novamente.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-white/10 bg-[#201e27] text-[#e6e0ec]">
        <DialogHeader>
          <DialogTitle className="text-white">Editar Requisito {requirement.codigo}</DialogTitle>
          <DialogDescription className="text-[#ccc3d8]">
            Atualize os atributos do requisito. As alterações serão persistidas no
            banco de dados.
          </DialogDescription>
        </DialogHeader>

        {eraAprovado && (
          <div className="flex items-start gap-2 rounded-md border border-amber-400/25 bg-amber-500/10 p-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" />
            <div className="text-sm text-amber-200/90">
              Este requisito está com status <strong>"Aprovado"</strong>. Ao salvar
              esta edição o status retornará automaticamente para{" "}
              <strong>"Pendente"</strong> e o cliente precisará revalidá-lo
              (RN004).
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-2 space-y-4">
          {error && (
            <div className="rounded-md border border-red-400/25 bg-red-500/10 p-3">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-codigo" className="text-[#ccc3d8]">Código *</Label>
            <Input
              id="edit-codigo"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ex.: RF01"
              className={inputGlass}
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-descricao" className="text-[#ccc3d8]">Descrição *</Label>
            <Textarea
              id="edit-descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={5}
              className={inputGlass}
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[#ccc3d8]">Tipo *</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as TipoRequisito)}>
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

          <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="sm-glass-btn rounded-full px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2 text-sm font-medium text-[#231400] transition hover:bg-amber-400 disabled:opacity-60"
              disabled={saving}
            >
              {saving ? (
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
