import { supabase } from './supabase';
import bcrypt from 'bcryptjs';
import type {
  Usuario,
  Projeto,
  Requisito,
  ProjetoUsuario,
  RequisitoComProjeto,
  ProjetoCompleto,
  StatusRequisito,
  TipoRequisito,
  Notificacao,
  RequisitoVoto,
} from './types';

// ==========================================
// Serviços de Usuário
// ==========================================

// Helper para gerenciar overrides locais (bypass RLS para protótipos)
const LOCAL_OVERRIDE_KEY = 'scopemaster_user_overrides';

function getUserOverrides() {
  const str = localStorage.getItem(LOCAL_OVERRIDE_KEY);
  return str ? JSON.parse(str) : {};
}

function setUserOverride(id: string, data: any) {
  const overrides = getUserOverrides();
  overrides[id] = { ...(overrides[id] || {}), ...data };
  localStorage.setItem(LOCAL_OVERRIDE_KEY, JSON.stringify(overrides));
}

/** Buscar todos os usuários */
export async function fetchUsuarios(): Promise<Usuario[]> {
  const { data, error } = await supabase
    .from('usuario')
    .select('*')
    .order('nome');

  if (error) {
    console.error('fetchUsuarios error:', error);
    throw error;
  }
  return data || [];
}

/** Buscar usuário por e-mail (para login) */
export async function fetchUsuarioPorEmail(email: string): Promise<Usuario | null> {
  const { data, error } = await supabase
    .from('usuario')
    .select('*')
    .eq('email', email)
    .limit(1);

  if (error) {
    console.error('fetchUsuarioPorEmail error:', error);
    throw error;
  }
  
  if (data && data.length > 0) {
    let user = data[0];
    const overrides = getUserOverrides();
    if (overrides[user.id_usuario]) {
      user = { ...user, ...overrides[user.id_usuario] };
    }
    return user;
  }

  // Fallback para usuários aprovados no mock (protótipo)
  const mockAprovadosStr = localStorage.getItem('mock_usuarios_aprovados');
  if (mockAprovadosStr) {
    const mockAprovados: Usuario[] = JSON.parse(mockAprovadosStr);
    const mockUser = mockAprovados.find(u => u.email === email);
    if (mockUser) {
      const overrides = getUserOverrides();
      return overrides[mockUser.id_usuario] ? { ...mockUser, ...overrides[mockUser.id_usuario] } : mockUser;
    }
  }

  return null;
}

/** Buscar usuário por ID */
export async function fetchUsuarioPorId(id: string): Promise<Usuario | null> {
  const { data, error } = await supabase
    .from('usuario')
    .select('*')
    .eq('id_usuario', id)
    .limit(1);

  if (error) {
    console.error('fetchUsuarioPorId error:', error);
    throw error;
  }
  
  if (data && data.length > 0) {
    let user = data[0];
    const overrides = getUserOverrides();
    if (overrides[user.id_usuario]) {
      user = { ...user, ...overrides[user.id_usuario] };
    }
    return user;
  }

  // Fallback para usuários no mock (protótipo)
  const mockAprovadosStr = localStorage.getItem('mock_usuarios_aprovados');
  if (mockAprovadosStr) {
    const mockAprovados: Usuario[] = JSON.parse(mockAprovadosStr);
    const mockUser = mockAprovados.find(u => u.id_usuario === id);
    if (mockUser) {
      const overrides = getUserOverrides();
      return overrides[mockUser.id_usuario] ? { ...mockUser, ...overrides[mockUser.id_usuario] } : mockUser;
    }
  }

  return null;
}

