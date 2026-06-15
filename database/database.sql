-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.usuario (
  id_usuario uuid NOT NULL DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text NOT NULL UNIQUE,
  senha_hash text NOT NULL,
  perfil USER-DEFINED NOT NULL,
  CONSTRAINT usuario_pkey PRIMARY KEY (id_usuario)
);
CREATE TABLE public.projeto (
  id_projeto uuid NOT NULL DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  data_criacao timestamp with time zone DEFAULT now(),
  CONSTRAINT projeto_pkey PRIMARY KEY (id_projeto)
);
CREATE TABLE public.requisito (
  id_requisito uuid NOT NULL DEFAULT gen_random_uuid(),
  id_projeto uuid NOT NULL,
  codigo text NOT NULL,
  tipo USER-DEFINED NOT NULL,
  descricao text NOT NULL,
  status_validacao USER-DEFINED DEFAULT 'Pendente'::status_requisito,
  feedback_validacao text,
  data_criacao timestamp with time zone NOT NULL DEFAULT now(),
  rodada_votacao integer NOT NULL DEFAULT 1,
  CONSTRAINT requisito_pkey PRIMARY KEY (id_requisito),
  CONSTRAINT requisito_id_projeto_fkey FOREIGN KEY (id_projeto) REFERENCES public.projeto(id_projeto)
);
CREATE TABLE public.projeto_usuario (
  id_projeto uuid NOT NULL,
  id_usuario uuid NOT NULL,
  papel_no_projeto text NOT NULL,
  CONSTRAINT projeto_usuario_pkey PRIMARY KEY (id_projeto, id_usuario),
  CONSTRAINT projeto_usuario_id_projeto_fkey FOREIGN KEY (id_projeto) REFERENCES public.projeto(id_projeto),
  CONSTRAINT projeto_usuario_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario)
);
CREATE TABLE public.notificacao (
  id_notificacao uuid NOT NULL DEFAULT gen_random_uuid(),
  id_usuario uuid NOT NULL,
  id_projeto uuid,
  mensagem text NOT NULL,
  tipo character varying DEFAULT 'info'::character varying,
  lida boolean DEFAULT false,
  data_criacao timestamp with time zone DEFAULT now(),
  CONSTRAINT notificacao_pkey PRIMARY KEY (id_notificacao),
  CONSTRAINT notificacao_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario),
  CONSTRAINT notificacao_id_projeto_fkey FOREIGN KEY (id_projeto) REFERENCES public.projeto(id_projeto)
);
CREATE TABLE public.requisito_voto (
  id_voto uuid NOT NULL DEFAULT gen_random_uuid(),
  id_requisito uuid NOT NULL,
  id_usuario uuid NOT NULL,
  voto text NOT NULL CHECK (voto = ANY (ARRAY['Aprovado'::text, 'Rejeitado'::text])),
  justificativa text NOT NULL,
  rodada integer NOT NULL DEFAULT 1,
  data_criacao timestamp with time zone DEFAULT now(),
  CONSTRAINT requisito_voto_pkey PRIMARY KEY (id_voto),
  CONSTRAINT requisito_voto_id_requisito_fkey FOREIGN KEY (id_requisito) REFERENCES public.requisito(id_requisito),
  CONSTRAINT requisito_voto_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario)
);
