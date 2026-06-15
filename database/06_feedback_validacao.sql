-- ============================================================
-- ScopeMaster — Migração para Sprint 3
-- Adiciona campo de feedback obrigatório na rejeição (RN007)
-- Execute este script no SQL Editor do Supabase.
-- ============================================================

ALTER TABLE public.requisito
  ADD COLUMN IF NOT EXISTS feedback_validacao TEXT;

COMMENT ON COLUMN public.requisito.feedback_validacao IS
  'Justificativa preenchida pelo cliente ao rejeitar o requisito (RN007). Obrigatório quando status_validacao = Rejeitado.';
