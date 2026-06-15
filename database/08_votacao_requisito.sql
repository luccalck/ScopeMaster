-- =============================================
-- Votação por consenso de requisitos
-- Execute este SQL no Editor SQL do Supabase Dashboard
-- (https://supabase.com/dashboard → seu projeto → SQL Editor)
--
-- Regras (definidas pelo produto):
--  - Votam apenas membros com perfil 'Administrador' ou 'Cliente'.
--  - Ao votar (Aprovado/Rejeitado) a justificativa é OBRIGATÓRIA.
--  - O requisito só muda de status com MAIORIA ABSOLUTA dos votantes.
--  - Empate (todos votaram, sem maioria) abre uma NOVA RODADA, zerando a
--    contagem (os votos antigos ficam guardados apenas como histórico).
-- A apuração da maioria é feita na camada da aplicação (chave anon, sem
-- backend), seguindo o mesmo modelo das demais regras do sistema.
-- =============================================

-- 1. Rodada de votação atual de cada requisito
--    Votos são contados sempre pela rodada vigente; ao empatar, a aplicação
--    incrementa este valor para reiniciar a votação.
ALTER TABLE requisito
  ADD COLUMN IF NOT EXISTS rodada_votacao INT NOT NULL DEFAULT 1;

-- 2. Tabela de votos
--    Um voto por usuário por requisito EM CADA rodada (UNIQUE garante isso e
--    permite o "upsert" quando o usuário ajusta o próprio voto na rodada).
CREATE TABLE IF NOT EXISTS requisito_voto (
  id_voto       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_requisito  UUID NOT NULL REFERENCES requisito(id_requisito) ON DELETE CASCADE,
  id_usuario    UUID NOT NULL REFERENCES usuario(id_usuario)     ON DELETE CASCADE,
  voto          TEXT NOT NULL CHECK (voto IN ('Aprovado', 'Rejeitado')),
  justificativa TEXT NOT NULL,
  rodada        INT  NOT NULL DEFAULT 1,
  data_criacao  TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT uq_voto_requisito_usuario_rodada
    UNIQUE (id_requisito, id_usuario, rodada)
);

-- Índice para buscar rapidamente os votos de um requisito numa rodada
CREATE INDEX IF NOT EXISTS idx_voto_req_rodada
  ON requisito_voto (id_requisito, rodada);

-- 3. Habilitar RLS
ALTER TABLE requisito_voto ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de acesso para o role anon
--    (mesmo modelo das outras tabelas: a verificação de perfil/permissão é
--     feita na camada da aplicação)
DROP POLICY IF EXISTS "Permitir leitura de votos" ON requisito_voto;
CREATE POLICY "Permitir leitura de votos"
  ON requisito_voto FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Permitir inserção de votos" ON requisito_voto;
CREATE POLICY "Permitir inserção de votos"
  ON requisito_voto FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualização de votos" ON requisito_voto;
CREATE POLICY "Permitir atualização de votos"
  ON requisito_voto FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir exclusão de votos" ON requisito_voto;
CREATE POLICY "Permitir exclusão de votos"
  ON requisito_voto FOR DELETE
  TO anon
  USING (true);
