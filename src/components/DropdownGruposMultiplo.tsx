'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, X } from 'lucide-react';
import type { Grupo } from '@/types';

type OpcaoGrupo = { tipo: 'grupo'; id: string; nome: string; grupo: Grupo };
type OpcaoDivisao = { tipo: 'divisao'; id: string; nome: string; nomeCompleto: string; codigo: string; grupo: Grupo };
type Opcao = OpcaoGrupo | OpcaoDivisao;

/** Badge com o ID do grupo/divisão (enviado ao portal e usado no login do cliente). */
function IdBadge({ texto }: { texto: string }) {
  return (
    <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-500" title="ID usado no portal / login do cliente">
      {texto}
    </span>
  );
}

interface DropdownGruposMultiploProps {
  /** Grupos completos (com divisoes) — usar GET /api/grupos?comDivisoes=1 */
  grupos: Grupo[];
  grupoIds: string[];
  divisaoIds: string[];
  onAddGrupo: (id: string) => void;
  onRemoveGrupo: (id: string) => void;
  onAddDivisao: (id: string) => void;
  onRemoveDivisao: (id: string) => void;
  disabled?: boolean;
  ariaLabel?: string;
}

export default function DropdownGruposMultiplo({
  grupos,
  grupoIds,
  divisaoIds,
  onAddGrupo,
  onRemoveGrupo,
  onAddDivisao,
  onRemoveDivisao,
  disabled = false,
  ariaLabel = 'Selecionar grupos ou divisões de cliente',
}: DropdownGruposMultiploProps) {
  const [open, setOpen] = useState(false);
  const [busca, setBusca] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const opcoes = useMemo((): Opcao[] => {
    const out: Opcao[] = [];
    for (const g of grupos) {
      if (!g.ativo) continue;
      out.push({ tipo: 'grupo', id: g.id, nome: g.nome, grupo: g });
      const divs = g.divisoes ?? [];
      for (const d of divs) {
        out.push({
          tipo: 'divisao',
          id: d.id,
          nome: d.nome,
          nomeCompleto: `${g.nome} › ${d.nome}`,
          codigo: (d.codigo ?? d.id).toUpperCase(),
          grupo: g,
        });
      }
    }
    return out;
  }, [grupos]);

  const filtrados = useMemo(() => {
    if (!busca.trim()) return opcoes;
    const q = busca.trim().toLowerCase();
    return opcoes.filter((o) =>
      o.tipo === 'grupo' ? o.nome.toLowerCase().includes(q) : o.nomeCompleto.toLowerCase().includes(q)
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

  const toggleGrupo = (id: string) => {
    if (grupoIds.includes(id)) {
      onRemoveGrupo(id);
    } else {
      onAddGrupo(id);
      const g = grupos.find((x) => x.id === id);
      if (g?.divisoes?.length) {
        g.divisoes.forEach((d) => {
          if (divisaoIds.includes(d.id)) onRemoveDivisao(d.id);
        });
      }
    }
  };

  const toggleDivisao = (id: string) => {
    if (divisaoIds.includes(id)) onRemoveDivisao(id);
    else onAddDivisao(id);
  };

  const temSelecao = grupoIds.length > 0 || divisaoIds.length > 0;

  const labelChipDivisao = (divisaoId: string) => {
    for (const g of grupos) {
      const d = g.divisoes?.find((x) => x.id === divisaoId);
      if (d) return `${g.nome} › ${d.nome}`;
    }
    return divisaoId;
  };

  const codigoChipDivisao = (divisaoId: string) => {
    for (const g of grupos) {
      const d = g.divisoes?.find((x) => x.id === divisaoId);
      if (d) return (d.codigo ?? d.id).toUpperCase();
    }
    return divisaoId.toUpperCase();
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        className="input-field min-w-[200px] max-w-xs text-left flex items-center justify-between gap-2 disabled:opacity-60"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
      >
        <span className="truncate">Adicionar grupo ou divisão...</span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 w-full min-w-[280px] max-w-md rounded-lg border border-slate-200 bg-white py-2 shadow-lg"
          role="listbox"
          aria-multiselectable="true"
        >
          <div className="px-2 pb-2">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar grupo ou divisão..."
              className="input-field w-full text-sm"
              aria-label="Buscar grupo ou divisão"
              autoFocus
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
          <ul className="max-h-56 overflow-y-auto px-2" role="group">
            {filtrados.length === 0 ? (
              <li className="py-2 text-center text-sm text-slate-500">Nenhum grupo ou divisão encontrado</li>
            ) : (
              filtrados.map((o) => {
                if (o.tipo === 'grupo') {
                  const selected = grupoIds.includes(o.id);
                  return (
                    <li
                      key={`g-${o.id}`}
                      role="option"
                      aria-selected={selected}
                      className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-sm hover:bg-slate-100"
                      onClick={() => toggleGrupo(o.id)}
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
                      <span className="flex-1 truncate font-medium">{o.nome}</span>
                      {o.grupo.divisoes?.length ? (
                        <span className="text-xs text-slate-500">(grupo inteiro)</span>
                      ) : null}
                      <IdBadge texto={o.grupo.id.toUpperCase()} />
                    </li>
                  );
                }
                const selected = divisaoIds.includes(o.id) || grupoIds.includes(o.grupo.id);
                return (
                  <li
                    key={`d-${o.id}`}
                    role="option"
                    aria-selected={selected}
                    className="flex cursor-pointer items-center gap-2 rounded pl-6 pr-2 py-2 text-sm hover:bg-slate-100"
                    onClick={() => toggleDivisao(o.id)}
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
                    <span className="flex-1 truncate text-slate-700">{o.nomeCompleto}</span>
                    <IdBadge texto={o.codigo} />
                  </li>
                );
              })
            )}
          </ul>
          <div className="border-t border-slate-100 px-2 pt-2 text-xs text-slate-500">
            Se o grupo tiver divisões, você pode escolher o grupo inteiro ou apenas divisões específicas.
          </div>
        </div>
      )}

      {(grupoIds.length > 0 || divisaoIds.length > 0) && (
        <ul className="mt-2 flex flex-wrap gap-2" role="list">
          {grupoIds.map((id) => {
            const grupo = grupos.find((g) => g.id === id);
            return (
              <li
                key={`g-${id}`}
                className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-800"
              >
                {grupo?.nome ?? id}
                <span className="font-mono text-[10px] font-semibold text-primary-600/80">{(grupo?.id ?? id).toUpperCase()}</span>
                <button
                  type="button"
                  onClick={() => onRemoveGrupo(id)}
                  className="rounded-full p-0.5 hover:bg-primary-200"
                  aria-label={`Remover grupo ${grupo?.nome ?? id}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
          {divisaoIds.map((divId) => (
            <li
              key={`d-${divId}`}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-800"
            >
              {labelChipDivisao(divId)}
              <span className="font-mono text-[10px] font-semibold text-slate-500">{codigoChipDivisao(divId)}</span>
              <button
                type="button"
                onClick={() => onRemoveDivisao(divId)}
                className="rounded-full p-0.5 hover:bg-slate-200"
                aria-label={`Remover divisão ${labelChipDivisao(divId)}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {!temSelecao && (
        <p className="mt-1 text-xs text-slate-500">Abra o dropdown e selecione ao menos um grupo ou divisão.</p>
      )}
    </div>
  );
}
