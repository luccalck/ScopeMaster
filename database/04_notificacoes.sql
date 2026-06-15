-- =============================================
-- Tabela de Notificações
-- Execute este SQL no Editor SQL do Supabase Dashboard
-- =============================================

-- Criar tabela de notificações
CREATE TABLE notificacao (
  id_notificacao UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  id_usuario UUID NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  id_projeto UUID REFERENCES projeto(id_projeto) ON DELETE CASCADE,
  mensagem TEXT NOT NULL,
  tipo VARCHAR(50) DEFAULT 'info',
  lida BOOLEAN DEFAULT false,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índice para buscar notificações por usuário
CREATE INDEX idx_notificacao_usuario ON notificacao(id_usuario, lida, data_criacao DESC);

-- Habilitar RLS
ALTER TABLE notificacao ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para o role anon
CREATE POLICY "Permitir leitura de notificações"
  ON notificacao FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Permitir inserção de notificações"
  ON notificacao FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Permitir atualização de notificações"
  ON notificacao FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir exclusão de notificações"
  ON notificacao FOR DELETE
  TO anon
  USING (true);
