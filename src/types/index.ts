/**
 * Módulos disponíveis no Portal do Cliente.
 * Cada módulo pode ter funcionalidades específicas (sub-permissões).
 *
 * Baseado nas rotas reais de permissão do Portal do Cliente (`PermissionDto.Rota`
 * em Gvm.Pdc-Core/src/@types/Dto/authDto.d.ts). "avaria" e "vamoscontrole" são exceção:
 * existem como funcionalidades reais em produção, mas ainda não estão presentes na
 * enum oficial de permissões do Pdc-Core — mantidas aqui por já serem usadas no portal.
 */
export type ModuloId =
  | 'faturamento'
  | 'avaria'
  | 'vamoscontrole'
  | 'relatorios'
  | 'agendamento'
  | 'multas'
  | 'crlv'
  | 'comunicados'
  | 'importbi'
  | 'logsacesso'
  | 'faq';

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
    id: 'faturamento',
    nome: 'Faturamento',
    descricao: 'Consulta de faturas e cobranças do contrato',
    funcionalidades: [
      { id: 'faturamento_acesso', nome: 'Acesso', descricao: 'Visualizar faturamento' },
    ],
  },
  {
    id: 'avaria',
    nome: 'Cobrança de Avaria',
    descricao: 'Consulta de cobranças por avaria em ativos',
    funcionalidades: [
      { id: 'avaria_acesso', nome: 'Acesso', descricao: 'Visualizar cobranças de avaria' },
    ],
  },
  {
    id: 'vamoscontrole',
    nome: 'Vamos Controle',
    descricao: 'Torre de controle e monitoramento da frota',
    funcionalidades: [
      { id: 'vamoscontrole_acesso', nome: 'Acesso', descricao: 'Visualizar Vamos Controle' },
    ],
  },
  {
    id: 'relatorios',
    nome: 'Relatórios',
    descricao: 'Relatórios operacionais da frota',
    funcionalidades: [
      { id: 'relatorios_distribuicao_geografica', nome: 'Distribuição Geográfica', descricao: 'Distribuição geográfica da frota' },
      { id: 'relatorios_manutencao', nome: 'Manutenção', descricao: 'Relatório de manutenção' },
      { id: 'relatorios_modelos', nome: 'Modelos', descricao: 'Relatório de modelos' },
      { id: 'relatorios_servicos', nome: 'Serviços', descricao: 'Relatório de serviços' },
    ],
  },
  {
    id: 'agendamento',
    nome: 'Agendamento',
    descricao: 'Agendamento de serviços e manutenções',
    funcionalidades: [
      { id: 'agendamento_agendar', nome: 'Agendar', descricao: 'Criar agendamento' },
      { id: 'agendamento_relatorio', nome: 'Relatório de agendamentos', descricao: 'Consultar agendamentos' },
      { id: 'agendamento_lote', nome: 'Agendamento em lote', descricao: 'Agendar múltiplos ativos de uma vez' },
    ],
  },
  {
    id: 'multas',
    nome: 'Multas',
    descricao: 'Consulta de multas dos ativos',
    funcionalidades: [
      { id: 'multas_acesso', nome: 'Acesso', descricao: 'Visualizar multas' },
    ],
  },
  {
    id: 'crlv',
    nome: 'CRLV',
    descricao: 'Consulta de documentos CRLV dos ativos',
    funcionalidades: [
      { id: 'crlv_acesso', nome: 'Acesso', descricao: 'Visualizar CRLV' },
    ],
  },
  {
    id: 'comunicados',
    nome: 'Comunicados',
    descricao: 'Comunicados enviados pelo Grupo Vamos',
    funcionalidades: [
      { id: 'comunicados_acesso', nome: 'Acesso', descricao: 'Visualizar comunicados' },
    ],
  },
  {
    id: 'importbi',
    nome: 'Import BI',
    descricao: 'Importação de dados para BI',
    funcionalidades: [
      { id: 'importbi_acesso', nome: 'Acesso', descricao: 'Importar dados para BI' },
    ],
  },
  {
    id: 'logsacesso',
    nome: 'Logs de Acesso',
    descricao: 'Histórico de acessos ao portal',
    funcionalidades: [
      { id: 'logs_acesso', nome: 'Acesso', descricao: 'Visualizar logs de acesso' },
    ],
  },
  {
    id: 'faq',
    nome: 'FAQ',
    descricao: 'Perguntas frequentes',
    funcionalidades: [
      { id: 'faq_acesso', nome: 'Acesso', descricao: 'Visualizar FAQ' },
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
  /** IDs das divisões de ativo vinculadas (acesso apenas à divisão, não ao grupo inteiro). */
  divisaoIds?: string[];
  /** ID do perfil de acesso vinculado (opcional). */
  perfilId?: string;
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
  /** IDs das divisões de ativo (acesso apenas à divisão). */
  divisaoIds?: string[];
  perfilId?: string;
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
