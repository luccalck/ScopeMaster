-- =============================================
-- Novas Políticas RLS para a tabela usuario
-- Execute este SQL no Editor SQL do Supabase Dashboard
-- (https://supabase.com/dashboard → seu projeto → SQL Editor)
-- =============================================

-- Permite que o frontend (role anon) insira novos usuários no cadastro
CREATE POLICY "Permitir inserção pública de usuários"
  ON usuario FOR INSERT
  TO anon
  WITH CHECK (true);

-- Permite que o frontend (role anon) atualize dados de usuários (autorização, troca de senha, etc.)
CREATE POLICY "Permitir atualização pública de usuários"
  ON usuario FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
