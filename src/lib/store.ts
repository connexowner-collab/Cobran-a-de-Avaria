import fs from 'fs';
import path from 'path';
import type { Cliente, Usuario, PermissaoUsuario, Contrato, Ativo, ClienteContratoOption, ResponsavelOption, GrupoListItem, Grupo, Divisao, Perfil, SolicitacaoAcesso, SolicitacaoAcessoInput, StatusSolicitacaoAcesso } from '@/types';
import { ACESSOS_CLIENTES, usuariosDoCliente } from '@/lib/acessosData';

const STORE_DIR = path.join(process.cwd(), '.data');
const STORE_FILE = path.join(STORE_DIR, 'store.json');

function loadFromFile(usuariosRef: Usuario[], gruposRef: Grupo[], perfisRef: Perfil[], solicitacoesRef: SolicitacaoAcesso[]): void {
  try {
    if (!fs.existsSync(STORE_FILE)) return;
    const raw = fs.readFileSync(STORE_FILE, 'utf-8');
    const data = JSON.parse(raw) as { usuarios?: Usuario[]; grupos?: Grupo[]; perfis?: Perfil[]; solicitacoes?: SolicitacaoAcesso[] };
    // Só sobrescreve se o arquivo tiver dados; arquivo vazio não apaga os dados em memória (seed)
    if (Array.isArray(data.usuarios) && data.usuarios.length > 0) {
      usuariosRef.length = 0;
      data.usuarios.forEach((u) => usuariosRef.push(u));
    }
    if (Array.isArray(data.grupos) && data.grupos.length > 0) {
      gruposRef.length = 0;
      data.grupos.forEach((g) => gruposRef.push(g));
    }
    if (Array.isArray(data.perfis) && data.perfis.length > 0) {
      perfisRef.length = 0;
      data.perfis.forEach((p) => perfisRef.push(p));
    }
    // Solicitações: sempre reflete o arquivo (inclusive lista vazia), pois não há seed.
    if (Array.isArray(data.solicitacoes)) {
      solicitacoesRef.length = 0;
      data.solicitacoes.forEach((s) => solicitacoesRef.push(s));
    }
  } catch {
    // Ignora erro de leitura (arquivo corrompido ou inexistente); mantém dados em memória
  }
}

/** Recarrega usuários, grupos, perfis e solicitações do arquivo (garante dados atualizados ao ler). */
export function reloadStoreFromFile(): void {
  loadFromFile(usuarios, grupos, perfis, solicitacoes);
}

/** Persiste os dados atuais em memória no arquivo (útil para restaurar seed ou backup). */
function persistSeedIfNoFile(): void {
  try {
    if (fs.existsSync(STORE_FILE)) return;
    if (!fs.existsSync(STORE_DIR)) {
      fs.mkdirSync(STORE_DIR, { recursive: true });
    }
    const data = { usuarios, grupos, perfis, solicitacoes };
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // Ignora falha ao criar .data (ex.: permissão)
  }
}

function saveToFile(usuariosRef: Usuario[], gruposRef: Grupo[], perfisRef: Perfil[]): void {
  try {
    if (!fs.existsSync(STORE_DIR)) {
      fs.mkdirSync(STORE_DIR, { recursive: true });
    }
    const data = { usuarios: usuariosRef, grupos: gruposRef, perfis: perfisRef, solicitacoes };
    const content = JSON.stringify(data, null, 2);
    fs.writeFileSync(STORE_FILE, content, 'utf-8');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('[store] Erro ao salvar .data/store.json:', msg);
    }
    // Não lança erro: a operação em memória (excluir/criar/atualizar) foi feita; só a persistência falhou
  }
}

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
  { id: '5', razaoSocial: 'Epsilon Transportes Ltda', nomeFantasia: 'Epsilon', cnpj: '11.111.111/0001-11', ativo: true },
  { id: '6', razaoSocial: 'Zeta Cargas S.A.', nomeFantasia: 'Zeta', cnpj: '22.222.222/0002-22', ativo: true },
  { id: '7', razaoSocial: 'Eta Log Ltda', nomeFantasia: 'Eta Log', cnpj: '33.333.333/0003-33', ativo: true },
  { id: '8', razaoSocial: 'Theta Frota S.A.', nomeFantasia: 'Theta', cnpj: '44.444.444/0004-44', ativo: true },
  { id: '9', razaoSocial: 'Iota Movimentação Ltda', nomeFantasia: 'Iota', cnpj: '55.555.555/0005-55', ativo: true },
  { id: '10', razaoSocial: 'Kappa Cargas e Logística', nomeFantasia: 'Kappa', cnpj: '66.666.666/0006-66', ativo: true },
  { id: '11', razaoSocial: 'Lambda Transportes Ltda', nomeFantasia: 'Lambda', cnpj: '77.777.777/0007-77', ativo: true },
  { id: '12', razaoSocial: 'Mu Operações Logísticas S.A.', nomeFantasia: 'Mu', cnpj: '88.888.888/0008-88', ativo: true },
  { id: '13', razaoSocial: 'Nu Frota Nacional Ltda', nomeFantasia: 'Nu', cnpj: '99.999.999/0009-99', ativo: true },
  { id: '14', razaoSocial: 'Xi Cargas Rápidas S.A.', nomeFantasia: 'Xi', cnpj: '10.101.010/0010-10', ativo: true },
];

