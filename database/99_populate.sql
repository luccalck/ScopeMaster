-- Limpar as tabelas antes de popular (cuidado se houver dados importantes em produção)
DELETE FROM notificacao;
DELETE FROM projeto_usuario;
DELETE FROM requisito;
DELETE FROM projeto;

-- ======================================================================
-- 1. POPULANDO A TABELA 'projeto' (20 Registros)
-- UUIDs fixos para facilitar o relacionamento nas próximas tabelas
-- ======================================================================
INSERT INTO projeto (id_projeto, nome, descricao) VALUES
('b0000000-0000-0000-0000-000000000001', 'Sistema de Controle de Estoque', 'Modernização do sistema de controle de inventário para filiais.'),
('b0000000-0000-0000-0000-000000000002', 'Aplicativo de Entregas', 'App mobile para acompanhamento de entregas de última milha.'),
('b0000000-0000-0000-0000-000000000003', 'Portal de Recursos Humanos', 'Plataforma interna para holerites, férias e ponto eletrônico.'),
('b0000000-0000-0000-0000-000000000004', 'E-commerce Moda Plus', 'Novo e-commerce B2C focado em moda sustentável.'),
('b0000000-0000-0000-0000-000000000005', 'CRM de Vendas B2B', 'Sistema de relacionamento com cliente focado em atacadistas.'),
('b0000000-0000-0000-0000-000000000006', 'Dashboard Analítico', 'Painel de BI para diretores com métricas financeiras.'),
('b0000000-0000-0000-0000-000000000007', 'API de Pagamentos', 'Gateway de pagamento integrado com PIX e Cartão de Crédito.'),
('b0000000-0000-0000-0000-000000000008', 'App de Telemedicina', 'Consultas online com agendamento e vídeo-chamada.'),
('b0000000-0000-0000-0000-000000000009', 'Sistema de Escolas', 'Gestão de notas, chamadas e boletins escolares.'),
('b0000000-0000-0000-0000-000000000010', 'Automação de Marketing', 'Disparo de campanhas via E-mail, SMS e WhatsApp.'),
('b0000000-0000-0000-0000-000000000011', 'Logística Reversa', 'Sistema para controle de devolução de produtos.'),
('b0000000-0000-0000-0000-000000000012', 'Reserva de Hotéis', 'Plataforma B2B para reserva de hotéis e pousadas.'),
('b0000000-0000-0000-0000-000000000013', 'App de Finanças Pessoais', 'Gerenciador financeiro com importação via Open Finance.'),
('b0000000-0000-0000-0000-000000000014', 'Rede Social Corporativa', 'Fóruns, comunicados e grupos para funcionários.'),
('b0000000-0000-0000-0000-000000000015', 'ERP para Restaurantes', 'Gestão de mesas, comandas e controle de desperdício.'),
('b0000000-0000-0000-0000-000000000016', 'Monitoramento IoT', 'Painel de sensores de temperatura para câmaras frias.'),
('b0000000-0000-0000-0000-000000000017', 'Sistema Jurídico', 'Acompanhamento de processos judiciais e prazos.'),
('b0000000-0000-0000-0000-000000000018', 'Marketplace de Serviços', 'Plataforma conectando prestadores a clientes finais.'),
('b0000000-0000-0000-0000-000000000019', 'Controle de Frota', 'Monitoramento de rotas e manutenção de caminhões.'),
('b0000000-0000-0000-0000-000000000020', 'Plataforma EAD', 'Sistema de cursos online com emissão de certificados.');


