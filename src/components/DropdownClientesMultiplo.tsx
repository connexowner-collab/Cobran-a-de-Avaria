'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, X } from 'lucide-react';
import type { ClienteContratoOption } from '@/types';

interface DropdownClientesMultiploProps {
  /** Lista de opções cliente+contrato (carregar de /api/clientes/opcoes). */
  opcoes: ClienteContratoOption[];
  /** IDs dos contratos já selecionados. */
  selectedContratoIds: string[];
  onAdd: (opt: ClienteContratoOption) => void;
  onRemove: (contratoId: string) => void;
  disabled?: boolean;
  loading?: boolean;
  ariaLabel?: string;
}

function labelOpcao(opt: ClienteContratoOption): string {
  const nome = opt.nomeFantasia || opt.razaoSocial;
  return `${nome} — ${opt.numeroContrato} — ${opt.cnpj}`;
}

export default function DropdownClientesMultiplo({
  opcoes,
  selectedContratoIds,
  onAdd,
  onRemove,
  disabled = false,
  loading = false,
  ariaLabel = 'Selecionar clientes (contratos)',
}: DropdownClientesMultiploProps) {
  const [open, setOpen] = useState(false);
  const [busca, setBusca] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filtrados = useMemo(() => {
    if (!busca.trim()) return opcoes;
    const q = busca.trim().toLowerCase();
    const cnpjDigits = busca.replace(/\D/g, '');
    return opcoes.filter(
      (o) =>
        (o.razaoSocial || '').toLowerCase().includes(q) ||
        (o.nomeFantasia || '').toLowerCase().includes(q) ||
        (o.numeroContrato || '').toLowerCase().includes(q) ||
        (o.cnpj || '').replace(/\D/g, '').includes(cnpjDigits)
    );
  }, [opcoes, busca]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const toggle = (opt: ClienteContratoOption) => {
    if (selectedContratoIds.includes(opt.contratoId)) {
      onRemove(opt.contratoId);
    } else {
      onAdd(opt);
    }
  };

  const temSelecao = selectedContratoIds.length > 0;

  const labelChip = (contratoId: string) => {
    const opt = opcoes.find((o) => o.contratoId === contratoId);
    if (!opt) return contratoId;
    const nome = opt.nomeFantasia || opt.razaoSocial;
    return `${nome} — ${opt.numeroContrato}`;
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        className="input-field min-w-[200px] w-full max-w-md text-left flex items-center justify-between gap-2 disabled:opacity-60"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
      >
        <span className="truncate">
          {temSelecao
            ? `${selectedContratoIds.length} cliente(s) selecionado(s)`
            : 'Clique para selecionar cliente(s)...'}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-20 mt-1 w-full min-w-[280px] max-w-lg rounded-lg border border-slate-200 bg-white py-2 shadow-lg"
          role="listbox"
          aria-multiselectable="true"
        >
          <div className="px-2 pb-2">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por CNPJ, nome ou contrato..."
              className="input-field w-full text-sm"
              aria-label="Buscar cliente"
              autoFocus
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
          <ul className="max-h-56 overflow-y-auto px-2" role="group">
            {loading ? (
              <li className="py-4 text-center text-sm text-slate-500">Carregando...</li>
            ) : filtrados.length === 0 ? (
              <li className="py-4 text-center text-sm text-slate-500">Nenhum cliente encontrado</li>
            ) : (
              filtrados.map((opt) => {
                const selected = selectedContratoIds.includes(opt.contratoId);
                return (
                  <li
                    key={opt.contratoId}
                    role="option"
                    aria-selected={selected}
                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-sm hover:bg-slate-100"
                    onClick={() => toggle(opt)}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 ${
                        selected ? 'border-primary-600 bg-primary-600 text-white' : 'border-slate-300 bg-white'
                      }`}
                      aria-hidden
                    >
                      {selected && (
                        <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 12 12">
                          <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                        </svg>
                      )}
                    </span>
                    <span className="flex-1 truncate text-slate-800">{labelOpcao(opt)}</span>
                  </li>
                );
              })
            )}
          </ul>
          <div className="border-t border-slate-100 px-2 pt-2 text-xs text-slate-500">
            Selecione um ou mais clientes (contratos). Os ativos dos contratos selecionados serão vinculados ao grupo.
          </div>
        </div>
      )}

      {temSelecao && (
        <ul className="mt-2 flex flex-wrap gap-2" role="list">
          {selectedContratoIds.map((cid) => (
            <li
              key={cid}
              className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-800"
            >
              {labelChip(cid)}
              <button
                type="button"
                onClick={() => onRemove(cid)}
                className="rounded-full p-0.5 hover:bg-primary-200"
                aria-label={`Remover ${labelChip(cid)}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {!temSelecao && (
        <p className="mt-1 text-xs text-slate-500">Abra o dropdown e selecione ao menos um cliente (contrato).</p>
      )}
    </div>
  );
}
