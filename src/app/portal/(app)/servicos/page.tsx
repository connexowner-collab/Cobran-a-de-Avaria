'use client';

import { useMemo, useState } from 'react';
import {
  Download, Info, Wrench, FileText, X, AlertTriangle, Clock,
  CheckCircle2, CalendarClock,
} from 'lucide-react';
import {
  PageTitle, StatusBadge, KpiCard, FilterChip, KpiRow, SectionCard, SectionHeader,
  Toolbar, ToolbarDivider, SearchInput, DataTable, Th, TablePagination,
} from '@/components/portal/ui';

/* Data de referência do protótipo (para calcular imobilização/atrasos). */
const HOJE = new Date(2026, 6, 20); // 20/07/2026

function parseBR(d: string): Date | null {
  if (!d || d === '—') return null;
  const [dd, mm, yy] = d.split('/').map(Number);
  return new Date(yy, mm - 1, dd);
}
function diasEntre(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

type TipoServico = 'preventiva' | 'corretiva' | 'sinistro' | 'outros';

const TIPO_INFO: Record<TipoServico, { label: string; dot: string; bar: string }> = {
  preventiva: { label: 'Preventiva', dot: 'bg-emerald-500', bar: 'bg-emerald-500' },
  corretiva: { label: 'Corretiva', dot: 'bg-[#0e2233]', bar: 'bg-[#0e2233]' },
  sinistro: { label: 'Sinistro', dot: 'bg-primary-600', bar: 'bg-primary-600' },
  outros: { label: 'Outros', dot: 'bg-slate-300', bar: 'bg-slate-300' },
};
const TIPOS_ORDEM: TipoServico[] = ['preventiva', 'corretiva', 'sinistro', 'outros'];

interface AtendimentoServico {
  numero: string;
  placa: string;
  status: 'finalizado' | 'aberta';
  motivo: string;
  tipo: TipoServico;
  agendamento: string;
  previsao: string;
  saida: string;
  situacao: string;
}

const ATENDIMENTOS_SERVICO: AtendimentoServico[] = [
  { numero: '972972', placa: 'JBL5B25', status: 'finalizado', motivo: 'PNEU', tipo: 'corretiva', agendamento: '25/06/2026', previsao: '—', saida: '13/07/2026', situacao: 'Rodando' },
  { numero: '957964', placa: 'JBL5B27', status: 'finalizado', motivo: 'CORRETIVA', tipo: 'corretiva', agendamento: '15/11/2025', previsao: '—', saida: '21/11/2025', situacao: 'Rodando' },
  { numero: '951200', placa: 'SHQ6B80', status: 'finalizado', motivo: 'REVISÃO PREVENTIVA', tipo: 'preventiva', agendamento: '10/05/2026', previsao: '—', saida: '12/05/2026', situacao: 'Rodando' },
  { numero: '948877', placa: 'JBL5E88', status: 'finalizado', motivo: 'SINISTRO', tipo: 'sinistro', agendamento: '02/04/2026', previsao: '—', saida: '25/04/2026', situacao: 'Rodando' },
  { numero: '2066903', placa: 'SIE8F02', status: 'aberta', motivo: 'DESMOBILIZAÇÃO', tipo: 'outros', agendamento: '02/07/2026', previsao: '20/07/2026', saida: '—', situacao: 'Em oficina' },
  { numero: '2066895', placa: 'BXW9D72', status: 'aberta', motivo: 'AFERIÇÃO TACÓGRAFO', tipo: 'preventiva', agendamento: '08/07/2026', previsao: '18/07/2026', saida: '—', situacao: 'Aguardando peça' },
  { numero: '2066894', placa: 'TXI3F16', status: 'aberta', motivo: 'PNEU', tipo: 'corretiva', agendamento: '10/07/2026', previsao: '17/07/2026', saida: '—', situacao: 'Em oficina' },
];

/** Dias de imobilização + atraso frente à previsão (para abertos). */
function imobilizacao(a: AtendimentoServico): { dias: number | null; atrasoDias: number } {
  const ag = parseBR(a.agendamento);
  if (a.status === 'finalizado') {
    const sa = parseBR(a.saida);
    return { dias: ag && sa ? diasEntre(ag, sa) : null, atrasoDias: 0 };
  }
  const prev = parseBR(a.previsao);
  return {
    dias: ag ? diasEntre(ag, HOJE) : null,
    atrasoDias: prev ? Math.max(0, diasEntre(prev, HOJE)) : 0,
  };
}

/* Evolução mensal por tipo (empilhado). */
const EVOLUCAO_MENSAL: { mes: string; valores: Record<TipoServico, number> }[] = [
  { mes: 'Jul/25', valores: { preventiva: 1, corretiva: 1, sinistro: 0, outros: 0 } },
  { mes: 'Ago/25', valores: { preventiva: 1, corretiva: 2, sinistro: 0, outros: 0 } },
  { mes: 'Set/25', valores: { preventiva: 0, corretiva: 3, sinistro: 0, outros: 0 } },
  { mes: 'Out/25', valores: { preventiva: 0, corretiva: 0, sinistro: 0, outros: 0 } },
  { mes: 'Nov/25', valores: { preventiva: 0, corretiva: 1, sinistro: 0, outros: 0 } },
  { mes: 'Dez/25', valores: { preventiva: 0, corretiva: 0, sinistro: 0, outros: 0 } },
  { mes: 'Jan/26', valores: { preventiva: 0, corretiva: 0, sinistro: 0, outros: 0 } },
  { mes: 'Fev/26', valores: { preventiva: 0, corretiva: 0, sinistro: 0, outros: 0 } },
  { mes: 'Mar/26', valores: { preventiva: 1, corretiva: 1, sinistro: 0, outros: 0 } },
  { mes: 'Abr/26', valores: { preventiva: 1, corretiva: 3, sinistro: 1, outros: 0 } },
  { mes: 'Mai/26', valores: { preventiva: 1, corretiva: 0, sinistro: 0, outros: 0 } },
  { mes: 'Jun/26', valores: { preventiva: 0, corretiva: 1, sinistro: 0, outros: 1 } },
];

type DetalheTipo = 'info' | 'servico' | 'resumo';
const DETALHE_TITULO: Record<DetalheTipo, string> = {
  info: 'Informação',
  servico: 'Detalhes de Serviço',
  resumo: 'Resumo do atendimento',
};

function ModalDetalheAtendimento({
  atendimento, tipo, onFechar,
}: {
  atendimento: AtendimentoServico;
  tipo: DetalheTipo;
  onFechar: () => void;
}) {
  const imob = imobilizacao(atendimento);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onFechar}>
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="font-mono text-xs font-semibold text-slate-500">Atendimento {atendimento.numero}</p>
            <h3 className="text-lg font-extrabold text-slate-900">{DETALHE_TITULO[tipo]}</h3>
          </div>
          <button onClick={onFechar} aria-label="Fechar" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        {tipo === 'info' && (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[13px]">
            <div><dt className="text-xs font-bold uppercase text-slate-400">Placa</dt><dd className="font-mono font-semibold">{atendimento.placa}</dd></div>
            <div><dt className="text-xs font-bold uppercase text-slate-400">Tipo</dt><dd className="font-semibold">{TIPO_INFO[atendimento.tipo].label}</dd></div>
            <div><dt className="text-xs font-bold uppercase text-slate-400">Motivo</dt><dd className="font-semibold">{atendimento.motivo}</dd></div>
            <div><dt className="text-xs font-bold uppercase text-slate-400">Situação do veículo</dt><dd>{atendimento.situacao}</dd></div>
            <div><dt className="text-xs font-bold uppercase text-slate-400">Data de agendamento</dt><dd className="font-mono">{atendimento.agendamento}</dd></div>
            <div><dt className="text-xs font-bold uppercase text-slate-400">Data de previsão</dt><dd className="font-mono">{atendimento.previsao}</dd></div>
            <div><dt className="text-xs font-bold uppercase text-slate-400">Data de saída</dt><dd className="font-mono">{atendimento.saida}</dd></div>
            <div><dt className="text-xs font-bold uppercase text-slate-400">Imobilização</dt><dd className="font-semibold">{imob.dias != null ? `${imob.dias} dias` : '—'}</dd></div>
          </dl>
        )}

        {tipo === 'servico' && (
          <div className="space-y-2.5 text-[13px]">
            <div className="rounded-lg border border-slate-200 px-4 py-3">
              <p className="font-semibold text-slate-800">{atendimento.motivo}</p>
              <p className="mt-0.5 text-xs text-slate-500">Oficina Vamos · Ordem de serviço vinculada ao atendimento {atendimento.numero}</p>
            </div>
            <div className="rounded-lg border border-slate-200 px-4 py-3">
              <p className="font-semibold text-slate-800">Itens aplicados</p>
              <p className="mt-0.5 text-xs text-slate-500">Peças e mão de obra registradas pela oficina aparecem aqui.</p>
            </div>
          </div>
        )}

        {tipo === 'resumo' && (
          <div className="space-y-3 text-[13px] text-slate-700">
            <p>
              Veículo <b className="font-mono">{atendimento.placa}</b> — atendimento{' '}
              {atendimento.status === 'finalizado' ? 'finalizado' : 'em andamento'} com motivo{' '}
              <b>{atendimento.motivo}</b> ({TIPO_INFO[atendimento.tipo].label}).
            </p>
            <p className="text-xs text-slate-500">
              Agendado em {atendimento.agendamento}
              {atendimento.saida !== '—'
                ? ` · veículo liberado em ${atendimento.saida} · ${imob.dias} dias imobilizado`
                : ` · previsão de conclusão ${atendimento.previsao}${imob.atrasoDias > 0 ? ` · atrasado ${imob.atrasoDias} dia(s)` : ''}`}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== Gráfico empilhado por tipo ===== */
function GraficoEmpilhado() {
  const [periodo, setPeriodo] = useState<'dia' | 'mes'>('mes');
  const maxTotal = Math.max(
    ...EVOLUCAO_MENSAL.map((m) => TIPOS_ORDEM.reduce((s, t) => s + m.valores[t], 0)),
    1,
  );

  return (
    <SectionCard
      titulo="Gráfico de Serviços"
      subtitulo="Comparativo dos serviços realizados por tipo no período"
      acao={
        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-slate-200 px-3 py-1.5 font-mono text-xs text-slate-600">
            20/07/2025 ~ 20/07/2026
          </span>
          <div className="flex overflow-hidden rounded-lg border border-slate-200 text-xs font-bold">
            {(['dia', 'mes'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={`px-3 py-1.5 ${periodo === p ? 'bg-[#0e2233] text-white' : 'bg-white text-slate-500'}`}
              >
                {p === 'dia' ? 'Dia' : 'Mês'}
              </button>
            ))}
          </div>
        </div>
      }
    >
      <div className="flex h-44 items-end gap-2">
        {EVOLUCAO_MENSAL.map((m) => {
          const total = TIPOS_ORDEM.reduce((s, t) => s + m.valores[t], 0);
          const tooltip = total === 0
            ? `${m.mes}: sem serviços`
            : `${m.mes}: ${TIPOS_ORDEM.filter((t) => m.valores[t] > 0).map((t) => `${TIPO_INFO[t].label} ${m.valores[t]}`).join(' · ')}`;
          return (
            <div key={m.mes} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5" title={tooltip}>
              {total > 0 && <span className="text-[10px] font-bold text-slate-500">{total}</span>}
              <div className="flex w-full flex-col justify-end" style={{ height: '100%' }}>
                {total === 0 ? (
                  <div className="w-full rounded-t bg-slate-100" style={{ height: '3%' }} />
                ) : (
                  TIPOS_ORDEM.filter((t) => m.valores[t] > 0).map((t, i, arr) => (
                    <div
                      key={t}
                      className={`w-full ${TIPO_INFO[t].bar} ${i === 0 ? 'rounded-t-md' : ''}`}
                      style={{ height: `${(m.valores[t] / maxTotal) * 100}%` }}
                    />
                  ))
                )}
              </div>
              <span className="text-[9px] text-slate-500">{m.mes}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-slate-500">
        {TIPOS_ORDEM.map((t) => (
          <span key={t} className="flex items-center gap-1.5">
            <i className={`h-2 w-2 rounded-full ${TIPO_INFO[t].dot}`} />
            {TIPO_INFO[t].label}
          </span>
        ))}
      </div>
    </SectionCard>
  );
}

const FILTROS_TIPO: Array<{ key: TipoServico | 'todos'; label: string }> = [
  { key: 'todos', label: 'Todos' },
  { key: 'preventiva', label: 'Preventiva' },
  { key: 'corretiva', label: 'Corretiva' },
  { key: 'sinistro', label: 'Sinistro' },
  { key: 'outros', label: 'Outros' },
];

export default function ServicosPage() {
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<TipoServico | 'todos'>('todos');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'aberta' | 'finalizado'>('todos');
  const [detalhe, setDetalhe] = useState<{ atendimento: AtendimentoServico; tipo: DetalheTipo } | null>(null);

  const abertos = ATENDIMENTOS_SERVICO.filter((a) => a.status === 'aberta');

  /* KPIs operacionais calculados a partir dos dados. */
  const kpis = useMemo(() => {
    const finalizados = ATENDIMENTOS_SERVICO.filter((a) => a.status === 'finalizado');
    const imobs = finalizados.map((a) => imobilizacao(a).dias ?? 0);
    const tempoMedio = imobs.length ? imobs.reduce((s, v) => s + v, 0) / imobs.length : 0;
    const atrasados = abertos.filter((a) => imobilizacao(a).atrasoDias > 0).length;
    const frotaTotal = 42;
    const disponivel = frotaTotal - abertos.length;
    return {
      emOficina: abertos.length,
      tempoMedio: tempoMedio.toFixed(1).replace('.', ','),
      atrasados,
      disponibilidade: ((disponivel / frotaTotal) * 100).toFixed(1).replace('.', ','),
    };
  }, [abertos]);

  /* Top motivos recorrentes. */
  const topMotivos = useMemo(() => {
    const cont = new Map<string, number>();
    ATENDIMENTOS_SERVICO.forEach((a) => cont.set(a.motivo, (cont.get(a.motivo) ?? 0) + 1));
    const total = ATENDIMENTOS_SERVICO.length;
    return Array.from(cont.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([motivo, qtd]) => ({ motivo, qtd, pct: Math.round((qtd / total) * 100) }));
  }, []);

  const linhas = ATENDIMENTOS_SERVICO
    .filter((a) => filtroStatus === 'todos' || a.status === filtroStatus)
    .filter((a) => filtroTipo === 'todos' || a.tipo === filtroTipo)
    .filter((a) => !busca || a.placa.toLowerCase().includes(busca.toLowerCase()) || a.numero.includes(busca));

  return (
    <div>
      <PageTitle
        titulo="Serviços"
        subtitulo="Serviços realizados, veículos em atendimento e disponibilidade da frota"
      />

      {/* KPIs operacionais */}
      <KpiRow>
        <KpiCard label="Em oficina agora" valor={String(kpis.emOficina)} detalhe="veículos imobilizados" cor="border-l-[#0e2233]" />
        <KpiCard label="Tempo médio de imobilização" valor={`${kpis.tempoMedio} d`} detalhe="da entrada à liberação" cor="border-l-sky-600" />
        <KpiCard
          label="Retornos atrasados"
          valor={String(kpis.atrasados)}
          detalhe="além da previsão"
          cor="border-l-primary-600"
          detalheCor="text-primary-700"
        />
        <KpiCard label="Disponibilidade da frota" valor={`${kpis.disponibilidade}%`} detalhe="veículos operacionais" cor="border-l-emerald-500" detalheCor="text-emerald-600" />
      </KpiRow>

      {/* Em atendimento agora */}
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <Clock size={15} className="text-slate-400" />
          <p className="text-sm font-bold text-slate-800">Em atendimento agora</p>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
            {abertos.length}
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {abertos.map((a) => {
            const imob = imobilizacao(a);
            const atrasado = imob.atrasoDias > 0;
            return (
              <div
                key={a.numero}
                className={`card p-4 ${atrasado ? 'border-primary-200 bg-primary-50/30' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-sm font-bold text-slate-800">{a.placa}</p>
                    <p className="text-xs text-slate-500">{a.motivo}</p>
                  </div>
                  <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold ${
                    atrasado ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {atrasado ? <AlertTriangle size={12} /> : <CalendarClock size={12} />}
                    {atrasado ? `Atrasado ${imob.atrasoDias}d` : 'No prazo'}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                  <span className="text-slate-500">
                    <b className="text-slate-800">{imob.dias}</b> dias parado
                  </span>
                  <span className="text-slate-500">
                    Previsão <b className="font-mono text-slate-800">{a.previsao}</b>
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">{a.situacao}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gráfico + composição */}
      <div className="mb-6 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <GraficoEmpilhado />

        <SectionCard titulo="Top motivos de serviço" subtitulo="Motivos mais recorrentes no período">
          <div className="space-y-3">
            {topMotivos.map((m) => (
              <div key={m.motivo}>
                <div className="mb-1 flex justify-between text-[13px]">
                  <span className="font-semibold text-slate-700">{m.motivo}</span>
                  <span className="font-mono text-slate-500">{m.qtd} · {m.pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-[#0e2233]" style={{ width: `${m.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Atendimentos realizados por tipo */}
      <SectionCard titulo="Atendimentos Realizados" subtitulo="Quantidade por tipo de serviço no período" className="mb-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {[
            { label: 'Total', valor: '21', pct: '100%', icon: <CheckCircle2 size={14} className="text-slate-400" /> },
            { label: 'Preventiva', valor: '5', pct: '24%', icon: <i className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> },
            { label: 'Corretiva', valor: '15', pct: '71%', icon: <i className="h-2.5 w-2.5 rounded-full bg-[#0e2233]" /> },
            { label: 'Sinistro', valor: '1', pct: '5%', icon: <i className="h-2.5 w-2.5 rounded-full bg-primary-600" /> },
            { label: 'Outros', valor: '1', pct: '5%', icon: <i className="h-2.5 w-2.5 rounded-full bg-slate-300" /> },
          ].map((a) => (
            <div key={a.label}>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">{a.icon}{a.label}</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">{a.valor}</p>
              <p className="font-mono text-[11px] text-slate-400">{a.pct} dos serviços</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Relatório de veículos */}
      <SectionHeader
        titulo="Relatório de Veículos"
        subtitulo="Listagem de veículos que passaram por serviços"
        className="mb-3"
        acao={
          <div className="flex items-center gap-2.5">
            <SearchInput value={busca} onChange={setBusca} placeholder="Buscar placa ou nº..." largura="w-40" />
            <button className="btn-secondary gap-1.5 px-3 py-2 text-xs">
              <Download size={13} /> Baixar planilha
            </button>
          </div>
        }
      />

      {/* Filtros */}
      <Toolbar>
        {FILTROS_TIPO.map((f) => (
          <FilterChip key={f.key} label={f.label} active={filtroTipo === f.key} onClick={() => setFiltroTipo(f.key)} />
        ))}
        <ToolbarDivider />
        {([
          { key: 'todos', label: 'Todos os status' },
          { key: 'aberta', label: 'Em aberto' },
          { key: 'finalizado', label: 'Finalizados' },
        ] as const).map((f) => (
          <FilterChip key={f.key} label={f.label} active={filtroStatus === f.key} onClick={() => setFiltroStatus(f.key)} />
        ))}
      </Toolbar>

      <DataTable
        colSpan={10}
        vazio={linhas.length === 0}
        vazioLabel="Nenhum atendimento encontrado com os filtros atuais."
        head={
          <>
            <Th>Nº de atendimento</Th>
            <Th>Placa</Th>
            <Th>Status</Th>
            <Th>Motivo</Th>
            <Th>Tipo</Th>
            <Th>Agendamento</Th>
            <Th>Previsão</Th>
            <Th>Saída</Th>
            <Th>Imobilização</Th>
            <Th>Mais detalhes</Th>
          </>
        }
        footer={<TablePagination info={`Mostrando de 1 até ${linhas.length} de 202.638 registros`} />}
      >
        {linhas.map((a) => {
              const imob = imobilizacao(a);
              const atrasado = imob.atrasoDias > 0;
              return (
                <tr key={a.numero} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3.5 font-mono font-semibold text-slate-800">{a.numero}</td>
                  <td className="px-4 py-3.5 font-mono text-xs">{a.placa}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge
                      status={a.status === 'finalizado' ? 'resolvido' : 'aberto'}
                      label={a.status === 'finalizado' ? 'Atendimento Finalizado' : 'Aberta'}
                    />
                  </td>
                  <td className="px-4 py-3.5 text-xs font-semibold">{a.motivo}</td>
                  <td className="px-4 py-3.5">
                    <span className="flex items-center gap-1.5 text-xs">
                      <i className={`h-2 w-2 rounded-full ${TIPO_INFO[a.tipo].dot}`} />
                      {TIPO_INFO[a.tipo].label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs">{a.agendamento}</td>
                  <td className="px-4 py-3.5 font-mono text-xs">{a.previsao}</td>
                  <td className="px-4 py-3.5 font-mono text-xs">{a.saida}</td>
                  <td className="px-4 py-3.5">
                    {imob.dias != null ? (
                      <span className={`font-mono text-xs font-semibold ${atrasado ? 'text-primary-700' : 'text-slate-600'}`}>
                        {imob.dias}d{atrasado ? ` · atraso ${imob.atrasoDias}d` : ''}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1">
                      <button
                        title="Informação"
                        onClick={() => setDetalhe({ atendimento: a, tipo: 'info' })}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#0e2233]"
                      >
                        <Info size={16} />
                      </button>
                      <button
                        title="Detalhes de Serviço"
                        onClick={() => setDetalhe({ atendimento: a, tipo: 'servico' })}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#0e2233]"
                      >
                        <Wrench size={16} />
                      </button>
                      <button
                        title="Resumo do atendimento"
                        onClick={() => setDetalhe({ atendimento: a, tipo: 'resumo' })}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#0e2233]"
                      >
                        <FileText size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
      </DataTable>

      {detalhe && (
        <ModalDetalheAtendimento
          atendimento={detalhe.atendimento}
          tipo={detalhe.tipo}
          onFechar={() => setDetalhe(null)}
        />
      )}
    </div>
  );
}
