import type { Cliente, Usuario, PermissaoUsuario } from '@/types';

/** Store em memória para demonstração. Em produção, substituir por banco de dados. */
const clientes: Cliente[] = [
  { id: '1', razaoSocial: 'Empresa Alpha Ltda', nomeFantasia: 'Alpha', cnpj: '00.000.000/0001-00', ativo: true },
  { id: '2', razaoSocial: 'Beta Comércio S.A.', nomeFantasia: 'Beta', cnpj: '00.000.000/0002-00', ativo: true },
  { id: '3', razaoSocial: 'Gamma Serviços Ltda', nomeFantasia: 'Gamma', cnpj: '00.000.000/0003-00', ativo: false },
];

const usuarios: Usuario[] = [
  {
    id: 'u1',
    nome: 'João Silva',
    email: 'joao.silva@alpha.com',
    ativo: true,
    clienteId: '1',
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

export function getUsuarios(filtros?: FiltrosUsuarios): Usuario[] {
  let result = [...usuarios];
  if (filtros?.clienteId) {
    result = result.filter((u) => u.clienteId === filtros.clienteId);
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
  const novo: Usuario = {
    id,
    ...input,
    criadoEm: now,
    atualizadoEm: now,
  };
  usuarios.push(novo);
  return { ...novo };
}

export function atualizarUsuario(id: string, input: Partial<UsuarioInput>): Usuario | null {
  const idx = usuarios.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  const now = new Date().toISOString();
  usuarios[idx] = {
    ...usuarios[idx],
    ...input,
    atualizadoEm: now,
  };
  return { ...usuarios[idx] };
}

export function excluirUsuario(id: string): boolean {
  const idx = usuarios.findIndex((u) => u.id === id);
  if (idx === -1) return false;
  usuarios.splice(idx, 1);
  return true;
}
