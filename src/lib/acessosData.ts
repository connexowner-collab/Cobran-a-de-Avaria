/**
 * Dados (mock) de acessos dos clientes ao Portal do Cliente, usados no Dashboard
 * da tela de Gestão de Clientes/Externo. Em produção viriam do log de acessos.
 *
 * Convenções:
 *  - diasSemAcesso: dias desde o último acesso; null = nunca acessou o portal.
 *  - criadoDiasAtras: há quantos dias o acesso foi criado (para "nunca acessou").
 *  - REGRA_BLOQUEIO_DIAS: acima disso sem acessar, o usuário é bloqueado automaticamente.
 */

export const REGRA_BLOQUEIO_DIAS = 90;

export interface AcessoCliente {
  clienteId: string;
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  grupo: string;
  usuarios: number;
  /** Total de acessos nos últimos 90 dias. */
  acessos90d: number;
  /** Dias desde o último acesso; null = nunca acessou. */
  diasSemAcesso: number | null;
  /** Há quantos dias o acesso do cliente foi criado. */
  criadoDiasAtras: number;
}

export const ACESSOS_CLIENTES: AcessoCliente[] = [
  { clienteId: '1', nomeFantasia: 'Alpha', razaoSocial: 'Empresa Alpha Ltda', cnpj: '00.000.000/0001-00', grupo: 'Alpha', usuarios: 3, acessos90d: 412, diasSemAcesso: 0, criadoDiasAtras: 540 },
  { clienteId: '2', nomeFantasia: 'Beta', razaoSocial: 'Beta Comércio S.A.', cnpj: '00.000.000/0002-00', grupo: 'Beta', usuarios: 3, acessos90d: 288, diasSemAcesso: 1, criadoDiasAtras: 500 },
  { clienteId: '4', nomeFantasia: 'Delta Log', razaoSocial: 'Delta Logística Ltda', cnpj: '12.345.678/0001-90', grupo: 'Delta Log', usuarios: 3, acessos90d: 260, diasSemAcesso: 2, criadoDiasAtras: 470 },
  { clienteId: '6', nomeFantasia: 'Zeta', razaoSocial: 'Zeta Cargas S.A.', cnpj: '22.222.222/0002-22', grupo: '—', usuarios: 2, acessos90d: 197, diasSemAcesso: 4, criadoDiasAtras: 300 },
  { clienteId: '5', nomeFantasia: 'Epsilon', razaoSocial: 'Epsilon Transportes Ltda', cnpj: '11.111.111/0001-11', grupo: '—', usuarios: 2, acessos90d: 154, diasSemAcesso: 7, criadoDiasAtras: 260 },
  { clienteId: '10', nomeFantasia: 'Kappa', razaoSocial: 'Kappa Cargas e Logística', cnpj: '66.666.666/0006-66', grupo: '—', usuarios: 2, acessos90d: 132, diasSemAcesso: 9, criadoDiasAtras: 220 },
  { clienteId: '8', nomeFantasia: 'Theta', razaoSocial: 'Theta Frota S.A.', cnpj: '44.444.444/0004-44', grupo: '—', usuarios: 2, acessos90d: 96, diasSemAcesso: 14, criadoDiasAtras: 210 },
  { clienteId: '7', nomeFantasia: 'Eta Log', razaoSocial: 'Eta Log Ltda', cnpj: '33.333.333/0003-33', grupo: '—', usuarios: 2, acessos90d: 61, diasSemAcesso: 27, criadoDiasAtras: 190 },
  { clienteId: '9', nomeFantasia: 'Iota', razaoSocial: 'Iota Movimentação Ltda', cnpj: '55.555.555/0005-55', grupo: '—', usuarios: 2, acessos90d: 33, diasSemAcesso: 44, criadoDiasAtras: 160 },
  { clienteId: '11', nomeFantasia: 'Lambda', razaoSocial: 'Lambda Transportes Ltda', cnpj: '77.777.777/0007-77', grupo: '—', usuarios: 2, acessos90d: 12, diasSemAcesso: 72, criadoDiasAtras: 150 },
  { clienteId: '3', nomeFantasia: 'Gamma', razaoSocial: 'Gamma Serviços Ltda', cnpj: '00.000.000/0003-00', grupo: 'Gamma', usuarios: 2, acessos90d: 4, diasSemAcesso: 118, criadoDiasAtras: 400 },
  { clienteId: '12', nomeFantasia: 'Mu', razaoSocial: 'Mu Operações Logísticas S.A.', cnpj: '88.888.888/0008-88', grupo: '—', usuarios: 1, acessos90d: 2, diasSemAcesso: 145, criadoDiasAtras: 320 },
  { clienteId: '13', nomeFantasia: 'Nu', razaoSocial: 'Nu Frota Nacional Ltda', cnpj: '99.999.999/0009-99', grupo: '—', usuarios: 1, acessos90d: 0, diasSemAcesso: null, criadoDiasAtras: 120 },
  { clienteId: '14', nomeFantasia: 'Xi', razaoSocial: 'Xi Cargas Rápidas S.A.', cnpj: '10.101.010/0010-10', grupo: '—', usuarios: 1, acessos90d: 0, diasSemAcesso: null, criadoDiasAtras: 25 },
];

