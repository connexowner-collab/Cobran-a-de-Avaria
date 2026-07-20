'use client';

import { MapPin, Navigation } from 'lucide-react';
import { TELEMETRIA } from '@/lib/portalData';
import { PageTitle, StatusBadge } from '@/components/portal/ui';

const STATUS_LABEL = { rota: 'Em rota', parado: 'Parado', manutencao: 'Manutenção' } as const;

/** Posições ilustrativas dos pins no "mapa" (protótipo sem tile real). */
const PINS = [
  { left: '58%', top: '38%', status: 'rota' },
  { left: '46%', top: '52%', status: 'rota' },
  { left: '38%', top: '44%', status: 'parado' },
  { left: '30%', top: '60%', status: 'manutencao' },
  { left: '66%', top: '58%', status: 'parado' },
];

const PIN_COLOR: Record<string, string> = {
  rota: 'bg-emerald-500',
  parado: 'bg-amber-500',
  manutencao: 'bg-primary-600',
};

export default function VamosControlePage() {
  return (
    <div>
      <PageTitle
        titulo="Vamos Controle"
        subtitulo="Telemetria e localização em tempo real da frota"
      />

      <div className="grid items-start gap-5 xl:grid-cols-[1.5fr_1fr]">
        {/* Mapa ilustrativo */}
        <div className="card overflow-hidden">
          <div
            className="relative h-[420px]"
            style={{
              background:
                'radial-gradient(circle at 30% 30%, #e8eef4 0%, #dae4ec 45%, #cfdbe6 100%)',
            }}
          >
            {/* "Vias" decorativas */}
            <div className="absolute inset-0 opacity-40" style={{
              backgroundImage:
                'linear-gradient(115deg, transparent 47%, #b9c8d6 47.5%, #b9c8d6 48.5%, transparent 49%), linear-gradient(25deg, transparent 60%, #b9c8d6 60.5%, #b9c8d6 61.5%, transparent 62%), linear-gradient(160deg, transparent 30%, #b9c8d6 30.5%, #b9c8d6 31.5%, transparent 32%)',
            }} />
            {PINS.map((p, i) => (
              <span
                key={i}
                className={`absolute flex h-7 w-7 -translate-x-1/2 -translate-y-full items-center justify-center rounded-full text-white shadow-md ${PIN_COLOR[p.status]}`}
                style={{ left: p.left, top: p.top }}
              >
                <MapPin size={14} />
              </span>
            ))}
            <span className="absolute left-4 top-4 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 shadow-sm">
              32 veículos rastreados
            </span>
            <span className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-500 shadow-sm">
              <Navigation size={12} /> Atualização automática a cada 30s
            </span>
          </div>
          <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100">
            {[
              { label: 'Em rota', valor: '18', cor: 'bg-emerald-500' },
              { label: 'Parados', valor: '11', cor: 'bg-amber-500' },
              { label: 'Manutenção', valor: '3', cor: 'bg-primary-600' },
            ].map((s) => (
              <div key={s.label} className="px-5 py-4">
                <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <span className={`h-2 w-2 rounded-full ${s.cor}`} /> {s.label}
                </p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">{s.valor}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Lista de telemetria */}
        <div className="card overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            Veículos em operação
          </div>
          <div className="max-h-[440px] overflow-y-auto">
            {TELEMETRIA.map((v) => (
              <div key={v.placa} className="border-b border-slate-100 px-5 py-3.5 last:border-0 hover:bg-slate-50">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[13px] font-semibold text-slate-800">{v.placa}</span>
                  <StatusBadge status={v.status} label={STATUS_LABEL[v.status]} />
                </div>
                <p className="mt-1 text-xs text-slate-500">{v.local}</p>
                <p className="mt-1.5 flex gap-4 font-mono text-[11px] text-slate-400">
                  <span>{v.velocidade}</span>
                  <span>{v.atualizado}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
