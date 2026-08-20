'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, X, MessageSquare, Download, Wrench } from 'lucide-react';
import {
  PageTitle, KpiCard, KpiRow, SectionCard, StatusBadge, BarraProgresso,
  DataTable, Th, TablePagination, usePaginacao,
  ColunaFiltro, ThFiltro, useFiltrosColuna, type ColDef,
} from '@/components/portal/ui';
import { CHAMADOS, VEICULOS, type Chamado, type ChamadoStatus } from '@/lib/portalData';

/** Rótulo de cada status de chamado (a cor vem de StatusBadge). */
const STATUS_LABEL: Record<ChamadoStatus, string> = {
  aberto: 'Aberto',
  atendimento: 'Em atendimento',
  resolvido: 'Finalizado',
};

/** Um chamado é considerado "em aberto" enquanto não estiver resolvido. */
const emAberto = (c: Chamado) => c.status !== 'resolvido';

/** Gera e baixa um CSV (mesmo padrão das demais telas do portal). */
function baixarCSV(nome: string, linhas: (string | number)[][]) {
  const csv = linhas.map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${nome}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
/** Referência "hoje" do protótipo: julho/2026. Codificada como ano*12+mês. */
const HOJE_YM = 2026 * 12 + 6;
/** Ano-mês (ano*12+mês) de uma data dd/mm/aaaa. */
function ymOf(d: string): number {
  const [, mm, yy] = d.split('/').map(Number);
  return yy * 12 + (mm - 1);
}

/** Timestamp de uma data dd/mm/aaaa (para ordenação). */
function tsData(d: string): number {
  const [dd, mm, yy] = d.split('/').map(Number);
  return new Date(yy || 0, (mm || 1) - 1, dd || 1).getTime();
}

/** Opções do filtro de período (em meses; 0 = todo o histórico). */
const PERIODOS = [
  { key: '3', label: '3 meses', meses: 3 },
  { key: '6', label: '6 meses', meses: 6 },
  { key: '12', label: '12 meses', meses: 12 },
  { key: 'tudo', label: 'Tudo', meses: 0 },
] as const;
type PeriodoKey = (typeof PERIODOS)[number]['key'];

/** Cor do "ponto" de cada status, para o chip de filtro/contador. */
const STATUS_DOT: Record<ChamadoStatus, string> = {
  aberto: 'bg-primary-500',
  atendimento: 'bg-amber-500',
  resolvido: 'bg-emerald-500',
};

/** Chip de filtro por status com contador. Sem `status` = opção "Todos". */
function ContadorChip({
  label, valor, status, ativo, onClick,
}: {
  label: string;
  valor: number;
  status?: ChamadoStatus;
  ativo: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={ativo}
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
        ativo
          ? 'border-primary-600 bg-primary-600 text-white'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-800'
      }`}
    >
      {status && <i className={`h-2 w-2 rounded-full ${ativo ? 'bg-white' : STATUS_DOT[status]}`} />}
      {label}
      <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-extrabold ${ativo ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
        {valor}
      </span>
    </button>
  );
}

/** Tom da barra conforme a magnitude (claro → forte). O último mês (atual)
 *  ganha um azul-petróleo da marca para se destacar do restante da série. */
function corBarra(count: number, max: number, atual: boolean): string {
  if (atual) return 'bg-[#0e2233]';
  const r = count / max;
  if (r >= 0.8) return 'bg-primary-600';
  if (r >= 0.6) return 'bg-primary-500';
  if (r >= 0.4) return 'bg-primary-400';
  if (r >= 0.2) return 'bg-primary-300';
  return 'bg-primary-200';
}

/** Gráfico de barras de chamados por mês (magnitude por tom; mês atual em destaque). */
function GraficoPorMes({ dados }: { dados: { label: string; count: number }[] }) {
  const max = Math.max(1, ...dados.map((d) => d.count));
  return (
    <div className="overflow-x-auto">
    <div className="flex h-44 min-w-[560px] items-end gap-1.5 sm:min-w-0 sm:gap-2.5">
      {dados.map((d, i) => {
        const atual = i === dados.length - 1;
        return (
          <div key={d.label} className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end" title={`${d.label}: ${d.count} chamados`}>
            <span className="mb-1 text-[10px] font-bold text-slate-500">{d.count}</span>
            <div
              className={`w-full rounded-t-md transition-opacity hover:opacity-80 ${corBarra(d.count, max, atual)}`}
              style={{ height: `${Math.max(3, (d.count / max) * 100)}%` }}
            />
            <span className={`mt-2 text-[10px] font-semibold uppercase tracking-wide ${atual ? 'text-slate-700' : 'text-slate-400'}`}>{d.label}</span>
          </div>
        );
      })}
    </div>
    </div>
  );
}

/** Modal de detalhes do chamado: histórico de mensagens + envio de nova mensagem. */
function ModalChamado({ chamado: c, onFechar }: { chamado: Chamado; onFechar: () => void }) {
  const ativo = c.placa !== '—' ? VEICULOS.find((v) => v.placa === c.placa) : undefined;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onFechar}>
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-y-auto rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6 pb-4">
          <div>
            <p className="font-mono text-[13px] font-semibold text-slate-500">Chamado {c.id}</p>
            <h2 className="mt-0.5 text-xl font-extrabold text-slate-900">{c.categoria}</h2>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              <span>Solicitante <b className="text-slate-800">{c.solicitante}</b></span>
              <span>Responsável <b className="text-slate-800">{c.responsavel}</b></span>
              <span>Aberto em <b className="font-mono text-slate-800">{c.dataAbertura}</b></span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={c.status} label={STATUS_LABEL[c.status]} />
            <button onClick={onFechar} aria-label="Fechar" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Dados do ativo vinculado ao chamado */}
        <div className="border-b border-slate-100 px-6 py-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Dados do ativo</p>
          {c.placa === '—' ? (
            <p className="text-[13px] text-slate-400">Chamado sem ativo vinculado.</p>
          ) : (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border border-slate-200 bg-slate-50/40 p-4 text-[13px] sm:grid-cols-3">
              <div><dt className="text-xs font-bold uppercase text-slate-400">Placa</dt><dd className="font-mono font-semibold text-slate-800">{c.placa}</dd></div>
              <div><dt className="text-xs font-bold uppercase text-slate-400">Chassi</dt><dd className="font-mono font-semibold text-slate-800">{ativo?.chassi ?? '—'}</dd></div>
              <div><dt className="text-xs font-bold uppercase text-slate-400">Marca/Modelo</dt><dd className="font-semibold text-slate-800">{ativo?.modelo ?? '—'}</dd></div>
              <div><dt className="text-xs font-bold uppercase text-slate-400">Categoria</dt><dd className="font-semibold text-slate-800">{ativo?.categoria ?? '—'}</dd></div>
              <div><dt className="text-xs font-bold uppercase text-slate-400">Frota</dt><dd className="font-semibold text-slate-800">{ativo?.frota ?? '—'}</dd></div>
              <div><dt className="text-xs font-bold uppercase text-slate-400">Contrato</dt><dd className="font-mono font-semibold text-slate-800">{ativo?.contrato ?? '—'}</dd></div>
            </dl>
          )}
        </div>

        {/* Descrição registrada na abertura do chamado */}
        <div className="px-6 py-4">
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">Descrição do chamado</p>
          <p className="text-[13px] leading-relaxed text-slate-700">{c.descricao}</p>
        </div>

        {/* Atalho para os serviços de manutenção do ativo */}
        {c.placa !== '—' && (
          <div className="border-t border-slate-100 px-6 py-4">
            <Link
              href={`/portal/servicos?placa=${encodeURIComponent(c.placa)}`}
              className="btn-secondary inline-flex items-center gap-1.5 text-[13px]"
            >
              <Wrench size={14} /> Ver serviços de manutenção deste ativo
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChamadosPage() {
  const [aberto, setAberto] = useState<Chamado | null>(null);
  const [statusFiltro, setStatusFiltro] = useState<ChamadoStatus | 'todos'>('todos');
  const [periodo, setPeriodo] = useState<PeriodoKey>('12');
  const mesesSel = PERIODOS.find((p) => p.key === periodo)!.meses;

  /* KPIs gerais de chamados (todo o histórico). */
  const totais = useMemo(() => {
    const abertos = CHAMADOS.filter(emAberto).length;
    return { abertos, finalizados: CHAMADOS.length - abertos, total: CHAMADOS.length };
  }, []);

  /* Top 5 placas com mais chamados (sem SLA, priorizamos por volume por ativo). */
  const topPlacas = useMemo(() => {
    const map = new Map<string, { total: number; abertos: number }>();
    for (const c of CHAMADOS) {
      if (c.placa === '—') continue;
      const e = map.get(c.placa) ?? { total: 0, abertos: 0 };
      e.total++;
      if (emAberto(c)) e.abertos++;
      map.set(c.placa, e);
    }
    return Array.from(map.entries())
      .map(([placa, v]) => ({ placa, ...v }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, []);
  const maxPlaca = Math.max(1, ...topPlacas.map((p) => p.total));

  /* Top chamados por tipo (categoria) mais recorrente. */
  const topTipos = useMemo(() => {
    const cont = new Map<string, number>();
    CHAMADOS.forEach((c) => cont.set(c.categoria, (cont.get(c.categoria) ?? 0) + 1));
    const total = CHAMADOS.length;
    return Array.from(cont.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tipo, qtd]) => ({ tipo, qtd, pct: Math.round((qtd / total) * 100) }));
  }, []);

  /* Base filtrada pelo período (compartilhada por contadores e tabela). */
  const dentroPeriodo = (c: Chamado) => mesesSel === 0 || ymOf(c.dataAbertura) >= HOJE_YM - (mesesSel - 1);
  const basePeriodo = useMemo(
    () => (mesesSel === 0 ? CHAMADOS : CHAMADOS.filter(dentroPeriodo)),
    [mesesSel],
  );

  /* Contagem por status dentro do período (para os chips). */
  const contagem = useMemo(() => {
    const base: Record<ChamadoStatus, number> = { aberto: 0, atendimento: 0, resolvido: 0 };
    for (const c of basePeriodo) base[c.status]++;
    return base;
  }, [basePeriodo]);

  /* Chamados por mês na janela do período (série do gráfico). */
  const dadosGrafico = useMemo(() => {
    const janela = mesesSel === 0 ? 12 : mesesSel;
    const arr: { label: string; count: number }[] = [];
    for (let k = janela - 1; k >= 0; k--) {
      const ym = HOJE_YM - k;
      const count = CHAMADOS.filter((c) => ymOf(c.dataAbertura) === ym).length;
      arr.push({ label: `${MESES[ym % 12]}/${String(Math.floor(ym / 12)).slice(2)}`, count });
    }
    return arr;
  }, [mesesSel]);

  const baseTabela = useMemo(
    () => (statusFiltro === 'todos' ? basePeriodo : basePeriodo.filter((c) => c.status === statusFiltro)),
    [basePeriodo, statusFiltro],
  );

  const cols = useMemo<ColDef<Chamado>[]>(() => [
    { key: 'id', get: (c) => c.id, multi: true },
    { key: 'categoria', get: (c) => c.categoria },
    { key: 'placa', get: (c) => c.placa, multi: true },
    { key: 'solicitante', get: (c) => c.solicitante },
  ], []);
  const { val, set, filtradas: lista } = useFiltrosColuna(baseTabela, cols);
  /* Ordena a listagem por Data de Abertura, da mais nova para a mais antiga. */
  const listaOrdenada = useMemo(
    () => [...lista].sort((a, b) => tsData(b.dataAbertura) - tsData(a.dataAbertura)),
    [lista],
  );
  const pag = usePaginacao(listaOrdenada, 10);

  return (
    <div>
      <PageTitle
        titulo="Central de Chamados"
        subtitulo="Todos os chamados abertos com a Vamos — manutenção, documentação, financeiro e suporte"
        novo
        acao={
          <Link href="/portal/agendamentos" className="btn-primary gap-1.5 text-[13px]">
            <Plus size={15} /> Novo Chamado
          </Link>
        }
      />

      <KpiRow cols={3}>
        <KpiCard label="Total de chamados" valor={String(totais.total)} detalhe="abertos + finalizados" cor="border-l-[#0e2233]" />
        <KpiCard label="Chamados em aberto" valor={String(totais.abertos)} detalhe="aguardando resolução" cor="border-l-primary-600" detalheCor="text-primary-700" />
        <KpiCard label="Chamados finalizados" valor={String(totais.finalizados)} detalhe="já resolvidos" cor="border-l-emerald-600" detalheCor="text-emerald-700" />
      </KpiRow>

      {/* Gráfico chamados por mês — largura total para caber os 12 meses. */}
      <SectionCard
        titulo="Chamados por mês"
        subtitulo="Volume de aberturas no período selecionado"
        className="mb-4"
        acao={
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
            {PERIODOS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriodo(p.key)}
                className={`rounded-md px-2.5 py-1.5 text-xs font-bold transition ${
                  periodo === p.key ? 'bg-primary-600 text-white' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        }
      >
        <GraficoPorMes dados={dadosGrafico} />
      </SectionCard>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        {/* Top 5 placas com mais chamados */}
        <SectionCard titulo="Top 5 placas com mais chamados" subtitulo="Ativos que mais acionaram a central">
          <ul className="space-y-3.5">
            {topPlacas.map((p, i) => (
              <li key={p.placa} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[12px] font-extrabold text-slate-600">
                  {i + 1}º
                </span>
                <span className="w-20 shrink-0 font-mono text-[13px] font-semibold text-slate-800">{p.placa}</span>
                <div className="min-w-0 flex-1">
                  <BarraProgresso pct={(p.total / maxPlaca) * 100} cor="bg-primary-500" />
                </div>
                <span className="w-32 shrink-0 text-right text-[11px] text-slate-500">
                  <b className="text-slate-800">{p.total}</b> · {p.abertos} aberto
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* Top chamados por tipo de chamados */}
        <SectionCard titulo="Top 5 tipos de chamado" subtitulo="Tipos de chamado mais recorrentes">
          <div className="space-y-3.5">
            {topTipos.map((t, i) => (
              <div key={t.tipo} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[12px] font-extrabold text-slate-600">
                  {i + 1}º
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex justify-between gap-3 text-[13px]">
                    <span className="truncate font-semibold text-slate-700">{t.tipo}</span>
                    <span className="shrink-0 font-mono text-slate-500">{t.qtd} · {t.pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-[#0e2233]" style={{ width: `${t.pct}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Filtro por status com contador + download da tabela. */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <ContadorChip label="Todos" valor={basePeriodo.length} ativo={statusFiltro === 'todos'} onClick={() => setStatusFiltro('todos')} />
        {(Object.keys(STATUS_LABEL) as ChamadoStatus[]).map((s) => (
          <ContadorChip
            key={s}
            label={STATUS_LABEL[s]}
            valor={contagem[s]}
            status={s}
            ativo={statusFiltro === s}
            onClick={() => setStatusFiltro((prev) => (prev === s ? 'todos' : s))}
          />
        ))}
        <button
          type="button"
          onClick={() => baixarCSV('chamados', [
            ['Chamado', 'Assunto', 'Placa / Ativo', 'Solicitante', 'Data de Abertura', 'Status'],
            ...listaOrdenada.map((c) => [c.id, c.categoria, c.placa, c.solicitante, c.dataAbertura, STATUS_LABEL[c.status]]),
          ])}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-primary-300 hover:text-primary-700"
        >
          <Download size={14} /> Baixar tabela
        </button>
      </div>

      <DataTable
        colSpan={7}
        vazio={lista.length === 0}
        vazioLabel="Nenhum chamado encontrado com os filtros atuais."
        filterRow={
          <>
            <ThFiltro><ColunaFiltro value={val('id')} onChange={set('id')} placeholder="Chamado" multi ariaLabel="Filtrar chamado" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('categoria')} onChange={set('categoria')} placeholder="Assunto" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('placa')} onChange={set('placa')} placeholder="Placa / Ativo" multi ariaLabel="Filtrar placa ou ativo" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('solicitante')} onChange={set('solicitante')} placeholder="Solicitante" /></ThFiltro>
            <ThFiltro />
            <ThFiltro />
            <ThFiltro />
          </>
        }
        head={
          <>
            <Th>Chamado</Th>
            <Th>Assunto</Th>
            <Th>Placa / Ativo</Th>
            <Th>Solicitante</Th>
            <Th>Data de Abertura</Th>
            <Th>Status</Th>
            <Th className="text-right">Detalhes</Th>
          </>
        }
        footer={
          <TablePagination
            pagina={pag.pagina}
            totalPaginas={pag.totalPaginas}
            totalItens={pag.totalItens}
            itensPorPagina={pag.itensPorPagina}
            onPaginaChange={pag.setPagina}
            onItensPorPaginaChange={pag.setItensPorPagina}
            rotulo="chamados"
          />
        }
      >
        {pag.pageItens.map((c) => (
          <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
            <td className="px-4 py-3.5 font-mono text-xs font-semibold text-slate-800">{c.id}</td>
            <td className="px-4 py-3.5 text-[13px] font-semibold text-slate-800">{c.categoria}</td>
            <td className="px-4 py-3.5 font-mono text-xs text-slate-600">{c.placa}</td>
            <td className="px-4 py-3.5 text-xs text-slate-600">{c.solicitante}</td>
            <td className="px-4 py-3.5 font-mono text-xs text-slate-600">{c.dataAbertura}</td>
            <td className="px-4 py-3.5"><StatusBadge status={c.status} label={STATUS_LABEL[c.status]} /></td>
            <td className="px-4 py-3.5 text-right">
              <button
                onClick={() => setAberto(c)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-primary-300 hover:text-primary-700"
              >
                <MessageSquare size={13} /> Detalhes
              </button>
            </td>
          </tr>
        ))}
      </DataTable>

      {aberto && <ModalChamado chamado={aberto} onFechar={() => setAberto(null)} />}
    </div>
  );
}
