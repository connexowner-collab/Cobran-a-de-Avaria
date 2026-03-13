/**
 * Módulos disponíveis no Portal do Cliente.
 * Cada módulo pode ter funcionalidades específicas (sub-permissões).
 */
export type ModuloId =
  | 'cobranca'
  | 'avaria'
  | 'entregas'
  | 'relatorios'
  | 'cadastros'
  | 'configuracoes';

export interface Modulo {
  id: ModuloId;
  nome: string;
  descricao: string;
  funcionalidades: Funcionalidade[];
}

export interface Funcionalidade {
  id: string;
  nome: string;
  descricao?: string;
}

/** Configuração estática dos módulos e funcionalidades do portal */
export const MODULOS_PORTAL: Modulo[] = [
  {
    id: 'cobranca',
    nome: 'Cobrança',
    descricao: 'Gestão de cobranças e faturamento',
    funcionalidades: [
      { id: 'cobranca_visualizar', nome: 'Visualizar', descricao: 'Consultar cobranças' },
      { id: 'cobranca_exportar', nome: 'Exportar', descricao: 'Exportar relatórios' },
    ],
  },
  {
    id: 'avaria',
    nome: 'Cobrança de Avaria',
    descricao: 'Registro e acompanhamento de avarias',
    funcionalidades: [
      { id: 'avaria_visualizar', nome: 'Visualizar', descricao: 'Consultar avarias' },
      { id: 'avaria_registrar', nome: 'Registrar', descricao: 'Registrar novas avarias' },
      { id: 'avaria_aprovar', nome: 'Aprovar', descricao: 'Aprovar/rejeitar avarias' },
    ],
  },
  {
    id: 'entregas',
    nome: 'Entregas',
    descricao: 'Acompanhamento de entregas',
    funcionalidades: [
      { id: 'entregas_visualizar', nome: 'Visualizar', descricao: 'Consultar entregas' },
      { id: 'entregas_rastrear', nome: 'Rastrear', descricao: 'Rastreamento em tempo real' },
    ],
  },
  {
    id: 'relatorios',
    nome: 'Relatórios',
    descricao: 'Relatórios gerenciais',
    funcionalidades: [
      { id: 'relatorios_visualizar', nome: 'Visualizar', descricao: 'Acessar relatórios' },
      { id: 'relatorios_exportar', nome: 'Exportar', descricao: 'Exportar em PDF/Excel' },
    ],
  },
  {
    id: 'cadastros',
    nome: 'Cadastros',
    descricao: 'Cadastros gerais do cliente',
    funcionalidades: [
      { id: 'cadastros_visualizar', nome: 'Visualizar', descricao: 'Consultar cadastros' },
      { id: 'cadastros_editar', nome: 'Editar', descricao: 'Alterar cadastros' },
    ],
  },
  {
    id: 'configuracoes',
    nome: 'Configurações',
    descricao: 'Configurações da conta',
    funcionalidades: [
      { id: 'config_visualizar', nome: 'Visualizar', descricao: 'Ver configurações' },
      { id: 'config_editar', nome: 'Editar', descricao: 'Alterar configurações' },
    ],
  },
];

export interface Cliente {
  id: string;
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj?: string;
  ativo: boolean;
}

/** Contrato vinculado a um cliente */
export interface Contrato {
  id: string;
  clienteId: string;
  numero: string;
}

/** Ativo (equipamento) vinculado a um contrato */
export interface Ativo {
  id: string;
  contratoId: string;
  /** Placa (opcional; alguns ativos têm apenas Nº de série). */
  placa?: string;
  chassi: string;
  numeroSerie: string;
  modelo: string;
}

/** Opção cliente+contrato para autocomplete (nome + contrato + CNPJ) */
export interface ClienteContratoOption {
  contratoId: string;
  clienteId: string;
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  numeroContrato: string;
}

/** Responsável para autocomplete no modal Novo Grupo */
export interface ResponsavelOption {
  id: string;
  nome: string;
}

/** Divisão de frota vinculada a um grupo (nome + ativos). */
export interface Divisao {
  id: string;
  nome: string;
  ativoIds: string[];
}

/** Grupo criado (possui ID único). */
export interface Grupo {
  id: string;
  nome: string;
  responsavelId?: string;
  contratoIds: string[];
  ativo: boolean;
  /** Divisões de frota do grupo. */
  divisoes?: Divisao[];
  /** Data e hora de criação (ISO). Preenchida pelo sistema ao criar. */
  criadoEm?: string;
  /** Data e hora da última atualização (ISO). Atualizada pelo sistema ao editar. */
  atualizadoEm?: string;
}

/** Item da listagem da aba Grupo de cliente (contagens por grupo) */
export interface GrupoListItem {
  id: string;
  nome: string;
  qtdContrato: number;
  qtdAtivo: number;
  qtdContatosVinculados: number;
  /** Quantidade de divisões de frota do grupo. */
  qtdDivisoes: number;
  ativo: boolean;
  /** Data e hora de criação (ISO). */
  criadoEm?: string;
  /** Data e hora da última atualização (ISO). */
  atualizadoEm?: string;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  clienteId: string;
  /** ID do grupo (compatibilidade; use grupoIds quando múltiplos). */
  grupoId?: string;
  /** IDs dos grupos vinculados (seleção múltipla). */
  grupoIds?: string[];
  permissoes: PermissaoUsuario;
  /** Data e hora de criação do usuário (ISO). */
  criadoEm: string;
  atualizadoEm: string;
  /** Data e hora do último acesso no portal do cliente, atualizada via PDV (ISO). */
  ultimoAcessoEm?: string | null;
}

/** Permissões por funcionalidade (id da funcionalidade => habilitado) */
export type PermissaoUsuario = Record<string, boolean>;

/** Perfil de acesso (conjunto de permissões reutilizável) */
export interface Perfil {
  id: string;
  nome: string;
  permissoes: PermissaoUsuario;
}

export interface UsuarioInput {
  nome: string;
  email: string;
  ativo: boolean;
  clienteId: string;
  grupoId?: string;
  /** Múltiplos grupos (prioridade sobre grupoId). */
  grupoIds?: string[];
  permissoes: PermissaoUsuario;
}

export interface FiltrosUsuarios {
  clienteId?: string;
  grupoId?: string;
  busca?: string;
  ativo?: boolean;
  pagina?: number;
  itensPorPagina?: number;
}

/** Resultado paginado (padrão Cobrança Avaria). */
export interface PagedResult<T> {
  items: T[];
  totalItens: number;
  totalPaginas: number;
}