const contratos: Contrato[] = [
  { id: 'c1', clienteId: '1', numero: 'CONT-2024-001' },
  { id: 'c2', clienteId: '1', numero: 'CONT-2024-002' },
  { id: 'c3', clienteId: '2', numero: 'CONT-2024-003' },
  { id: 'c4', clienteId: '3', numero: 'CONT-2023-010' },
  { id: 'c5', clienteId: '4', numero: 'CONT-2024-100' },
  { id: 'c6', clienteId: '5', numero: 'CONT-2024-101' },
  { id: 'c7', clienteId: '6', numero: 'CONT-2024-102' },
  { id: 'c8', clienteId: '7', numero: 'CONT-2024-103' },
  { id: 'c9', clienteId: '8', numero: 'CONT-2024-104' },
  { id: 'c10', clienteId: '9', numero: 'CONT-2024-105' },
  { id: 'c11', clienteId: '10', numero: 'CONT-2024-106' },
  { id: 'c12', clienteId: '11', numero: 'CONT-2024-107' },
  { id: 'c13', clienteId: '12', numero: 'CONT-2024-108' },
  { id: 'c14', clienteId: '13', numero: 'CONT-2024-109' },
  { id: 'c15', clienteId: '14', numero: 'CONT-2024-110' },
];

const modelosBase = ['Empilhadeira', 'Retro', 'Paleteira', 'Carregadeira', 'Transpaleteira', 'Rebocador', 'Guincho', 'Pá carregadeira', 'Empilhadeira telescópica', 'Porta-container', 'Tanque', 'Baú'];

function gerarAtivosPorContrato(contratoId: string, inicioId: number, qtd: number): Ativo[] {
  const ativosGerados: Ativo[] = [];
  for (let i = 0; i < qtd; i++) {
    const n = inicioId + i;
    const placa = `BR${String(n).padStart(2, '0')}${String.fromCharCode(65 + (i % 26))}${(i % 10)}${String.fromCharCode(65 + ((i + 1) % 26))}`;
    const chassi = `9BWZZZ377VT00${4250 + n}`;
    ativosGerados.push({
      id: `a${n}`,
      contratoId,
      placa,
      chassi,
      numeroSerie: `SN-${String(n).padStart(3, '0')}`,
      modelo: `${modelosBase[i % modelosBase.length]} ${(Math.floor(i / modelosBase.length) + 1)}`,
    });
  }
  return ativosGerados;
}

