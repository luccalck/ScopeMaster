import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { criarProjeto } from "../lib/api";
import { Loader2 } from "lucide-react";
import "../screens/dashboard-glass.css";

const inputGlass =
  "border-white/10 bg-black/30 text-white placeholder:text-[#ccc3d8]/50 focus-visible:border-[#7c3aed]/60 focus-visible:ring-[#7c3aed]/30";

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectModal({
  open,
  onOpenChange,
}: CreateProjectModalProps) {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!projectName.trim()) {
      setError("O nome do projeto é obrigatório.");
      return;
    }

    try {
      setIsSubmitting(true);
      await criarProjeto(projectName.trim(), description.trim());
      onOpenChange(false);
      // Reset form
      setProjectName("");
      setDescription("");
    } catch (err) {
      console.error("Erro ao criar projeto:", err);
      setError("Erro ao criar o projeto. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-white/10 bg-[#201e27] text-[#e6e0ec]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Criar Novo Projeto
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          {error && (
            <div className="rounded-lg border border-red-400/25 bg-red-500/10 p-3">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="projectName" className="text-sm font-medium text-[#ccc3d8]">
              Nome do Projeto
            </Label>
            <Input
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Digite o nome do projeto"
              className={inputGlass}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-[#ccc3d8]">
              Descrição
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o objetivo e escopo do projeto"
              className={`min-h-[100px] ${inputGlass}`}
              disabled={isSubmitting}
            />
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
                "Criar Projeto"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