-- ======================================================================
-- 2. POPULANDO A TABELA 'requisito' (20 Registros)
-- Vinculando aos UUIDs dos projetos acima
-- ======================================================================
INSERT INTO requisito (id_projeto, codigo, tipo, descricao, status_validacao) VALUES
('b0000000-0000-0000-0000-000000000001', 'REQ-001', 'Funcional', 'O sistema deve emitir relatórios diários de produtos abaixo do estoque mínimo.', 'Aprovado'),
('b0000000-0000-0000-0000-000000000001', 'RNF-001', 'Não Funcional', 'O sistema deve suportar até 5000 usuários simultâneos.', 'Aprovado'),
('b0000000-0000-0000-0000-000000000002', 'REQ-002', 'Funcional', 'Permitir que o motoboy tire foto do comprovante de entrega.', 'Pendente'),
('b0000000-0000-0000-0000-000000000002', 'RNF-002', 'Não Funcional', 'A foto deve ser otimizada para ter no máximo 2MB.', 'Pendente'),
('b0000000-0000-0000-0000-000000000003', 'REQ-003', 'Funcional', 'Usuário deve poder assinar o holerite digitalmente.', 'Rejeitado'),
('b0000000-0000-0000-0000-000000000004', 'REQ-004', 'Funcional', 'Integração de carrinho abandonado com envio de email após 2 horas.', 'Aprovado'),
('b0000000-0000-0000-0000-000000000005', 'REQ-005', 'Funcional', 'O CRM deve listar os clientes por ordem de data da última compra.', 'Pendente'),
('b0000000-0000-0000-0000-000000000006', 'RNF-003', 'Não Funcional', 'Os gráficos do dashboard devem renderizar em menos de 1 segundo.', 'Aprovado'),
('b0000000-0000-0000-0000-000000000007', 'REQ-006', 'Funcional', 'O gateway deve gerar um QR Code Pix com validade de 30 minutos.', 'Aprovado'),
('b0000000-0000-0000-0000-000000000008', 'REQ-007', 'Funcional', 'Gravação da teleconsulta para acesso posterior pelo paciente.', 'Rejeitado'),
('b0000000-0000-0000-0000-000000000009', 'REQ-008', 'Funcional', 'Professores devem lançar faltas através de um painel em lote.', 'Pendente'),
('b0000000-0000-0000-0000-000000000010', 'RNF-004', 'Não Funcional', 'A API de disparo precisa atingir 10.000 emails por minuto.', 'Aprovado'),
('b0000000-0000-0000-0000-000000000011', 'REQ-009', 'Funcional', 'Gerar código de autorização de postagem via integração Correios.', 'Pendente'),
('b0000000-0000-0000-0000-000000000012', 'REQ-010', 'Funcional', 'Permitir filtro de hotéis que aceitam animais de estimação (Pet Friendly).', 'Aprovado'),
('b0000000-0000-0000-0000-000000000013', 'REQ-011', 'Funcional', 'Categorização automática de despesas via IA.', 'Rejeitado'),
('b0000000-0000-0000-0000-000000000014', 'RNF-005', 'Não Funcional', 'Chat em tempo real utilizando WebSockets sem delay perceptível.', 'Aprovado'),
('b0000000-0000-0000-0000-000000000015', 'REQ-012', 'Funcional', 'Alerta sonoro na cozinha quando um pedido urgente for criado.', 'Pendente'),
('b0000000-0000-0000-0000-000000000016', 'REQ-013', 'Funcional', 'Envio de SMS caso a temperatura da câmara suba 3 graus.', 'Aprovado'),
('b0000000-0000-0000-0000-000000000017', 'REQ-014', 'Funcional', 'Aviso visual em vermelho para prazos judiciais faltando 2 dias.', 'Aprovado'),
('b0000000-0000-0000-0000-000000000020', 'RNF-006', 'Não Funcional', 'O player de vídeo deve possuir criptografia anti-pirataria (DRM).', 'Pendente');


-- ======================================================================
-- 3. POPULANDO A TABELA 'projeto_usuario' (Mais de 20 Registros)
-- Vinculando os usuários do reset_users.sql a vários projetos
-- ======================================================================
INSERT INTO projeto_usuario (id_projeto, id_usuario, papel_no_projeto) VALUES
-- Projeto 1
('b0000000-0000-0000-0000-000000000001', (SELECT id_usuario FROM usuario WHERE email = 'ana.admin@email.com' LIMIT 1), 'Gerente'),
('b0000000-0000-0000-0000-000000000001', (SELECT id_usuario FROM usuario WHERE email = 'miguel_oliveira_dev@email.com' LIMIT 1), 'Desenvolvedor'),
('b0000000-0000-0000-0000-000000000001', (SELECT id_usuario FROM usuario WHERE email = 'carlos.cliente@email.com' LIMIT 1), 'Cliente'),

-- Projeto 2
('b0000000-0000-0000-0000-000000000002', (SELECT id_usuario FROM usuario WHERE email = 'ana.admin@email.com' LIMIT 1), 'Administrador'),
('b0000000-0000-0000-0000-000000000002', (SELECT id_usuario FROM usuario WHERE email = 'miguel_oliveira_dev@email.com' LIMIT 1), 'Tech Lead'),

