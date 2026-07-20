'use client';

import { useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import {
  Camera, Search, Download, FileSpreadsheet, ClipboardList, AlertTriangle, Clock,
  X, FileText, CheckCircle2, Eye,
} from 'lucide-react';
import { AVARIAS, type Avaria, type AvariaStatus, type AvariaMotivo } from '@/lib/portalData';
import {
  PageTitle, StatusBadge, FilterChip, Toolbar, ToolbarSpacer,
  DataTable, Th, TablePagination,
} from '@/components/portal/ui';
import DateRangeFilter from '@/components/DateRangeFilter';

/** Data de referência do protótipo (mesma usada na aba Serviços). */
const HOJE = new Date(2026, 6, 20); // 20/07/2026
const PRAZO_CONTESTACAO_DIAS = 15;

const STATUS_LABEL: Record<AvariaStatus, string> = {
  analise: 'Aguardando aprovação',
  aprovada: 'Aprovada',
  contestada: 'Contestada',
  paga: 'Faturada',
};

const FILTROS: Array<{ key: AvariaStatus | 'todos'; label: string }> = [
  { key: 'todos', label: 'Todas' },
  { key: 'analise', label: 'Aguardando aprovação' },
  { key: 'aprovada', label: 'Aprovadas' },
  { key: 'contestada', label: 'Contestadas' },
  { key: 'paga', label: 'Faturadas' },
];

const STATUS_DOT: Record<AvariaStatus, string> = {
  analise: 'bg-sky-500',
  aprovada: 'bg-amber-500',
  contestada: 'bg-violet-500',
  paga: 'bg-emerald-500',
};

const MOTIVO_STYLE: Record<AvariaMotivo, string> = {
  Corretiva: 'bg-sky-50 text-sky-700',
  Preventiva: 'bg-emerald-50 text-emerald-700',
  Sinistro: 'bg-primary-50 text-primary-700',
};

function valorNum(v: string): number {
  return Number(v.replace(/[^0-9,]/g, '').replace('.', '').replace(',', '.')) || 0;
}
function fmtBRL(n: number): string {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function parseBR(d: string): Date {
  const [dd, mm, yy] = d.split('/').map(Number);
  return new Date(yy, mm - 1, dd);
}
function diasEntre(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/** Prazo de contestação (só se aplica a cobranças "em análise"). */
function prazoContestacao(a: Avaria): { diasRestantes: number; vencido: boolean } | null {
  if (a.status !== 'analise') return null;
  const limite = parseBR(a.data);
  limite.setDate(limite.getDate() + PRAZO_CONTESTACAO_DIAS);
  const diasRestantes = diasEntre(HOJE, limite);
  return { diasRestantes, vencido: diasRestantes < 0 };
}

/** Card compacto de resumo — usado só nesta tela para o painel de indicadores. */
function ResumoCard({ titulo, children, destaque }: { titulo: string; children: React.ReactNode; destaque?: boolean }) {
  return (
    <div className={`card p-4 ${destaque ? 'border-primary-200 bg-primary-50/30' : ''}`}>
      <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">{titulo}</p>
      {children}
    </div>
  );
}

/**
 * Modal de análise de uma cobrança "Aguardando aprovação".
 * Reúne fotos, resumo do atendimento e o demonstrativo (PDF) num só lugar
 * para o cliente decidir entre aprovar ou contestar sem sair da tela.
 */
function ModalAnalise({
  avaria, prazo, onFechar, onAprovar, onContestar,
}: {
  avaria: Avaria;
  prazo: { diasRestantes: number; vencido: boolean } | null;
  onFechar: () => void;
  onAprovar: () => void;
  onContestar: (motivo: string) => void;
}) {
  const [contestando, setContestando] = useState(false);
  const [motivoContestacao, setMotivoContestacao] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onFechar}>
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Cabeçalho */}
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-semibold text-slate-500">{avaria.id} · atendimento {avaria.numeroAtendimento}</p>
            <h2 className="mt-0.5 text-lg font-extrabold text-slate-900">{avaria.descricao}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span>Veículo <b className="font-mono text-slate-800">{avaria.placa}</b></span>
              <span>{avaria.centroCusto}</span>
              <span className={`rounded px-1.5 py-0.5 font-semibold ${MOTIVO_STYLE[avaria.motivo]}`}>{avaria.motivo}</span>
            </div>
          </div>
          <button onClick={onFechar} aria-label="Fechar" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        {prazo && (
          <div className={`mb-5 flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-xs font-semibold ${prazo.vencido ? 'bg-primary-50 text-primary-700' : 'bg-amber-50 text-amber-700'}`}>
            <Clock size={14} />
            {prazo.vencido
              ? 'O prazo de 15 dias para contestar esta cobrança já venceu.'
              : `Você tem ${prazo.diasRestantes} dia${prazo.diasRestantes === 1 ? '' : 's'} para contestar esta cobrança.`}
          </div>
        )}

        {/* Fotos */}
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Fotos anexadas ({avaria.fotos})</p>
        {avaria.fotos > 0 ? (
          <div className="mb-5 grid grid-cols-4 gap-2">
            {Array.from({ length: avaria.fotos }).map((_, i) => (
              <div key={i} className="flex aspect-square items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                <Camera size={20} />
              </div>
            ))}
          </div>
        ) : (
          <p className="mb-5 text-xs text-slate-400">Nenhuma foto anexada pela oficina.</p>
        )}

        {/* Resumo do atendimento */}
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Resumo do atendimento</p>
        <dl className="mb-5 grid grid-cols-2 gap-x-4 gap-y-2.5 rounded-lg border border-slate-200 p-4 text-[13px]">
          <div><dt className="text-xs text-slate-400">Data de envio</dt><dd className="font-mono font-semibold">{avaria.data}</dd></div>
          <div><dt className="text-xs text-slate-400">Nº do demonstrativo</dt><dd className="font-mono font-semibold">{avaria.numeroDemonstrativo}</dd></div>
          <div><dt className="text-xs text-slate-400">Valor total do atendimento</dt><dd className="font-mono">{avaria.valorTotal}</dd></div>
          <div><dt className="text-xs text-slate-400">Valor cobrado (CA)</dt><dd className="font-mono font-bold text-slate-900">{avaria.valor}</dd></div>
        </dl>

        {/* PDF do demonstrativo */}
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Demonstrativo</p>
        <div className="mb-5 flex items-center gap-3 rounded-lg border border-slate-200 p-3.5">
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <FileText size={18} />
          </span>
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-slate-800">{avaria.numeroDemonstrativo}.pdf</p>
            <p className="text-xs text-slate-400">Demonstrativo de cobrança da avaria</p>
          </div>
          <button className="btn-secondary gap-1.5 px-3 py-1.5 text-xs">
            <Eye size={13} /> Visualizar
          </button>
          <button className="btn-secondary gap-1.5 px-3 py-1.5 text-xs">
            <Download size={13} /> Baixar
          </button>
        </div>

        {/* Ações */}
        {contestando ? (
          <div className="border-t border-slate-100 pt-4">
            <label htmlFor="motivo-contestacao" className="mb-1.5 block text-xs font-bold text-slate-700">
              Motivo da contestação
            </label>
            <textarea
              id="motivo-contestacao"
              value={motivoContestacao}
              onChange={(e) => setMotivoContestacao(e.target.value)}
              placeholder="Descreva por que você está contestando esta cobrança..."
              rows={3}
              className="input-field w-full text-[13px]"
            />
            <div className="mt-3 flex justify-end gap-2.5">
              <button onClick={() => setContestando(false)} className="btn-secondary text-[13px]">
                Cancelar
              </button>
              <button
                onClick={() => onContestar(motivoContestacao)}
                disabled={!motivoContestacao.trim()}
                className="btn-primary text-[13px]"
              >
                Enviar contestação
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4">
            <button onClick={() => setContestando(true)} className="btn-secondary text-[13px]">
              Contestar
            </button>
            <button onClick={onAprovar} className="btn-primary gap-1.5 text-[13px]">
              <CheckCircle2 size={15} /> Aprovar cobrança
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AvariasPage() {
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<AvariaStatus | 'todos'>('todos');
  const [periodo, setPeriodo] = useState<DateRange | undefined>(undefined);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [statusOverride, setStatusOverride] = useState<Record<string, AvariaStatus>>({});
  const [analisando, setAnalisando] = useState<Avaria | null>(null);

  // Aplica decisões tomadas nesta sessão (aprovar/contestar) por cima dos dados mockados.
  const avarias = useMemo(
    () => AVARIAS.map((a) => (statusOverride[a.id] ? { ...a, status: statusOverride[a.id] } : a)),
    [statusOverride],
  );

  const linhas = useMemo(() => {
    return avarias
      .filter((a) => filtro === 'todos' || a.status === filtro)
      .filter(
        (a) =>
          !busca ||
          a.placa.toLowerCase().includes(busca.toLowerCase()) ||
          a.id.toLowerCase().includes(busca.toLowerCase()),
      );
  }, [avarias, filtro, busca]);

  // Resumo (calculado sobre a base completa, não sobre o filtro atual).
  const totalCAs = avarias.length;
  const porStatus = (['analise', 'aprovada', 'contestada', 'paga'] as AvariaStatus[]).map((s) => ({
    status: s,
    qtd: avarias.filter((a) => a.status === s).length,
    valor: avarias.filter((a) => a.status === s).reduce((sum, a) => sum + valorNum(a.valor), 0),
  }));
  const porMotivo = useMemo(() => {
    const cont = new Map<AvariaMotivo, number>();
    avarias.forEach((a) => cont.set(a.motivo, (cont.get(a.motivo) ?? 0) + 1));
    return Array.from(cont.entries());
  }, [avarias]);
  const totalGasto = avarias.reduce((sum, a) => sum + valorNum(a.valor), 0);

  // A ação mais importante desta tela: quantas cobranças estão perto (ou já passaram) do prazo de 15 dias.
  const prazos = useMemo(() => {
    return avarias
      .map((a) => ({ a, prazo: prazoContestacao(a) }))
      .filter((x): x is { a: Avaria; prazo: { diasRestantes: number; vencido: boolean } } => x.prazo !== null)
      .sort((x, y) => x.prazo.diasRestantes - y.prazo.diasRestantes);
  }, [avarias]);
  const urgentes = prazos.filter((p) => p.prazo.diasRestantes <= 5);

  const valorSelecionado = avarias
    .filter((a) => selecionados.has(a.id))
    .reduce((sum, a) => sum + valorNum(a.valor), 0);

  const todasSelecionadas = linhas.length > 0 && linhas.every((a) => selecionados.has(a.id));
  const toggleTodas = () => {
    setSelecionados((prev) => {
      if (todasSelecionadas) return new Set();
      return new Set(linhas.map((a) => a.id));
    });
  };
  const toggleUm = (id: string) => {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const limparFiltros = () => {
    setBusca('');
    setFiltro('todos');
    setPeriodo(undefined);
  };

  return (
    <div>
      <PageTitle
        titulo="Cobrança de Avarias"
        subtitulo="Acompanhe, conteste e resolva cobranças de avaria com transparência"
      />

      {/* Alerta de prazos — a informação mais acionável da tela */}
      {urgentes.length > 0 && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-primary-200 bg-primary-50/60 px-4 py-3">
          <AlertTriangle size={18} className="mt-0.5 flex-none text-primary-600" />
          <p className="text-[13px] text-slate-700">
            <b className="text-primary-700">
              {urgentes.length} cobrança{urgentes.length > 1 ? 's' : ''} {urgentes.some((u) => u.prazo.vencido) ? 'com prazo vencido ou' : ''} perto do prazo de contestação
            </b>{' '}
            — {urgentes.map((u) => `${u.a.id} (${u.prazo.vencido ? 'vencido' : `${u.prazo.diasRestantes}d`})`).join(', ')}.
            Conteste em até {PRAZO_CONTESTACAO_DIAS} dias após o envio, com fotos e documentos.
          </p>
        </div>
      )}

      {/* Busca principal */}
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3">
        <Search size={16} className="text-slate-400" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Digite a placa ou nº de CA desejado"
          className="w-full border-none bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </div>

      <Toolbar>
        {FILTROS.map((f) => (
          <FilterChip key={f.key} label={f.label} active={filtro === f.key} onClick={() => setFiltro(f.key)} />
        ))}
        <ToolbarSpacer />
        <DateRangeFilter value={periodo} onChange={setPeriodo} placeholder="Período" />
        <button onClick={limparFiltros} className="text-xs font-semibold text-primary-700 hover:text-primary-600">
          Limpar filtros
        </button>
      </Toolbar>

      {/* Painel de indicadores */}
      <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <ResumoCard titulo="Total de CAs">
          <p className="text-3xl font-extrabold text-slate-900">{totalCAs}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">{fmtBRL(totalGasto)} no total</p>
        </ResumoCard>

        <ResumoCard titulo="Por status">
          <div className="space-y-1.5">
            {porStatus.map((s) => (
              <div key={s.status} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <i className={`h-2 w-2 rounded-full ${STATUS_DOT[s.status]}`} />
                  {STATUS_LABEL[s.status]}
                </span>
                <span className="text-right">
                  <span className="font-mono font-bold text-slate-800">{s.qtd}</span>
                  <span className="ml-1.5 font-mono text-[10px] text-slate-400">{fmtBRL(s.valor)}</span>
                </span>
              </div>
            ))}
          </div>
        </ResumoCard>

        <ResumoCard titulo="Por motivo">
          <div className="space-y-1.5">
            {porMotivo.map(([motivo, qtd]) => (
              <div key={motivo} className="flex items-center justify-between text-xs">
                <span className={`rounded px-1.5 py-0.5 font-semibold ${MOTIVO_STYLE[motivo]}`}>{motivo}</span>
                <span className="font-mono font-bold text-slate-800">{qtd}</span>
              </div>
            ))}
          </div>
        </ResumoCard>

        <ResumoCard titulo="Prazo de contestação" destaque={urgentes.length > 0}>
          {prazos.length === 0 ? (
            <p className="text-xs text-slate-400">Nenhuma cobrança aguardando aprovação.</p>
          ) : (
            <div className="space-y-1.5">
              {prazos.map(({ a, prazo }) => (
                <div key={a.id} className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-600">{a.id}</span>
                  <span className={`flex items-center gap-1 font-bold ${prazo.vencido ? 'text-primary-700' : prazo.diasRestantes <= 5 ? 'text-amber-600' : 'text-slate-500'}`}>
                    <Clock size={11} />
                    {prazo.vencido ? 'Vencido' : `${prazo.diasRestantes}d restantes`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ResumoCard>
      </div>

      {/* Lista */}
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-800">Cobranças de avarias</p>
          <p className="text-xs text-slate-500">Acompanhe as cobranças de avaria da sua frota</p>
        </div>
        <div className="flex items-center gap-3">
          {selecionados.size > 0 && (
            <button className="btn-primary gap-1.5 px-3 py-2 text-xs">
              <Download size={13} /> Baixar {selecionados.size} demonstrativo{selecionados.size > 1 ? 's' : ''} · {fmtBRL(valorSelecionado)}
            </button>
          )}
          <button className="flex items-center gap-1.5 text-xs font-semibold text-primary-700 hover:text-primary-600">
            <FileSpreadsheet size={14} /> Baixar planilha
          </button>
        </div>
      </div>

      <DataTable
        colSpan={9}
        vazio={linhas.length === 0}
        vazioLabel="Nenhuma cobrança encontrada com os filtros atuais."
        head={
          <>
            <Th className="w-10">
              <input type="checkbox" checked={todasSelecionadas} onChange={toggleTodas} className="h-4 w-4 rounded border-slate-300" aria-label="Selecionar todas" />
            </Th>
            <Th>Cobrança</Th>
            <Th>Veículo / Centro de custo</Th>
            <Th>Motivo</Th>
            <Th>Envio / Prazo</Th>
            <Th>Valor da CA</Th>
            <Th>Status</Th>
            <Th>Fotos</Th>
            <Th />
          </>
        }
        footer={<TablePagination info={`Mostrando ${linhas.length} de ${avarias.length} cobranças`} />}
      >
        {linhas.map((a) => {
          const prazo = prazoContestacao(a);
          return (
            <tr key={a.id} className={`border-b border-slate-100 last:border-0 hover:bg-slate-50 ${selecionados.has(a.id) ? 'bg-primary-50/30' : ''}`}>
              <td className="px-4 py-3.5">
                <input
                  type="checkbox"
                  checked={selecionados.has(a.id)}
                  onChange={() => toggleUm(a.id)}
                  aria-label={`Selecionar ${a.id}`}
                  className="h-4 w-4 rounded border-slate-300"
                />
              </td>
              <td className="px-4 py-3.5">
                <p className="font-mono font-semibold text-slate-800">{a.id}</p>
                <p className="max-w-[180px] truncate text-xs text-slate-500">{a.descricao}</p>
              </td>
              <td className="px-4 py-3.5">
                <p className="font-mono text-xs font-semibold text-slate-700">{a.placa}</p>
                <p className="text-xs text-slate-400">{a.centroCusto}</p>
              </td>
              <td className="px-4 py-3.5">
                <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${MOTIVO_STYLE[a.motivo]}`}>{a.motivo}</span>
              </td>
              <td className="px-4 py-3.5">
                <p className="font-mono text-xs">{a.data}</p>
                {prazo && (
                  <p className={`text-[11px] font-semibold ${prazo.vencido ? 'text-primary-700' : prazo.diasRestantes <= 5 ? 'text-amber-600' : 'text-slate-400'}`}>
                    {prazo.vencido ? 'Prazo vencido' : `${prazo.diasRestantes}d para contestar`}
                  </p>
                )}
              </td>
              <td className="px-4 py-3.5">
                <p className="font-mono font-semibold">{a.valor}</p>
                <p className="text-[11px] text-slate-400">de {a.valorTotal} total</p>
              </td>
              <td className="px-4 py-3.5"><StatusBadge status={a.status} label={STATUS_LABEL[a.status]} /></td>
              <td className="px-4 py-3.5">
                {a.fotos > 0 ? (
                  <button title="Ver fotos" className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-[#0e2233]">
                    <Camera size={14} /> {a.fotos}
                  </button>
                ) : (
                  <span className="text-xs text-slate-300">—</span>
                )}
              </td>
              <td className="px-4 py-3.5">
                <div className="flex justify-end gap-2">
                  <button title="Demonstrativo" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#0e2233]">
                    <ClipboardList size={16} />
                  </button>
                  {a.status === 'analise' && (
                    <button onClick={() => setAnalisando(a)} className="btn-primary px-3 py-1.5 text-xs">
                      Analisar
                    </button>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </DataTable>

      <p className="mt-4 text-xs text-slate-400">
        Cobranças aguardando aprovação podem ser contestadas em até {PRAZO_CONTESTACAO_DIAS} dias após o envio, com fotos e documentos.
      </p>

      {analisando && (
        <ModalAnalise
          avaria={analisando}
          prazo={prazoContestacao(analisando)}
          onFechar={() => setAnalisando(null)}
          onAprovar={() => {
            setStatusOverride((prev) => ({ ...prev, [analisando.id]: 'aprovada' }));
            setAnalisando(null);
          }}
          onContestar={() => {
            setStatusOverride((prev) => ({ ...prev, [analisando.id]: 'contestada' }));
            setAnalisando(null);
          }}
        />
      )}
    </div>
  );
}
