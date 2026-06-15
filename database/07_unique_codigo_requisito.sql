-- ============================================================
-- ScopeMaster — Migração para Sprint 3
-- Garante a Regra de Negócio RN002: Unicidade de Código
-- (não permite dois requisitos com o mesmo código em um mesmo projeto)
-- Execute este script no SQL Editor do Supabase.
-- ============================================================

-- Antes de criar a constraint, removemos eventuais duplicatas residuais.
WITH ranked AS (
  SELECT
    id_requisito,
    ROW_NUMBER() OVER (PARTITION BY id_projeto, codigo ORDER BY id_requisito) AS rn
  FROM public.requisito
)
DELETE FROM public.requisito
WHERE id_requisito IN (SELECT id_requisito FROM ranked WHERE rn > 1);

-- Constraint que enforce RN002 a nível de banco.
ALTER TABLE public.requisito
  DROP CONSTRAINT IF EXISTS requisito_codigo_projeto_unico;

ALTER TABLE public.requisito
  ADD CONSTRAINT requisito_codigo_projeto_unico
  UNIQUE (id_projeto, codigo);

COMMENT ON CONSTRAINT requisito_codigo_projeto_unico ON public.requisito IS
  'RN002 — Unicidade de Código: não permite dois requisitos com o mesmo código identificador em um mesmo projeto.';
