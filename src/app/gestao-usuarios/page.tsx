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
  const [gruposFiltro, setGruposFiltro] = useState<GrupoListItem[]>([]);
  const [grupos, setGrupos] = useState<GrupoListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [loadingGrupos, setLoadingGrupos] = useState(false);
  const [grupoIdFiltro, setGrupoIdFiltro] = useState<string>('');
  const [busca, setBusca] = useState('');
  const [ativoFiltro, setAtivoFiltro] = useState<string>('');
  const [modalNovoGrupoOpen, setModalNovoGrupoOpen] = useState(false);
  const [grupoEditId, setGrupoEditId] = useState<string | null>(null);
  const [paginaUsuarios, setPaginaUsuarios] = useState(1);
  const [itensPorPaginaUsuarios, setItensPorPaginaUsuarios] = useState(25);
  const [totalItensUsuarios, setTotalItensUsuarios] = useState(0);
  const [totalPaginasUsuarios, setTotalPaginasUsuarios] = useState(0);
  const [paginaGrupos, setPaginaGrupos] = useState(1);
  const [itensPorPaginaGrupos, setItensPorPaginaGrupos] = useState(25);
  const [totalItensGrupos, setTotalItensGrupos] = useState(0);
  const [totalPaginasGrupos, setTotalPaginasGrupos] = useState(0);

  const ITENS_POR_PAGINA_OPCOES = [10, 25, 50, 100];

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

  const loadGrupos = (showLoading = true) => {
    if (showLoading) setLoadingGrupos(true);
    const params = new URLSearchParams();
    params.set('pagina', String(paginaGrupos));
    params.set('itensPorPagina', String(itensPorPaginaGrupos));
    fetch(`/api/grupos?${params}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.items) {
          setGrupos(data.items);
          setTotalItensGrupos(data.totalItens ?? 0);
          setTotalPaginasGrupos(data.totalPaginas ?? 0);
        } else {
          setGrupos([]);
          setTotalItensGrupos(0);
          setTotalPaginasGrupos(0);
        }
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
    params.set('pagina', String(paginaUsuarios));
    params.set('itensPorPagina', String(itensPorPaginaUsuarios));
    setLoading(true);
    fetch(`/api/usuarios?${params}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.items) {
          setUsuarios(data.items);
          setTotalItensUsuarios(data.totalItens ?? 0);
          setTotalPaginasUsuarios(data.totalPaginas ?? 0);
        } else {
          setUsuarios([]);
          setTotalItensUsuarios(0);
          setTotalPaginasUsuarios(0);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const loadGruposParaFiltro = () => {
    fetch('/api/grupos?pagina=1&itensPorPagina=1000')
      .then((res) => res.json())
      .then((data) => {
        setGruposFiltro(data?.items ?? []);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadClientes();
    loadGruposParaFiltro();
  }, []);

  useEffect(() => {
    if (aba === 'usuarios') loadUsuarios();
  }, [aba, grupoIdFiltro, busca, ativoFiltro, paginaUsuarios, itensPorPaginaUsuarios]);

  useEffect(() => {
    if (aba === 'clientes') loadGrupos();
  }, [aba, paginaGrupos, itensPorPaginaGrupos]);

  useEffect(() => {
    if (abaParam === 'clientes') setAba('clientes');
  }, [abaParam]);

  const getGrupoOuClienteNome = (u: Usuario) => {
    if (u.grupoId) return gruposFiltro.find((g) => g.id === u.grupoId)?.nome ?? u.grupoId;
    const c = clientes.find((x) => x.id === u.clienteId);
    return (c?.nomeFantasia || c?.razaoSocial) ?? u.clienteId;
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
                  onChange={(e) => { setGrupoIdFiltro(e.target.value); setPaginaUsuarios(1); }}
                  className="input-field"
                >
                  <option value="">Todos</option>
                  {gruposFiltro.filter((g) => g.ativo).map((g) => (
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
                    onChange={(e) => { setBusca(e.target.value); setPaginaUsuarios(1); }}
                    placeholder="Nome ou e-mail"
                    className="input-field pl-9"
                  />
                </div>
              </div>
              <div className="min-w-[140px]">
                <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
                <select
                  value={ativoFiltro}
                  onChange={(e) => { setAtivoFiltro(e.target.value); setPaginaUsuarios(1); }}
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
              <>
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
                {totalPaginasUsuarios > 0 && (
                  <div className="pagination">
                    <span className="pagination-info">
                      Página {paginaUsuarios} de {totalPaginasUsuarios} ({totalItensUsuarios} itens)
                    </span>
                    <div className="pagination-controls">
                      <button type="button" disabled={paginaUsuarios <= 1} onClick={() => setPaginaUsuarios(1)} aria-label="Primeira página">&laquo;</button>
                      <button type="button" disabled={paginaUsuarios <= 1} onClick={() => setPaginaUsuarios((p) => Math.max(1, p - 1))} aria-label="Página anterior">&lsaquo;</button>
                      {Array.from({ length: Math.min(5, totalPaginasUsuarios) }, (_, i) => {
                        const p = Math.max(1, Math.min(paginaUsuarios - 2, totalPaginasUsuarios - 4)) + i;
                        if (p > totalPaginasUsuarios) return null;
                        return (
                          <button key={p} type="button" className={paginaUsuarios === p ? 'active' : ''} onClick={() => setPaginaUsuarios(p)}>{p}</button>
                        );
                      })}
                      <button type="button" disabled={paginaUsuarios >= totalPaginasUsuarios} onClick={() => setPaginaUsuarios((p) => Math.min(totalPaginasUsuarios, p + 1))} aria-label="Próxima página">&rsaquo;</button>
                      <button type="button" disabled={paginaUsuarios >= totalPaginasUsuarios} onClick={() => setPaginaUsuarios(totalPaginasUsuarios)} aria-label="Última página">&raquo;</button>
                      <label className="ml-3 flex items-center gap-1 text-sm text-slate-500">
                        Por página:
                        <select value={itensPorPaginaUsuarios} onChange={(e) => { setItensPorPaginaUsuarios(Number(e.target.value)); setPaginaUsuarios(1); }} aria-label="Itens por página" className="rounded border border-slate-300 bg-white px-2 py-1 text-sm">
                          {ITENS_POR_PAGINA_OPCOES.map((n) => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                )}
              </>
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
                  loadGruposParaFiltro();
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
              <>
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
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-mono text-slate-700">{g.id.toUpperCase()}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">{g.nome}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{g.qtdContrato}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{g.qtdAtivo}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{g.qtdContatosVinculados}</td>
                        <td className="w-[8rem] whitespace-nowrap px-4 py-3">
                          <label className="flex cursor-pointer items-center gap-3">
                            <span className="relative inline-flex h-6 w-11 shrink-0 rounded-full focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2">
                              <input
                                type="checkbox"
                                checked={!!g.ativo}
                                onChange={async () => {
                                  const id = g.id;
                                  const novoAtivo = !g.ativo;
                                  setGrupos((prev) => prev.map((gr) => (gr.id === id ? { ...gr, ativo: novoAtivo } : gr)));
                                  try {
                                    const res = await fetch(`/api/grupos/${id}`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ ativo: novoAtivo }),
                                    });
                                    if (!res.ok) {
                                      setGrupos((prev) => prev.map((gr) => (gr.id === id ? { ...gr, ativo: !novoAtivo } : gr)));
                                      alert('Erro ao alterar status.');
                                    }
                                  } catch {
                                    setGrupos((prev) => prev.map((gr) => (gr.id === id ? { ...gr, ativo: !novoAtivo } : gr)));
                                    alert('Erro ao alterar status.');
                                  }
                                }}
                                className="peer sr-only"
                                title={g.ativo ? 'Desativar' : 'Ativar'}
                              />
                              <span className="absolute inset-0 rounded-full bg-[#DDE4EB] transition-colors peer-checked:bg-red-500" aria-hidden />
                              <span className="absolute left-0.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-[1.375rem]" aria-hidden />
                            </span>
                            <span className="min-w-[3.5rem] text-sm text-slate-600">{g.ativo ? 'Ativo' : 'Inativo'}</span>
                          </label>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
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
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {totalPaginasGrupos > 0 && (
                <div className="pagination">
                  <span className="pagination-info">
                    Página {paginaGrupos} de {totalPaginasGrupos} ({totalItensGrupos} itens)
                  </span>
                  <div className="pagination-controls">
                    <button type="button" disabled={paginaGrupos <= 1} onClick={() => setPaginaGrupos(1)} aria-label="Primeira página">&laquo;</button>
                    <button type="button" disabled={paginaGrupos <= 1} onClick={() => setPaginaGrupos((p) => Math.max(1, p - 1))} aria-label="Página anterior">&lsaquo;</button>
                    {Array.from({ length: Math.min(5, totalPaginasGrupos) }, (_, i) => {
                      const p = Math.max(1, Math.min(paginaGrupos - 2, totalPaginasGrupos - 4)) + i;
                      if (p > totalPaginasGrupos) return null;
                      return (
                        <button key={p} type="button" className={paginaGrupos === p ? 'active' : ''} onClick={() => setPaginaGrupos(p)}>{p}</button>
                      );
                    })}
                    <button type="button" disabled={paginaGrupos >= totalPaginasGrupos} onClick={() => setPaginaGrupos((p) => Math.min(totalPaginasGrupos, p + 1))} aria-label="Próxima página">&rsaquo;</button>
                    <button type="button" disabled={paginaGrupos >= totalPaginasGrupos} onClick={() => setPaginaGrupos(totalPaginasGrupos)} aria-label="Última página">&raquo;</button>
                    <label className="ml-3 flex items-center gap-1 text-sm text-slate-500">
                      Por página:
                      <select value={itensPorPaginaGrupos} onChange={(e) => { setItensPorPaginaGrupos(Number(e.target.value)); setPaginaGrupos(1); }} aria-label="Itens por página" className="rounded border border-slate-300 bg-white px-2 py-1 text-sm">
                        {ITENS_POR_PAGINA_OPCOES.map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
