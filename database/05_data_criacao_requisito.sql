-- ============================================================
-- ScopeMaster — Migração para Sprint 3
-- Adiciona campo de data de criação no requisito.
-- Permite ordenar a lista de "Requisitos Recentes" no Dashboard.
-- Execute este script no SQL Editor do Supabase.
-- ============================================================

ALTER TABLE public.requisito
  ADD COLUMN IF NOT EXISTS data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

COMMENT ON COLUMN public.requisito.data_criacao IS
  'Data e hora em que o requisito foi cadastrado. Usado para ordenação cronológica nas listagens.';

-- Para os registros já existentes, preenche com a data atual (ou poderia ser
-- a data do projeto pai, se preferir manter coerência histórica).
-- O DEFAULT já cuidou disso para inserções, esta linha é defensiva para bancos
-- que tinham a coluna NULL antes.
UPDATE public.requisito
   SET data_criacao = now()
 WHERE data_criacao IS NULL;
