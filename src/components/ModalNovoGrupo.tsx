'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Check, Maximize2, Minimize2, Pencil } from 'lucide-react';
import type { ClienteContratoOption, ResponsavelOption, Ativo } from '@/types';

interface ModalNovoGrupoProps {
  open: boolean;
  onClose: () => void;
  /** Quando informado, o modal abre em modo edição para este grupo. */
  grupoId?: string | null;
  onSalvar?: (payload: { nomeGrupo: string; responsavelId: string; contratoIds: string[]; grupoId?: string; divisoes?: Array<{ id: string; nome: string; ativoIds: string[] }> }) => void;
}

export default function ModalNovoGrupo({ open, onClose, grupoId, onSalvar }: ModalNovoGrupoProps) {
  const [nomeGrupo, setNomeGrupo] = useState('');
  const [responsavelId, setResponsavelId] = useState('');
  const [responsavelTexto, setResponsavelTexto] = useState('');
  const [responsaveis, setResponsaveis] = useState<ResponsavelOption[]>([]);
  const [responsavelOpen, setResponsavelOpen] = useState(false);

  const [clienteOptionsAll, setClienteOptionsAll] = useState<ClienteContratoOption[]>([]);
  const [clienteBusca, setClienteBusca] = useState('');
  const [clienteSelected, setClienteSelected] = useState<ClienteContratoOption | null>(null);
  const [clienteDropdownOpen, setClienteDropdownOpen] = useState(false);
  const [clienteLoading, setClienteLoading] = useState(false);

  const [ativos, setAtivos] = useState<Ativo[]>([]);
  const [ativosLoading, setAtivosLoading] = useState(false);
  const [mostrarDivisaoFrota, setMostrarDivisaoFrota] = useState(false);
  /** IDs dos ativos selecionados para nova divisão. */
  const [selectedAtivoIds, setSelectedAtivoIds] = useState<Set<string>>(new Set());
  /** Divisões criadas (nome + ativoIds). */
  const [divisoes, setDivisoes] = useState<Array<{ id: string; nome: string; ativoIds: string[] }>>([]);
  const [showNomeDivisaoInput, setShowNomeDivisaoInput] = useState(false);
  const [nomeDivisao, setNomeDivisao] = useState('');
  /** Nome exibido da seção "Divisão inicial" (editável pelo lápis). */
  const [nomeSecaoInicial, setNomeSecaoInicial] = useState('Divisão inicial');
  /** ID da divisão (ou DIVISAO_INICIAL_ID) cujo nome está sendo editado. */
  const [editingNomeDivisaoId, setEditingNomeDivisaoId] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  /** Filtros por coluna na lista de ativos */
  const [filtroPlaca, setFiltroPlaca] = useState('');
  const [filtroChassi, setFiltroChassi] = useState('');
  const [filtroNumeroSerie, setFiltroNumeroSerie] = useState('');
  const [filtroModelo, setFiltroModelo] = useState('');
  const [filtroContrato, setFiltroContrato] = useState('');
  const [filtroCnpj, setFiltroCnpj] = useState('');
  const [filtroNomeCliente, setFiltroNomeCliente] = useState('');
  /** Valor do select "Movimentar em lote para" (resetado após aplicar). */
  const [batchMoveDestino, setBatchMoveDestino] = useState('');

  const responsavelRef = useRef<HTMLDivElement>(null);
  const clienteRef = useRef<HTMLDivElement>(null);

  const loadResponsaveis = useCallback(() => {
    fetch('/api/responsaveis')
      .then((res) => res.json())
      .then((data) => setResponsaveis(Array.isArray(data) ? data : []))
      .catch(() => setResponsaveis([]));
  }, []);

  useEffect(() => {
    if (open) {
      loadResponsaveis();
      setMostrarDivisaoFrota(false);
      setSelectedAtivoIds(new Set());
      setDivisoes([]);
      setShowNomeDivisaoInput(false);
      setNomeDivisao('');
      setNomeSecaoInicial('Divisão inicial');
      setEditingNomeDivisaoId(null);
      setBatchMoveDestino('');
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
      setClienteSelected(null);
      setClienteBusca('');
      setAtivos([]);
      setMostrarDivisaoFrota(false);
      setSelectedAtivoIds(new Set());
      setDivisoes([]);
      setShowNomeDivisaoInput(false);
      setNomeDivisao('');
      return;
    }
    fetch(`/api/grupos/${grupoId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((grupo) => {
        if (!grupo) return;
        setNomeGrupo(grupo.nome || '');
        setResponsavelId(grupo.responsavelId || '');
        setResponsavelTexto('');
        setClienteSelected(null);
        if (grupo.responsavelId) {
          fetch('/api/responsaveis')
            .then((r) => r.json())
            .then((list) => {
              const r = (Array.isArray(list) ? list : []).find((x: { id: string }) => x.id === grupo.responsavelId);
              setResponsavelTexto(r?.nome || '');
            });
        }
        if (grupo.contratoIds?.length) {
          fetch('/api/clientes/opcoes')
            .then((r) => r.json())
            .then((opts: ClienteContratoOption[]) => {
              const all = Array.isArray(opts) ? opts : [];
              setClienteOptionsAll(all);
              const opt = all.find((o) => o.contratoId === grupo.contratoIds[0]);
              setClienteSelected(opt || null);
            });
        }
        setDivisoes(Array.isArray(grupo.divisoes) ? grupo.divisoes : []);
        setMostrarDivisaoFrota((grupo.divisoes?.length ?? 0) > 0);
      })
      .catch(() => {});
  }, [open, grupoId]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (responsavelRef.current && !responsavelRef.current.contains(e.target as Node)) setResponsavelOpen(false);
      if (clienteRef.current && !clienteRef.current.contains(e.target as Node)) setClienteDropdownOpen(false);
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

  const openClienteDropdown = () => {
    setClienteDropdownOpen(true);
    if (clienteOptionsAll.length === 0) loadClienteOpcoes();
  };

  const contratoIds = clienteSelected ? [clienteSelected.contratoId] : [];
  useEffect(() => {
    if (contratoIds.length === 0) {
      setAtivos([]);
      return;
    }
    setAtivosLoading(true);
    fetch(`/api/ativos?contratoIds=${contratoIds.join(',')}`)
      .then((res) => res.json())
      .then((data) => setAtivos(Array.isArray(data) ? data : []))
      .catch(() => setAtivos([]))
      .finally(() => setAtivosLoading(false));
  }, [contratoIds.join(',')]);

  const selectClienteOption = (opt: ClienteContratoOption) => {
    setClienteSelected(opt);
    setClienteBusca('');
    setClienteDropdownOpen(false);
  };

  const clearClienteSelection = () => {
    setClienteSelected(null);
  };

  const clienteOptionsFiltered = clienteBusca.trim()
    ? clienteOptionsAll.filter(
        (opt) =>
          (opt.cnpj || '').replace(/\D/g, '').includes(clienteBusca.replace(/\D/g, '')) ||
          (opt.razaoSocial || '').toLowerCase().includes(clienteBusca.toLowerCase()) ||
          (opt.nomeFantasia || '').toLowerCase().includes(clienteBusca.toLowerCase()) ||
          (opt.numeroContrato || '').toLowerCase().includes(clienteBusca.toLowerCase())
      )
    : clienteOptionsAll;

  const filteredResponsaveis = responsavelTexto.trim()
    ? responsaveis.filter((r) =>
        r.nome.toLowerCase().includes(responsavelTexto.toLowerCase())
      )
    : responsaveis;

  const handleSalvar = () => {
    if (!nomeGrupo.trim() || !responsavelId) return;
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
    setClienteSelected(null);
    setClienteBusca('');
    setAtivos([]);
    // Edição: fecha o modal. Novo: mantém aberto com formulário limpo para outro cadastro.
    if (isEdit) onClose();
  };

  const handleClose = () => {
    setNomeGrupo('');
    setResponsavelId('');
    setResponsavelTexto('');
    setClienteSelected(null);
    setClienteBusca('');
    setClienteOptionsAll([]);
    setAtivos([]);
    setMostrarDivisaoFrota(false);
    setSelectedAtivoIds(new Set());
    setDivisoes([]);
    setShowNomeDivisaoInput(false);
    setNomeDivisao('');
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
    const opt =
      clienteOptionsAll.find((o) => o.contratoId === contratoId) ||
      (clienteSelected?.contratoId === contratoId ? clienteSelected : null);
    return {
      contrato: opt?.numeroContrato ?? '-',
      cnpj: opt?.cnpj ?? '-',
      nomeCliente: (opt?.nomeFantasia || opt?.razaoSocial) ?? '-',
    };
  };

  /** Verifica se o valor corresponde ao filtro da coluna (case-insensitive, contém). */
  const matchCol = (filtro: string, valor: string) =>
    !String(filtro).trim() || String(valor).toLowerCase().includes(String(filtro).trim().toLowerCase());

  /** Ativos filtrados pelas colunas (usa getContratoInfo para contrato/CNPJ/cliente). */
  const ativosFiltrados = ativos.filter((a) => {
    const info = getContratoInfo(a.contratoId);
    return (
      matchCol(filtroPlaca, (a.placa || a.numeroSerie) ?? '') &&
      matchCol(filtroChassi, a.chassi) &&
      matchCol(filtroNumeroSerie, a.numeroSerie) &&
      matchCol(filtroModelo, a.modelo) &&
      matchCol(filtroContrato, info.contrato) &&
      matchCol(filtroCnpj, info.cnpj) &&
      matchCol(filtroNomeCliente, info.nomeCliente)
    );
  });

  const ativosIniciais = ativosFiltrados.filter((a) => !divisoes.some((d) => d.ativoIds.includes(a.id)));

  const handleCriarDivisao = () => {
    if (!nomeDivisao.trim() || selectedAtivoIds.size === 0) return;
    setDivisoes((prev) => [
      ...prev,
      { id: crypto.randomUUID(), nome: nomeDivisao.trim(), ativoIds: Array.from(selectedAtivoIds) },
    ]);
    setSelectedAtivoIds(new Set());
    setNomeDivisao('');
    setShowNomeDivisaoInput(false);
    // Mantém modo "Divisão de Frota" ativo para permitir criar outra divisão em seguida
    setMostrarDivisaoFrota(true);
  };

  const DIVISAO_INICIAL_ID = '__inicial__';

  /** Adiciona um ativo da divisão inicial a uma divisão existente. */
  const adicionarAtivoInicialADivisao = (ativoId: string, divisaoId: string) => {
    setDivisoes((prev) =>
      prev.map((d) => (d.id === divisaoId ? { ...d, ativoIds: [...d.ativoIds, ativoId] } : d))
    );
  };

  /** Adiciona todos os ativos selecionados a uma divisão existente e limpa a seleção. */
  const adicionarSelecionadosADivisao = (divisaoId: string) => {
    if (selectedAtivoIds.size === 0) return;
    const ids = Array.from(selectedAtivoIds);
    setDivisoes((prev) =>
      prev.map((d) =>
        d.id === divisaoId ? { ...d, ativoIds: [...d.ativoIds, ...ids] } : d
      )
    );
    setSelectedAtivoIds(new Set());
    setShowNomeDivisaoInput(false);
  };

  /** Altera o nome de uma divisão (ou da seção inicial). */
  const salvarNomeDivisao = (id: string, nome: string) => {
    const n = (nome || '').trim();
    if (id === DIVISAO_INICIAL_ID) {
      setNomeSecaoInicial(n || 'Divisão inicial');
    } else {
      setDivisoes((prev) =>
        prev.map((d) => (d.id === id ? { ...d, nome: n || d.nome } : d))
      );
    }
    setEditingNomeDivisaoId(null);
  };

  /** Move um ativo de uma divisão para outra (ou para a divisão inicial, sem divisão). */
  const moverAtivoParaDivisao = (ativoId: string, divisaoOrigemId: string, divisaoDestinoId: string) => {
    if (divisaoOrigemId === divisaoDestinoId) return;
    setDivisoes((prev) => {
      if (divisaoDestinoId === DIVISAO_INICIAL_ID) {
        return prev.map((d) =>
          d.id === divisaoOrigemId ? { ...d, ativoIds: d.ativoIds.filter((id) => id !== ativoId) } : d
        );
      }
      return prev.map((d) => {
        if (d.id === divisaoOrigemId) {
          return { ...d, ativoIds: d.ativoIds.filter((id) => id !== ativoId) };
        }
        if (d.id === divisaoDestinoId) {
          return { ...d, ativoIds: [...d.ativoIds, ativoId] };
        }
        return d;
      });
    });
  };

  /** Move vários ativos em lote para uma divisão (ou para a divisão inicial). */
  const moverAtivosEmLoteParaDivisao = (ativoIds: string[], divisaoDestinoId: string) => {
    if (ativoIds.length === 0) return;
    setDivisoes((prev) => {
      if (divisaoDestinoId === DIVISAO_INICIAL_ID) {
        return prev.map((d) => ({
          ...d,
          ativoIds: d.ativoIds.filter((id) => !ativoIds.includes(id)),
        }));
      }
      return prev.map((d) =>
        d.id === divisaoDestinoId
          ? { ...d, ativoIds: [...new Set([...d.ativoIds, ...ativoIds])] }
          : { ...d, ativoIds: d.ativoIds.filter((id) => !ativoIds.includes(id)) }
      );
    });
    setSelectedAtivoIds(new Set());
    setBatchMoveDestino('');
  };

  if (!open) return null;

  const label = 'block text-sm font-medium text-slate-700 mb-1';
  const input = 'input-field w-full';

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
            ? 'relative z-10 w-full h-full max-w-none max-h-none rounded-none bg-white shadow-xl flex flex-col'
            : 'relative z-10 w-full max-w-[min(95vw,88rem)] max-h-[95vh] overflow-hidden rounded-lg bg-white shadow-xl flex flex-col'
        }
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 shrink-0">
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
            <button
              type="button"
              onClick={handleClose}
              className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-4">
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
              onChange={(e) => {
                setResponsavelTexto(e.target.value);
                setResponsavelOpen(true);
              }}
              onFocus={() => setResponsavelOpen(true)}
              placeholder="Digite para buscar (ex.: Lucas Pessoa Duarte)"
              className={input}
              autoComplete="off"
            />
            {responsavelOpen && (
              <ul
                className="absolute z-20 mt-1 w-full max-h-48 overflow-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg"
                role="listbox"
              >
                {filteredResponsaveis.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-slate-500">Nenhum resultado</li>
                ) : (
                  filteredResponsaveis.map((r) => (
                    <li
                      key={r.id}
                      role="option"
                      aria-selected={responsavelId === r.id}
                      className="cursor-pointer px-3 py-2 text-sm text-slate-900 hover:bg-slate-100"
                      onClick={() => {
                        setResponsavelId(r.id);
                        setResponsavelTexto(r.nome);
                        setResponsavelOpen(false);
                      }}
                    >
                      {r.nome}
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          <div ref={clienteRef} className="relative">
            <label className={label}>Cliente</label>
            <button
              type="button"
              onClick={openClienteDropdown}
              className={`${input} text-left flex items-center justify-between cursor-pointer bg-white`}
              aria-haspopup="listbox"
              aria-expanded={clienteDropdownOpen}
            >
              <span className={clienteSelected ? 'text-slate-900' : 'text-slate-500'}>
                {clienteSelected
                  ? `${clienteSelected.nomeFantasia || clienteSelected.razaoSocial} — ${clienteSelected.numeroContrato} — ${clienteSelected.cnpj}`
                  : 'Clique para selecionar (CNPJ)'}
              </span>
              {clienteSelected && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    clearClienteSelection();
                  }}
                  className="rounded p-0.5 hover:bg-slate-200 text-slate-500"
                  aria-label="Limpar"
                >
                  <X className="h-4 w-4" />
                </span>
              )}
            </button>
            {clienteDropdownOpen && (
              <div className="absolute z-20 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg overflow-hidden">
                <div className="p-2 border-b border-slate-200 bg-slate-50">
                  <input
                    type="text"
                    value={clienteBusca}
                    onChange={(e) => setClienteBusca(e.target.value)}
                    placeholder="Buscar por CNPJ, nome ou contrato..."
                    className="input-field w-full text-sm"
                    autoComplete="off"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <ul
                  className="max-h-48 overflow-auto py-1"
                  role="listbox"
                >
                  {clienteLoading ? (
                    <li className="px-3 py-4 text-sm text-slate-500 text-center">Carregando...</li>
                  ) : clienteOptionsFiltered.length === 0 ? (
                    <li className="px-3 py-4 text-sm text-slate-500 text-center">Nenhum resultado</li>
                  ) : (
                    clienteOptionsFiltered.map((opt) => (
                      <li
                        key={opt.contratoId}
                        role="option"
                        aria-selected={clienteSelected?.contratoId === opt.contratoId}
                        className="cursor-pointer px-3 py-2 text-sm text-slate-900 hover:bg-slate-100 border-b border-slate-100 last:border-0"
                        onClick={() => selectClienteOption(opt)}
                      >
                        <span className="font-medium">{opt.nomeFantasia || opt.razaoSocial}</span>
                        {' — '}
                        <span>{opt.numeroContrato}</span>
                        {' — '}
                        <span className="text-slate-600">{opt.cnpj}</span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>

          {(contratoIds.length > 0 || ativosLoading) && (
            <div>
              <h4 className="text-sm font-semibold text-slate-800 mb-2">Ativos vinculados ao(s) contrato(s)</h4>
              {ativosLoading ? (
                <p className="text-sm text-slate-500">Carregando ativos...</p>
              ) : ativos.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhum ativo vinculado aos contratos selecionados.</p>
              ) : divisoes.length > 0 ? (
                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex items-center gap-2">
                      {editingNomeDivisaoId === DIVISAO_INICIAL_ID ? (
                        <input
                          type="text"
                          value={nomeSecaoInicial}
                          onChange={(e) => setNomeSecaoInicial(e.target.value)}
                          onBlur={() => salvarNomeDivisao(DIVISAO_INICIAL_ID, nomeSecaoInicial)}
                          onKeyDown={(e) => { if (e.key === 'Enter') salvarNomeDivisao(DIVISAO_INICIAL_ID, nomeSecaoInicial); }}
                          className="flex-1 text-sm font-semibold text-slate-800 rounded border border-slate-300 px-2 py-1"
                          autoFocus
                          aria-label="Editar nome da seção inicial"
                        />
                      ) : (
                        <>
                          <h5 className="text-sm font-semibold text-slate-800 flex-1">{nomeSecaoInicial}</h5>
                          <button
                            type="button"
                            onClick={() => setEditingNomeDivisaoId(DIVISAO_INICIAL_ID)}
                            className="p-1 rounded text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                            aria-label="Editar nome da seção inicial"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          {mostrarDivisaoFrota && (
                            <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-600 w-14 whitespace-nowrap">Divisão de frota</th>
                          )}
                          <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-600 whitespace-nowrap">Placa</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-600 whitespace-nowrap">Chassi</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-600 whitespace-nowrap">Nº de série</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-600 whitespace-nowrap">Modelo</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-600 whitespace-nowrap">Contrato</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-600 whitespace-nowrap">CNPJ</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-600 whitespace-nowrap">Nome cliente</th>
                        </tr>
                        <tr className="border-t border-slate-200 bg-slate-100/80">
                          {mostrarDivisaoFrota && <th className="px-2 py-1" />}
                          <th className="px-2 py-1"><input type="text" value={filtroPlaca} onChange={(e) => setFiltroPlaca(e.target.value)} placeholder="Filtrar" className="w-full rounded px-2 py-1 text-xs" aria-label="Filtrar placa" /></th>
                          <th className="px-2 py-1"><input type="text" value={filtroChassi} onChange={(e) => setFiltroChassi(e.target.value)} placeholder="Filtrar" className="w-full rounded px-2 py-1 text-xs" aria-label="Filtrar chassi" /></th>
                          <th className="px-2 py-1"><input type="text" value={filtroNumeroSerie} onChange={(e) => setFiltroNumeroSerie(e.target.value)} placeholder="Filtrar" className="w-full rounded px-2 py-1 text-xs" aria-label="Filtrar nº série" /></th>
                          <th className="px-2 py-1"><input type="text" value={filtroModelo} onChange={(e) => setFiltroModelo(e.target.value)} placeholder="Filtrar" className="w-full rounded px-2 py-1 text-xs" aria-label="Filtrar modelo" /></th>
                          <th className="px-2 py-1"><input type="text" value={filtroContrato} onChange={(e) => setFiltroContrato(e.target.value)} placeholder="Filtrar" className="w-full rounded px-2 py-1 text-xs" aria-label="Filtrar contrato" /></th>
                          <th className="px-2 py-1"><input type="text" value={filtroCnpj} onChange={(e) => setFiltroCnpj(e.target.value)} placeholder="Filtrar" className="w-full rounded px-2 py-1 text-xs" aria-label="Filtrar CNPJ" /></th>
                          <th className="px-2 py-1"><input type="text" value={filtroNomeCliente} onChange={(e) => setFiltroNomeCliente(e.target.value)} placeholder="Filtrar" className="w-full rounded px-2 py-1 text-xs" aria-label="Filtrar nome cliente" /></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {ativosIniciais.map((a) => {
                          const info = getContratoInfo(a.contratoId);
                          return (
                            <tr key={a.id}>
                              {mostrarDivisaoFrota && (
                                <td className="px-4 py-2">
                                  <button
                                    type="button"
                                    role="checkbox"
                                    aria-checked={selectedAtivoIds.has(a.id)}
                                    aria-label={`Selecionar ${a.placa || a.numeroSerie} para nova divisão ou movimentar em lote`}
                                    onClick={() => toggleAtivoSelection(a.id)}
                                    className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                                      selectedAtivoIds.has(a.id)
                                        ? 'border-[#c41e3a] bg-[#c41e3a] text-white'
                                        : 'border-slate-300 bg-white hover:border-slate-400'
                                    }`}
                                  >
                                    {selectedAtivoIds.has(a.id) && <Check className="h-3 w-3 stroke-[3]" />}
                                  </button>
                                </td>
                              )}
                              <td className="px-4 py-2 text-sm text-slate-900 whitespace-nowrap">{a.placa || a.numeroSerie}</td>
                              <td className="px-4 py-2 text-sm text-slate-600 whitespace-nowrap">{a.chassi || '—'}</td>
                              <td className="px-4 py-2 text-sm text-slate-600 whitespace-nowrap">{a.numeroSerie}</td>
                              <td className="px-4 py-2 text-sm text-slate-600 whitespace-nowrap">{a.modelo}</td>
                              <td className="px-4 py-2 text-sm text-slate-600 whitespace-nowrap">{info.contrato}</td>
                              <td className="px-4 py-2 text-sm text-slate-600 whitespace-nowrap">{info.cnpj}</td>
                              <td className="px-4 py-2 text-sm text-slate-600 whitespace-nowrap">{info.nomeCliente}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {divisoes.map((div) => {
                    const ativosDiv = ativosFiltrados.filter((a) => div.ativoIds.includes(a.id));
                    const editandoEsta = editingNomeDivisaoId === div.id;
                    return (
                      <div key={div.id} className="border border-slate-200 rounded-lg overflow-hidden">
                        <div className="px-4 py-2 bg-primary-50 border-b border-slate-200 flex items-center gap-2">
                          {editandoEsta ? (
                            <input
                              type="text"
                              defaultValue={div.nome}
                              onBlur={(e) => salvarNomeDivisao(div.id, e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') salvarNomeDivisao(div.id, (e.target as HTMLInputElement).value); }}
                              className="flex-1 text-sm font-semibold text-slate-800 rounded border border-slate-300 px-2 py-1"
                              autoFocus
                              aria-label={`Editar nome da divisão ${div.nome}`}
                            />
                          ) : (
                            <>
                              <h5 className="text-sm font-semibold text-slate-800 flex-1">{div.nome}</h5>
                              <button
                                type="button"
                                onClick={() => setEditingNomeDivisaoId(div.id)}
                                className="p-1 rounded text-slate-500 hover:bg-primary-100 hover:text-slate-700"
                                aria-label={`Editar nome da divisão ${div.nome}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                        <table className="min-w-full divide-y divide-slate-200">
                          <thead className="bg-slate-50">
                            <tr>
                              {mostrarDivisaoFrota && (
                                <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-600 w-14 whitespace-nowrap">Divisão de frota</th>
                              )}
                              <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-600 whitespace-nowrap">Placa</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-600 whitespace-nowrap">Chassi</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-600 whitespace-nowrap">Nº de série</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-600 whitespace-nowrap">Modelo</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-600 whitespace-nowrap">Contrato</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-600 whitespace-nowrap">CNPJ</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-600 whitespace-nowrap">Nome cliente</th>
                            </tr>
                            <tr className="border-t border-slate-200 bg-slate-100/80">
                              {mostrarDivisaoFrota && <th className="px-2 py-1" />}
                              <th className="px-2 py-1"><input type="text" value={filtroPlaca} onChange={(e) => setFiltroPlaca(e.target.value)} placeholder="Filtrar" className="w-full rounded px-2 py-1 text-xs" aria-label="Filtrar placa" /></th>
                              <th className="px-2 py-1"><input type="text" value={filtroChassi} onChange={(e) => setFiltroChassi(e.target.value)} placeholder="Filtrar" className="w-full rounded px-2 py-1 text-xs" aria-label="Filtrar chassi" /></th>
                              <th className="px-2 py-1"><input type="text" value={filtroNumeroSerie} onChange={(e) => setFiltroNumeroSerie(e.target.value)} placeholder="Filtrar" className="w-full rounded px-2 py-1 text-xs" aria-label="Filtrar nº série" /></th>
                              <th className="px-2 py-1"><input type="text" value={filtroModelo} onChange={(e) => setFiltroModelo(e.target.value)} placeholder="Filtrar" className="w-full rounded px-2 py-1 text-xs" aria-label="Filtrar modelo" /></th>
                              <th className="px-2 py-1"><input type="text" value={filtroContrato} onChange={(e) => setFiltroContrato(e.target.value)} placeholder="Filtrar" className="w-full rounded px-2 py-1 text-xs" aria-label="Filtrar contrato" /></th>
                              <th className="px-2 py-1"><input type="text" value={filtroCnpj} onChange={(e) => setFiltroCnpj(e.target.value)} placeholder="Filtrar" className="w-full rounded px-2 py-1 text-xs" aria-label="Filtrar CNPJ" /></th>
                              <th className="px-2 py-1"><input type="text" value={filtroNomeCliente} onChange={(e) => setFiltroNomeCliente(e.target.value)} placeholder="Filtrar" className="w-full rounded px-2 py-1 text-xs" aria-label="Filtrar nome cliente" /></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 bg-white">
                            {ativosDiv.map((a) => {
                              const info = getContratoInfo(a.contratoId);
                              return (
                                <tr key={a.id}>
                                  {mostrarDivisaoFrota && (
                                    <td className="px-4 py-2">
                                      <button
                                        type="button"
                                        role="checkbox"
                                        aria-checked={selectedAtivoIds.has(a.id)}
                                        aria-label={`Selecionar ${a.placa || a.numeroSerie} para movimentar em lote`}
                                        onClick={() => toggleAtivoSelection(a.id)}
                                        className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                                          selectedAtivoIds.has(a.id)
                                            ? 'border-[#c41e3a] bg-[#c41e3a] text-white'
                                            : 'border-slate-300 bg-white hover:border-slate-400'
                                        }`}
                                      >
                                        {selectedAtivoIds.has(a.id) && <Check className="h-3 w-3 stroke-[3]" />}
                                      </button>
                                    </td>
                                  )}
                                  <td className="px-4 py-2 text-sm text-slate-900 whitespace-nowrap">{a.placa || a.numeroSerie}</td>
                                  <td className="px-4 py-2 text-sm text-slate-600 whitespace-nowrap">{a.chassi || '—'}</td>
                                  <td className="px-4 py-2 text-sm text-slate-600 whitespace-nowrap">{a.numeroSerie}</td>
                                  <td className="px-4 py-2 text-sm text-slate-600 whitespace-nowrap">{a.modelo}</td>
                                  <td className="px-4 py-2 text-sm text-slate-600 whitespace-nowrap">{info.contrato}</td>
                                  <td className="px-4 py-2 text-sm text-slate-600 whitespace-nowrap">{info.cnpj}</td>
                                  <td className="px-4 py-2 text-sm text-slate-600 whitespace-nowrap">{info.nomeCliente}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        {mostrarDivisaoFrota && (
                          <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-600 w-14 whitespace-nowrap">Divisão de frota</th>
                        )}
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-600 whitespace-nowrap">Placa</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-600 whitespace-nowrap">Chassi</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-600 whitespace-nowrap">Nº de série</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-600 whitespace-nowrap">Modelo</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-600 whitespace-nowrap">Contrato</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-600 whitespace-nowrap">CNPJ</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-600 whitespace-nowrap">Nome cliente</th>
                      </tr>
                      <tr className="border-t border-slate-200 bg-slate-100/80">
                        {mostrarDivisaoFrota && <th className="px-2 py-1" />}
                        <th className="px-2 py-1"><input type="text" value={filtroPlaca} onChange={(e) => setFiltroPlaca(e.target.value)} placeholder="Filtrar" className="w-full rounded px-2 py-1 text-xs" aria-label="Filtrar placa" /></th>
                        <th className="px-2 py-1"><input type="text" value={filtroChassi} onChange={(e) => setFiltroChassi(e.target.value)} placeholder="Filtrar" className="w-full rounded px-2 py-1 text-xs" aria-label="Filtrar chassi" /></th>
                        <th className="px-2 py-1"><input type="text" value={filtroNumeroSerie} onChange={(e) => setFiltroNumeroSerie(e.target.value)} placeholder="Filtrar" className="w-full rounded px-2 py-1 text-xs" aria-label="Filtrar nº série" /></th>
                        <th className="px-2 py-1"><input type="text" value={filtroModelo} onChange={(e) => setFiltroModelo(e.target.value)} placeholder="Filtrar" className="w-full rounded px-2 py-1 text-xs" aria-label="Filtrar modelo" /></th>
                        <th className="px-2 py-1"><input type="text" value={filtroContrato} onChange={(e) => setFiltroContrato(e.target.value)} placeholder="Filtrar" className="w-full rounded px-2 py-1 text-xs" aria-label="Filtrar contrato" /></th>
                        <th className="px-2 py-1"><input type="text" value={filtroCnpj} onChange={(e) => setFiltroCnpj(e.target.value)} placeholder="Filtrar" className="w-full rounded px-2 py-1 text-xs" aria-label="Filtrar CNPJ" /></th>
                        <th className="px-2 py-1"><input type="text" value={filtroNomeCliente} onChange={(e) => setFiltroNomeCliente(e.target.value)} placeholder="Filtrar" className="w-full rounded px-2 py-1 text-xs" aria-label="Filtrar nome cliente" /></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {ativosFiltrados.map((a) => {
                        const info = getContratoInfo(a.contratoId);
                        return (
                          <tr key={a.id}>
                            {mostrarDivisaoFrota && (
                              <td className="px-4 py-2">
                                <button
                                  type="button"
                                  role="checkbox"
                                  aria-checked={selectedAtivoIds.has(a.id)}
                                  aria-label={`Selecionar ${a.placa || a.numeroSerie} para nova divisão`}
                                  onClick={() => toggleAtivoSelection(a.id)}
                                  className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                                    selectedAtivoIds.has(a.id)
                                      ? 'border-[#c41e3a] bg-[#c41e3a] text-white'
                                      : 'border-slate-300 bg-white hover:border-slate-400'
                                  }`}
                                >
                                  {selectedAtivoIds.has(a.id) && <Check className="h-3 w-3 stroke-[3]" />}
                                </button>
                              </td>
                            )}
                            <td className="px-4 py-2 text-sm text-slate-900 whitespace-nowrap">{a.placa || a.numeroSerie}</td>
                            <td className="px-4 py-2 text-sm text-slate-600 whitespace-nowrap">{a.chassi || '—'}</td>
                            <td className="px-4 py-2 text-sm text-slate-600 whitespace-nowrap">{a.numeroSerie}</td>
                            <td className="px-4 py-2 text-sm text-slate-600 whitespace-nowrap">{a.modelo}</td>
                            <td className="px-4 py-2 text-sm text-slate-600 whitespace-nowrap">{info.contrato}</td>
                            <td className="px-4 py-2 text-sm text-slate-600 whitespace-nowrap">{info.cnpj}</td>
                            <td className="px-4 py-2 text-sm text-slate-600 whitespace-nowrap">{info.nomeCliente}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4">
          {showNomeDivisaoInput && (
            <div className="flex items-center gap-2 flex-wrap">
              <label htmlFor="nome-divisao-input" className="text-sm font-medium text-slate-700">Nome da divisão</label>
              <input
                id="nome-divisao-input"
                type="text"
                value={nomeDivisao}
                onChange={(e) => setNomeDivisao(e.target.value)}
                placeholder="Ex.: Frota Norte"
                className="input-field flex-1 min-w-[12rem]"
                aria-label="Nome da divisão"
              />
              <button
                type="button"
                onClick={handleCriarDivisao}
                disabled={!nomeDivisao.trim() || selectedAtivoIds.size === 0}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Salvar
              </button>
            </div>
          )}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {selectedAtivoIds.size > 0 ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowNomeDivisaoInput(true)}
                    className="btn-secondary ring-2 ring-primary-500"
                    aria-pressed={showNomeDivisaoInput}
                  >
                    Gerar divisão
                  </button>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="font-medium whitespace-nowrap">Movimentar {selectedAtivoIds.size} ativo(s) para</span>
                    <select
                      value={batchMoveDestino}
                      disabled={divisoes.length === 0}
                      onChange={(e) => {
                        const destId = e.target.value;
                        if (destId) {
                          moverAtivosEmLoteParaDivisao(Array.from(selectedAtivoIds), destId);
                        }
                      }}
                      className="rounded border border-slate-300 px-2 py-1 text-sm bg-white text-slate-700 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60 disabled:cursor-not-allowed"
                      aria-label="Escolher divisão de destino para movimentar em lote"
                    >
                      <option value="">
                        {divisoes.length === 0 ? 'Crie uma divisão antes' : '— escolher —'}
                      </option>
                      <option value={DIVISAO_INICIAL_ID}>{nomeSecaoInicial}</option>
                      {divisoes.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setMostrarDivisaoFrota((v) => !v)}
                  className={`btn-secondary ${mostrarDivisaoFrota ? 'ring-2 ring-primary-500' : ''}`}
                  aria-pressed={mostrarDivisaoFrota}
                >
                  Divisão de Frota
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={handleClose} className="btn-secondary">
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSalvar}
                disabled={!nomeGrupo.trim() || !responsavelId}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
