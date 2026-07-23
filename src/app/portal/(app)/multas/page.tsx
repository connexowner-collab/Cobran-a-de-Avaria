'use client';

import { Fragment, useMemo, useState } from 'react';
import { ChevronRight, Download } from 'lucide-react';
import { MULTAS, VEICULOS, type Multa } from '@/lib/portalData';
import {
  PageTitle, StatusBadge, KpiCard, KpiRow, FilterChip, Toolbar,
  DataTable, Th, TablePagination, SectionCard, usePaginacao,
  ColunaFiltro, ThFiltro, useFiltrosColuna, type ColDef,
} from '@/components/portal/ui';

/** Quantos veículos aparecem no ranking — fixo, independente do tamanho da frota. */
const TOP_N = 5;

const STATUS_LABEL = {
  notificada: 'Notificada',
  em_recurso: 'Em recurso',
  paga: 'Paga',
  vencida: 'Vencida',
} as const;

const FILTROS: Array<{ key: Multa['status'] | 'todos'; label: string }> = [
  { key: 'todos', label: 'Todas' },
  { key: 'notificada', label: 'Notificadas' },
  { key: 'em_recurso', label: 'Em recurso' },
  { key: 'paga', label: 'Pagas' },
  { key: 'vencida', label: 'Vencidas' },
];

const RANK_STYLE = [
  'bg-amber-100 text-amber-700 border-amber-300',
  'bg-slate-200 text-slate-600 border-slate-300',
  'bg-orange-100 text-orange-700 border-orange-300',
];

