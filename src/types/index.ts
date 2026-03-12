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
  placa: string;
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

/** Grupo criado (possui ID único). */
export interface Grupo {
  id: string;
  nome: string;
  responsavelId?: string;
  contratoIds: string[];
  ativo: boolean;
}

/** Item da listagem da aba Grupo de cliente (contagens por grupo) */
export interface GrupoListItem {
  id: string;
  nome: string;
  qtdContrato: number;
  qtdAtivo: number;
  qtdContatosVinculados: number;
  ativo: boolean;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  clienteId: string;
  /** ID do grupo (quando vinculado a um grupo criado no modal). */
  grupoId?: string;
  permissoes: PermissaoUsuario;
  criadoEm: string;
  atualizadoEm: string;
}

/** Permissões por funcionalidade (id da funcionalidade => habilitado) */
export type PermissaoUsuario = Record<string, boolean>;

export interface UsuarioInput {
  nome: string;
  email: string;
  ativo: boolean;
  clienteId: string;
  grupoId?: string;
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