-- Projeto 3
('b0000000-0000-0000-0000-000000000003', (SELECT id_usuario FROM usuario WHERE email = 'miguel_oliveira_dev@email.com' LIMIT 1), 'Engenheiro de Software'),
('b0000000-0000-0000-0000-000000000003', (SELECT id_usuario FROM usuario WHERE email = 'carlos.cliente@email.com' LIMIT 1), 'Cliente Validador'),

-- Distribuindo o Desenvolvedor Miguel
('b0000000-0000-0000-0000-000000000004', (SELECT id_usuario FROM usuario WHERE email = 'miguel_oliveira_dev@email.com' LIMIT 1), 'Desenvolvedor'),
('b0000000-0000-0000-0000-000000000005', (SELECT id_usuario FROM usuario WHERE email = 'miguel_oliveira_dev@email.com' LIMIT 1), 'Desenvolvedor'),
('b0000000-0000-0000-0000-000000000006', (SELECT id_usuario FROM usuario WHERE email = 'miguel_oliveira_dev@email.com' LIMIT 1), 'Analista de Dados'),
('b0000000-0000-0000-0000-000000000007', (SELECT id_usuario FROM usuario WHERE email = 'miguel_oliveira_dev@email.com' LIMIT 1), 'Arquiteto de Solução'),

-- Distribuindo a Administradora Ana
('b0000000-0000-0000-0000-000000000008', (SELECT id_usuario FROM usuario WHERE email = 'ana.admin@email.com' LIMIT 1), 'Dona do Produto'),
('b0000000-0000-0000-0000-000000000009', (SELECT id_usuario FROM usuario WHERE email = 'ana.admin@email.com' LIMIT 1), 'Supervisora'),
('b0000000-0000-0000-0000-000000000010', (SELECT id_usuario FROM usuario WHERE email = 'ana.admin@email.com' LIMIT 1), 'Diretora'),
('b0000000-0000-0000-0000-000000000011', (SELECT id_usuario FROM usuario WHERE email = 'ana.admin@email.com' LIMIT 1), 'Admin'),

-- Distribuindo o Cliente Carlos
('b0000000-0000-0000-0000-000000000012', (SELECT id_usuario FROM usuario WHERE email = 'carlos.cliente@email.com' LIMIT 1), 'Consultor'),
('b0000000-0000-0000-0000-000000000013', (SELECT id_usuario FROM usuario WHERE email = 'carlos.cliente@email.com' LIMIT 1), 'Aprovador de UAT'),
('b0000000-0000-0000-0000-000000000014', (SELECT id_usuario FROM usuario WHERE email = 'carlos.cliente@email.com' LIMIT 1), 'Patrocinador'),
('b0000000-0000-0000-0000-000000000015', (SELECT id_usuario FROM usuario WHERE email = 'carlos.cliente@email.com' LIMIT 1), 'Sócio'),

-- Projetos Finais Aleatórios
('b0000000-0000-0000-0000-000000000016', (SELECT id_usuario FROM usuario WHERE email = 'miguel_oliveira_dev@email.com' LIMIT 1), 'IoT Dev'),
('b0000000-0000-0000-0000-000000000017', (SELECT id_usuario FROM usuario WHERE email = 'ana.admin@email.com' LIMIT 1), 'Gestora'),
('b0000000-0000-0000-0000-000000000018', (SELECT id_usuario FROM usuario WHERE email = 'carlos.cliente@email.com' LIMIT 1), 'Cliente Base'),
('b0000000-0000-0000-0000-000000000019', (SELECT id_usuario FROM usuario WHERE email = 'miguel_oliveira_dev@email.com' LIMIT 1), 'Dev backend'),
('b0000000-0000-0000-0000-000000000020', (SELECT id_usuario FROM usuario WHERE email = 'ana.admin@email.com' LIMIT 1), 'Revisora de Escopo');


-- ======================================================================
-- 4. POPULANDO A TABELA 'notificacao' (20 Registros)
-- Mensagens de log/alerta para os usuários
-- ======================================================================
INSERT INTO notificacao (id_usuario, id_projeto, mensagem, tipo, lida) VALUES
((SELECT id_usuario FROM usuario WHERE email = 'ana.admin@email.com' LIMIT 1), 'b0000000-0000-0000-0000-000000000001', 'O requisito REQ-001 foi aprovado pelo cliente.', 'sucesso', false),
((SELECT id_usuario FROM usuario WHERE email = 'miguel_oliveira_dev@email.com' LIMIT 1), 'b0000000-0000-0000-0000-000000000001', 'Novo requisito cadastrado no projeto Sistema de Controle de Estoque.', 'info', true),
((SELECT id_usuario FROM usuario WHERE email = 'carlos.cliente@email.com' LIMIT 1), 'b0000000-0000-0000-0000-000000000001', 'Você foi adicionado ao projeto.', 'info', false),

