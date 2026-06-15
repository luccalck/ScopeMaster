// ==========================================
// Tipos TypeScript mapeados do banco Supabase
// ==========================================

// Enums do banco de dados
export type PerfilUsuario = 'Administrador' | 'Desenvolvedor' | 'Cliente';
export type TipoRequisito = 'Funcional' | 'Não Funcional';
export type StatusRequisito = 'Pendente' | 'Aprovado' | 'Rejeitado';

// Tabela: usuario
export interface Usuario {
  id_usuario: string;
  nome: string;
  email: string;
  senha_hash: string;
  perfil: PerfilUsuario;
}

// Tabela: projeto
export interface Projeto {
  id_projeto: string;
  nome: string;
  descricao: string | null;
  data_criacao: string;
}

// Tabela: requisito
export interface Requisito {
  id_requisito: string;
  id_projeto: string;
  codigo: string;
  tipo: TipoRequisito;
  descricao: string;
  status_validacao: StatusRequisito;
  feedback_validacao: string | null;
  data_criacao: string;
  rodada_votacao: number;
}

// Tabela: requisito_voto
export interface RequisitoVoto {
  id_voto: string;
  id_requisito: string;
  id_usuario: string;
  voto: 'Aprovado' | 'Rejeitado';
  justificativa: string;
  rodada: number;
  data_criacao: string;
  usuario?: Usuario;
}

// Tabela: projeto_usuario (controle de acesso)
export interface ProjetoUsuario {
  id_projeto: string;
  id_usuario: string;
  papel_no_projeto: string;
}

// Tabela: notificacao
export interface Notificacao {
  id_notificacao: string;
  id_usuario: string;
  id_projeto: string | null;
  mensagem: string;
  tipo: string;
  lida: boolean;
  data_criacao: string;
}

// Requisito com informações do projeto (join)
export interface RequisitoComProjeto extends Requisito {
  projeto?: Projeto;
}

// Projeto com membros e requisitos (join)
export interface ProjetoCompleto extends Projeto {
  requisitos?: Requisito[];
  membros?: (ProjetoUsuario & { usuario?: Usuario })[];
}

// Supabase Database type (para tipagem do cliente)
export interface Database {
  public: {
    Tables: {
      usuario: {
        Row: Usuario;
        Insert: Omit<Usuario, 'id_usuario'> & { id_usuario?: string };
        Update: Partial<Usuario>;
      };
      projeto: {
        Row: Projeto;
        Insert: Omit<Projeto, 'id_projeto' | 'data_criacao'> & {
          id_projeto?: string;
          data_criacao?: string;
        };
        Update: Partial<Projeto>;
      };
      requisito: {
        Row: Requisito;
        Insert: Omit<Requisito, 'id_requisito' | 'status_validacao' | 'feedback_validacao' | 'data_criacao' | 'rodada_votacao'> & {
          id_requisito?: string;
          status_validacao?: StatusRequisito;
          feedback_validacao?: string | null;
          data_criacao?: string;
          rodada_votacao?: number;
        };
        Update: Partial<Requisito>;
      };
      projeto_usuario: {
        Row: ProjetoUsuario;
        Insert: ProjetoUsuario;
        Update: Partial<ProjetoUsuario>;
      };
      notificacao: {
        Row: Notificacao;
        Insert: Omit<Notificacao, 'id_notificacao' | 'data_criacao' | 'lida'> & {
          id_notificacao?: string;
          data_criacao?: string;
          lida?: boolean;
        };
        Update: Partial<Notificacao>;
      };
      requisito_voto: {
        Row: RequisitoVoto;
        Insert: Omit<RequisitoVoto, 'id_voto' | 'data_criacao'> & {
          id_voto?: string;
          data_criacao?: string;
        };
        Update: Partial<RequisitoVoto>;
      };
    };
    Enums: {
      perfil_usuario: PerfilUsuario;
      tipo_requisito: TipoRequisito;
      status_requisito: StatusRequisito;
    };
  };
}
