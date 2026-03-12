import type { Cliente, Usuario, PermissaoUsuario, Contrato, Ativo, ClienteContratoOption, ResponsavelOption, GrupoListItem, Grupo } from '@/types';

/**
 * Store em memória para demonstração. Em produção, substituir por banco de dados.
 *
 * Relação para testes: CNPJ → Cliente → Contrato(s) → Ativo(s)
 * --------------------------------------------------------------------------
 * CNPJ (buscar com 4+ dígitos)  | Cliente      | Contrato(s)     | Ativos (placa, chassi, nº série, modelo)
 * ------------------------------|--------------|-----------------|------------------------------------------
 * 00.000.000/0001-00 (0001)     | Alpha        | CONT-2024-001   | ABC-1D23, DEF-4G56 (Empilhadeira X/Y)
 *                               |              | CONT-2024-002   | GHI-7H89 (Paleteira Z)
 * 00.000.000/0002-00 (0002)     | Beta         | CONT-2024-003   | JKL-0I12, MNO-3P45 (Rebocador A/B)
 * 00.000.000/0003-00 (0003)     | Gamma        | CONT-2023-010   | PQR-6S78 (Transpaleteira C)
 * 12.345.678/0001-90 (1234)     | Delta Log    | CONT-2024-100   | STU-9T01, VWX-2Y34 (Retro X1, Carregadeira Y2)
 */
const clientes: Cliente[] = [
  { id: '1', razaoSocial: 'Empresa Alpha Ltda', nomeFantasia: 'Alpha', cnpj: '00.000.000/0001-00', ativo: true },
  { id: '2', razaoSocial: 'Beta Comércio S.A.', nomeFantasia: 'Beta', cnpj: '00.000.000/0002-00', ativo: true },
  { id: '3', razaoSocial: 'Gamma Serviços Ltda', nomeFantasia: 'Gamma', cnpj: '00.000.000/0003-00', ativo: false },
  { id: '4', razaoSocial: 'Delta Logística Ltda', nomeFantasia: 'Delta Log', cnpj: '12.345.678/0001-90', ativo: true },
];

const contratos: Contrato[] = [
  { id: 'c1', clienteId: '1', numero: 'CONT-2024-001' },
  { id: 'c2', clienteId: '1', numero: 'CONT-2024-002' },
  { id: 'c3', clienteId: '2', numero: 'CONT-2024-003' },
  { id: 'c4', clienteId: '3', numero: 'CONT-2023-010' },
  { id: 'c5', clienteId: '4', numero: 'CONT-2024-100' },
];

const ativos: Ativo[] = [
  { id: 'a1', contratoId: 'c1', placa: 'ABC-1D23', chassi: '9BWZZZ377VT004251', numeroSerie: 'SN-001', modelo: 'Empilhadeira X' },
  { id: 'a2', contratoId: 'c1', placa: 'DEF-4G56', chassi: '9BWZZZ377VT004252', numeroSerie: 'SN-002', modelo: 'Empilhadeira Y' },
  { id: 'a3', contratoId: 'c2', placa: 'GHI-7H89', chassi: '9BWZZZ377VT004253', numeroSerie: 'SN-003', modelo: 'Paleteira Z' },
  { id: 'a4', contratoId: 'c3', placa: 'JKL-0I12', chassi: '9BWZZZ377VT004254', numeroSerie: 'SN-004', modelo: 'Rebocador A' },
  { id: 'a5', contratoId: 'c3', placa: 'MNO-3P45', chassi: '9BWZZZ377VT004255', numeroSerie: 'SN-005', modelo: 'Rebocador B' },
  { id: 'a6', contratoId: 'c4', placa: 'PQR-6S78', chassi: '9BWZZZ377VT004256', numeroSerie: 'SN-006', modelo: 'Transpaleteira C' },
  { id: 'a7', contratoId: 'c5', placa: 'STU-9T01', chassi: '9BWZZZ377VT004257', numeroSerie: 'SN-007', modelo: 'Retro X1' },
  { id: 'a8', contratoId: 'c5', placa: 'VWX-2Y34', chassi: '9BWZZZ377VT004258', numeroSerie: 'SN-008', modelo: 'Carregadeira Y2' },
];

const responsaveis: ResponsavelOption[] = [
  { id: 'r1', nome: 'Lucas Pessoa Duarte' },
  { id: 'u1', nome: 'João Silva' },
  { id: 'u2', nome: 'Maria Santos' },
  { id: 'u3', nome: 'Pedro Oliveira' },
];

/** Grupos com ID único. Inicialmente derivados dos clientes; novos via modal. */
const grupos: Grupo[] = [
  { id: 'grp-1', nome: 'Alpha', responsavelId: 'r1', contratoIds: ['c1', 'c2'], ativo: true },
  { id: 'grp-2', nome: 'Beta', responsavelId: 'u3', contratoIds: ['c3'], ativo: true },
  { id: 'grp-3', nome: 'Gamma', responsavelId: 'r1', contratoIds: ['c4'], ativo: false },
  { id: 'grp-4', nome: 'Delta Log', responsavelId: 'r1', contratoIds: ['c5'], ativo: true },
];