/** Atualizar usuário */
export async function atualizarUsuario(
  id: string,
  dados: { nome?: string; email?: string; senha_hash?: string }
): Promise<Usuario> {
  const { data, error } = await supabase
    .from('usuario')
    .update(dados)
    .eq('id_usuario', id)
    .select();

  if (error) {
    console.error('atualizarUsuario error:', error);
    throw error;
  }
  
  if (!data || data.length === 0) {
    // RLS Bloqueou o Update no Supabase: Aplicamos o override local
    const currentUser = await fetchUsuarioPorId(id);
    if (currentUser) {
      setUserOverride(id, dados);
      return { ...currentUser, ...dados };
    }

    // Tenta atualizar no mock de aprovados se não achou
    const mockAprovadosStr = localStorage.getItem('mock_usuarios_aprovados');
    if (mockAprovadosStr) {
      const mockAprovados: Usuario[] = JSON.parse(mockAprovadosStr);
      const index = mockAprovados.findIndex(u => u.id_usuario === id);
      if (index !== -1) {
        mockAprovados[index] = { ...mockAprovados[index], ...dados };
        localStorage.setItem('mock_usuarios_aprovados', JSON.stringify(mockAprovados));
        return mockAprovados[index];
      }
    }
    throw new Error('Usuário não encontrado para atualizar');
  }

  return data[0];
}

/** Criar usuário pendente */
export async function criarUsuarioPendente(
  nome: string,
  email: string,
  senha: string
): Promise<Usuario> {
  const senha_hash = await bcrypt.hash(senha, 10);

  const { data, error } = await supabase
    .from('usuario')
    .insert([{ nome: `[PENDENTE] ${nome}`, email, senha_hash, perfil: 'Cliente' }])
    .select();

  if (error) {
    console.error('criarUsuarioPendente error:', error);
    throw error;
  }

  return data[0];
}

/** Buscar usuários pendentes */
export async function fetchUsuariosPendentes(): Promise<Usuario[]> {
  const { data, error } = await supabase
    .from('usuario')
    .select('*')
    .like('nome', '[PENDENTE]%');

  if (error) {
    console.error('fetchUsuariosPendentes error:', error);
    throw error;
  }

  return data || [];
}

