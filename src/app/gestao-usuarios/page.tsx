'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Plus, Pencil, Trash2, Users, Building2, Search } from 'lucide-react';
import type { Usuario, GrupoListItem } from '@/types';
import type { Cliente } from '@/types';
import ModalNovoGrupo from '@/components/ModalNovoGrupo';
import DateRangeFilter, { isDateInRange } from '@/components/DateRangeFilter';
import type { DateRange } from 'react-day-picker';

type Aba = 'usuarios' | 'clientes';

export default function GestaoUsuariosPage() {
  const searchParams = useSearchParams();
  const abaParam = searchParams.get('aba');
  const [aba, setAba] = useState<Aba>(abaParam === 'clientes' ? 'clientes' : 'usuarios');

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [gruposFiltro, setGruposFiltro] = useState<GrupoListItem[]>([]);
  const [grupos, setGrupos] = useState<GrupoListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [loadingGrupos, setLoadingGrupos] = useState(false);
  const [inicialUsuariosCarregado, setInicialUsuariosCarregado] = useState(false);
  const [inicialGruposCarregado, setInicialGruposCarregado] = useState(false);
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
  const [mensagemFlash, setMensagemFlash] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  /** Filtros por coluna (aba Usuários) */
  const [filtroColNome, setFiltroColNome] = useState('');
  const [filtroColEmail, setFiltroColEmail] = useState('');
  const [filtroColGrupo, setFiltroColGrupo] = useState('');
  const [filtroColStatus, setFiltroColStatus] = useState('');
  const [filtroCriadoEmRange, setFiltroCriadoEmRange] = useState<DateRange | undefined>(undefined);
  const [filtroUltimoAcessoRange, setFiltroUltimoAcessoRange] = useState<DateRange | undefined>(undefined);
  /** Filtros por coluna (aba Grupo de clientes) */
  const [filtroColId, setFiltroColId] = useState('');
  const [filtroColGrupoNome, setFiltroColGrupoNome] = useState('');
  const [filtroColQtdContrato, setFiltroColQtdContrato] = useState('');
  const [filtroColQtdAtivo, setFiltroColQtdAtivo] = useState('');
  const [filtroColQtdContatos, setFiltroColQtdContatos] = useState('');
  const [filtroColQtdDivisoes, setFiltroColQtdDivisoes] = useState('');
  const [filtroColStatusGrupo, setFiltroColStatusGrupo] = useState('');
  const [filtroCriadoEmGrupoRange, setFiltroCriadoEmGrupoRange] = useState<DateRange | undefined>(undefined);
  const [filtroAtualizadoEmGrupoRange, setFiltroAtualizadoEmGrupoRange] = useState<DateRange | undefined>(undefined);

  const ITENS_POR_PAGINA_OPCOES = [10, 25, 50, 100];

  /** Verifica se o valor da célula corresponde ao filtro da coluna (case-insensitive, contém). */
  const matchCol = (filtro: string, valor: string) =>
    !String(filtro).trim() || String(valor).toLowerCase().includes(String(filtro).trim().toLowerCase());

  /** Formata ISO para exibição: dd/MM/yyyy HH:mm */
  const formatarDataHora = (iso: string | null | undefined): string => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return '—';
      return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '—';
    }
  };

  /** Campo de filtro por coluna no padrão do layout: input com ícone de lupa à direita (ou sem ícone quando showSearch=false). */
  const FilterInput = ({
    value,
    onChange,
    placeholder = 'Filtrar...',
    ariaLabel,
    showSearch = true,
  }: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    ariaLabel: string;
    showSearch?: boolean;
  }) => (
    <div className="relative min-w-0">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className={`input-field input-field--no-border py-1.5 pl-2 text-xs ${showSearch ? 'pr-8' : 'pr-2'}`}
        aria-label={ariaLabel}
      />
      {showSearch && (
        <Search className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" aria-hidden />
      )}
    </div>
  );

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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    fetch(`/api/grupos?${params}`, { signal: controller.signal })
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
      })
      .catch((err) => {
        setGrupos([]);
        setTotalItensGrupos(0);
        setTotalPaginasGrupos(0);
        const isAbort = err?.name === 'AbortError';
        setMensagemFlash({ tipo: 'erro', texto: isAbort ? 'A requisição demorou muito. Tente novamente.' : 'Erro ao carregar grupos. Tente recarregar a página.' });
        setTimeout(() => setMensagemFlash(null), 6000);
      })
      .finally(() => {
        clearTimeout(timeoutId);
        setLoadingGrupos(false);
        setInicialGruposCarregado(true);
      });
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    fetch(`/api/usuarios?${params}`, { signal: controller.signal })
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
      })
      .catch((err) => {
        setUsuarios([]);
        setTotalItensUsuarios(0);
        setTotalPaginasUsuarios(0);
        const isAbort = err?.name === 'AbortError';
        setMensagemFlash({ tipo: 'erro', texto: isAbort ? 'A requisição demorou muito. Tente novamente.' : 'Erro ao carregar usuários. Tente recarregar a página.' });
        setTimeout(() => setMensagemFlash(null), 6000);
      })
      .finally(() => {
        clearTimeout(timeoutId);
        setLoading(false);
        setInicialUsuariosCarregado(true);
      });
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
    if (!id || id === 'undefined' || id === 'null') {
      setMensagemFlash({ tipo: 'erro', texto: 'ID do usuário inválido. Recarregue a página e tente novamente.' });
      return;
    }
    if (!confirm(`Excluir o usuário "${nome}"?`)) return;
    setMensagemFlash(null);
    const url = `/api/usuarios/${encodeURIComponent(id)}`;
    fetch(url, { method: 'DELETE' })
      .then(async (res) => {
        if (res.ok) {
          loadUsuarios();
          setMensagemFlash({ tipo: 'sucesso', texto: 'Usuário excluído.' });
          setTimeout(() => setMensagemFlash(null), 4000);
        } else {
          const data = await res.json().catch(() => ({}));
          setMensagemFlash({ tipo: 'erro', texto: data?.error || 'Erro ao excluir usuário.' });
        }
      })
      .catch(() => setMensagemFlash({ tipo: 'erro', texto: 'Erro ao excluir usuário. Verifique a conexão.' }));
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

      {mensagemFlash && (
        <div
          role="status"
          aria-live="polite"
          className={`rounded-lg px-4 py-3 text-sm ${mensagemFlash.tipo === 'sucesso' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}
        >
          {mensagemFlash.texto}
        </div>
      )}

      {aba === 'usuarios' && (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold text-slate-900">Usuários</h2>
            <Link href="/gestao-usuarios/novo" className="btn-primary inline-flex gap-2">
              <Plus className="h-4 w-4" />
              Novo usuário
            </Link>
          </div>

          <div className="table-container" aria-busy={loading || !inicialUsuariosCarregado}>
            {loading || !inicialUsuariosCarregado ? (
              <div className="flex justify-center py-12" role="status" aria-live="polite">
                <span className="text-slate-500">Carregando...</span>
              </div>
            ) : (
              <>
                {(() => {
                  const usuariosFiltered = usuarios.filter(
                    (u) =>
                      matchCol(filtroColNome, u.nome) &&
                      matchCol(filtroColEmail, u.email) &&
                      matchCol(filtroColGrupo, getGrupoOuClienteNome(u)) &&
                      matchCol(filtroColStatus, u.ativo ? 'Ativo' : 'Inativo') &&
                      isDateInRange(u.criadoEm, filtroCriadoEmRange) &&
                      isDateInRange(u.ultimoAcessoEm ?? null, filtroUltimoAcessoRange)
                  );
                  return (
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Nome</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">E-mail</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Grupo de cliente</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Data da criação</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Data do último acesso</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">Ações</th>
                    </tr>
                    <tr className="border-t border-slate-200 bg-slate-100/80">
                      <th className="px-2 py-1.5">
                        <FilterInput value={filtroColNome} onChange={setFiltroColNome} ariaLabel="Filtrar por nome" />
                      </th>
                      <th className="px-2 py-1.5">
                        <FilterInput value={filtroColEmail} onChange={setFiltroColEmail} ariaLabel="Filtrar por e-mail" />
                      </th>
                      <th className="px-2 py-1.5">
                        <FilterInput value={filtroColGrupo} onChange={setFiltroColGrupo} ariaLabel="Filtrar por grupo" />
                      </th>
                      <th className="px-2 py-1.5">
                        <FilterInput value={filtroColStatus} onChange={setFiltroColStatus} placeholder="Ativo/Inativo" ariaLabel="Filtrar por status" />
                      </th>
                      <th className="min-w-[11rem] px-2 py-1.5 overflow-hidden">
                        <DateRangeFilter value={filtroCriadoEmRange} onChange={setFiltroCriadoEmRange} ariaLabel="Filtrar por data da criação" />
                      </th>
                      <th className="min-w-[11rem] px-2 py-1.5 overflow-hidden">
                        <DateRangeFilter value={filtroUltimoAcessoRange} onChange={setFiltroUltimoAcessoRange} ariaLabel="Filtrar por data do último acesso" />
                      </th>
                      <th className="px-2 py-1.5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {usuariosFiltered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center">
                          <p className="text-slate-600 font-medium">Nenhum usuário encontrado.</p>
                          <p className="mt-1 text-sm text-slate-500">Tente ajustar os filtros ou cadastre um novo usuário.</p>
                        </td>
                      </tr>
                    ) : (
                      usuariosFiltered.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/50">
                          <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">{u.nome}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{u.email}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{getGrupoOuClienteNome(u)}</td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${u.ativo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                              {u.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{formatarDataHora(u.criadoEm)}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{formatarDataHora(u.ultimoAcessoEm ?? null)}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Link href={`/gestao-usuarios/${u.id}`} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-primary-600" title="Editar" aria-label={`Editar usuário ${u.nome}`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                              <button type="button" onClick={() => handleExcluir(u.id, u.nome)} className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600" title="Excluir" aria-label={`Excluir usuário ${u.nome}`}>
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                  );
                })()}
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
                      ? { nome: payload.nomeGrupo, responsavelId: payload.responsavelId, contratoIds: payload.contratoIds, divisoes: payload.divisoes ?? [] }
                      : { nomeGrupo: payload.nomeGrupo, responsavelId: payload.responsavelId, contratoIds: payload.contratoIds, divisoes: payload.divisoes ?? [] }
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
          <div className="table-container" aria-busy={loadingGrupos || !inicialGruposCarregado}>
            {loadingGrupos || !inicialGruposCarregado ? (
              <div className="flex justify-center py-12" role="status" aria-live="polite">
                <span className="text-slate-500">Carregando...</span>
              </div>
            ) : (
              <>
                {(() => {
                  const gruposFiltered = grupos.filter(
                    (g) =>
                      matchCol(filtroColId, g.id) &&
                      matchCol(filtroColGrupoNome, g.nome) &&
                      matchCol(filtroColQtdContrato, String(g.qtdContrato ?? '')) &&
                      matchCol(filtroColQtdAtivo, String(g.qtdAtivo ?? '')) &&
                      matchCol(filtroColQtdContatos, String(g.qtdContatosVinculados ?? '')) &&
                      matchCol(filtroColQtdDivisoes, String(g.qtdDivisoes ?? '')) &&
                      matchCol(filtroColStatusGrupo, g.ativo ? 'Ativo' : 'Inativo') &&
                      isDateInRange(g.criadoEm, filtroCriadoEmGrupoRange) &&
                      isDateInRange(g.atualizadoEm, filtroAtualizadoEmGrupoRange)
                  );
                  return (
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Grupo</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Qtd de Contrato</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Qtd de Ativo</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Qtd de Contatos vinculados</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Qtd de Divisões</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Data de Criação</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Data de Atualização</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">Ações</th>
                    </tr>
                    <tr className="border-t border-slate-200 bg-slate-100/80">
                      <th className="px-2 py-1.5">
                        <FilterInput value={filtroColId} onChange={setFiltroColId} ariaLabel="Filtrar por ID" />
                      </th>
                      <th className="px-2 py-1.5">
                        <FilterInput value={filtroColGrupoNome} onChange={setFiltroColGrupoNome} ariaLabel="Filtrar por grupo" />
                      </th>
                      <th className="px-2 py-1.5">
                        <FilterInput value={filtroColQtdContrato} onChange={setFiltroColQtdContrato} ariaLabel="Filtrar por qtd contrato" />
                      </th>
                      <th className="px-2 py-1.5">
                        <FilterInput value={filtroColQtdAtivo} onChange={setFiltroColQtdAtivo} ariaLabel="Filtrar por qtd ativo" />
                      </th>
                      <th className="px-2 py-1.5">
                        <FilterInput value={filtroColQtdContatos} onChange={setFiltroColQtdContatos} ariaLabel="Filtrar por qtd contatos" />
                      </th>
                      <th className="px-2 py-1.5">
                        <FilterInput value={filtroColQtdDivisoes} onChange={setFiltroColQtdDivisoes} ariaLabel="Filtrar por qtd divisões" />
                      </th>
                      <th className="px-2 py-1.5">
                        <FilterInput value={filtroColStatusGrupo} onChange={setFiltroColStatusGrupo} placeholder="Ativo/Inativo" ariaLabel="Filtrar por status" />
                      </th>
                      <th className="min-w-[11rem] px-2 py-1.5 overflow-hidden">
                        <DateRangeFilter value={filtroCriadoEmGrupoRange} onChange={setFiltroCriadoEmGrupoRange} ariaLabel="Filtrar por data da criação" />
                      </th>
                      <th className="min-w-[11rem] px-2 py-1.5 overflow-hidden">
                        <DateRangeFilter value={filtroAtualizadoEmGrupoRange} onChange={setFiltroAtualizadoEmGrupoRange} ariaLabel="Filtrar por data de atualização" />
                      </th>
                      <th className="px-2 py-1.5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {gruposFiltered.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-4 py-8 text-center text-slate-500">Nenhum grupo encontrado.</td>
                      </tr>
                    ) : (
                      gruposFiltered.map((g) => (
                      <tr key={g.id} className="hover:bg-slate-50/50">
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-mono text-slate-700">{g.id.toUpperCase()}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">{g.nome}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{g.qtdContrato}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{g.qtdAtivo}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{g.qtdContatosVinculados}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{g.qtdDivisoes ?? 0}</td>
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
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{formatarDataHora(g.criadoEm)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{formatarDataHora(g.atualizadoEm)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setGrupoEditId(g.id);
                              setModalNovoGrupoOpen(true);
                            }}
                            className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-primary-600"
                            title="Editar"
                            aria-label={`Editar grupo ${g.nome}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
                  );
                })()}
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