/** Mapeamento clienteId -> grupoId para usuários existentes (compatibilidade). */
const clienteIdToGrupoId: Record<string, string> = { '1': 'grp-1', '2': 'grp-2', '3': 'grp-3', '4': 'grp-4' };

const usuarios: Usuario[] = [
  {
    id: 'u1',
    nome: 'João Silva',
    email: 'joao.silva@alpha.com',
    ativo: true,
    clienteId: '1',
    grupoId: 'grp-1',
    criadoEm: '2024-01-15T10:00:00Z',
    atualizadoEm: '2024-03-01T14:30:00Z',
    permissoes: {
      cobranca_visualizar: true,
      cobranca_exportar: true,
      avaria_visualizar: true,
      avaria_registrar: true,
      avaria_aprovar: false,
      entregas_visualizar: true,
      entregas_rastrear: true,
      relatorios_visualizar: true,
      relatorios_exportar: false,
      cadastros_visualizar: true,
      cadastros_editar: false,
      config_visualizar: true,
      config_editar: false,
    },
  },
  {
    id: 'u2',
    nome: 'Maria Santos',
    email: 'maria.santos@alpha.com',
    ativo: true,
    clienteId: '1',
    grupoId: 'grp-1',
    criadoEm: '2024-02-01T09:00:00Z',
    atualizadoEm: '2024-03-05T11:00:00Z',
    permissoes: {
      cobranca_visualizar: true,
      cobranca_exportar: true,
      avaria_visualizar: true,
      avaria_registrar: true,
      avaria_aprovar: true,
      entregas_visualizar: true,
      entregas_rastrear: true,
      relatorios_visualizar: true,
      relatorios_exportar: true,
      cadastros_visualizar: true,
      cadastros_editar: true,
      config_visualizar: true,
      config_editar: true,
    },
  },
  {
    id: 'u3',
    nome: 'Pedro Oliveira',
    email: 'pedro@beta.com',
    ativo: true,
    clienteId: '2',
    grupoId: 'grp-2',
    criadoEm: '2024-02-10T08:00:00Z',
    atualizadoEm: '2024-02-10T08:00:00Z',
    permissoes: {
      cobranca_visualizar: true,
      cobranca_exportar: false,
      avaria_visualizar: true,
      avaria_registrar: false,
      avaria_aprovar: false,
      entregas_visualizar: true,
      entregas_rastrear: true,
      relatorios_visualizar: true,
      relatorios_exportar: false,
      cadastros_visualizar: true,
      cadastros_editar: false,
      config_visualizar: false,
      config_editar: false,
    },
  },
];

export function getClientes(): Cliente[] {
  return [...clientes];
}

export function getClienteById(id: string): Cliente | undefined {
  return clientes.find((c) => c.id === id);
}

export interface FiltrosUsuarios {
  clienteId?: string;
  busca?: string;
  ativo?: boolean;
}

export function getGrupos(): Grupo[] {
  return [...grupos];
}

export function getGrupoById(id: string): Grupo | undefined {
  return grupos.find((g) => g.id === id);
}

/** Retorna o primeiro grupo cujos contratos pertencem ao clienteId (para exibir nome na listagem). */
export function getGrupoByClienteId(clienteId: string): Grupo | undefined {
  return grupos.find((g) =>
    g.contratoIds.some((cid) => contratos.find((c) => c.id === cid)?.clienteId === clienteId)
  );
}

export function getUsuarios(filtros?: FiltrosUsuarios): Usuario[] {
  let result = [...usuarios];
  if (filtros?.clienteId) {
    result = result.filter((u) => u.clienteId === filtros.clienteId);
  }
  if (filtros?.grupoId) {
    result = result.filter((u) => u.grupoId === filtros.grupoId);
  }
  if (filtros?.busca) {
    const b = filtros.busca.toLowerCase();
    result = result.filter(
      (u) =>
        u.nome.toLowerCase().includes(b) ||
        u.email.toLowerCase().includes(b)
    );
  }
  if (filtros?.ativo !== undefined) {
    result = result.filter((u) => u.ativo === filtros.ativo);
  }
  return result;
}

export function getUsuarioById(id: string): Usuario | undefined {
  return usuarios.find((u) => u.id === id);
}

export interface UsuarioInput {
  nome: string;
  email: string;
  ativo: boolean;
  clienteId: string;
  permissoes: PermissaoUsuario;
}

export function criarUsuario(input: UsuarioInput): Usuario {
  const id = 'u' + (usuarios.length + 1);
  const now = new Date().toISOString();
  let clienteId = input.clienteId;
  let grupoId = input.grupoId;
  if (grupoId) {
    const g = getGrupoById(grupoId);
    if (g?.contratoIds.length) {
      const ct = contratos.find((c) => c.id === g.contratoIds[0]);
      if (ct) clienteId = ct.clienteId;
    }
  } else if (clienteId && clienteIdToGrupoId[clienteId]) {
    grupoId = clienteIdToGrupoId[clienteId];
  }
  const novo: Usuario = {
    id,
    nome: input.nome,
    email: input.email,
    ativo: input.ativo,
    clienteId,
    permissoes: input.permissoes,
    criadoEm: now,
    atualizadoEm: now,
    ...(grupoId && { grupoId }),
  };
  usuarios.push(novo);
  return { ...novo };
}

