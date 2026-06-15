-- Criação de Tipos (Enums) para garantir que apenas valores válidos sejam inseridos
CREATE TYPE perfil_usuario AS ENUM ('Administrador', 'Desenvolvedor', 'Cliente');
CREATE TYPE tipo_requisito AS ENUM ('Funcional', 'Não Funcional');
CREATE TYPE status_requisito AS ENUM ('Pendente', 'Aprovado', 'Rejeitado');

-- 1. Tabela: Usuario
CREATE TABLE usuario (
    id_usuario UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    perfil perfil_usuario NOT NULL
);

-- 2. Tabela: Projeto
CREATE TABLE projeto (
    id_projeto UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    descricao TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Tabela: Requisito
CREATE TABLE requisito (
    id_requisito UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_projeto UUID NOT NULL REFERENCES projeto(id_projeto) ON DELETE CASCADE,
    codigo TEXT NOT NULL,
    tipo tipo_requisito NOT NULL,
    descricao TEXT NOT NULL,
    status_validacao status_requisito DEFAULT 'Pendente'
);

-- 4. Tabela Intermediária: Projeto_Usuario (Controle de Acesso)
CREATE TABLE projeto_usuario (
    id_projeto UUID REFERENCES projeto(id_projeto) ON DELETE CASCADE,
    id_usuario UUID REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    papel_no_projeto TEXT NOT NULL,
    PRIMARY KEY (id_projeto, id_usuario)
);