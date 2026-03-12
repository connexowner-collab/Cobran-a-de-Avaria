'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Plus, Search, Pencil, Trash2, Users, Building2 } from 'lucide-react';
import type { Usuario, GrupoListItem } from '@/types';
import type { Cliente } from '@/types';
import ModalNovoGrupo from '@/components/ModalNovoGrupo';

type Aba = 'usuarios' | 'clientes';

export default function GestaoUsuariosPage() {
  const searchParams = useSearchParams();
  const abaParam = searchParams.get('aba');
  const [aba, setAba] = useState<Aba>(abaParam === 'clientes' ? 'clientes' : 'usuarios');

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [grupos, setGrupos] = useState<GrupoListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [loadingGrupos, setLoadingGrupos] = useState(false);
  const [grupoIdFiltro, setGrupoIdFiltro] = useState<string>('');
  const [busca, setBusca] = useState('');
  const [ativoFiltro, setAtivoFiltro] = useState<string>('');
  const [modalNovoGrupoOpen, setModalNovoGrupoOpen] = useState(false);
  const [grupoEditId, setGrupoEditId] = useState<string | null>(null);

  const loadClientes = () => {
    setLoadingClientes(true);
    fetch('/api/clientes')
      .then((res) => res.json())
      .then((data) => {
        setClientes(Array.isArray(data) ? data : []);
        setLoadingClientes(false);
      })
      .catch(() => setLoadingClientes(false));
  };

  const loadGrupos = () => {
    setLoadingGrupos(true);
    fetch('/api/grupos')
      .then((res) => res.json())
      .then((data) => {
        setGrupos(Array.isArray(data) ? data : []);
        setLoadingGrupos(false);
      })
      .catch(() => setLoadingGrupos(false));
  };

  const loadUsuarios = () => {
    const params = new URLSearchParams();
    if (grupoIdFiltro) params.set('grupoId', grupoIdFiltro);
    if (busca.trim()) params.set('busca', busca.trim());
    if (ativoFiltro === 'true') params.set('ativo', 'true');
    if (ativoFiltro === 'false') params.set('ativo', 'false');
    setLoading(true);
    fetch(`/api/usuarios?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setUsuarios(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadClientes();
    loadGrupos();
  }, []);

  useEffect(() => {
    if (aba === 'usuarios') loadUsuarios();
  }, [aba, grupoIdFiltro, busca, ativoFiltro]);

  useEffect(() => {
    if (abaParam === 'clientes') setAba('clientes');
  }, [abaParam]);

  const getGrupoOuClienteNome = (u: Usuario) => {
    if (u.grupoId) return grupos.find((g) => g.id === u.grupoId)?.nome ?? u.grupoId;
    return clientes.find((c) => c.id === u.clienteId)?.nomeFantasia || clientes.find((c) => c.id === u.clienteId)?.razaoSocial ?? u.clienteId;
  };

  const handleExcluir = (id: string, nome: string) => {
    if (!confirm(`Excluir o usuário "${nome}"?`)) return;
    fetch(`/api/usuarios/${id}`, { method: 'DELETE' })
      .then((res) => {
        if (res.ok) loadUsuarios();
        else alert('Erro ao excluir.');
      })
      .catch(() => alert('Erro ao excluir.'));
  };

  return (
    <div className="space-y-6">
      {/* Abas */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-1" aria-label="Abas">
          <button
            type="button"
            onClick={() => setAba('usuarios')}
            className={`inline-flex items-center gap-2 rounded-t-lg border border-b-0 px-4 py-2.5 text-sm font-medium transition ${
              aba === 'usuarios'
                ? 'border-slate-200 bg-white text-slate-900 shadow-sm'
                : 'border-transparent bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className="h-4 w-4" />
            Usuários
          </button>
          <button
            type="button"
            onClick={() => setAba('clientes')}
            className={`inline-flex items-center gap-2 rounded-t-lg border border-b-0 px-4 py-2.5 text-sm font-medium transition ${
              aba === 'clientes'
                ? 'border-slate-200 bg-white text-slate-900 shadow-sm'
                : 'border-transparent bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Building2 className="h-4 w-4" />
            Grupo de cliente
          </button>
        </nav>
      </div>

      {aba === 'usuarios' && (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold text-slate-900">Usuários</h2>
            <Link href="/gestao-usuarios/novo" className="btn-primary inline-flex gap-2">
              <Plus className="h-4 w-4" />
              Novo usuário
            </Link>
          </div>

          <div className="card p-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="min-w-[200px] flex-1">
                <label className="mb-1 block text-sm font-medium text-slate-700">Grupo de cliente</label>
                <select
                  value={grupoIdFiltro}
                  onChange={(e) => setGrupoIdFiltro(e.target.value)}
                  className="input-field"
                >
                  <option value="">Todos</option>
                  {grupos.filter((g) => g.ativo).map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="min-w-[200px] flex-1">
                <label className="mb-1 block text-sm font-medium text-slate-700">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Nome ou e-mail"
                    className="input-field pl-9"
                  />
                </div>
              </div>
              <div className="min-w-[140px]">
                <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
                <select
                  value={ativoFiltro}
                  onChange={(e) => setAtivoFiltro(e.target.value)}
                  className="input-field"
                >
                  <option value="">Todos</option>
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
              </div>
            </div>
          </div>

          <div className="table-container">
            {loading ? (
              <div className="flex justify-center py-12">
                <span className="text-slate-500">Carregando...</span>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Nome</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">E-mail</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Grupo de cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {usuarios.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">Nenhum usuário encontrado.</td>
                    </tr>
                  ) : (
                    usuarios.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50">
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">{u.nome}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{u.email}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{getGrupoOuClienteNome(u)}</td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${u.ativo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                            {u.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/gestao-usuarios/${u.id}`} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-primary-600" title="Editar">
                              <Pencil className="h-4 w-4" />
                            </Link>
                            <button type="button" onClick={() => handleExcluir(u.id, u.nome)} className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600" title="Excluir">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {aba === 'clientes' && (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold text-slate-900">Grupo de cliente</h2>
            <button
              type="button"
              onClick={() => {
                setGrupoEditId(null);
                setModalNovoGrupoOpen(true);
              }}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Novo Grupo
            </button>
          </div>
          <ModalNovoGrupo
            open={modalNovoGrupoOpen}
            onClose={() => {
              setModalNovoGrupoOpen(false);
              setGrupoEditId(null);
            }}
            grupoId={grupoEditId}
            onSalvar={async (payload) => {
              try {
                const isEdit = !!payload.grupoId;
                const url = isEdit ? `/api/grupos/${payload.grupoId}` : '/api/grupos';
                const res = await fetch(url, {
                  method: isEdit ? 'PUT' : 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(
                    isEdit
                      ? { nome: payload.nomeGrupo, responsavelId: payload.responsavelId, contratoIds: payload.contratoIds }
                      : { nomeGrupo: payload.nomeGrupo, responsavelId: payload.responsavelId, contratoIds: payload.contratoIds }
                  ),
                });
                if (res.ok) {
                  loadGrupos();
                } else {
                  const err = await res.json().catch(() => ({}));
                  alert(err?.error || (isEdit ? 'Erro ao atualizar grupo.' : 'Erro ao criar grupo.'));
                }
              } catch {
                alert('Erro ao salvar grupo.');
              }
            }}
          />
          <div className="table-container">
            {loadingGrupos ? (
              <div className="flex justify-center py-12">
                <span className="text-slate-500">Carregando...</span>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Grupo</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Qtd de Contrato</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Qtd de Ativo</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Qtd de Contatos vinculados</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {grupos.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500">Nenhum grupo encontrado.</td>
                    </tr>
                  ) : (
                    grupos.map((g) => (
                      <tr key={g.id} className="hover:bg-slate-50/50">
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-mono text-slate-700">{g.id}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">{g.nome}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{g.qtdContrato}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{g.qtdAtivo}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{g.qtdContatosVinculados}</td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${g.ativo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                            {g.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setGrupoEditId(g.id);
                                setModalNovoGrupoOpen(true);
                              }}
                              className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-primary-600"
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  const res = await fetch(`/api/grupos/${g.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ ativo: !g.ativo }),
                                  });
                                  if (res.ok) loadGrupos();
                                  else alert('Erro ao alterar status.');
                                } catch {
                                  alert('Erro ao alterar status.');
                                }
                              }}
                              className={`rounded px-2 py-1 text-xs font-medium ${g.ativo ? 'text-amber-700 hover:bg-amber-50' : 'text-emerald-700 hover:bg-emerald-50'}`}
                              title={g.ativo ? 'Desativar' : 'Ativar'}
                            >
                              {g.ativo ? 'Desativar' : 'Ativar'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
