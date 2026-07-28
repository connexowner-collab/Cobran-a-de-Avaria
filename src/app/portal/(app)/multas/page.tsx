'use client';

import { Fragment, useMemo, useState } from 'react';
import { ChevronRight, Download, UserCheck, Clock, X, Upload, Check, IdCard } from 'lucide-react';
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
  aguardando_identificacao: 'Aguardando Identificação Condutor',
  em_recurso: 'Em recurso',
  paga: 'Paga',
  vencida: 'Vencida',
} as const;

const FILTROS: Array<{ key: Multa['status'] | 'todos'; label: string }> = [
  { key: 'todos', label: 'Todas' },
  { key: 'aguardando_identificacao', label: 'Aguardando identificação' },
  { key: 'notificada', label: 'Notificadas' },
  { key: 'em_recurso', label: 'Em recurso' },
  { key: 'paga', label: 'Pagas' },
  { key: 'vencida', label: 'Vencidas' },
];

/* Data de referência do protótipo (para o prazo de identificação). */
const HOJE = new Date(2026, 6, 20); // 20/07/2026
function parseBR(d: string): Date | null {
  if (!d || d === '—') return null;
  const [dd, mm, yy] = d.split('/').map(Number);
  return new Date(yy, mm - 1, dd);
}
function diasEntre(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/** SLA de identificação do condutor: quanto tempo resta e se o botão está liberado. */
function slaIdentificacao(prazo?: string): { label: string; cls: string; liberado: boolean } | null {
  const p = prazo ? parseBR(prazo) : null;
  if (!p) return null;
  const dias = diasEntre(HOJE, p);
  if (dias < 0) return { label: 'Prazo encerrado', cls: 'text-rose-600', liberado: false };
  if (dias === 0) return { label: 'Encerra hoje', cls: 'text-rose-600', liberado: true };
  if (dias <= 3) return { label: `Faltam ${dias} dia${dias > 1 ? 's' : ''}`, cls: 'text-amber-600', liberado: true };
  return { label: `Faltam ${dias} dias`, cls: 'text-emerald-600', liberado: true };
}

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

/* ------------------------------------------------------------------ *
 * Modal de identificação do condutor (dados obrigatórios + foto da CNH).
 * ------------------------------------------------------------------ */
function ModalIdentificarCondutor({ multa, onFechar }: { multa: Multa; onFechar: () => void }) {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [cnh, setCnh] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [enviado, setEnviado] = useState(false);
  const sla = slaIdentificacao(multa.prazoIdentificacao);

  const inputCls = 'input-field w-full py-2.5 text-[13px]';
  const label = 'mb-1 block text-[13px] font-semibold text-slate-600';
  const podeEnviar = nome.trim().length >= 5 && cpf.replace(/\D/g, '').length === 11 && cnh.replace(/\D/g, '').length >= 9 && !!foto;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onFechar}>
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-semibold text-slate-500">{multa.auto} · {multa.placa}</p>
            <h3 className="text-lg font-extrabold text-slate-900">Identificar condutor</h3>
            <p className="mt-0.5 text-[13px] text-slate-500">{multa.infracao}</p>
          </div>
          <button onClick={onFechar} aria-label="Fechar" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><X size={18} /></button>
        </div>

        {enviado ? (
          <div className="flex flex-col items-center py-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><Check size={28} /></span>
            <h4 className="mt-4 text-base font-extrabold text-slate-900">Condutor identificado!</h4>
            <p className="mt-1 max-w-xs text-sm text-slate-500">
              A identificação de <b>{nome}</b> para a multa <b className="font-mono">{multa.auto}</b> foi enviada ao órgão autuador. Você receberá a confirmação em breve.
            </p>
            <button className="btn-secondary mt-6 text-[13px]" onClick={onFechar}>Fechar</button>
          </div>
        ) : (
          <>
            {sla && (
              <div className={`mb-4 flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-[12px] font-semibold ${sla.liberado ? 'bg-amber-50 text-amber-800' : 'bg-rose-50 text-rose-700'}`}>
                <Clock size={15} /> Prazo para identificação: <b>{multa.prazoIdentificacao}</b> · {sla.label}
              </div>
            )}
            <form
              onSubmit={(e) => { e.preventDefault(); if (podeEnviar) setEnviado(true); }}
              className="space-y-3"
            >
              <div>
                <label className={label}><span className="text-primary-600">*</span>Nome completo</label>
                <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo do condutor" className={inputCls} autoComplete="off" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}><span className="text-primary-600">*</span>CPF</label>
                  <input value={cpf} onChange={(e) => setCpf(e.target.value.replace(/\D/g, '').slice(0, 11))} placeholder="Somente números" inputMode="numeric" className={`${inputCls} font-mono`} autoComplete="off" />
                </div>
                <div>
                  <label className={label}><span className="text-primary-600">*</span>Nº da CNH</label>
                  <input value={cnh} onChange={(e) => setCnh(e.target.value.replace(/\D/g, '').slice(0, 11))} placeholder="Registro da CNH" inputMode="numeric" className={`${inputCls} font-mono`} autoComplete="off" />
                </div>
              </div>
              <div>
                <label className={label}><span className="text-primary-600">*</span>Foto da CNH</label>
                <label className="group flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/60 px-4 py-5 text-center transition hover:border-primary-400 hover:bg-primary-50/40">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm transition group-hover:text-primary-600">
                    {foto ? <IdCard size={17} /> : <Upload size={17} />}
                  </span>
                  <span className="text-[13px] font-semibold text-slate-600">{foto ? foto.name : 'Anexar foto da CNH'}</span>
                  <span className="text-[11px] text-slate-400">Frente da CNH legível (JPG, PNG)</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setFoto(e.target.files?.[0] ?? null)} />
                </label>
              </div>

              <div className="flex items-start gap-2 rounded-lg bg-sky-50 px-3.5 py-2.5 text-[12px] text-sky-800">
                <IdCard size={15} className="mt-0.5 shrink-0 text-sky-500" />
                <p>Confirme os dados do condutor responsável pela infração. A identificação é enviada ao órgão autuador dentro do prazo legal.</p>
              </div>

              <button type="submit" disabled={!podeEnviar} className="btn-primary w-full gap-1.5 py-2.5 text-[13px]">
                <UserCheck size={15} /> Enviar identificação
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function MultasPage() {
  const [filtro, setFiltro] = useState<Multa['status'] | 'todos'>('todos');
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [identificar, setIdentificar] = useState<Multa | null>(null);

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
          pendentes: multas.filter((m) => m.status === 'notificada' || m.status === 'vencida' || m.status === 'aguardando_identificacao').length,
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
          pendentes: multas.filter((m) => m.status === 'notificada' || m.status === 'vencida' || m.status === 'aguardando_identificacao').length,
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
  const aguardandoIdent = MULTAS.filter((m) => m.status === 'aguardando_identificacao').length;

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

      <KpiRow>
        <KpiCard label="Total de multas" valor={String(totalMultas)} detalhe={`${placasComMulta} veículos envolvidos`} cor="border-l-[#0e2233]" />
        <KpiCard label="Aguardando identificação" valor={String(aguardandoIdent)} detalhe="condutor a identificar" cor="border-l-indigo-500" detalheCor="text-indigo-700" />
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
                    <td className="px-4 py-3">
                      <StatusBadge status={m.status} label={STATUS_LABEL[m.status]} />
                      {m.status === 'aguardando_identificacao' && (() => {
                        const sla = slaIdentificacao(m.prazoIdentificacao);
                        return sla ? <p className={`mt-1 flex items-center gap-1 text-[11px] font-bold ${sla.cls}`}><Clock size={11} /> {sla.label}</p> : null;
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        {m.status === 'aguardando_identificacao' && (() => {
                          const sla = slaIdentificacao(m.prazoIdentificacao);
                          return (
                            <button
                              type="button"
                              onClick={() => setIdentificar(m)}
                              disabled={!sla?.liberado}
                              title={sla?.liberado ? 'Identificar condutor' : 'Prazo de identificação encerrado'}
                              className="btn-primary gap-1.5 px-3 py-1.5 text-xs"
                            >
                              <UserCheck size={13} /> Identificar condutor
                            </button>
                          );
                        })()}
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

      {identificar && <ModalIdentificarCondutor multa={identificar} onFechar={() => setIdentificar(null)} />}
    </div>
  );
}