const ativosBase: Ativo[] = [
  { id: 'a1', contratoId: 'c1', placa: 'ABC1D23', chassi: '9BWZZZ377VT004251', numeroSerie: 'SN-001', modelo: 'Empilhadeira X' },
  { id: 'a2', contratoId: 'c1', placa: 'DEF4G56', chassi: '9BWZZZ377VT004252', numeroSerie: 'SN-002', modelo: 'Empilhadeira Y' },
  { id: 'a3', contratoId: 'c2', placa: 'GHI7H89', chassi: '9BWZZZ377VT004253', numeroSerie: 'SN-003', modelo: 'Paleteira Z' },
  { id: 'a4', contratoId: 'c3', placa: 'JKL0I12', chassi: '9BWZZZ377VT004254', numeroSerie: 'SN-004', modelo: 'Rebocador A' },
  { id: 'a5', contratoId: 'c3', placa: 'MNO3P45', chassi: '9BWZZZ377VT004255', numeroSerie: 'SN-005', modelo: 'Rebocador B' },
  { id: 'a6', contratoId: 'c4', placa: 'PQR6S78', chassi: '9BWZZZ377VT004256', numeroSerie: 'SN-006', modelo: 'Transpaleteira C' },
  { id: 'a7', contratoId: 'c5', placa: 'STU9T01', chassi: '9BWZZZ377VT004257', numeroSerie: 'SN-007', modelo: 'Retro X1' },
  { id: 'a8', contratoId: 'c5', placa: 'VWX2Y34', chassi: '9BWZZZ377VT004258', numeroSerie: 'SN-008', modelo: 'Carregadeira Y2' },
];

/** Ativos sem placa (identificação apenas por Nº de série). */
const ativosSemPlaca: Ativo[] = [
  { id: 'a129', contratoId: 'c1', chassi: '', numeroSerie: 'SN-S001', modelo: 'Equipamento interno 1' },
  { id: 'a130', contratoId: 'c1', chassi: '', numeroSerie: 'SN-S002', modelo: 'Equipamento interno 2' },
  { id: 'a131', contratoId: 'c5', chassi: '', numeroSerie: 'SN-S003', modelo: 'Equipamento interno 3' },
  { id: 'a132', contratoId: 'c5', chassi: '', numeroSerie: 'SN-S004', modelo: 'Equipamento interno 4' },
  { id: 'a133', contratoId: 'c6', chassi: '', numeroSerie: 'SN-S005', modelo: 'Equipamento interno 5' },
];

const ativos: Ativo[] = [
  ...ativosBase,
  ...ativosSemPlaca,
  ...gerarAtivosPorContrato('c6', 9, 12),
  ...gerarAtivosPorContrato('c7', 21, 12),
  ...gerarAtivosPorContrato('c8', 33, 12),
  ...gerarAtivosPorContrato('c9', 45, 12),
  ...gerarAtivosPorContrato('c10', 57, 12),
  ...gerarAtivosPorContrato('c11', 69, 12),
  ...gerarAtivosPorContrato('c12', 81, 12),
  ...gerarAtivosPorContrato('c13', 93, 12),
  ...gerarAtivosPorContrato('c14', 105, 12),
  ...gerarAtivosPorContrato('c15', 117, 12),
];

const responsaveis: ResponsavelOption[] = [
  { id: 'r1', nome: 'Lucas Pessoa Duarte' },
  { id: 'u1', nome: 'João Silva' },
  { id: 'u2', nome: 'Maria Santos' },
  { id: 'u3', nome: 'Pedro Oliveira' },
];

/** Grupos com ID único. Inicialmente derivados dos clientes; novos via modal. */
const nowIso = () => new Date().toISOString();
const grupos: Grupo[] = [
  { id: 'grp-1', nome: 'Alpha', responsavelId: 'r1', contratoIds: ['c1', 'c2'], ativo: true, criadoEm: '2024-01-01T00:00:00.000Z', atualizadoEm: '2024-01-01T00:00:00.000Z' },
  { id: 'grp-2', nome: 'Beta', responsavelId: 'u3', contratoIds: ['c3'], ativo: true, criadoEm: '2024-01-01T00:00:00.000Z', atualizadoEm: '2024-01-01T00:00:00.000Z' },
  { id: 'grp-3', nome: 'Gamma', responsavelId: 'r1', contratoIds: ['c4'], ativo: false, criadoEm: '2024-01-01T00:00:00.000Z', atualizadoEm: '2024-01-01T00:00:00.000Z' },
  { id: 'grp-4', nome: 'Delta Log', responsavelId: 'r1', contratoIds: ['c5'], ativo: true, criadoEm: '2024-01-01T00:00:00.000Z', atualizadoEm: '2024-01-01T00:00:00.000Z' },
];

