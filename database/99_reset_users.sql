-- Limpar tabelas dependentes (se necessário, o Supabase geralmente tem ON DELETE CASCADE, mas por precaução limpamos os projetos)
DELETE FROM projeto_usuario;
DELETE FROM requisito;
DELETE FROM projeto;

-- Remover todos os usuários existentes
DELETE FROM usuario;

-- Inserir novos usuários obrigatórios
-- Nota: senha_hash abaixo é o bcrypt de '123456' com salt rounds=10
INSERT INTO usuario (id_usuario, nome, email, senha_hash, perfil)
VALUES
  (gen_random_uuid(), 'Administrador (Acesso Total)', 'ana.admin@email.com', '$2b$10$UL2zs4OyKAKo7siTKXU2jebLIGDirkyTrEhsgWS1R8oaZClJy14Hu', 'Administrador'),
  (gen_random_uuid(), 'Desenvolvedor (Criação técnica)', 'miguel_oliveira_dev@email.com', '$2b$10$UL2zs4OyKAKo7siTKXU2jebLIGDirkyTrEhsgWS1R8oaZClJy14Hu', 'Desenvolvedor'),
  (gen_random_uuid(), 'Cliente (Validação/Aprovação)', 'carlos.cliente@email.com', '$2b$10$UL2zs4OyKAKo7siTKXU2jebLIGDirkyTrEhsgWS1R8oaZClJy14Hu', 'Cliente');
