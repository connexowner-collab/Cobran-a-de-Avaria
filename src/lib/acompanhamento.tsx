'use client';

import { CheckCircle2, Clock, CalendarClock, Wrench, LogOut, Flag, type LucideIcon } from 'lucide-react';

export type EstadoEtapa = 'concluido' | 'atual' | 'pendente';

/* ------------------------------------------------------------------ *
 * Etapas da manutenção — MESMA linha do tempo usada no modal (esteira).
 * Fonte única para o funil das telas de Serviços e Central de Chamados,
 * garantindo que os números batam entre as duas telas.
 * ------------------------------------------------------------------ */
export type EtapaManutencaoKey = 'aguardando_agendamento' | 'agendado' | 'manutencao' | 'saida' | 'finalizado';

export const ETAPAS_MANUTENCAO: { key: EtapaManutencaoKey; label: string; icon: LucideIcon }[] = [
  { key: 'aguardando_agendamento', label: 'Aguardando Agendamento', icon: Clock },
  { key: 'agendado', label: 'Agendado', icon: CalendarClock },
  { key: 'manutencao', label: 'Em Manutenção', icon: Wrench },
  { key: 'saida', label: 'Disponível para retirada', icon: LogOut },
  { key: 'finalizado', label: 'Manutenção Finalizada', icon: Flag },
];

export interface EtapaManutencao {
  label: string;
  data: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  estado: EstadoEtapa;
  detalhe?: string;
}

export type OrigemInteracao = 'cliente' | 'suporte' | 'oficina';

export interface Interacao {
  autor: string;
  origem: OrigemInteracao;
  horario: string;
  texto: string;
}

/** Esteira vertical de status da manutenção. */
export function EsteiraManutencao({ etapas }: { etapas: EtapaManutencao[] }) {
  return (
    <ol className="relative">
      {etapas.map((et, i) => {
        const ultimo = i === etapas.length - 1;
        const Icone = et.icon;
        const cor = et.estado === 'concluido'
          ? { dot: 'bg-emerald-500 text-white border-emerald-500', linha: 'bg-emerald-500', txt: 'text-slate-800', sub: 'text-slate-500' }
          : et.estado === 'atual'
            ? { dot: 'bg-sky-500 text-white border-sky-500 ring-4 ring-sky-100', linha: 'bg-slate-200', txt: 'text-sky-800 font-bold', sub: 'text-sky-600' }
            : { dot: 'bg-white text-slate-300 border-slate-200', linha: 'bg-slate-200', txt: 'text-slate-400', sub: 'text-slate-300' };
        return (
          <li key={et.label} className="flex gap-3.5 pb-1">
            <div className="flex flex-col items-center">
              <span className={`flex h-8 w-8 items-center justify-center rounded-full border ${cor.dot}`}>
                {et.estado === 'concluido' ? <CheckCircle2 size={16} /> : <Icone size={15} />}
              </span>
              {!ultimo && <span className={`w-0.5 flex-1 ${cor.linha}`} style={{ minHeight: 22 }} />}
            </div>
            <div className="pb-4">
              <p className={`text-[14px] leading-tight ${cor.txt}`}>{et.label}</p>
              {et.detalhe && <p className={`mt-0.5 text-[12px] font-semibold ${cor.sub}`}>{et.detalhe}</p>}
              <p className={`mt-0.5 font-mono text-[12px] ${cor.sub}`}>
                {et.data && et.data !== '—' ? et.data : et.estado === 'pendente' ? 'Pendente' : ''}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

const COR_ORIGEM: Record<OrigemInteracao, string> = {
  cliente: 'bg-primary-500',
  suporte: 'bg-[#0e2233]',
  oficina: 'bg-amber-500',
};
const LABEL_ORIGEM: Record<OrigemInteracao, string> = {
  cliente: 'Cliente',
  suporte: 'Suporte',
  oficina: 'Oficina',
};

/** Linha do tempo de interações (cliente / suporte / oficina). */
export function BlocoConversa({ interacoes }: { interacoes: Interacao[] }) {
  return (
    <>
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Linha do tempo</p>
      <div className="max-h-64 space-y-3.5 overflow-y-auto pr-1.5">
        {interacoes.map((r, i) => (
          <div key={i} className="flex gap-2.5">
            <span className={`mt-1.5 h-2 w-2 flex-none rounded-full ${COR_ORIGEM[r.origem]}`} />
            <div className="flex-1 rounded-lg bg-slate-50 px-3.5 py-2.5">
              <div className="flex justify-between text-[11px] font-bold text-slate-500">
                <span>{LABEL_ORIGEM[r.origem]} · {r.autor}</span>
                <span>{r.horario}</span>
              </div>
              <p className="mt-1 text-[13px] text-slate-700">{r.texto}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