/** Mapeamento clienteId -> grupoId para usuários existentes (compatibilidade). */
const clienteIdToGrupoId: Record<string, string> = { '1': 'grp-1', '2': 'grp-2', '3': 'grp-3', '4': 'grp-4' };

/** Perfis de acesso reutilizáveis. */
const perfis: Perfil[] = [
  {
    id: 'perf-1',
    nome: 'Administrador',
    permissoes: {
      faturamento_acesso: true,
      avaria_acesso: true,
      vamoscontrole_acesso: true,
      relatorios_distribuicao_geografica: true,
      relatorios_manutencao: true,
      relatorios_modelos: true,
      relatorios_servicos: true,
      agendamento_agendar: true,
      agendamento_relatorio: true,
      agendamento_lote: true,
      multas_acesso: true,
      crlv_acesso: true,
      comunicados_acesso: true,
      importbi_acesso: true,
      logs_acesso: true,
      faq_acesso: true,
    },
  },
  {
    id: 'perf-2',
    nome: 'Operador',
    permissoes: {
      faturamento_acesso: true,
      avaria_acesso: true,
      relatorios_distribuicao_geografica: true,
      relatorios_manutencao: true,
      relatorios_modelos: true,
      relatorios_servicos: true,
    },
  },
  {
    id: 'perf-3',
    nome: 'Visualizador',
    permissoes: {
      faturamento_acesso: true,
      avaria_acesso: true,
      relatorios_distribuicao_geografica: true,
      relatorios_manutencao: true,
      relatorios_modelos: true,
      relatorios_servicos: true,
    },
  },
];

function perfilIdPorNome(nome: string): string {
  if (nome === 'Administrador') return 'perf-1';
  if (nome === 'Operador') return 'perf-2';
  return 'perf-3';
}

/** CPF determinístico (apenas para o protótipo) a partir de um índice. */
function cpfDeterministico(seed: number): string {
  const base = String((seed * 7654321 + 1234567) % 100_000_000_000).padStart(11, '0').slice(0, 11);
  return `${base.slice(0, 3)}.${base.slice(3, 6)}.${base.slice(6, 9)}-${base.slice(9, 11)}`;
}

/**
 * Gera os usuários do seed a partir dos clientes do Dashboard (ACESSOS_CLIENTES),
 * mantendo UMA fonte de verdade: os mesmos clientes/usuários aparecem no Dashboard
 * e na aba Usuários. Datas de último acesso são relativas a "hoje" e o bloqueio
 * automático (>90 dias sem acesso) é aplicado via ativo=false.
 */
function gerarUsuariosSeed(): Usuario[] {
  const DIA = 86_400_000;
  const agora = Date.now();
  const lista: Usuario[] = [];
  let n = 0;
  for (const cliente of ACESSOS_CLIENTES) {
    const grupoId = clienteIdToGrupoId[cliente.clienteId];
    for (const u of usuariosDoCliente(cliente)) {
      n++;
      const bloqueado = u.diasSemAcesso === null
        ? cliente.criadoDiasAtras >= 90
        : u.diasSemAcesso >= 90;
      const perfilId = perfilIdPorNome(u.perfil);
      const perfil = perfis.find((p) => p.id === perfilId);
      const ultimoAcessoEm = u.diasSemAcesso === null ? null : new Date(agora - u.diasSemAcesso * DIA).toISOString();
      const criadoEm = new Date(agora - cliente.criadoDiasAtras * DIA).toISOString();
      lista.push({
        id: `u${n}`,
        nome: u.nome,
        email: u.email,
        ativo: !bloqueado,
        clienteId: cliente.clienteId,
        cpf: cpfDeterministico(n),
        permissoes: perfil ? { ...perfil.permissoes } : {},
        criadoEm,
        atualizadoEm: criadoEm,
        ultimoAcessoEm,
        perfilId,
        ...(grupoId && { grupoId, grupoIds: [grupoId] }),
      });
    }
  }
  return lista;
}

const usuarios: Usuario[] = gerarUsuariosSeed();

/** Solicitações de acesso ao portal (chamados do botão "Solicite seu cadastro"). Sem seed. */
const solicitacoes: SolicitacaoAcesso[] = [];