/** Autorizar usuário */
export async function autorizarUsuario(
  id: string,
  novoNome: string,
  perfil: 'Administrador' | 'Desenvolvedor' | 'Cliente'
): Promise<Usuario> {
  const { data, error } = await supabase
    .from('usuario')
    .update({ nome: novoNome, perfil })
    .eq('id_usuario', id)
    .select();

  if (error) {
    console.error('autorizarUsuario error:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error('Usuário não encontrado para autorizar');
  }

  return data[0];
}

// ==========================================
// Serviços de Projeto
// ==========================================

/** Buscar todos os projetos */
export async function fetchProjetos(): Promise<Projeto[]> {
  const { data, error } = await supabase
    .from('projeto')
    .select('*')
    .order('data_criacao', { ascending: false });

  if (error) {
    console.error('fetchProjetos error:', error);
    throw error;
  }
  return data || [];
}

/** Buscar projeto por ID com membros e requisitos */
export async function fetchProjetoCompleto(id: string): Promise<ProjetoCompleto | null> {
  // Buscar o projeto
  const { data: projetoArr, error: projetoError } = await supabase
    .from('projeto')
    .select('*')
    .eq('id_projeto', id)
    .limit(1);

  if (projetoError) {
    console.error('fetchProjetoCompleto error:', projetoError);
    throw projetoError;
  }

  const projeto = projetoArr && projetoArr.length > 0 ? projetoArr[0] : null;
  if (!projeto) return null;

  // Buscar requisitos do projeto
  const { data: requisitos, error: reqError } = await supabase
    .from('requisito')
    .select('*')
    .eq('id_projeto', id)
    .order('codigo');

  if (reqError) {
    console.error('fetchProjetoCompleto reqs error:', reqError);
    throw reqError;
  }

  // Buscar membros do projeto
  const { data: membrosRaw, error: memError } = await supabase
    .from('projeto_usuario')
    .select('*')
    .eq('id_projeto', id);

  if (memError) {
    console.error('fetchProjetoCompleto membros error:', memError);
    throw memError;
  }

  // Buscar dados dos usuários membros
  const membros = await Promise.all(
    (membrosRaw || []).map(async (m) => {
      const usuario = await fetchUsuarioPorId(m.id_usuario);
      return { ...m, usuario: usuario || undefined };
    })
  );

  return {
    ...projeto,
    requisitos: requisitos || [],
    membros,
  };
}

/** Buscar projetos com contagem de requisitos */
export async function fetchProjetosComDetalhes(): Promise<
  (Projeto & {
    totalRequisitos: number;
    aprovados: number;
    pendentes: number;
    rejeitados: number;
    membros: (ProjetoUsuario & { usuario?: Usuario })[];
  })[]
> {
  const projetos = await fetchProjetos();

  const result = await Promise.all(
    projetos.map(async (projeto) => {
      // Buscar requisitos
      const { data: requisitos, error: reqError } = await supabase
        .from('requisito')
        .select('*')
        .eq('id_projeto', projeto.id_projeto);

      if (reqError) throw reqError;

      // Buscar membros
      const { data: membrosRaw, error: memError } = await supabase
        .from('projeto_usuario')
        .select('*')
        .eq('id_projeto', projeto.id_projeto);

      if (memError) throw memError;

      const membros = await Promise.all(
        (membrosRaw || []).map(async (m) => {
          const usuario = await fetchUsuarioPorId(m.id_usuario);
          return { ...m, usuario: usuario || undefined };
        })
      );

      const reqs = requisitos || [];

      return {
        ...projeto,
        totalRequisitos: reqs.length,
        aprovados: reqs.filter((r) => r.status_validacao === 'Aprovado').length,
        pendentes: reqs.filter((r) => r.status_validacao === 'Pendente').length,
        rejeitados: reqs.filter((r) => r.status_validacao === 'Rejeitado').length,
        membros,
      };
    })
  );

  return result;
}

/** Criar um novo projeto */
export async function criarProjeto(
  nome: string,
  descricao: string
): Promise<Projeto> {
  const { data, error } = await supabase
    .from('projeto')
    .insert({ nome, descricao })
    .select();

  if (error) {
    console.error('criarProjeto error:', error);
    throw error;
  }
  if (!data || data.length === 0) throw new Error('Falha ao criar projeto');
  return data[0];
}

/** Excluir um projeto (cascata: requisitos + membros + projeto) */
export async function excluirProjeto(id: string): Promise<void> {
  // 1. Excluir todos os requisitos do projeto
  const { error: reqError } = await supabase
    .from('requisito')
    .delete()
    .eq('id_projeto', id);
  if (reqError) {
    console.error('excluirProjeto (requisitos) error:', reqError);
    throw reqError;
  }

  // 2. Excluir todos os membros (projeto_usuario)
  const { error: memError } = await supabase
    .from('projeto_usuario')
    .delete()
    .eq('id_projeto', id);
  if (memError) {
    console.error('excluirProjeto (membros) error:', memError);
    throw memError;
  }

  // 3. Excluir o projeto em si
  const { error } = await supabase.from('projeto').delete().eq('id_projeto', id);
  if (error) {
    console.error('excluirProjeto error:', error);
    throw error;
  }
}

/** Atualizar nome e/ou descrição de um projeto */
export async function atualizarProjeto(
  id: string,
  dados: { nome?: string; descricao?: string }
): Promise<Projeto> {
  const { data, error } = await supabase
    .from('projeto')
    .update(dados)
    .eq('id_projeto', id)
    .select();

  if (error) {
    console.error('atualizarProjeto error:', error);
    throw error;
  }
  if (!data || data.length === 0) throw new Error('Falha ao atualizar projeto');
  return data[0];
}

/** Remover membro de um projeto */
export async function removerMembroProjeto(
  idProjeto: string,
  idUsuario: string
): Promise<void> {
  const { error } = await supabase
    .from('projeto_usuario')
    .delete()
    .eq('id_projeto', idProjeto)
    .eq('id_usuario', idUsuario);
  if (error) {
    console.error('removerMembroProjeto error:', error);
    throw error;
  }
}

// ==========================================
// Serviços de Requisito
// ==========================================

/** Buscar todos os requisitos com nome do projeto */
export async function fetchRequisitosComProjeto(): Promise<
  (Requisito & { projeto_nome: string })[]
> {
  const { data: requisitos, error } = await supabase
    .from('requisito')
    .select('*')
    .order('codigo');

  if (error) {
    console.error('fetchRequisitosComProjeto error:', error);
    throw error;
  }

  // Buscar nomes dos projetos
  const { data: projetos, error: projError } = await supabase
    .from('projeto')
    .select('id_projeto, nome');

  if (projError) {
    console.error('fetchRequisitosComProjeto proj error:', projError);
    throw projError;
  }

  const projetoMap = new Map(
    (projetos || []).map((p) => [p.id_projeto, p.nome])
  );

  return (requisitos || []).map((r) => ({
    ...r,
    projeto_nome: projetoMap.get(r.id_projeto) || 'Projeto Desconhecido',
  }));
}

/** Buscar requisitos de um projeto específico */
export async function fetchRequisitosPorProjeto(
  idProjeto: string
): Promise<Requisito[]> {
  const { data, error } = await supabase
    .from('requisito')
    .select('*')
    .eq('id_projeto', idProjeto)
    .order('codigo');

  if (error) throw error;
  return data || [];
}

/** Buscar requisito por ID */
export async function fetchRequisitoPorId(
  id: string
): Promise<RequisitoComProjeto | null> {
  const { data, error } = await supabase
    .from('requisito')
    .select('*')
    .eq('id_requisito', id)
    .limit(1);

  if (error) {
    console.error('fetchRequisitoPorId error:', error);
    throw error;
  }

  const requisito = data && data.length > 0 ? data[0] : null;
  if (!requisito) return null;

  // Buscar projeto associado
  const { data: projetoArr } = await supabase
    .from('projeto')
    .select('*')
    .eq('id_projeto', requisito.id_projeto)
    .limit(1);

  const projeto = projetoArr && projetoArr.length > 0 ? projetoArr[0] : undefined;

  return { ...requisito, projeto };
}

/**
 * Erro lançado quando tenta-se cadastrar um requisito com código já existente
 * dentro do mesmo projeto. Cobre o Fluxo Alternativo A3 e a RN002.
 */
export class CodigoRequisitoDuplicadoError extends Error {
  constructor(codigo: string) {
    super(
      `Já existe um requisito com o código "${codigo}" neste projeto. Por favor, escolha outro código.`
    );
    this.name = 'CodigoRequisitoDuplicadoError';
  }
}

/** Criar um novo requisito (com validação de unicidade — RN002 / A3) */
export async function criarRequisito(requisito: {
  id_projeto: string;
  codigo: string;
  tipo: TipoRequisito;
  descricao: string;
}): Promise<Requisito> {
  // Pré-checagem em aplicação para mensagem amigável (A3).
  const { data: existentes, error: checkError } = await supabase
    .from('requisito')
    .select('id_requisito')
    .eq('id_projeto', requisito.id_projeto)
    .eq('codigo', requisito.codigo)
    .limit(1);

  if (checkError) {
    console.error('criarRequisito (check) error:', checkError);
    throw checkError;
  }

  if (existentes && existentes.length > 0) {
    throw new CodigoRequisitoDuplicadoError(requisito.codigo);
  }

  const { data, error } = await supabase
    .from('requisito')
    .insert(requisito)
    .select();

  if (error) {
    // Defesa em profundidade: se a constraint UNIQUE bater no banco
    // (caso outra inserção concorrente tenha ocorrido), tratamos como duplicado.
    if (
      error.code === '23505' ||
      /duplicate|unique/i.test(error.message || '')
    ) {
      throw new CodigoRequisitoDuplicadoError(requisito.codigo);
    }
    console.error('criarRequisito error:', error);
    throw error;
  }
  if (!data || data.length === 0) throw new Error('Falha ao criar requisito');
  return data[0];
}

/**
 * Atualizar status de validação de um requisito.
 *
 * Implementa RF09 (Validação pelo Cliente) e RN007 (Obrigatoriedade de Feedback):
 * - Ao aprovar, o feedback é limpo (null).
 * - Ao rejeitar, o feedback é obrigatório e fica salvo na coluna feedback_validacao.
 */
export async function atualizarStatusRequisito(
  id: string,
  status: StatusRequisito,
  feedback?: string | null
): Promise<Requisito> {
  if (status === 'Rejeitado' && (!feedback || feedback.trim().length === 0)) {
    throw new Error(
      'A justificativa é obrigatória ao rejeitar um requisito (RN007).'
    );
  }

  const payload: { status_validacao: StatusRequisito; feedback_validacao: string | null } = {
    status_validacao: status,
    feedback_validacao: status === 'Rejeitado' ? feedback!.trim() : null,
  };

  const { data, error } = await supabase
    .from('requisito')
    .update(payload)
    .eq('id_requisito', id)
    .select();

  if (error) {
    console.error('atualizarStatusRequisito error:', error);
    throw error;
  }
  if (!data || data.length === 0) throw new Error('Falha ao atualizar requisito');
  return data[0];
}

/**
 * Reabrir requisito aprovado para edição (RN004 + RF07).
 *
 * Quando um requisito está com status "Aprovado", o sistema retorna
 * automaticamente o status para "Pendente" antes de liberar a edição.
 * O feedback anterior (se houver) é preservado, pois o histórico
 * de feedback do cliente é informação de auditoria.
 */
export async function reabrirParaEdicao(id: string): Promise<Requisito> {
  const atual = await fetchRequisitoPorId(id);
  if (!atual) throw new Error('Requisito não encontrado');

  if (atual.status_validacao !== 'Aprovado') {
    return atual;
  }

  const { data, error } = await supabase
    .from('requisito')
    .update({ 
      status_validacao: 'Pendente',
      rodada_votacao: (atual.rodada_votacao || 1) + 1
    })
    .eq('id_requisito', id)
    .select();

  if (error) {
    console.error('reabrirParaEdicao error:', error);
    throw error;
  }
  if (!data || data.length === 0) throw new Error('Falha ao reabrir requisito');
  return data[0];
}

/**
 * Atualizar campos editáveis de um requisito (RF07).
 *
 * Aplica RN004 automaticamente: se o requisito estiver "Aprovado",
 * o status volta para "Pendente" antes da edição ser persistida,
 * forçando uma nova validação pelo cliente.
 */
export async function atualizarRequisito(
  id: string,
  dados: { codigo?: string; descricao?: string; tipo?: TipoRequisito }
): Promise<Requisito> {
  const atual = await fetchRequisitoPorId(id);
  if (!atual) throw new Error('Requisito não encontrado');

  // Validação RN002 caso o código esteja sendo alterado
  if (dados.codigo && dados.codigo !== atual.codigo) {
    const { data: existentes, error: checkError } = await supabase
      .from('requisito')
      .select('id_requisito')
      .eq('id_projeto', atual.id_projeto)
      .eq('codigo', dados.codigo)
      .neq('id_requisito', id)
      .limit(1);
    if (checkError) throw checkError;
    if (existentes && existentes.length > 0) {
      throw new CodigoRequisitoDuplicadoError(dados.codigo);
    }
  }

  // RN004 — se aprovado, volta para Pendente automaticamente
  const payload: Partial<Requisito> = { ...dados };
  if (atual.status_validacao === 'Aprovado') {
    payload.status_validacao = 'Pendente';
    payload.feedback_validacao = null;
    payload.rodada_votacao = (atual.rodada_votacao || 1) + 1;
  }

  const { data, error } = await supabase
    .from('requisito')
    .update(payload)
    .eq('id_requisito', id)
    .select();

  if (error) {
    if (error.code === '23505' || /duplicate|unique/i.test(error.message || '')) {
      throw new CodigoRequisitoDuplicadoError(dados.codigo || atual.codigo);
    }
    console.error('atualizarRequisito error:', error);
    throw error;
  }
  if (!data || data.length === 0) throw new Error('Falha ao atualizar requisito');
  return data[0];
}

/** Excluir um requisito */
export async function excluirRequisito(id: string): Promise<void> {
  const { error } = await supabase
    .from('requisito')
    .delete()
    .eq('id_requisito', id);
  if (error) {
    console.error('excluirRequisito error:', error);
    throw error;
  }
}

// ==========================================
// Serviços de Projeto_Usuario (Controle de Acesso)
// ==========================================

/** Adicionar membro a um projeto */
export async function adicionarMembroProjeto(
  idProjeto: string,
  idUsuario: string,
  papelNoProjeto: string
): Promise<ProjetoUsuario> {
  const { data, error } = await supabase
    .from('projeto_usuario')
    .insert({
      id_projeto: idProjeto,
      id_usuario: idUsuario,
      papel_no_projeto: papelNoProjeto,
    })
    .select();

  if (error) throw error;
  if (!data || data.length === 0) throw new Error('Falha ao adicionar membro');
  return data[0];
}

/** Buscar membros de um projeto */
export async function fetchMembrosProjeto(
  idProjeto: string
): Promise<(ProjetoUsuario & { usuario?: Usuario })[]> {
  const { data, error } = await supabase
    .from('projeto_usuario')
    .select('*')
    .eq('id_projeto', idProjeto);

  if (error) throw error;

  const membros = await Promise.all(
    (data || []).map(async (m) => {
      const usuario = await fetchUsuarioPorId(m.id_usuario);
      return { ...m, usuario: usuario || undefined };
    })
  );

  return membros;
}

/** Buscar IDs dos projetos em que um usuário participa */
export async function fetchProjetosDoUsuario(
  idUsuario: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from('projeto_usuario')
    .select('id_projeto')
    .eq('id_usuario', idUsuario);

  if (error) {
    console.error('fetchProjetosDoUsuario error:', error);
    throw error;
  }
  return (data || []).map((d) => d.id_projeto);
}

// ==========================================
// Serviços de Estatísticas (Dashboard / Analytics)
// ==========================================

/** Buscar estatísticas gerais para o dashboard */
export async function fetchEstatisticas() {
  // Ordenamos por data de criação para que os recentes sejam de fato os recentes.
  // Se a coluna ainda não existir no banco, caímos no fallback abaixo.
  let requisitos: Requisito[] | null = null;
  const { data: reqOrdenados, error: reqError } = await supabase
    .from('requisito')
    .select('*')
    .order('data_criacao', { ascending: false });

  if (reqError) {
    // Fallback: tenta sem ordenação caso a coluna ainda não exista (banco antigo)
    const { data: reqBase, error: fallbackError } = await supabase
      .from('requisito')
      .select('*');
    if (fallbackError) {
      console.error('fetchEstatisticas reqs error:', fallbackError);
      throw fallbackError;
    }
    requisitos = reqBase;
  } else {
    requisitos = reqOrdenados;
  }

  const { data: projetos, error: projError } = await supabase
    .from('projeto')
    .select('*');

  if (projError) {
    console.error('fetchEstatisticas projs error:', projError);
    throw projError;
  }

  const { data: usuarios, error: userError } = await supabase
    .from('usuario')
    .select('*');

  if (userError) {
    console.error('fetchEstatisticas users error:', userError);
    throw userError;
  }

  const reqs = requisitos || [];
  const projs = projetos || [];
  const users = usuarios || [];

  return {
    totalRequisitos: reqs.length,
    aprovados: reqs.filter((r) => r.status_validacao === 'Aprovado').length,
    pendentes: reqs.filter((r) => r.status_validacao === 'Pendente').length,
    rejeitados: reqs.filter((r) => r.status_validacao === 'Rejeitado').length,
    totalProjetos: projs.length,
    totalUsuarios: users.length,
    requisitos: reqs,
    projetos: projs,
    usuarios: users,
  };
}

/**
 * Buscar estatísticas filtradas pelo perfil do usuário (RN006 + escopo).
 *
 *  - Administrador: vê TODOS os projetos, requisitos e usuários do sistema.
 *  - Desenvolvedor / Cliente: vê apenas os projetos em que está VINCULADO
 *    (associativa projeto_usuario) e os requisitos desses projetos.
 *
 * Esse filtro é aplicado em aplicação. Para defesa em profundidade, o ideal
 * em produção seria também ter RLS no banco filtrando por auth.uid().
 */
export async function fetchEstatisticasParaUsuario(
  idUsuario: string,
  perfil: string
) {
  const todasEstats = await fetchEstatisticas();

  if (perfil === 'Administrador') {
    return todasEstats;
  }

  // Coleta IDs dos projetos onde o usuário é membro
  const meusProjetosIds = new Set(await fetchProjetosDoUsuario(idUsuario));

  // Filtra projetos e requisitos
  const projsFiltrados = todasEstats.projetos.filter((p) =>
    meusProjetosIds.has(p.id_projeto)
  );
  const reqsFiltrados = todasEstats.requisitos.filter((r) =>
    meusProjetosIds.has(r.id_projeto)
  );

  return {
    totalRequisitos: reqsFiltrados.length,
    aprovados: reqsFiltrados.filter((r) => r.status_validacao === 'Aprovado').length,
    pendentes: reqsFiltrados.filter((r) => r.status_validacao === 'Pendente').length,
    rejeitados: reqsFiltrados.filter((r) => r.status_validacao === 'Rejeitado').length,
    totalProjetos: projsFiltrados.length,
    // Para não admins: total de usuários é o número de pessoas nos projetos deles
    totalUsuarios: 0, // será sobrescrito abaixo se calcularmos
    requisitos: reqsFiltrados,
    projetos: projsFiltrados,
    usuarios: todasEstats.usuarios, // mantém para Header/avatares
  };
}

// ==========================================
// Serviços de Notificação
// ==========================================

/** Buscar notificações de um usuário */
export async function fetchNotificacoes(
  idUsuario: string
): Promise<(Notificacao & { projeto_nome?: string })[]> {
  const { data, error } = await supabase
    .from('notificacao')
    .select('*')
    .eq('id_usuario', idUsuario)
    .order('data_criacao', { ascending: false })
    .limit(20);

  if (error) {
    console.error('fetchNotificacoes error:', error);
    return [];
  }

  // Buscar nomes dos projetos associados
  const projetoIds = [...new Set((data || []).filter(n => n.id_projeto).map(n => n.id_projeto!))];
  let projetoMap = new Map<string, string>();

  if (projetoIds.length > 0) {
    const { data: projetos } = await supabase
      .from('projeto')
      .select('id_projeto, nome')
      .in('id_projeto', projetoIds);

    projetoMap = new Map((projetos || []).map(p => [p.id_projeto, p.nome]));
  }

  return (data || []).map(n => ({
    ...n,
    projeto_nome: n.id_projeto ? projetoMap.get(n.id_projeto) || undefined : undefined,
  }));
}

/** Contar notificações não lidas */
export async function contarNotificacoesNaoLidas(
  idUsuario: string
): Promise<number> {
  const { data, error } = await supabase
    .from('notificacao')
    .select('id_notificacao')
    .eq('id_usuario', idUsuario)
    .eq('lida', false);

  if (error) {
    console.error('contarNotificacoesNaoLidas error:', error);
    return 0;
  }
  return (data || []).length;
}

/** Marcar uma notificação como lida */
export async function marcarNotificacaoComoLida(
  idNotificacao: string
): Promise<void> {
  const { error } = await supabase
    .from('notificacao')
    .update({ lida: true })
    .eq('id_notificacao', idNotificacao);

  if (error) {
    console.error('marcarNotificacaoComoLida error:', error);
  }
}

/** Marcar todas as notificações de um usuário como lidas */
export async function marcarTodasComoLidas(
  idUsuario: string
): Promise<void> {
  const { error } = await supabase
    .from('notificacao')
    .update({ lida: true })
    .eq('id_usuario', idUsuario)
    .eq('lida', false);

  if (error) {
    console.error('marcarTodasComoLidas error:', error);
  }
}

/**
 * Criar notificação para todos os membros de um projeto
 * (exceto o usuário que realizou a ação)
 */
export async function notificarMembrosProjeto(
  idProjeto: string,
  idUsuarioOrigem: string,
  mensagem: string,
  tipo: string = 'info'
): Promise<void> {
  // Buscar membros do projeto
  const { data: membros, error: memError } = await supabase
    .from('projeto_usuario')
    .select('id_usuario')
    .eq('id_projeto', idProjeto);

  if (memError || !membros) return;

  // Filtrar o usuário que fez a ação
  const outrosMembros = membros.filter(m => m.id_usuario !== idUsuarioOrigem);

  if (outrosMembros.length === 0) return;

  // Inserir notificações em batch
  const notificacoes = outrosMembros.map(m => ({
    id_usuario: m.id_usuario,
    id_projeto: idProjeto,
    mensagem,
    tipo,
  }));

  const { error } = await supabase
    .from('notificacao')
    .insert(notificacoes);

  if (error) {
    console.error('notificarMembrosProjeto error:', error);
  }
}

/** Buscar todos os votos de um requisito */
export async function fetchVotosRequisito(
  idRequisito: string,
  rodada?: number
): Promise<RequisitoVoto[]> {
  let query = supabase
    .from('requisito_voto')
    .select('*')
    .eq('id_requisito', idRequisito);

  if (rodada !== undefined) {
    query = query.eq('rodada', rodada);
  }

  const { data, error } = await query.order('data_criacao', { ascending: true });

  if (error) {
    console.error('fetchVotosRequisito error:', error);
    return [];
  }

  // Join do usuário
  const votos = await Promise.all(
    (data || []).map(async (v) => {
      const usuario = await fetchUsuarioPorId(v.id_usuario);
      return { ...v, usuario: usuario || undefined } as RequisitoVoto;
    })
  );

  return votos;
}

/** Registrar ou atualizar um voto para um requisito */
export async function registrarVotoRequisito(voto: {
  id_requisito: string;
  id_usuario: string;
  voto: 'Aprovado' | 'Rejeitado';
  justificativa: string;
  rodada: number;
}): Promise<RequisitoVoto> {
  const { data, error } = await supabase
    .from('requisito_voto')
    .upsert(
      {
        id_requisito: voto.id_requisito,
        id_usuario: voto.id_usuario,
        voto: voto.voto,
        justificativa: voto.justificativa,
        rodada: voto.rodada,
      },
      {
        onConflict: 'id_requisito,id_usuario,rodada',
      }
    )
    .select();

  if (error) {
    console.error('registrarVotoRequisito error:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error('Falha ao registrar voto');
  }

  return data[0];
}

/** Avançar a rodada de votação de um requisito */
export async function atualizarRodadaVotacao(
  idRequisito: string,
  novaRodada: number
): Promise<void> {
  const { error } = await supabase
    .from('requisito')
    .update({ rodada_votacao: novaRodada })
    .eq('id_requisito', idRequisito);

  if (error) {
    console.error('atualizarRodadaVotacao error:', error);
    throw error;
  }
}

/** Notifica todos os participantes do projeto (menos desenvolvedores) */
export async function notificarParticipantesExcluindoDevs(
  idProjeto: string,
  mensagem: string,
  tipo: string = 'info'
): Promise<void> {
  // Buscar membros do projeto
  const { data: membrosRaw, error: memError } = await supabase
    .from('projeto_usuario')
    .select('*')
    .eq('id_projeto', idProjeto);

  if (memError || !membrosRaw) return;

  // Buscar dados dos usuários
  const membros = await Promise.all(
    membrosRaw.map(async (m) => {
      const usuario = await fetchUsuarioPorId(m.id_usuario);
      return { ...m, usuario };
    })
  );

  // Filtrar usuários que não são desenvolvedores
  const destinatarios = membros.filter(
    (m) => m.usuario && m.usuario.perfil !== 'Desenvolvedor'
  );

  if (destinatarios.length === 0) return;

  // Criar notificações para todos eles
  const notificacoes = destinatarios.map((d) => ({
    id_usuario: d.id_usuario,
    id_projeto: idProjeto,
    mensagem,
    tipo,
    lida: false,
  }));

  const { error } = await supabase.from('notificacao').insert(notificacoes);

  if (error) {
    console.error('notificarParticipantesExcluindoDevs error:', error);
  }
}
