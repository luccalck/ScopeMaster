-- =============================================
-- Políticas de RLS para permitir leitura pública
-- Execute este SQL no Editor SQL do Supabase Dashboard
-- (https://supabase.com/dashboard → seu projeto → SQL Editor)
-- =============================================

-- 1. Habilitar RLS (caso ainda não esteja habilitado)
ALTER TABLE usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE projeto ENABLE ROW LEVEL SECURITY;
ALTER TABLE requisito ENABLE ROW LEVEL SECURITY;
ALTER TABLE projeto_usuario ENABLE ROW LEVEL SECURITY;

-- 2. Políticas de LEITURA (SELECT) para o role anon
-- Permite que a chave anon (frontend) leia todos os registros

CREATE POLICY "Permitir leitura pública de usuários"
  ON usuario FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Permitir leitura pública de projetos"
  ON projeto FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Permitir leitura pública de requisitos"
  ON requisito FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Permitir leitura pública de projeto_usuario"
  ON projeto_usuario FOR SELECT
  TO anon
  USING (true);

-- 3. Políticas de INSERÇÃO (INSERT) para o role anon
-- Permite criar novos registros pelo frontend

CREATE POLICY "Permitir inserção pública de usuários"
  ON usuario FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Permitir inserção pública de projetos"
  ON projeto FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Permitir inserção pública de requisitos"
  ON requisito FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Permitir inserção pública de projeto_usuario"
  ON projeto_usuario FOR INSERT
  TO anon
  WITH CHECK (true);

-- 4. Políticas de ATUALIZAÇÃO (UPDATE) para o role anon
-- Permite atualizar registros pelo frontend

CREATE POLICY "Permitir atualização pública de requisitos"
  ON requisito FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir atualização pública de usuários"
  ON usuario FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir atualização pública de projetos"
  ON projeto FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- 5. Políticas de EXCLUSÃO (DELETE) para o role anon
-- NOTA: A exclusão de PROJETOS é restrita a Administradores no frontend.
-- Como o sistema usa o role anon (sem Supabase Auth), a verificação de perfil
-- é feita na camada da aplicação (somente usuários com perfil 'Administrador'
-- podem ver e acionar a opção de excluir projetos).

CREATE POLICY "Permitir exclusão pública de projetos"
  ON projeto FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Permitir exclusão pública de requisitos"
  ON requisito FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Permitir exclusão pública de projeto_usuario"
  ON projeto_usuario FOR DELETE
  TO anon
  USING (true);