((SELECT id_usuario FROM usuario WHERE email = 'miguel_oliveira_dev@email.com' LIMIT 1), 'b0000000-0000-0000-0000-000000000002', 'Atenção: O RNF-002 está pendente de análise de viabilidade.', 'alerta', false),
((SELECT id_usuario FROM usuario WHERE email = 'ana.admin@email.com' LIMIT 1), 'b0000000-0000-0000-0000-000000000002', 'O projeto Aplicativo de Entregas teve seu escopo alterado.', 'info', true),

((SELECT id_usuario FROM usuario WHERE email = 'carlos.cliente@email.com' LIMIT 1), 'b0000000-0000-0000-0000-000000000003', 'O REQ-003 foi REJEITADO. Por favor, reveja as especificações.', 'erro', false),
((SELECT id_usuario FROM usuario WHERE email = 'miguel_oliveira_dev@email.com' LIMIT 1), 'b0000000-0000-0000-0000-000000000003', 'O cliente rejeitou sua última implementação no REQ-003.', 'erro', false),

((SELECT id_usuario FROM usuario WHERE email = 'ana.admin@email.com' LIMIT 1), NULL, 'O sistema ficará indisponível amanhã das 02:00 às 04:00.', 'info', true),
((SELECT id_usuario FROM usuario WHERE email = 'miguel_oliveira_dev@email.com' LIMIT 1), NULL, 'Você tem 5 novos requisitos assinalados para a sua equipe.', 'info', false),
((SELECT id_usuario FROM usuario WHERE email = 'carlos.cliente@email.com' LIMIT 1), NULL, 'A fatura do seu plano vence na próxima sexta-feira.', 'alerta', false),

((SELECT id_usuario FROM usuario WHERE email = 'miguel_oliveira_dev@email.com' LIMIT 1), 'b0000000-0000-0000-0000-000000000004', 'O REQ-004 acabou de ser Aprovado. Parabéns!', 'sucesso', true),
((SELECT id_usuario FROM usuario WHERE email = 'ana.admin@email.com' LIMIT 1), 'b0000000-0000-0000-0000-000000000008', 'O requisito de Gravação foi Rejeitado pelo comitê de segurança.', 'erro', false),
((SELECT id_usuario FROM usuario WHERE email = 'miguel_oliveira_dev@email.com' LIMIT 1), 'b0000000-0000-0000-0000-000000000005', 'Novo projeto criado: CRM de Vendas B2B.', 'info', true),
((SELECT id_usuario FROM usuario WHERE email = 'carlos.cliente@email.com' LIMIT 1), 'b0000000-0000-0000-0000-000000000012', 'Seus requisitos do sistema de hotéis já estão disponíveis.', 'info', false),
((SELECT id_usuario FROM usuario WHERE email = 'ana.admin@email.com' LIMIT 1), 'b0000000-0000-0000-0000-000000000015', 'O projeto ERP para Restaurantes atingiu o limite de horas.', 'alerta', false),

((SELECT id_usuario FROM usuario WHERE email = 'miguel_oliveira_dev@email.com' LIMIT 1), 'b0000000-0000-0000-0000-000000000016', 'Erro na compilação do módulo de sensores IoT.', 'erro', true),
((SELECT id_usuario FROM usuario WHERE email = 'carlos.cliente@email.com' LIMIT 1), 'b0000000-0000-0000-0000-000000000013', 'A categorização via IA não foi aprovada pelo compliance.', 'erro', false),
((SELECT id_usuario FROM usuario WHERE email = 'ana.admin@email.com' LIMIT 1), 'b0000000-0000-0000-0000-000000000006', 'Dashboard Analítico entregue com 100% de sucesso.', 'sucesso', true),
((SELECT id_usuario FROM usuario WHERE email = 'miguel_oliveira_dev@email.com' LIMIT 1), 'b0000000-0000-0000-0000-000000000007', 'Integração de PIX validada pelo Banco Central.', 'sucesso', false),
((SELECT id_usuario FROM usuario WHERE email = 'carlos.cliente@email.com' LIMIT 1), 'b0000000-0000-0000-0000-000000000015', 'Você não visualizou os requisitos atualizados há 7 dias.', 'alerta', false);