function valorNum(v: string): number {
  return Number(v.replace(/[^0-9,]/g, '').replace('.', '').replace(',', '.')) || 0;
}
function fmtBRL(n: number): string {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function MultasPage() {
  const [filtro, setFiltro] = useState<Multa['status'] | 'todos'>('todos');
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());

  // Agrupamento acumulado por placa — a visão principal desta tela.
  const porPlacaBase = useMemo(() => {
    const grupos = new Map<string, Multa[]>();
    MULTAS.forEach((m) => {
      grupos.set(m.placa, [...(grupos.get(m.placa) ?? []), m]);
    });
    return Array.from(grupos.entries())
      .map(([placa, multas]) => {
        const veiculo = VEICULOS.find((v) => v.placa === placa);
        return {
          placa,
          modelo: veiculo?.modelo ?? '—',
          qtd: multas.length,
          valor: multas.reduce((s, m) => s + valorNum(m.valor), 0),
          pontos: multas.reduce((s, m) => s + m.pontos, 0),
          pendentes: multas.filter((m) => m.status === 'notificada' || m.status === 'vencida').length,
        };
      })
      .sort((a, b) => b.qtd - a.qtd || b.valor - a.valor);
  }, []);
  const topPlacas = porPlacaBase.slice(0, TOP_N);

  // Multas que batem com o filtro de status + filtros por coluna.
  const multasBase = useMemo(() => MULTAS.filter((m) => filtro === 'todos' || m.status === filtro), [filtro]);
  const cols = useMemo<ColDef<Multa>[]>(() => [
    { key: 'placa', get: (m) => m.placa, multi: true },
    { key: 'auto', get: (m) => m.auto, multi: true },
    { key: 'infracao', get: (m) => m.infracao },
    { key: 'data', get: (m) => m.data },
    { key: 'valor', get: (m) => m.valor },
    { key: 'prazo', get: (m) => m.prazo },
    { key: 'status', get: (m) => STATUS_LABEL[m.status] },
  ], []);
  const { val, set, filtradas: linhasFiltradas } = useFiltrosColuna(multasBase, cols);

  // Agrupa o resultado filtrado por placa, mantendo só quem tem alguma multa correspondente.
  const grupos = useMemo(() => {
    const map = new Map<string, Multa[]>();
    linhasFiltradas.forEach((m) => map.set(m.placa, [...(map.get(m.placa) ?? []), m]));
    return Array.from(map.entries())
      .map(([placa, multas]) => {
        const veiculo = VEICULOS.find((v) => v.placa === placa);
        return {
          placa,
          modelo: veiculo?.modelo ?? '—',
          multas,
          valor: multas.reduce((s, m) => s + valorNum(m.valor), 0),
          pontos: multas.reduce((s, m) => s + m.pontos, 0),
          pendentes: multas.filter((m) => m.status === 'notificada' || m.status === 'vencida').length,
        };
      })
      .sort((a, b) => b.multas.length - a.multas.length);
  }, [linhasFiltradas]);

  const pag = usePaginacao(grupos, 10);

  // Com filtro de status ou busca ativos, expande automaticamente os grupos com resultado.
  const filtroAtivo = filtro !== 'todos';
  const estaExpandido = (placa: string) => filtroAtivo || expandidos.has(placa);
  const toggleExpandido = (placa: string) => {
    setExpandidos((prev) => {
      const next = new Set(prev);
      if (next.has(placa)) next.delete(placa); else next.add(placa);
      return next;
    });
  };

  const totalMultas = MULTAS.length;
  const valorTotal = MULTAS.reduce((s, m) => s + valorNum(m.valor), 0);
  const placasComMulta = porPlacaBase.length;

  const todasSelecionadas = linhasFiltradas.length > 0 && linhasFiltradas.every((m) => selecionados.has(m.auto));
  const toggleTodas = () => {
    setSelecionados(todasSelecionadas ? new Set() : new Set(linhasFiltradas.map((m) => m.auto)));
  };
  const toggleUma = (auto: string) => {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(auto)) next.delete(auto); else next.add(auto);
      return next;
    });
  };
  const toggleGrupo = (multas: Multa[]) => {
    const todasDoGrupo = multas.every((m) => selecionados.has(m.auto));
    setSelecionados((prev) => {
      const next = new Set(prev);
      multas.forEach((m) => (todasDoGrupo ? next.delete(m.auto) : next.add(m.auto)));
      return next;
    });
  };

  return (
    <div>
      <PageTitle
        titulo="Multas"
        subtitulo="Consulte as multas da sua frota por veículo e baixe as notificações"
      />

      <KpiRow cols={3}>
        <KpiCard label="Total de multas" valor={String(totalMultas)} detalhe={`${placasComMulta} veículos envolvidos`} cor="border-l-[#0e2233]" />
        <KpiCard label="Valor total" valor={fmtBRL(valorTotal)} detalhe="todas as multas" cor="border-l-primary-600" detalheCor="text-primary-700" />
        <KpiCard label="Placas com multas" valor={String(placasComMulta)} detalhe={`de ${VEICULOS.length} veículos na frota`} cor="border-l-sky-600" />
      </KpiRow>

      {/* Ranking fixo (top 5) — não cresce com o tamanho da frota. Para achar qualquer outra placa, use a busca abaixo. */}
      <SectionCard
        titulo="Top veículos com mais multas"
        subtitulo={`Os ${Math.min(TOP_N, placasComMulta)} veículos com mais ocorrências — clique para ver o detalhe na lista abaixo`}
        className="mb-6"
      >
        <div className="divide-y divide-slate-100">
          {topPlacas.map((p, i) => (
            <button
              key={p.placa}
              onClick={() => {
                set('placa')(val('placa') === p.placa ? '' : p.placa);
                setExpandidos((prev) => new Set(prev).add(p.placa));
              }}
              className="flex w-full items-center gap-4 py-3 text-left transition first:pt-0 last:pb-0 hover:bg-slate-50"
            >
              <span className={`flex h-7 w-7 flex-none items-center justify-center rounded-full border text-[11px] font-black ${RANK_STYLE[i] ?? 'border-slate-200 bg-slate-50 text-slate-400'}`}>
                {i + 1}º
              </span>
              <div className="min-w-[110px]">
                <p className="font-mono text-sm font-bold text-slate-800">{p.placa}</p>
                <p className="truncate text-xs text-slate-500">{p.modelo}</p>
              </div>
              <div className="flex-1 text-right">
                <p className="font-mono text-sm font-bold text-slate-800">
                  {p.qtd} <span className="text-xs font-semibold text-slate-400">multa{p.qtd > 1 ? 's' : ''}</span>
                </p>
                <p className="font-mono text-xs text-slate-500">{fmtBRL(p.valor)} · {p.pontos} pontos</p>
              </div>
              {p.pendentes > 0 && (
                <span className="flex-none rounded-full bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700">
                  {p.pendentes} pendente{p.pendentes > 1 ? 's' : ''}
                </span>
              )}
            </button>
          ))}
        </div>
      </SectionCard>

      <Toolbar>
        {FILTROS.map((f) => (
          <FilterChip key={f.key} label={f.label} active={filtro === f.key} onClick={() => setFiltro(f.key)} />
        ))}
      </Toolbar>

      {/* Ações em massa */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <input type="checkbox" checked={todasSelecionadas} onChange={toggleTodas} className="h-4 w-4 rounded border-slate-300" />
          Selecionar todas ({linhasFiltradas.length})
        </label>
        <div className="flex items-center gap-3">
          {selecionados.size > 0 && (
            <button className="btn-primary gap-1.5 px-3 py-2 text-xs">
              <Download size={13} /> Baixar {selecionados.size} notificaç{selecionados.size > 1 ? 'ões' : 'ão'} selecionada{selecionados.size > 1 ? 's' : ''}
            </button>
          )}
          <button className="btn-secondary gap-1.5 px-3 py-2 text-xs">
            <Download size={13} /> Baixar todas as notificações
          </button>
        </div>
      </div>

      {/* Lista agrupada por veículo, com linhas expansíveis */}
      <DataTable
        colSpan={9}
        vazio={grupos.length === 0}
        vazioLabel="Nenhuma multa encontrada com os filtros atuais."
        filterRow={
          <>
            <ThFiltro />
            <ThFiltro><ColunaFiltro value={val('placa')} onChange={set('placa')} placeholder="Placa" multi ariaLabel="Filtrar placa" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('infracao')} onChange={set('infracao')} placeholder="Infração" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('data')} onChange={set('data')} placeholder="Data" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('valor')} onChange={set('valor')} placeholder="Valor" /></ThFiltro>
            <ThFiltro />
            <ThFiltro><ColunaFiltro value={val('prazo')} onChange={set('prazo')} placeholder="Prazo" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('status')} onChange={set('status')} placeholder="Status" /></ThFiltro>
            <ThFiltro />
          </>
        }
        head={
          <>
            <Th className="w-10" />
            <Th>Veículo</Th>
            <Th>Infração</Th>
            <Th>Data</Th>
            <Th>Valor</Th>
            <Th>Pontos</Th>
            <Th>Prazo</Th>
            <Th>Status</Th>
            <Th />
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
            rotulo="veículos"
          />
        }
      >
        {pag.pageItens.map((g) => {
          const aberto = estaExpandido(g.placa);
          const grupoSelecionado = g.multas.every((m) => selecionados.has(m.auto));
          return (
            <Fragment key={g.placa}>
              {/* Linha agrupadora */}
              <tr
                onClick={() => toggleExpandido(g.placa)}
                className="cursor-pointer border-b border-slate-100 bg-slate-50/60 hover:bg-slate-100"
              >
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={grupoSelecionado}
                    onChange={() => toggleGrupo(g.multas)}
                    aria-label={`Selecionar todas as multas de ${g.placa}`}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                </td>
                <td className="px-4 py-3" colSpan={2}>
                  <div className="flex items-center gap-2">
                    <ChevronRight size={15} className={`flex-none text-slate-400 transition-transform ${aberto ? 'rotate-90' : ''}`} />
                    <div>
                      <p className="font-mono text-sm font-bold text-slate-800">{g.placa}</p>
                      <p className="text-xs text-slate-500">{g.modelo}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">
                  {g.multas.length} multa{g.multas.length > 1 ? 's' : ''}
                </td>
                <td className="px-4 py-3 font-mono text-sm font-bold text-slate-800">{fmtBRL(g.valor)}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{g.pontos} pts</td>
                <td className="px-4 py-3">
                  {g.pendentes > 0 && (
                    <span className="rounded-full bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700">
                      {g.pendentes} pendente{g.pendentes > 1 ? 's' : ''}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3" />
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end">
                    <button className="btn-secondary gap-1.5 px-3 py-1.5 text-xs">
                      <Download size={13} /> Todas do veículo
                    </button>
                  </div>
                </td>
              </tr>

              {/* Multas do veículo (expansível) */}
              {aberto &&
                g.multas.map((m) => (
                  <tr key={m.auto} className={`border-b border-slate-100 last:border-0 hover:bg-slate-50 ${selecionados.has(m.auto) ? 'bg-primary-50/30' : ''}`}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selecionados.has(m.auto)}
                        onChange={() => toggleUma(m.auto)}
                        aria-label={`Selecionar ${m.auto}`}
                        className="ml-1 h-4 w-4 rounded border-slate-300"
                      />
                    </td>
                    <td className="px-4 py-3 pl-9 font-mono text-xs text-slate-500">{m.auto}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800">{m.infracao}</p>
                      <p className="text-xs text-slate-500">{m.local}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{m.data}</td>
                    <td className="px-4 py-3 font-mono font-semibold">{m.valor}</td>
                    <td className="px-4 py-3 text-center font-mono text-xs">{m.pontos}</td>
                    <td className="px-4 py-3 font-mono text-xs">{m.prazo}</td>
                    <td className="px-4 py-3"><StatusBadge status={m.status} label={STATUS_LABEL[m.status]} /></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <button className="btn-secondary gap-1.5 px-3 py-1.5 text-xs">
                          <Download size={13} /> Notificação
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </Fragment>
          );
        })}
      </DataTable>
    </div>
  );
}
