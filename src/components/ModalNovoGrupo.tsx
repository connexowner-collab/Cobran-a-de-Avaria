'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Check, Maximize2, Minimize2, Pencil, Plus, Trash2 } from 'lucide-react';
import type { ClienteContratoOption, ResponsavelOption, Ativo } from '@/types';
import DropdownClientesMultiplo from './DropdownClientesMultiplo';
import { matchColuna } from '@/components/portal/ui';

/** Dica exibida nas colunas que aceitam vários valores colados de uma vez. */
const DICA_MULTI = 'Cole vários valores (do Excel, separados por espaço, vírgula ou quebra de linha) para filtrar todos de uma vez.';

const DIVISAO_INICIAL_ID = '__inicial__';

interface ModalNovoGrupoProps {
  open: boolean;
  onClose: () => void;
  /** Quando informado, o modal abre em modo edição para este grupo. */
  grupoId?: string | null;
  onSalvar?: (payload: { nomeGrupo: string; responsavelId: string; contratoIds: string[]; grupoId?: string; divisoes?: Array<{ id: string; nome: string; ativoIds: string[]; codigo?: string }> }) => void;
}

/** Checkbox quadrado padrão do modal. */
function Checkbox({ checked, onClick, label }: { checked: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onClick}
      className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
        checked ? 'border-[#c41e3a] bg-[#c41e3a] text-white' : 'border-slate-300 bg-white hover:border-slate-400'
      }`}
    >
      {checked && <Check className="h-3 w-3 stroke-[3]" />}
    </button>
  );
}

export default function ModalNovoGrupo({ open, onClose, grupoId, onSalvar }: ModalNovoGrupoProps) {
  const [nomeGrupo, setNomeGrupo] = useState('');
  const [responsavelId, setResponsavelId] = useState('');
  const [responsavelTexto, setResponsavelTexto] = useState('');
  const [responsaveis, setResponsaveis] = useState<ResponsavelOption[]>([]);
  const [responsavelOpen, setResponsavelOpen] = useState(false);

  const [clienteOptionsAll, setClienteOptionsAll] = useState<ClienteContratoOption[]>([]);
  /** IDs dos contratos (clientes) selecionados — múltipla seleção. */
  const [selectedContratoIds, setSelectedContratoIds] = useState<string[]>([]);
  const [clienteLoading, setClienteLoading] = useState(false);

  const [ativos, setAtivos] = useState<Ativo[]>([]);
  const [ativosLoading, setAtivosLoading] = useState(false);
  /** IDs dos ativos selecionados para movimentar em lote. */
  const [selectedAtivoIds, setSelectedAtivoIds] = useState<Set<string>>(new Set());
  /** Divisões criadas (nome + ativoIds + código estável). */
  const [divisoes, setDivisoes] = useState<Array<{ id: string; nome: string; ativoIds: string[]; codigo?: string }>>([]);
  /** Criação de divisão a partir da seleção (mostra o campo de nome na própria barra). */
  const [criandoDivisao, setCriandoDivisao] = useState(false);
  const [novaDivisaoNome, setNovaDivisaoNome] = useState('');
  /** Nome exibido da seção "Sem divisão" (editável pelo lápis). */
  const [nomeSecaoInicial, setNomeSecaoInicial] = useState('Sem divisão');
  /** ID da divisão (ou DIVISAO_INICIAL_ID) cujo nome está sendo editado. */
  const [editingNomeDivisaoId, setEditingNomeDivisaoId] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  /** Valor do select "Mover para" (resetado após aplicar). */
  const [batchMoveDestino, setBatchMoveDestino] = useState('');
  /** Filtros por coluna na lista de ativos */
  const [filtroPlaca, setFiltroPlaca] = useState('');
  const [filtroChassi, setFiltroChassi] = useState('');
  const [filtroNumeroSerie, setFiltroNumeroSerie] = useState('');
  const [filtroModelo, setFiltroModelo] = useState('');
  const [filtroContrato, setFiltroContrato] = useState('');
  const [filtroCnpj, setFiltroCnpj] = useState('');
  const [filtroNomeCliente, setFiltroNomeCliente] = useState('');

  const responsavelRef = useRef<HTMLDivElement>(null);

  const loadResponsaveis = useCallback(() => {
    fetch('/api/responsaveis')
      .then((res) => res.json())
      .then((data) => setResponsaveis(Array.isArray(data) ? data : []))
      .catch(() => setResponsaveis([]));
  }, []);

  /** Limpa o estado de criação/divisão. */
  const resetDivisaoUI = () => {
    setSelectedAtivoIds(new Set());
    setCriandoDivisao(false);
    setNovaDivisaoNome('');
    setEditingNomeDivisaoId(null);
    setBatchMoveDestino('');
    setNomeSecaoInicial('Sem divisão');
  };

  useEffect(() => {
    if (open) {
      loadResponsaveis();
      resetDivisaoUI();
      setDivisoes([]);
    } else {
      setFullscreen(false);
      setFiltroPlaca('');
      setFiltroChassi('');
      setFiltroNumeroSerie('');
      setFiltroModelo('');
      setFiltroContrato('');
      setFiltroCnpj('');
      setFiltroNomeCliente('');
    }
  }, [open, loadResponsaveis]);

  useEffect(() => {
    if (!open) return;
    if (!grupoId) {
      setNomeGrupo('');
      setResponsavelId('');
      setResponsavelTexto('');
      setSelectedContratoIds([]);
      setAtivos([]);
      setDivisoes([]);
      resetDivisaoUI();
      return;
    }
    fetch(`/api/grupos/${grupoId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((grupo) => {
        if (!grupo) return;
        setNomeGrupo(grupo.nome || '');
        setResponsavelId(grupo.responsavelId || '');
        setResponsavelTexto('');
        setSelectedContratoIds(grupo.contratoIds ?? []);
        if (grupo.responsavelId) {
          fetch('/api/responsaveis')
            .then((r) => r.json())
            .then((list) => {
              const r = (Array.isArray(list) ? list : []).find((x: { id: string }) => x.id === grupo.responsavelId);
              setResponsavelTexto(r?.nome || '');
            });
        }
        if ((grupo.contratoIds?.length ?? 0) > 0) {
          fetch('/api/clientes/opcoes')
            .then((r) => r.json())
            .then((opts: ClienteContratoOption[]) => {
              setClienteOptionsAll(Array.isArray(opts) ? opts : []);
            });
        }
        setDivisoes(Array.isArray(grupo.divisoes) ? grupo.divisoes : []);
      })
      .catch(() => {});
  }, [open, grupoId]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (responsavelRef.current && !responsavelRef.current.contains(e.target as Node)) setResponsavelOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [open]);

  const loadClienteOpcoes = useCallback(() => {
    setClienteLoading(true);
    fetch('/api/clientes/opcoes')
      .then((res) => res.json())
      .then((data) => {
        setClienteOptionsAll(Array.isArray(data) ? data : []);
      })
      .catch(() => setClienteOptionsAll([]))
      .finally(() => setClienteLoading(false));
  }, []);

  useEffect(() => {
    if (open && clienteOptionsAll.length === 0) loadClienteOpcoes();
  }, [open, clienteOptionsAll.length, loadClienteOpcoes]);

  const contratoIds = selectedContratoIds;
  useEffect(() => {
    if (contratoIds.length === 0) {
      setAtivos([]);
      setAtivosLoading(false);
      return;
    }
    const isRefetch = ativos.length > 0;
    if (!isRefetch) setAtivosLoading(true);
    fetch(`/api/ativos?contratoIds=${contratoIds.join(',')}`)
      .then((res) => res.json())
      .then((data) => setAtivos(Array.isArray(data) ? data : []))
      .catch(() => setAtivos([]))
      .finally(() => setAtivosLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contratoIds.join(',')]);

  const addCliente = (opt: ClienteContratoOption) => {
    if (!selectedContratoIds.includes(opt.contratoId)) {
      setSelectedContratoIds((prev) => [...prev, opt.contratoId]);
    }
  };

  const removeCliente = (contratoId: string) => {
    setSelectedContratoIds((prev) => prev.filter((id) => id !== contratoId));
  };

  const filteredResponsaveis = responsavelTexto.trim()
    ? responsaveis.filter((r) => r.nome.toLowerCase().includes(responsavelTexto.toLowerCase()))
    : responsaveis;

  const handleSalvar = () => {
    if (!nomeGrupo.trim() || !responsavelId || selectedContratoIds.length === 0) return;
    const isEdit = !!grupoId;
    onSalvar?.({
      nomeGrupo: nomeGrupo.trim(),
      responsavelId,
      contratoIds,
      ...(grupoId && { grupoId }),
      ...(divisoes.length > 0 && { divisoes }),
    });
    setNomeGrupo('');
    setResponsavelId('');
    setResponsavelTexto('');
    setSelectedContratoIds([]);
    setAtivos([]);
    setDivisoes([]);
    resetDivisaoUI();
    // Edição: fecha o modal. Novo: mantém aberto com formulário limpo para outro cadastro.
    if (isEdit) onClose();
  };

  const handleClose = () => {
    setNomeGrupo('');
    setResponsavelId('');
    setResponsavelTexto('');
    setSelectedContratoIds([]);
    setClienteOptionsAll([]);
    setAtivos([]);
    setDivisoes([]);
    resetDivisaoUI();
    onClose();
  };

  const toggleAtivoSelection = (ativoId: string) => {
    setSelectedAtivoIds((prev) => {
      const next = new Set(prev);
      if (next.has(ativoId)) next.delete(ativoId);
      else next.add(ativoId);
      return next;
    });
  };

  /** Retorna contrato, CNPJ e nome do cliente para um ativo (pelo contratoId). */
  const getContratoInfo = (contratoId: string) => {
    const opt = clienteOptionsAll.find((o) => o.contratoId === contratoId);
    return {
      contrato: opt?.numeroContrato ?? '-',
      cnpj: opt?.cnpj ?? '-',
      nomeCliente: (opt?.nomeFantasia || opt?.razaoSocial) ?? '-',
    };
  };

  /** Verifica se o valor corresponde ao filtro (case-insensitive, contém). */
  const matchCol = (filtro: string, valor: string) =>
    !String(filtro).trim() || String(valor).toLowerCase().includes(String(filtro).trim().toLowerCase());

  /** Ativos filtrados pelas colunas (placa/chassi/nº série aceitam vários valores). */
  const ativosFiltrados = ativos.filter((a) => {
    const info = getContratoInfo(a.contratoId);
    return (
      matchColuna((a.placa || a.numeroSerie) ?? '', filtroPlaca, true) &&
      matchColuna(a.chassi ?? '', filtroChassi, true) &&
      matchColuna(a.numeroSerie ?? '', filtroNumeroSerie, true) &&
      matchCol(filtroModelo, a.modelo) &&
      matchCol(filtroContrato, info.contrato) &&
      matchCol(filtroCnpj, info.cnpj) &&
      matchCol(filtroNomeCliente, info.nomeCliente)
    );
  });

  const estaEmAlgumaDivisao = (id: string) => divisoes.some((d) => d.ativoIds.includes(id));
  const ativosSemDivisao = ativosFiltrados.filter((a) => !estaEmAlgumaDivisao(a.id));

  /** Cria uma divisão a partir dos ativos atualmente selecionados. */
  const criarDivisaoDaSelecao = () => {
    if (!novaDivisaoNome.trim() || selectedAtivoIds.size === 0) return;
    setDivisoes((prev) => [...prev, { id: crypto.randomUUID(), nome: novaDivisaoNome.trim(), ativoIds: Array.from(selectedAtivoIds) }]);
    setSelectedAtivoIds(new Set());
    setNovaDivisaoNome('');
    setCriandoDivisao(false);
  };

  const excluirDivisao = (divisaoId: string) => {
    setDivisoes((prev) => prev.filter((d) => d.id !== divisaoId));
  };

  /** Altera o nome de uma divisão (ou da seção "Sem divisão"). */
  const salvarNomeDivisao = (id: string, nome: string) => {
    const n = (nome || '').trim();
    if (id === DIVISAO_INICIAL_ID) {
      setNomeSecaoInicial(n || 'Sem divisão');
    } else {
      setDivisoes((prev) => prev.map((d) => (d.id === id ? { ...d, nome: n || d.nome } : d)));
    }
    setEditingNomeDivisaoId(null);
  };

  /** Move os ativos selecionados para uma divisão (ou para "Sem divisão"). */
  const moverSelecionadosPara = (divisaoDestinoId: string) => {
    const ids = Array.from(selectedAtivoIds);
    if (ids.length === 0 || !divisaoDestinoId) return;
    setDivisoes((prev) => {
      if (divisaoDestinoId === DIVISAO_INICIAL_ID) {
        return prev.map((d) => ({ ...d, ativoIds: d.ativoIds.filter((id) => !ids.includes(id)) }));
      }
      return prev.map((d) =>
        d.id === divisaoDestinoId
          ? { ...d, ativoIds: Array.from(new Set([...d.ativoIds, ...ids])) }
          : { ...d, ativoIds: d.ativoIds.filter((id) => !ids.includes(id)) }
      );
    });
    setSelectedAtivoIds(new Set());
    setBatchMoveDestino('');
  };

  if (!open) return null;

  const label = 'block text-sm font-medium text-slate-700 mb-1';
  const input = 'input-field w-full';
  const thCls = 'px-4 py-2 text-left text-xs font-semibold uppercase text-slate-600 whitespace-nowrap';

  const totalAtivos = ativos.length;
  const totalEmDivisao = ativos.filter((a) => estaEmAlgumaDivisao(a.id)).length;
  const totalSemDivisao = totalAtivos - totalEmDivisao;

  /** Cabeçalho de colunas das tabelas de ativos. */
  const cabecalhoAtivos = (
    <tr>
      <th className="w-10 px-3 py-2" />
      <th className={thCls}>Placa</th>
      <th className={thCls}>Chassi</th>
      <th className={thCls}>Nº de série</th>
      <th className={thCls}>Modelo</th>
      <th className={thCls}>Contrato</th>
      <th className={thCls}>CNPJ</th>
      <th className={thCls}>Nome cliente</th>
    </tr>
  );

  /** Linha de filtros por coluna (placa/chassi/nº série aceitam vários valores). */
  const linhaFiltros = (
    <tr className="bg-slate-100/80">
      <th className="w-10 px-2 py-1" />
      <th className="px-2 py-1"><input value={filtroPlaca} onChange={(e) => setFiltroPlaca(e.target.value)} placeholder="Filtrar (vários)" title={DICA_MULTI} className="filter-input-line w-full px-2 text-xs" aria-label="Filtrar placa (aceita vários valores)" /></th>
      <th className="px-2 py-1"><input value={filtroChassi} onChange={(e) => setFiltroChassi(e.target.value)} placeholder="Filtrar (vários)" title={DICA_MULTI} className="filter-input-line w-full px-2 text-xs" aria-label="Filtrar chassi (aceita vários valores)" /></th>
      <th className="px-2 py-1"><input value={filtroNumeroSerie} onChange={(e) => setFiltroNumeroSerie(e.target.value)} placeholder="Filtrar (vários)" title={DICA_MULTI} className="filter-input-line w-full px-2 text-xs" aria-label="Filtrar nº série (aceita vários valores)" /></th>
      <th className="px-2 py-1"><input value={filtroModelo} onChange={(e) => setFiltroModelo(e.target.value)} placeholder="Filtrar" className="filter-input-line w-full px-2 text-xs" aria-label="Filtrar modelo" /></th>
      <th className="px-2 py-1"><input value={filtroContrato} onChange={(e) => setFiltroContrato(e.target.value)} placeholder="Filtrar" className="filter-input-line w-full px-2 text-xs" aria-label="Filtrar contrato" /></th>
      <th className="px-2 py-1"><input value={filtroCnpj} onChange={(e) => setFiltroCnpj(e.target.value)} placeholder="Filtrar" className="filter-input-line w-full px-2 text-xs" aria-label="Filtrar CNPJ" /></th>
      <th className="px-2 py-1"><input value={filtroNomeCliente} onChange={(e) => setFiltroNomeCliente(e.target.value)} placeholder="Filtrar" className="filter-input-line w-full px-2 text-xs" aria-label="Filtrar nome cliente" /></th>
    </tr>
  );

  /** Linha de um ativo, com checkbox de seleção para movimentação em lote. */
  const linhaAtivo = (a: Ativo, sel: Set<string>, toggle: (id: string) => void) => {
    const info = getContratoInfo(a.contratoId);
    return (
      <tr key={a.id} className="hover:bg-slate-50/50">
        <td className="px-3 py-2">
          <Checkbox checked={sel.has(a.id)} onClick={() => toggle(a.id)} label={`Selecionar ${a.placa || a.numeroSerie}`} />
        </td>
        <td className="px-4 py-2 text-sm text-slate-900 whitespace-nowrap">{a.placa || a.numeroSerie}</td>
        <td className="px-4 py-2 text-sm text-slate-600 whitespace-nowrap">{a.chassi || '—'}</td>
        <td className="px-4 py-2 text-sm text-slate-600 whitespace-nowrap">{a.numeroSerie}</td>
        <td className="px-4 py-2 text-sm text-slate-600 whitespace-nowrap">{a.modelo}</td>
        <td className="px-4 py-2 text-sm text-slate-600 whitespace-nowrap">{info.contrato}</td>
        <td className="px-4 py-2 text-sm text-slate-600 whitespace-nowrap">{info.cnpj}</td>
        <td className="px-4 py-2 text-sm text-slate-600 whitespace-nowrap">{info.nomeCliente}</td>
      </tr>
    );
  };

  /** Badge com o ID da seção/divisão. */
  const idBadge = (idText: string) => (
    <span className="shrink-0 rounded bg-white/80 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-slate-500" title="Identificador enviado ao portal / usado no login do cliente">
      {idText}
    </span>
  );

  /** Cabeçalho de uma seção/divisão, com nome editável, ID e (opcional) botão de excluir. */
  const cabecalhoSecao = (id: string, nome: string, idText: string, qtd: number, cor: string, onExcluir?: () => void) => (
    <div className={`flex items-center gap-2 border-b border-slate-200 px-4 py-2 ${cor}`}>
      {editingNomeDivisaoId === id ? (
        <input
          type="text"
          defaultValue={nome}
          onBlur={(e) => salvarNomeDivisao(id, e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') salvarNomeDivisao(id, (e.target as HTMLInputElement).value); }}
          className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm font-semibold text-slate-800"
          autoFocus
          aria-label={`Editar nome de ${nome}`}
        />
      ) : (
        <>
          <h5 className="flex-1 text-sm font-semibold text-slate-800">{nome} <span className="font-normal text-slate-500">· {qtd} ativo(s)</span></h5>
          {idBadge(idText)}
          <button type="button" onClick={() => setEditingNomeDivisaoId(id)} className="rounded p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-700" aria-label={`Editar nome de ${nome}`}>
            <Pencil className="h-4 w-4" />
          </button>
          {onExcluir && (
            <button type="button" onClick={onExcluir} className="rounded p-1 text-slate-500 hover:bg-rose-100 hover:text-rose-600" aria-label={`Excluir divisão ${nome}`} title="Excluir divisão (ativos voltam para Sem divisão)">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </>
      )}
    </div>
  );

  const idGrupoLabel = grupoId ? grupoId.toUpperCase() : 'gerado ao salvar';

  return (
    <div
      className={fullscreen ? 'fixed inset-0 z-50 flex p-0' : 'fixed inset-0 z-50 flex items-center justify-center p-4'}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-novo-grupo-titulo"
    >
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} aria-hidden />
      <div
        className={
          fullscreen
            ? 'relative z-10 flex h-full max-h-none w-full max-w-none flex-col rounded-none bg-white shadow-xl'
            : 'relative z-10 flex max-h-[95vh] w-full max-w-[min(95vw,88rem)] flex-col overflow-hidden rounded-lg bg-white shadow-xl'
        }
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 id="modal-novo-grupo-titulo" className="text-lg font-semibold text-slate-900">{grupoId ? 'Editar Grupo' : 'Novo Grupo'}</h3>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setFullscreen((v) => !v)}
              className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              aria-label={fullscreen ? 'Restaurar tamanho' : 'Expandir para tela inteira'}
              title={fullscreen ? 'Restaurar tamanho' : 'Expandir para tela inteira'}
            >
              {fullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>
            <button type="button" onClick={handleClose} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700" aria-label="Fechar">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
          <div>
            <label className={label}>Nome do Grupo</label>
            <input
              type="text"
              value={nomeGrupo}
              onChange={(e) => setNomeGrupo(e.target.value)}
              placeholder="Digite o nome do grupo"
              className={input}
              aria-label="Nome do grupo"
              autoFocus
            />
          </div>

          <div ref={responsavelRef} className="relative">
            <label className={label}>Responsável</label>
            <input
              type="text"
              value={responsavelTexto}
              onChange={(e) => { setResponsavelTexto(e.target.value); setResponsavelOpen(true); }}
              onFocus={() => setResponsavelOpen(true)}
              placeholder="Digite para buscar (ex.: Lucas Pessoa Duarte)"
              className={input}
              autoComplete="off"
            />
            {responsavelOpen && (
              <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg" role="listbox">
                {filteredResponsaveis.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-slate-500">Nenhum resultado</li>
                ) : (
                  filteredResponsaveis.map((r) => (
                    <li
                      key={r.id}
                      role="option"
                      aria-selected={responsavelId === r.id}
                      className="cursor-pointer px-3 py-2 text-sm text-slate-900 hover:bg-slate-100"
                      onClick={() => { setResponsavelId(r.id); setResponsavelTexto(r.nome); setResponsavelOpen(false); }}
                    >
                      {r.nome}
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          <div>
            <label className={label}>Cliente</label>
            <DropdownClientesMultiplo
              opcoes={clienteOptionsAll}
              selectedContratoIds={selectedContratoIds}
              onAdd={addCliente}
              onRemove={removeCliente}
              loading={clienteLoading}
              ariaLabel="Selecionar cliente(s) / contrato(s)"
            />
          </div>

          {(contratoIds.length > 0 || ativosLoading) && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-semibold text-slate-800">Ativos vinculados ao(s) contrato(s)</h4>
                <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-500" title="ID do grupo — a seção Sem divisão usa este mesmo ID">
                  Grupo {idGrupoLabel}
                </span>
              </div>

              {ativosLoading ? (
                <p className="text-sm text-slate-500">Carregando ativos...</p>
              ) : ativos.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhum ativo vinculado aos contratos selecionados.</p>
              ) : (
                <>
                  {/* Resumo + ação de criar divisão */}
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
                    <div className="text-sm text-slate-600">
                      <span className="font-semibold text-slate-800">{totalAtivos}</span> ativos ·{' '}
                      <span className="font-semibold text-slate-800">{totalSemDivisao}</span> sem divisão ·{' '}
                      <span className="font-semibold text-slate-800">{totalEmDivisao}</span> em {divisoes.length} divisão(ões)
                    </div>
                    <span className="text-xs text-slate-400">Selecione ativos abaixo para criar uma divisão ou movê-los.</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Divisões são subgrupos opcionais da frota (ex.: <em>Frota Norte</em>). Se não criar nenhuma, todos os ativos ficam juntos no grupo.
                  </p>

                  {/* Barra única de ações — aparece só quando há ativos selecionados */}
                  {selectedAtivoIds.size > 0 && (
                    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 rounded-lg border border-primary-300 bg-primary-50 px-4 py-2.5 shadow-sm">
                      <span className="text-sm font-semibold text-slate-800">{selectedAtivoIds.size} ativo(s) selecionado(s)</span>
                      {criandoDivisao ? (
                        <>
                          <input
                            type="text"
                            value={novaDivisaoNome}
                            onChange={(e) => setNovaDivisaoNome(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') criarDivisaoDaSelecao(); }}
                            placeholder="Nome da nova divisão (ex.: Frota Norte)"
                            className="input-field min-w-[12rem] flex-1 py-1.5 text-sm"
                            autoFocus
                            aria-label="Nome da nova divisão"
                          />
                          <button type="button" onClick={criarDivisaoDaSelecao} disabled={!novaDivisaoNome.trim()} className="btn-primary disabled:cursor-not-allowed disabled:opacity-50">
                            Criar
                          </button>
                          <button type="button" onClick={() => { setCriandoDivisao(false); setNovaDivisaoNome(''); }} className="btn-secondary">
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={() => { setCriandoDivisao(true); setNovaDivisaoNome(''); }} className="btn-secondary inline-flex items-center gap-1.5">
                            <Plus className="h-4 w-4" /> Criar divisão
                          </button>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="whitespace-nowrap">Mover para</span>
                            <select
                              value={batchMoveDestino}
                              onChange={(e) => { setBatchMoveDestino(e.target.value); if (e.target.value) moverSelecionadosPara(e.target.value); }}
                              className="rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                              aria-label="Escolher destino para mover os ativos selecionados"
                            >
                              <option value="">— escolher —</option>
                              <option value={DIVISAO_INICIAL_ID}>{nomeSecaoInicial}</option>
                              {divisoes.map((d) => (
                                <option key={d.id} value={d.id}>{d.nome}</option>
                              ))}
                            </select>
                          </div>
                          <button type="button" onClick={() => setSelectedAtivoIds(new Set())} className="ml-auto text-sm font-medium text-slate-500 hover:text-slate-700">
                            Limpar seleção
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {/* Seção "Sem divisão" */}
                  <div className="overflow-hidden rounded-lg border border-slate-200">
                    {cabecalhoSecao(DIVISAO_INICIAL_ID, nomeSecaoInicial, idGrupoLabel, ativosSemDivisao.length, 'bg-slate-100')}
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">{cabecalhoAtivos}{linhaFiltros}</thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {ativosSemDivisao.length === 0 ? (
                          <tr><td colSpan={8} className="px-4 py-6 text-center text-sm text-slate-400">Nenhum ativo aqui.</td></tr>
                        ) : (
                          ativosSemDivisao.map((a) => linhaAtivo(a, selectedAtivoIds, toggleAtivoSelection))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Divisões criadas */}
                  {divisoes.map((div) => {
                    const ativosDiv = ativosFiltrados.filter((a) => div.ativoIds.includes(a.id));
                    return (
                      <div key={div.id} className="overflow-hidden rounded-lg border border-slate-200">
                        {cabecalhoSecao(div.id, div.nome, div.codigo ? div.codigo.toUpperCase() : 'gerado ao salvar', ativosDiv.length, 'bg-primary-50', () => excluirDivisao(div.id))}
                        <table className="min-w-full divide-y divide-slate-200">
                          <thead className="bg-slate-50">{cabecalhoAtivos}{linhaFiltros}</thead>
                          <tbody className="divide-y divide-slate-200 bg-white">
                            {ativosDiv.length === 0 ? (
                              <tr><td colSpan={8} className="px-4 py-6 text-center text-sm text-slate-400">Nenhum ativo nesta divisão.</td></tr>
                            ) : (
                              ativosDiv.map((a) => linhaAtivo(a, selectedAtivoIds, toggleAtivoSelection))
                            )}
                          </tbody>
                        </table>
                      </div>
                    );
                  })}

                </>
              )}
            </div>
          )}
        </div>

        {/* Rodapé: apenas ações do grupo */}
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-200 px-6 py-4">
          <button type="button" onClick={handleClose} className="btn-secondary">Cancelar</button>
          <button
            type="button"
            onClick={handleSalvar}
            disabled={!nomeGrupo.trim() || !responsavelId || selectedContratoIds.length === 0}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