export function atualizarUsuario(id: string, input: Partial<UsuarioInput>): Usuario | null {
  const idx = usuarios.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  const now = new Date().toISOString();
  let clienteId = input.clienteId ?? usuarios[idx].clienteId;
  let grupoId = input.grupoId !== undefined ? input.grupoId : usuarios[idx].grupoId;
  if (input.grupoId) {
    grupoId = input.grupoId;
    const g = getGrupoById(input.grupoId);
    if (g?.contratoIds.length) {
      const ct = contratos.find((c) => c.id === g.contratoIds[0]);
      if (ct) clienteId = ct.clienteId;
    }
  }
  usuarios[idx] = {
    ...usuarios[idx],
    ...input,
    clienteId,
    atualizadoEm: now,
    ...(grupoId !== undefined && { grupoId }),
  };
  return { ...usuarios[idx] };
}

export function excluirUsuario(id: string): boolean {
  const idx = usuarios.findIndex((u) => u.id === id);
  if (idx === -1) return false;
  usuarios.splice(idx, 1);
  return true;
}

export function getContratos(): Contrato[] {
  return [...contratos];
}

export function getAtivosByContratoIds(contratoIds: string[]): Ativo[] {
  if (!contratoIds.length) return [];
  const set = new Set(contratoIds);
  return ativos.filter((a) => set.has(a.contratoId));
}

/** Retorna todas as opções cliente+contrato (para dropdown ao abrir). */
export function getAllClienteContratoOptions(): ClienteContratoOption[] {
  const options: ClienteContratoOption[] = [];
  for (const c of clientes) {
    const conts = contratos.filter((ct) => ct.clienteId === c.id);
    for (const ct of conts) {
      options.push({
        contratoId: ct.id,
        clienteId: c.id,
        razaoSocial: c.razaoSocial,
        nomeFantasia: c.nomeFantasia,
        cnpj: c.cnpj || '',
        numeroContrato: ct.numero,
      });
    }
  }
  return options;
}

/** Busca cliente+contrato por CNPJ; retorna uma opção por contrato (nome + contrato + cnpj). */
export function searchClienteContratoByCnpj(cnpj: string): ClienteContratoOption[] {
  const dig = (cnpj || '').replace(/\D/g, '');
  if (dig.length < 4) return [];
  const options: ClienteContratoOption[] = [];
  for (const c of clientes) {
    const cnpjDig = (c.cnpj || '').replace(/\D/g, '');
    if (!cnpjDig.includes(dig)) continue;
    const conts = contratos.filter((ct) => ct.clienteId === c.id);
    for (const ct of conts) {
      options.push({
        contratoId: ct.id,
        clienteId: c.id,
        razaoSocial: c.razaoSocial,
        nomeFantasia: c.nomeFantasia,
        cnpj: c.cnpj || '',
        numeroContrato: ct.numero,
      });
    }
  }
  return options;
}

export function getResponsaveis(): ResponsavelOption[] {
  return [...responsaveis];
}

/** Gera ID único para novo grupo */
function nextGrupoId(): string {
  return 'grp-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

export interface GrupoInput {
  nome: string;
  responsavelId: string;
  contratoIds: string[];
  ativo?: boolean;
}

export function criarGrupo(input: GrupoInput): Grupo {
  const id = nextGrupoId();
  const novo: Grupo = {
    id,
    nome: input.nome,
    responsavelId: input.responsavelId,
    contratoIds: input.contratoIds || [],
    ativo: input.ativo ?? true,
  };
  grupos.push(novo);
  return { ...novo };
}

export function atualizarGrupo(id: string, input: Partial<GrupoInput>): Grupo | null {
  const idx = grupos.findIndex((g) => g.id === id);
  if (idx === -1) return null;
  const now = { ...grupos[idx] };
  if (input.nome !== undefined) now.nome = input.nome;
  if (input.responsavelId !== undefined) now.responsavelId = input.responsavelId;
  if (input.contratoIds !== undefined) now.contratoIds = input.contratoIds;
  if (input.ativo !== undefined) now.ativo = input.ativo;
  grupos[idx] = now;
  return { ...now };
}

/** Listagem para a aba Grupo de cliente: ID, Grupo, Qtd Contrato, Qtd Ativo, Qtd Contatos vinculados, Status */
export function getGruposList(): GrupoListItem[] {
  return grupos.map((g) => {
    const qtdAtivo = getAtivosByContratoIds(g.contratoIds).length;
    const qtdContatosVinculados = usuarios.filter((u) => u.grupoId === g.id).length;
    return {
      id: g.id,
      nome: g.nome,
      qtdContrato: g.contratoIds.length,
      qtdAtivo,
      qtdContatosVinculados,
      ativo: g.ativo,
    };
  });
}
