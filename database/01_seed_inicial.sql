-- 1. Inserindo 10 Usuários (Admins, Devs e Clientes)
INSERT INTO usuario (id_usuario, nome, email, senha_hash, perfil) VALUES
('a1000000-0000-0000-0000-000000000001', 'Miguel Oliveira', 'miguel_oliveira_dev@email.com', 'hash_cripto_1', 'Desenvolvedor'),
('a1000000-0000-0000-0000-000000000002', 'Ana Souza', 'ana.admin@email.com', 'hash_cripto_2', 'Administrador'),
('a1000000-0000-0000-0000-000000000003', 'Carlos Mendes', 'carlos.cliente@email.com', 'hash_cripto_3', 'Cliente'),
('a1000000-0000-0000-0000-000000000004', 'Beatriz Lima', 'beatriz.dev@email.com', 'hash_cripto_4', 'Desenvolvedor'),
('a1000000-0000-0000-0000-000000000005', 'Fernando Costa', 'fernando.admin@email.com', 'hash_cripto_5', 'Administrador'),
('a1000000-0000-0000-0000-000000000006', 'Juliana Alves', 'juliana.cliente@email.com', 'hash_cripto_6', 'Cliente'),
('a1000000-0000-0000-0000-000000000007', 'Thiago Romão', 'thiago.dev@email.com', 'hash_cripto_7', 'Desenvolvedor'),
('a1000000-0000-0000-0000-000000000008', 'Mariana Rocha', 'mariana.dev@email.com', 'hash_cripto_8', 'Desenvolvedor'),
('a1000000-0000-0000-0000-000000000009', 'Roberto Nunes', 'roberto.cliente@email.com', 'hash_cripto_9', 'Cliente'),
('a1000000-0000-0000-0000-000000000010', 'Larissa Silva', 'larissa.admin@email.com', 'hash_cripto_10', 'Administrador');

-- 2. Inserindo 10 Projetos
INSERT INTO projeto (id_projeto, nome, descricao) VALUES
('b2000000-0000-0000-0000-000000000001', 'SaaS Gestão Financeira', 'Plataforma para gerenciamento de valores bancários do usuário.'),
('b2000000-0000-0000-0000-000000000002', 'FinsSaude', 'Sistema integrado para gestão de clínicas de saúde.'),
('b2000000-0000-0000-0000-000000000003', 'Dojo Tracker', 'Aplicativo para acompanhamento de treinos em artes marciais.'),
('b2000000-0000-0000-0000-000000000004', 'E-commerce Moda', 'Loja virtual com carrinho e pagamento integrado via Pix e Cartão.'),
('b2000000-0000-0000-0000-000000000005', 'ERP Varejo', 'Sistema de gestão de estoque e vendas para redes de supermercados.'),
('b2000000-0000-0000-0000-000000000006', 'Delivery Express', 'App de entregas focado em restaurantes locais e motoboys parceiros.'),
('b2000000-0000-0000-0000-000000000007', 'EducaPlay', 'Plataforma de cursos online em vídeo com emissão de certificados.'),
('b2000000-0000-0000-0000-000000000008', 'HR Control', 'Software corporativo para gestão de folha de pagamento e ponto.'),
('b2000000-0000-0000-0000-000000000009', 'CRM Pro Sales', 'Gerenciamento avançado de leads e funil de vendas para equipes.'),
('b2000000-0000-0000-0000-000000000010', 'NewsPortal CMS', 'Painel administrativo customizado para grandes portais de notícias regionais.');

-- 3. Inserindo 11 Requisitos (vinculados aos projetos acima)
-- Obs: Aqui podemos deixar o id_requisito ser gerado sozinho (gen_random_uuid()), pois ninguém depende dele.
INSERT INTO requisito (id_projeto, codigo, tipo, descricao, status_validacao) VALUES
('b2000000-0000-0000-0000-000000000001', 'RF01', 'Funcional', 'O sistema deve integrar com a API do banco para buscar o saldo do usuário.', 'Aprovado'),
('b2000000-0000-0000-0000-000000000001', 'RNF01', 'Não Funcional', 'O cálculo de análise de gastos deve utilizar a API do Gemini.', 'Pendente'),
('b2000000-0000-0000-0000-000000000002', 'RF01', 'Funcional', 'Permitir o agendamento de consultas médicas pelos pacientes logados.', 'Aprovado'),
('b2000000-0000-0000-0000-000000000003', 'RF02', 'Funcional', 'Registrar a frequência dos alunos e a carga horária no tatame.', 'Pendente'),
('b2000000-0000-0000-0000-000000000004', 'RF01', 'Funcional', 'O cliente deve conseguir adicionar e remover itens ao carrinho de compras.', 'Rejeitado'),
('b2000000-0000-0000-0000-000000000005', 'RNF01', 'Não Funcional', 'O sistema deve suportar 10.000 requisições simultâneas durante a Black Friday.', 'Aprovado'),
('b2000000-0000-0000-0000-000000000006', 'RF01', 'Funcional', 'Motoristas devem poder aceitar e recusar corridas diretamente pelo mapa do app.', 'Pendente'),
('b2000000-0000-0000-0000-000000000007', 'RF05', 'Funcional', 'Emissão automática de certificado em PDF após 100% de conclusão do módulo.', 'Aprovado'),
('b2000000-0000-0000-0000-000000000008', 'RNF02', 'Não Funcional', 'Todas as senhas e dados bancários devem ser criptografados no banco de dados.', 'Aprovado'),
('b2000000-0000-0000-0000-000000000009', 'RF03', 'Funcional', 'Gerar e exportar relatório mensal de vendas fechadas em formato Excel.', 'Rejeitado'),
('b2000000-0000-0000-0000-000000000010', 'RF01', 'Funcional', 'Jornalistas devem conseguir publicar artigos com uma ou múltiplas imagens de capa.', 'Aprovado');

-- 4. Inserindo 10 Relações de Controle de Acesso (Projeto_Usuario)
INSERT INTO projeto_usuario (id_projeto, id_usuario, papel_no_projeto) VALUES
('b2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Criador / Dev Full-Stack'), 
('b2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003', 'Cliente Validador'),        
('b2000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Líder Técnico'),   
('b2000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'Administrador do Sistema'),
('b2000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000007', 'Product Owner'),            
('b2000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004', 'Desenvolvedor Backend'),
('b2000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000005', 'Gerente de Projetos'),
('b2000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000006', 'Cliente Validador'),
('b2000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000008', 'Analista de Qualidade (QA)'),
('b2000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000010', 'Administrador de Banco de Dados');