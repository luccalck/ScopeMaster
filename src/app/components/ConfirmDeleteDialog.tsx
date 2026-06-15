import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";
import "../screens/dashboard-glass.css";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => Promise<void>;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirm();
      onOpenChange(false);
    } catch (err) {
      console.error("Erro ao excluir:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-white/10 bg-[#201e27] text-[#e6e0ec]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2">
          <p className="text-sm leading-relaxed text-[#ccc3d8]">{description}</p>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="sm-glass-btn rounded-full px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
            disabled={isDeleting}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="flex items-center gap-2 rounded-full bg-red-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-60"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Confirmar Exclusão"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
