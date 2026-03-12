'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import type { ClienteContratoOption, ResponsavelOption, Ativo } from '@/types';

interface ModalNovoGrupoProps {
  open: boolean;
  onClose: () => void;
  /** Quando informado, o modal abre em modo edição para este grupo. */
  grupoId?: string | null;
  onSalvar?: (payload: { nomeGrupo: string; responsavelId: string; contratoIds: string[]; grupoId?: string }) => void;
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

  const responsavelRef = useRef<HTMLDivElement>(null);
  const clienteRef = useRef<HTMLDivElement>(null);

  const loadResponsaveis = useCallback(() => {
    fetch('/api/responsaveis')
      .then((res) => res.json())
      .then((data) => setResponsaveis(Array.isArray(data) ? data : []))
      .catch(() => setResponsaveis([]));
  }, []);

  useEffect(() => {
    if (open) loadResponsaveis();
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
    onSalvar?.({
      nomeGrupo: nomeGrupo.trim(),
      responsavelId,
      contratoIds,
      ...(grupoId && { grupoId }),
    });
    setNomeGrupo('');
    setResponsavelId('');
    setResponsavelTexto('');
    setClienteSelected(null);
    setClienteBusca('');
    setAtivos([]);
    onClose();
  };

  const handleClose = () => {
    setNomeGrupo('');
    setResponsavelId('');
    setResponsavelTexto('');
    setClienteSelected(null);
    setClienteBusca('');
    setClienteOptionsAll([]);
    setAtivos([]);
    onClose();
  };

  if (!open) return null;

  const label = 'block text-sm font-medium text-slate-700 mb-1';
  const input = 'input-field w-full';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} aria-hidden />
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-lg bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">{grupoId ? 'Editar Grupo' : 'Novo Grupo'}</h3>
          <button
            type="button"
            onClick={handleClose}
            className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div>
            <label className={label}>Nome do Grupo</label>
            <input
              type="text"
              value={nomeGrupo}
              onChange={(e) => setNomeGrupo(e.target.value)}
              placeholder="Digite o nome do grupo"
              className={input}
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
              ) : (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-600">Placa</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-600">Chassi</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-600">Nº de série</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-600">Modelo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {ativos.map((a) => (
                        <tr key={a.id}>
                          <td className="px-4 py-2 text-sm text-slate-900">{a.placa}</td>
                          <td className="px-4 py-2 text-sm text-slate-600">{a.chassi}</td>
                          <td className="px-4 py-2 text-sm text-slate-600">{a.numeroSerie}</td>
                          <td className="px-4 py-2 text-sm text-slate-600">{a.modelo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
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
  );
}
