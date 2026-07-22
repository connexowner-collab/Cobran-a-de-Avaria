'use client';

import { useMemo, useState } from 'react';
import {
  MapPin, Gauge, Power, BatteryMedium, Navigation, Clock, Fuel, Thermometer,
  AlertTriangle, ShieldAlert, Route, Signal, LocateFixed,
} from 'lucide-react';
import {
  PageTitle, KpiCard, KpiRow, SectionCard, FilterChip, Toolbar, ToolbarSpacer, SearchInput,
} from '@/components/portal/ui';

type SituacaoRastreador = 'rota' | 'parado' | 'manutencao' | 'ocioso';

interface VeiculoRastreado {
  placa: string;
  motorista: string;
  modelo: string;
  situacao: SituacaoRastreador;
  local: string;
  cidade: string;
  velocidade: number;
  ignicao: boolean;
  bateria: number;
  combustivel: number;
  odometro: string;
  temperatura: string;
  ultimaAtualizacao: string;
  sinalGps: 'ok' | 'fraco' | 'sem';
  cerca: string;
  x: number;
  y: number;
}

const VEICULOS_RASTREADOS: VeiculoRastreado[] = [
  { placa: 'JBL5E88', motorista: 'Carlos Mota', modelo: 'Volvo FH 460', situacao: 'rota', local: 'BR-116, km 214', cidade: 'Registro/SP', velocidade: 82, ignicao: true, bateria: 96, combustivel: 68, odometro: '340.120 km', temperatura: '84 °C', ultimaAtualizacao: 'há 12s', sinalGps: 'ok', cerca: 'Corredor SP-Sul', x: 28, y: 66 },
  { placa: 'SHQ6B80', motorista: 'Marcos Lima', modelo: 'VW 11-180', situacao: 'rota', local: 'Rod. Anhanguera, km 32', cidade: 'São Paulo/SP', velocidade: 74, ignicao: true, bateria: 91, combustivel: 54, odometro: '128.430 km', temperatura: '88 °C', ultimaAtualizacao: 'há 20s', sinalGps: 'ok', cerca: 'Região Metropolitana', x: 52, y: 40 },
  { placa: 'JBL5B25', motorista: 'Fernanda Reis', modelo: 'VW 11-180', situacao: 'parado', local: 'CD Campinas · pátio', cidade: 'Campinas/SP', velocidade: 0, ignicao: false, bateria: 88, combustivel: 40, odometro: '96.200 km', temperatura: '—', ultimaAtualizacao: 'há 3min', sinalGps: 'ok', cerca: 'CD Campinas', x: 40, y: 24 },
  { placa: 'DSA9924', motorista: '—', modelo: 'Mercedes Accelo 815', situacao: 'manutencao', local: 'Oficina Vamos · Sorocaba', cidade: 'Sorocaba/SP', velocidade: 0, ignicao: false, bateria: 72, combustivel: 22, odometro: '210.900 km', temperatura: '—', ultimaAtualizacao: 'há 40min', sinalGps: 'fraco', cerca: 'Oficina Sorocaba', x: 22, y: 40 },
  { placa: 'JBL5B26', motorista: 'Pedro Alves', modelo: 'VW 11-180', situacao: 'rota', local: 'Av. do Estado', cidade: 'São Paulo/SP', velocidade: 46, ignicao: true, bateria: 93, combustivel: 61, odometro: '92.410 km', temperatura: '80 °C', ultimaAtualizacao: 'há 8s', sinalGps: 'ok', cerca: 'Região Metropolitana', x: 58, y: 52 },
  { placa: 'MNT7D45', motorista: '—', modelo: 'Manitou MRT 2550', situacao: 'ocioso', local: 'Obra Jundiaí · canteiro', cidade: 'Jundiaí/SP', velocidade: 0, ignicao: true, bateria: 64, combustivel: 35, odometro: '3.210 h', temperatura: '77 °C', ultimaAtualizacao: 'há 5min', sinalGps: 'ok', cerca: 'Obra Jundiaí', x: 46, y: 34 },
  { placa: 'RTX4C12', motorista: '—', modelo: 'JCB 3CX', situacao: 'parado', local: 'Obra Jundiaí · canteiro', cidade: 'Jundiaí/SP', velocidade: 0, ignicao: false, bateria: 58, combustivel: 18, odometro: '8.940 h', temperatura: '—', ultimaAtualizacao: 'há 22min', sinalGps: 'ok', cerca: 'Obra Jundiaí', x: 44, y: 30 },
];

interface AlertaTelemetria {
  tipo: string;
  placa: string;
  detalhe: string;
  tempo: string;
  nivel: 'critico' | 'atencao';
}

const ALERTAS: AlertaTelemetria[] = [
  { tipo: 'Excesso de velocidade', placa: 'JBL5E88', detalhe: '82 km/h em via de 80 km/h · BR-116', tempo: 'há 1 min', nivel: 'atencao' },
  { tipo: 'Combustível baixo', placa: 'RTX4C12', detalhe: 'Tanque em 18% · Obra Jundiaí', tempo: 'há 12 min', nivel: 'atencao' },
  { tipo: 'Ignição ligada parado', placa: 'MNT7D45', detalhe: 'Motor ligado e ocioso há 15 min', tempo: 'há 15 min', nivel: 'atencao' },
  { tipo: 'Sinal de GPS fraco', placa: 'DSA9924', detalhe: 'Rastreador sem posição precisa', tempo: 'há 40 min', nivel: 'critico' },
];