export interface TelaMaisAcessada {
  tela: string;
  acessos: number;
  topClientes: { nome: string; acessos: number }[];
}

export const TELAS_MAIS_ACESSADAS: TelaMaisAcessada[] = [
  { tela: 'Faturamento', acessos: 1240, topClientes: [{ nome: 'Alpha', acessos: 210 }, { nome: 'Beta', acessos: 160 }, { nome: 'Delta Log', acessos: 120 }] },
  { tela: 'Cobrança de Avarias', acessos: 980, topClientes: [{ nome: 'Delta Log', acessos: 180 }, { nome: 'Alpha', acessos: 150 }, { nome: 'Zeta', acessos: 90 }] },
  { tela: 'Relatórios', acessos: 870, topClientes: [{ nome: 'Alpha', acessos: 190 }, { nome: 'Kappa', acessos: 110 }, { nome: 'Beta', acessos: 95 }] },
  { tela: 'Central de Chamados', acessos: 540, topClientes: [{ nome: 'Beta', acessos: 120 }, { nome: 'Epsilon', acessos: 80 }, { nome: 'Alpha', acessos: 70 }] },
  { tela: 'Multas', acessos: 430, topClientes: [{ nome: 'Zeta', acessos: 90 }, { nome: 'Theta', acessos: 70 }, { nome: 'Delta Log', acessos: 60 }] },
  { tela: 'Veículos / CRLV', acessos: 360, topClientes: [{ nome: 'Alpha', acessos: 80 }, { nome: 'Kappa', acessos: 55 }, { nome: 'Iota', acessos: 40 }] },
];

/* ───────────────────── Detalhamento por cliente / por tela ───────────────────── */

export interface UsuarioAcesso {
  nome: string;
  email: string;
  perfil: string;
  /** Dias desde o último acesso do usuário; null = nunca acessou. */
  diasSemAcesso: number | null;
}

const PERFIS_MOCK = ['Administrador', 'Operador', 'Visualizador'];
const PRIMEIROS = ['Ana', 'Bruno', 'Carla', 'Diego', 'Eduardo', 'Fernanda', 'Gustavo', 'Helena', 'Igor', 'Juliana', 'Rafael', 'Marina'];
const SOBRENOMES = ['Silva', 'Souza', 'Oliveira', 'Costa', 'Pereira', 'Almeida', 'Lima', 'Rocha'];

/** Gera (de forma determinística) a lista de usuários de um cliente para o detalhe. */
export function usuariosDoCliente(c: AcessoCliente): UsuarioAcesso[] {
  const dominio = c.nomeFantasia.toLowerCase().replace(/[^a-z]/g, '') || 'cliente';
  const seed = Number(c.clienteId) || c.nomeFantasia.length;
  return Array.from({ length: c.usuarios }, (_, i) => {
    const nome = `${PRIMEIROS[(seed + i * 3) % PRIMEIROS.length]} ${SOBRENOMES[(i * 5 + seed) % SOBRENOMES.length]}`;
    const primeiro = nome.split(' ')[0].toLowerCase();
    const sobrenome = nome.split(' ')[1].toLowerCase();
    const email = `${primeiro}.${sobrenome}${i > 0 ? i + 1 : ''}@${dominio}.com.br`;
    const perfil = PERFIS_MOCK[i % PERFIS_MOCK.length];
    const dias = c.diasSemAcesso === null ? null : i === 0 ? c.diasSemAcesso : c.diasSemAcesso + i * 3 + (i % 2 ? 2 : 5);
    return { nome, email, perfil, diasSemAcesso: dias };
  });
}

export interface TelaClienteAcesso { tela: string; acessos: number }

/** Distribui os acessos do cliente entre as telas (para o detalhe do cliente). */
export function telasDoCliente(c: AcessoCliente): TelaClienteAcesso[] {
  if (c.acessos90d === 0) return [];
  const pesos = [0.34, 0.24, 0.18, 0.12, 0.08, 0.04];
  return TELAS_MAIS_ACESSADAS
    .map((t, i) => ({ tela: t.tela, acessos: Math.round(c.acessos90d * (pesos[i] ?? 0.02)) }))
    .filter((t) => t.acessos > 0)
    .sort((a, b) => b.acessos - a.acessos);
}

/** Está bloqueado por inatividade: passou da regra de dias sem acesso
 *  (ou nunca acessou e o acesso foi criado há mais que a regra). */
export function estaBloqueadoPorInatividade(c: AcessoCliente): boolean {
  if (c.diasSemAcesso === null) return c.criadoDiasAtras >= REGRA_BLOQUEIO_DIAS;
  return c.diasSemAcesso >= REGRA_BLOQUEIO_DIAS;
}

/** Dias efetivos sem acesso (para "nunca acessou", usa os dias desde a criação). */
export function diasSemAcessoEfetivo(c: AcessoCliente): number {
  return c.diasSemAcesso === null ? c.criadoDiasAtras : c.diasSemAcesso;
}