// Na inicialização, carrega usuários, grupos, perfis e solicitações do arquivo (se existir) para persistir entre reinícios.
loadFromFile(usuarios, grupos, perfis, solicitacoes);
persistSeedIfNoFile();

export function getClientes(): Cliente[] {
  return [...clientes];
}

export function getClienteById(id: string): Cliente | undefined {
  return clientes.find((c) => c.id === id);
}

export interface FiltrosUsuarios {
  clienteId?: string;
  grupoId?: string;
  busca?: string;
  ativo?: boolean;
}

export function getGrupos(): Grupo[] {
  return [...grupos];
}

export function getGrupoById(id: string): Grupo | undefined {
  return grupos.find((g) => g.id === id);
}

/** Retorna o grupo que contém a divisão com o id informado. */
export function getGrupoByDivisaoId(divisaoId: string): Grupo | undefined {
  return grupos.find((g) => g.divisoes?.some((d) => d.id === divisaoId));
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
    result = result.filter((u) => {
      const ids = u.grupoIds ?? (u.grupoId ? [u.grupoId] : []);
      return ids.includes(filtros.grupoId!);
    });
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

/** Busca usuário pelo CPF (compara só os dígitos). */
export function getUsuarioByCpf(cpf: string): Usuario | undefined {
  const dig = (cpf || '').replace(/\D/g, '');
  if (dig.length < 11) return undefined;
  return usuarios.find((u) => u.cpf && u.cpf.replace(/\D/g, '') === dig);
}

/** Marca/desmarca a senha como provisória (força troca no próximo login). */
export function setSenhaProvisoria(id: string, valor: boolean): Usuario | null {
  const idx = usuarios.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  usuarios[idx] = { ...usuarios[idx], senhaProvisoria: valor, atualizadoEm: new Date().toISOString() };
  saveToFile(usuarios, grupos, perfis);
  return { ...usuarios[idx] };
}

export interface UsuarioInput {
  nome: string;
  email: string;
  ativo: boolean;
  clienteId: string;
  cpf?: string;
  senhaProvisoria?: boolean;
  grupoId?: string;
  grupoIds?: string[];
  divisaoIds?: string[];
  perfilId?: string;
  permissoes: PermissaoUsuario;
}

function resolveClienteIdFromGrupos(grupoIds: string[]): string {
  if (grupoIds.length === 0) return '';
  const g = getGrupoById(grupoIds[0]);
  if (g?.contratoIds.length) {
    const ct = contratos.find((c) => c.id === g.contratoIds[0]);
    if (ct) return ct.clienteId;
  }
  return '';
}

function resolveClienteIdFromDivisoes(divisaoIds: string[]): string {
  if (divisaoIds.length === 0) return '';
  const g = getGrupoByDivisaoId(divisaoIds[0]);
  if (g?.contratoIds.length) {
    const ct = contratos.find((c) => c.id === g.contratoIds[0]);
    if (ct) return ct.clienteId;
  }
  return '';
}

export function criarUsuario(input: UsuarioInput): Usuario {
  const id = 'u' + (usuarios.length + 1);
  const now = new Date().toISOString();
  const grupoIds = input.grupoIds?.length ? input.grupoIds : input.grupoId ? [input.grupoId] : [];
  const divisaoIds = Array.isArray(input.divisaoIds) ? input.divisaoIds : [];
  let clienteId = input.clienteId;
  if (grupoIds.length) {
    const cid = resolveClienteIdFromGrupos(grupoIds);
    if (cid) clienteId = cid;
  } else if (divisaoIds.length) {
    const cid = resolveClienteIdFromDivisoes(divisaoIds);
    if (cid) clienteId = cid;
  } else if (clienteId && clienteIdToGrupoId[clienteId]) {
    grupoIds.push(clienteIdToGrupoId[clienteId]);
  }
  const permissoes = input.permissoes && typeof input.permissoes === 'object'
    ? { ...input.permissoes }
    : {};
  const cpf = input.cpf?.trim() ? input.cpf.trim() : undefined;
  const novo: Usuario = {
    id,
    nome: input.nome,
    email: input.email,
    ativo: input.ativo,
    clienteId,
    permissoes,
    criadoEm: now,
    atualizadoEm: now,
    ultimoAcessoEm: null,
    senhaProvisoria: true,
    ...(cpf && { cpf }),
    ...(grupoIds.length > 0 && { grupoIds, grupoId: grupoIds[0] }),
    ...(divisaoIds.length > 0 && { divisaoIds }),
    ...(input.perfilId && { perfilId: input.perfilId }),
  };
  usuarios.push(novo);
  // Conclui automaticamente a solicitação de acesso do CPF (e/ou e-mail) recém-criado.
  concluirSolicitacaoAoCriarAcesso(cpf, novo.email);
  saveToFile(usuarios, grupos, perfis);
  return { ...novo };
}

export function atualizarUsuario(id: string, input: Partial<UsuarioInput>): Usuario | null {
  const idx = usuarios.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  const now = new Date().toISOString();
  let clienteId = input.clienteId ?? usuarios[idx].clienteId;
  const grupoIds = input.grupoIds !== undefined
    ? input.grupoIds
    : input.grupoId !== undefined
      ? [input.grupoId]
      : usuarios[idx].grupoIds ?? (usuarios[idx].grupoId ? [usuarios[idx].grupoId!] : []);
  const divisaoIds = input.divisaoIds !== undefined
    ? input.divisaoIds
    : usuarios[idx].divisaoIds ?? [];
  if (grupoIds.length) {
    const cid = resolveClienteIdFromGrupos(grupoIds);
    if (cid) clienteId = cid;
  } else if (divisaoIds.length) {
    const cid = resolveClienteIdFromDivisoes(divisaoIds);
    if (cid) clienteId = cid;
  }
  const permissoes = input.permissoes !== undefined && typeof input.permissoes === 'object'
    ? { ...input.permissoes }
    : usuarios[idx].permissoes && typeof usuarios[idx].permissoes === 'object'
      ? { ...usuarios[idx].permissoes }
      : {};
  usuarios[idx] = {
    ...usuarios[idx],
    ...input,
    clienteId,
    atualizadoEm: now,
    permissoes,
    ...(grupoIds.length > 0 && { grupoIds, grupoId: grupoIds[0] }),
    ...(Array.isArray(divisaoIds) && { divisaoIds }),
    ...(input.perfilId !== undefined && { perfilId: input.perfilId || undefined }),
  };
  saveToFile(usuarios, grupos, perfis);
  return { ...usuarios[idx] };
}

export function excluirUsuario(id: string): boolean {
  const idx = usuarios.findIndex((u) => u.id === id);
  if (idx === -1) return false;
  usuarios.splice(idx, 1);
  saveToFile(usuarios, grupos, perfis);
  return true;
}

/** Atualiza a data do último acesso do usuário no portal (chamado pelo PDV). */
export function registrarUltimoAcesso(usuarioId: string): boolean {
  const idx = usuarios.findIndex((u) => u.id === usuarioId);
  if (idx === -1) return false;
  usuarios[idx].ultimoAcessoEm = new Date().toISOString();
  saveToFile(usuarios, grupos, perfis);
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

/** Gera próximo ID de grupo no padrão grp-1, grp-2, grp-3, ... */
function nextGrupoId(): string {
  const numericIds = grupos
    .map((g) => {
      const match = g.id.match(/^grp-(\d+)$/i);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => n > 0);
  const next = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
  return 'grp-' + next;
}

export interface GrupoInput {
  nome: string;
  responsavelId: string;
  contratoIds: string[];
  ativo?: boolean;
  divisoes?: Divisao[];
}

/** Verifica se já existe grupo com o mesmo nome (ignora maiúsculas/minúsculas). Exclui um id da checagem (para edição). */
export function grupoNomeEmUso(nome: string, excluirGrupoId?: string): boolean {
  const n = (nome || '').trim().toLowerCase();
  if (!n) return false;
  return grupos.some(
    (g) => g.id !== excluirGrupoId && (g.nome || '').trim().toLowerCase() === n
  );
}

export function criarGrupo(input: GrupoInput): Grupo {
  const id = nextGrupoId();
  const iso = nowIso();
  const novo: Grupo = {
    id,
    nome: input.nome,
    responsavelId: input.responsavelId,
    contratoIds: input.contratoIds || [],
    ativo: input.ativo ?? true,
    divisoes: Array.isArray(input.divisoes) ? input.divisoes : [],
    criadoEm: iso,
    atualizadoEm: iso,
  };
  grupos.push(novo);
  saveToFile(usuarios, grupos, perfis);
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
  if (input.divisoes !== undefined) now.divisoes = Array.isArray(input.divisoes) ? input.divisoes : [];
  now.atualizadoEm = nowIso();
  grupos[idx] = now;
  saveToFile(usuarios, grupos, perfis);
  return { ...now };
}

export function getPerfis(): Perfil[] {
  return [...perfis];
}

export function getPerfilById(id: string): Perfil | undefined {
  return perfis.find((p) => p.id === id);
}

function nextPerfilId(): string {
  const numericIds = perfis
    .map((p) => {
      const match = p.id.match(/^perf-(\d+)$/i);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => n > 0);
  const next = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
  return 'perf-' + next;
}

export function criarPerfil(nome: string, permissoes: PermissaoUsuario): Perfil {
  const novo: Perfil = { id: nextPerfilId(), nome: nome.trim(), permissoes: { ...permissoes } };
  perfis.push(novo);
  saveToFile(usuarios, grupos, perfis);
  return { ...novo };
}

/** Listagem para a aba Grupo de cliente: ID, Grupo, Qtd Contrato, Qtd Ativo, Qtd Contatos vinculados, Status */
export function getGruposList(): GrupoListItem[] {
  return grupos.map((g) => {
    const qtdAtivo = getAtivosByContratoIds(g.contratoIds).length;
    const qtdContatosVinculados = usuarios.filter((u) => {
      const uIds = u.grupoIds ?? (u.grupoId ? [u.grupoId] : []);
      return uIds.includes(g.id);
    }).length;
    return {
      id: g.id,
      nome: g.nome,
      qtdContrato: g.contratoIds.length,
      qtdAtivo,
      qtdContatosVinculados,
      qtdDivisoes: g.divisoes?.length ?? 0,
      ativo: g.ativo,
      criadoEm: g.criadoEm,
      atualizadoEm: g.atualizadoEm,
    };
  });
}

/* ───────────────────────── Solicitações de acesso ───────────────────────── */

const soDigitos = (v: string | undefined | null): string => (v || '').replace(/\D/g, '');
const emailNorm = (v: string | undefined | null): string => (v || '').trim().toLowerCase();

/** Gera próximo protocolo no padrão SOL-0001, SOL-0002, ... */
function nextSolicitacaoId(): string {
  const numericIds = solicitacoes
    .map((s) => {
      const match = s.id.match(/^SOL-(\d+)$/i);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => n > 0);
  const next = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
  return 'SOL-' + String(next).padStart(4, '0');
}

export function getSolicitacoes(): SolicitacaoAcesso[] {
  return [...solicitacoes].sort((a, b) => (b.criadoEm > a.criadoEm ? 1 : -1));
}

export function getSolicitacaoById(id: string): SolicitacaoAcesso | undefined {
  return solicitacoes.find((s) => s.id.toLowerCase() === id.toLowerCase());
}

/** Retorna as solicitações de um CPF (para acompanhamento pelo cliente). */
export function getSolicitacoesByCpf(cpf: string): SolicitacaoAcesso[] {
  const dig = soDigitos(cpf);
  if (dig.length < 11) return [];
  return solicitacoes
    .filter((s) => soDigitos(s.cpf) === dig)
    .sort((a, b) => (b.criadoEm > a.criadoEm ? 1 : -1));
}

/**
 * Verifica se já existe um acesso (usuário) no portal para o CPF ou e-mail informado.
 */
export function existeAcessoParaCpfOuEmail(cpf: string, email: string): boolean {
  const cpfDig = soDigitos(cpf);
  const mail = emailNorm(email);
  return usuarios.some(
    (u) =>
      (cpfDig.length === 11 && u.cpf && soDigitos(u.cpf) === cpfDig) ||
      (!!mail && emailNorm(u.email) === mail)
  );
}

/**
 * Concilia os status: qualquer solicitação em aberto cujo CPF ou e-mail já possua
 * um acesso cadastrado no portal passa para "concluido". Cobre acessos criados por
 * fora do fluxo ou usuários que já existiam antes da solicitação. Persiste se mudar.
 */
export function reconciliarSolicitacoesConcluidas(): void {
  let mudou = false;
  const now = new Date().toISOString();
  solicitacoes.forEach((s, i) => {
    if (s.status === 'concluido') return;
    if (existeAcessoParaCpfOuEmail(s.cpf, s.emailCorporativo)) {
      solicitacoes[i] = { ...s, status: 'concluido', atualizadoEm: now };
      mudou = true;
    }
  });
  if (mudou) saveToFile(usuarios, grupos, perfis);
}

export type MotivoBloqueioSolicitacao = 'cpf' | 'email' | null;

/**
 * Verifica se o CPF ou e-mail já possui solicitação em aberto (pendente/em atendimento)
 * ou já existe um usuário cadastrado com esse e-mail/CPF. Retorna o motivo do bloqueio.
 */
export function motivoBloqueioSolicitacao(cpf: string, email: string): MotivoBloqueioSolicitacao {
  const cpfDig = soDigitos(cpf);
  const mail = emailNorm(email);
  // Solicitações em aberto com mesmo CPF
  const cpfEmAberto = solicitacoes.some(
    (s) => s.status !== 'concluido' && soDigitos(s.cpf) === cpfDig
  );
  const cpfJaUsuario = usuarios.some((u) => u.cpf && soDigitos(u.cpf) === cpfDig);
  if (cpfDig.length === 11 && (cpfEmAberto || cpfJaUsuario)) return 'cpf';
  // Solicitações em aberto com mesmo e-mail
  const emailEmAberto = solicitacoes.some(
    (s) => s.status !== 'concluido' && emailNorm(s.emailCorporativo) === mail
  );
  const emailJaUsuario = usuarios.some((u) => emailNorm(u.email) === mail);
  if (mail && (emailEmAberto || emailJaUsuario)) return 'email';
  return null;
}

export function criarSolicitacao(input: SolicitacaoAcessoInput): SolicitacaoAcesso {
  const now = new Date().toISOString();
  const nova: SolicitacaoAcesso = {
    id: nextSolicitacaoId(),
    nomeEmpresa: input.nomeEmpresa.trim(),
    cnpj: input.cnpj.trim(),
    nomeCompleto: input.nomeCompleto.trim(),
    cpf: input.cpf.trim(),
    dataNascimento: input.dataNascimento,
    emailCorporativo: input.emailCorporativo.trim().toLowerCase(),
    telefoneComercial: input.telefoneComercial.trim(),
    ...(input.telefoneCelular?.trim() && { telefoneCelular: input.telefoneCelular.trim() }),
    status: 'pendente',
    criadoEm: now,
    atualizadoEm: now,
  };
  solicitacoes.push(nova);
  saveToFile(usuarios, grupos, perfis);
  return { ...nova };
}

export function atualizarStatusSolicitacao(id: string, status: StatusSolicitacaoAcesso): SolicitacaoAcesso | null {
  const idx = solicitacoes.findIndex((s) => s.id.toLowerCase() === id.toLowerCase());
  if (idx === -1) return null;
  solicitacoes[idx] = { ...solicitacoes[idx], status, atualizadoEm: new Date().toISOString() };
  saveToFile(usuarios, grupos, perfis);
  return { ...solicitacoes[idx] };
}

/**
 * Conclui automaticamente as solicitações em aberto cujo CPF (ou e-mail) corresponde
 * ao acesso recém-criado. Não persiste — quem chama (criarUsuario) já salva em seguida.
 */
function concluirSolicitacaoAoCriarAcesso(cpf: string | undefined, email: string | undefined): void {
  const cpfDig = soDigitos(cpf);
  const mail = emailNorm(email);
  const now = new Date().toISOString();
  solicitacoes.forEach((s, i) => {
    if (s.status === 'concluido') return;
    const bateCpf = cpfDig.length === 11 && soDigitos(s.cpf) === cpfDig;
    const bateEmail = !!mail && emailNorm(s.emailCorporativo) === mail;
    if (bateCpf || bateEmail) {
      solicitacoes[i] = { ...s, status: 'concluido', atualizadoEm: now };
    }
  });
}