const SITUACAO_INFO: Record<SituacaoRastreador, { label: string; dot: string; badge: string }> = {
  rota: { label: 'Em rota', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700' },
  parado: { label: 'Parado', dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-600' },
  manutencao: { label: 'Manutenção', dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700' },
  ocioso: { label: 'Ocioso (motor ligado)', dot: 'bg-sky-500', badge: 'bg-sky-50 text-sky-700' },
};

const FILTROS: { key: SituacaoRastreador | 'todos'; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'rota', label: 'Em rota' },
  { key: 'parado', label: 'Parados' },
  { key: 'ocioso', label: 'Ociosos' },
  { key: 'manutencao', label: 'Manutenção' },
];

function corSinal(s: VeiculoRastreado['sinalGps']) {
  return s === 'ok' ? 'text-emerald-500' : s === 'fraco' ? 'text-amber-500' : 'text-rose-500';
}
function corBateria(pct: number) {
  return pct >= 60 ? 'text-emerald-600' : pct >= 30 ? 'text-amber-600' : 'text-rose-600';
}

export default function VamosControlePage() {
  const [filtro, setFiltro] = useState<SituacaoRastreador | 'todos'>('todos');
  const [busca, setBusca] = useState('');
  const [selecionada, setSelecionada] = useState<string>('JBL5E88');

  const lista = useMemo(
    () =>
      VEICULOS_RASTREADOS
        .filter((v) => filtro === 'todos' || v.situacao === filtro)
        .filter((v) => !busca || v.placa.toLowerCase().includes(busca.toLowerCase()) || v.motorista.toLowerCase().includes(busca.toLowerCase()) || v.cidade.toLowerCase().includes(busca.toLowerCase())),
    [filtro, busca],
  );

  const kpis = useMemo(() => ({
    emRota: VEICULOS_RASTREADOS.filter((v) => v.situacao === 'rota').length,
    parados: VEICULOS_RASTREADOS.filter((v) => v.situacao === 'parado' || v.situacao === 'ocioso').length,
    manutencao: VEICULOS_RASTREADOS.filter((v) => v.situacao === 'manutencao').length,
    alertas: ALERTAS.length,
  }), []);

  const veiculoSel = VEICULOS_RASTREADOS.find((v) => v.placa === selecionada) ?? VEICULOS_RASTREADOS[0];

  return (
    <div>
      <PageTitle
        titulo="Vamos Controle"
        subtitulo="Rastreamento e telemetria da sua frota em tempo real"
        acao={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
            <Signal size={14} /> {VEICULOS_RASTREADOS.length} rastreadores online
          </span>
        }
      />

      <KpiRow>
        <KpiCard label="Em rota" valor={String(kpis.emRota)} detalhe="veículos em movimento" cor="border-l-emerald-500" detalheCor="text-emerald-600" />
        <KpiCard label="Parados / ociosos" valor={String(kpis.parados)} detalhe="sem deslocamento" cor="border-l-[#0e2233]" />
        <KpiCard label="Em manutenção" valor={String(kpis.manutencao)} detalhe="em oficina" cor="border-l-amber-500" detalheCor="text-amber-600" />
        <KpiCard label="Alertas ativos" valor={String(kpis.alertas)} detalhe="requerem atenção" cor="border-l-rose-500" detalheCor="text-rose-600" />
      </KpiRow>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <SectionCard titulo="Mapa da frota" subtitulo="Posição aproximada dos rastreadores">
          <div className="relative h-72 overflow-hidden rounded-xl border border-slate-200 bg-[#0e2233]">
            <div
              className="absolute inset-0 opacity-[0.15]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
                backgroundSize: '36px 36px',
              }}
            />
            {VEICULOS_RASTREADOS.map((v) => {
              const ativo = v.placa === selecionada;
              return (
                <button
                  key={v.placa}
                  onClick={() => setSelecionada(v.placa)}
                  title={`${v.placa} · ${v.cidade}`}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${v.x}%`, top: `${v.y}%` }}
                >
                  <span className={`flex items-center justify-center rounded-full ${ativo ? 'h-8 w-8 ring-4 ring-white/30' : 'h-6 w-6'} ${SITUACAO_INFO[v.situacao].dot}`}>
                    <MapPin size={ativo ? 16 : 12} className="text-white" />
                  </span>
                  {ativo && (
                    <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-white px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-800 shadow">
                      {v.placa}
                    </span>
                  )}
                </button>
              );
            })}
            <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
              {(['rota', 'ocioso', 'parado', 'manutencao'] as SituacaoRastreador[]).map((s) => (
                <span key={s} className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  <i className={`h-2 w-2 rounded-full ${SITUACAO_INFO[s].dot}`} /> {SITUACAO_INFO[s].label}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-slate-200 px-2 py-1 font-mono text-sm font-bold">{veiculoSel.placa}</span>
                <span className="text-sm font-semibold text-slate-700">{veiculoSel.modelo}</span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${SITUACAO_INFO[veiculoSel.situacao].badge}`}>{SITUACAO_INFO[veiculoSel.situacao].label}</span>
              </div>
              <span className="flex items-center gap-1 text-xs text-slate-400"><Clock size={12} /> {veiculoSel.ultimaAtualizacao}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Metric icon={<Gauge size={15} />} label="Velocidade" valor={`${veiculoSel.velocidade} km/h`} />
              <Metric icon={<Power size={15} />} label="Ignição" valor={veiculoSel.ignicao ? 'Ligada' : 'Desligada'} cor={veiculoSel.ignicao ? 'text-emerald-600' : 'text-slate-500'} />
              <Metric icon={<BatteryMedium size={15} />} label="Bateria" valor={`${veiculoSel.bateria}%`} cor={corBateria(veiculoSel.bateria)} />
              <Metric icon={<Fuel size={15} />} label="Combustível" valor={`${veiculoSel.combustivel}%`} cor={corBateria(veiculoSel.combustivel)} />
              <Metric icon={<Navigation size={15} />} label="Local" valor={veiculoSel.local} sub={veiculoSel.cidade} />
              <Metric icon={<LocateFixed size={15} />} label="Cerca" valor={veiculoSel.cerca} />
              <Metric icon={<Route size={15} />} label="Odômetro" valor={veiculoSel.odometro} />
              <Metric icon={<Thermometer size={15} />} label="Motor" valor={veiculoSel.temperatura} />
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
              <Signal size={13} className={corSinal(veiculoSel.sinalGps)} />
              Sinal GPS {veiculoSel.sinalGps === 'ok' ? 'estável' : veiculoSel.sinalGps === 'fraco' ? 'fraco' : 'sem sinal'} · Motorista: <b className="text-slate-700">{veiculoSel.motorista}</b>
            </p>
          </div>
        </SectionCard>

        <SectionCard titulo="Alertas em tempo real" subtitulo="Eventos detectados pelos rastreadores">
          <div className="space-y-2.5">
            {ALERTAS.map((a) => (
              <div key={a.tipo + a.placa} className={`flex items-start gap-3 rounded-lg border px-3.5 py-3 ${a.nivel === 'critico' ? 'border-rose-200 bg-rose-50/50' : 'border-amber-200 bg-amber-50/50'}`}>
                <span className="mt-0.5">
                  {a.nivel === 'critico' ? <ShieldAlert size={16} className="text-rose-500" /> : <AlertTriangle size={16} className="text-amber-500" />}
                </span>
                <div className="flex-1">
                  <p className="text-[13px] font-bold text-slate-800">{a.tipo} <span className="font-mono text-xs font-semibold text-slate-500">· {a.placa}</span></p>
                  <p className="text-xs text-slate-500">{a.detalhe}</p>
                </div>
                <span className="whitespace-nowrap text-[11px] text-slate-400">{a.tempo}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6">
        <Toolbar>
          {FILTROS.map((f) => (
            <FilterChip key={f.key} label={f.label} active={filtro === f.key} onClick={() => setFiltro(f.key)} />
          ))}
          <ToolbarSpacer />
          <SearchInput value={busca} onChange={setBusca} placeholder="Placa, motorista ou cidade..." largura="w-52" />
        </Toolbar>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {lista.map((v) => (
            <button
              key={v.placa}
              onClick={() => setSelecionada(v.placa)}
              className={`card p-4 text-left transition ${v.placa === selecionada ? 'border-primary-500 ring-1 ring-primary-500' : 'hover:border-slate-300'}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-sm font-bold text-slate-800">{v.placa}</p>
                  <p className="text-xs text-slate-500">{v.modelo} · {v.motorista}</p>
                </div>
                <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${SITUACAO_INFO[v.situacao].badge}`}>
                  <i className={`h-1.5 w-1.5 rounded-full ${SITUACAO_INFO[v.situacao].dot}`} /> {SITUACAO_INFO[v.situacao].label}
                </span>
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-600"><MapPin size={13} className="text-slate-400" /> {v.local} · {v.cidade}</p>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Gauge size={13} /> {v.velocidade} km/h</span>
                <span className={`flex items-center gap-1 ${corBateria(v.bateria)}`}><BatteryMedium size={13} /> {v.bateria}%</span>
                <span className="flex items-center gap-1"><Clock size={13} /> {v.ultimaAtualizacao}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Metric({ icon, label, valor, sub, cor = 'text-slate-800' }: { icon: React.ReactNode; label: string; valor: string; sub?: string; cor?: string }) {
  return (
    <div>
      <p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">{icon} {label}</p>
      <p className={`mt-0.5 truncate text-sm font-bold ${cor}`}>{valor}</p>
      {sub && <p className="truncate text-[11px] text-slate-400">{sub}</p>}
    </div>
  );
}
