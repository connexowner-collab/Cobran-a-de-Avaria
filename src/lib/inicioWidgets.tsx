'use client';

import Link from 'next/link';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { KpiCard, BarraProgresso } from '@/components/portal/ui';
import { CHAMADOS, VEICULOS, FATURAS, AVARIAS, MULTAS, TELEMETRIA } from '@/lib/portalData';

/** Um item do catálogo que o usuário pode adicionar à sua visão personalizada da tela de Início. */
export interface WidgetInicio {
  id: string;
  titulo: string;
  /** Aba do portal de onde o item vem — usado para agrupar no catálogo. */
  aba: string;
  descricao: string;
  /** Link "ver tudo" para a aba de origem. */
  href: string;
  /** Ocupa a linha inteira do grid (gráficos e listas largas). */
  full?: boolean;
  render: () => React.ReactNode;
}

/* ------------------------------------------------------------------ *
 * Dados de apoio (mesmos números exibidos no panorama padrão).
 * ------------------------------------------------------------------ */
const ATENCAO = [
  { texto: 'Chamado CH-3391 está fora do SLA', detalhe: 'Falha no sistema de freios · SHQ6B80', href: '/portal/chamados', acao: 'Ver chamado' },
  { texto: 'Fatura NF-86677 vencida (R$ 24.310,00)', detalhe: 'Venceu em 10/04/2026 — emita a 2ª via do boleto', href: '/portal/faturamento', acao: 'Ver fatura' },
  { texto: 'Multa AIT-559102 com prazo próximo', detalhe: 'Excesso de velocidade · SHQ6B80 · prazo 28/07/2026', href: '/portal/multas', acao: 'Ver multa' },
];

const REGIOES = [
  { nome: 'Sudeste', qtd: 22, pct: 52 },
  { nome: 'Sul', qtd: 9, pct: 22 },
  { nome: 'Nordeste', qtd: 6, pct: 14 },
  { nome: 'Centro-Oeste', qtd: 3, pct: 8 },
  { nome: 'Norte', qtd: 2, pct: 4 },
];

const SERVICOS_MES = [
  { mes: 'Fev', h: 35 }, { mes: 'Mar', h: 55 }, { mes: 'Abr', h: 80 },
  { mes: 'Mai', h: 60 }, { mes: 'Jun', h: 40 }, { mes: 'Jul', h: 70 },
];

const ATENDIMENTOS = [
  { label: 'Total', valor: '17', pct: '100%' },
  { label: 'Preventiva', valor: '9', pct: '53%' },
  { label: 'Corretiva', valor: '6', pct: '35%' },
  { label: 'Sinistro', valor: '1', pct: '6%' },
  { label: 'Outros', valor: '1', pct: '6%' },
];

const ENTRADA_SAIDA = [
  { mes: 'Fev', e: 30, s: 22 }, { mes: 'Mar', e: 45, s: 38 }, { mes: 'Abr', e: 60, s: 50 },
  { mes: 'Mai', e: 40, s: 44 }, { mes: 'Jun', e: 55, s: 48 }, { mes: 'Jul', e: 70, s: 60 },
  { mes: 'Ago', e: 50, s: 52 }, { mes: 'Set', e: 65, s: 58 },
];

/* ------------------------------------------------------------------ *
 * Blocos reutilizáveis para as prévias de tabela.
 * ------------------------------------------------------------------ */
function Badge({ texto, cor }: { texto: string; cor: string }) {
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${cor}`}>{texto}</span>;
}

function MiniTabela({ colunas, linhas }: { colunas: string[]; linhas: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[12.5px]">
        <thead>
          <tr className="text-[10px] uppercase tracking-wide text-slate-400">
            {colunas.map((c, i) => (
              <th key={c} className={`pb-1.5 font-bold ${i === colunas.length - 1 ? 'text-right' : ''}`}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((l, i) => (
            <tr key={i} className="border-t border-slate-100">
              {l.map((cel, j) => (
                <td key={j} className={`py-1.5 ${j === l.length - 1 ? 'text-right' : ''}`}>{cel}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const COR_CHAMADO: Record<string, string> = {
  aberto: 'bg-sky-100 text-sky-700', atendimento: 'bg-amber-100 text-amber-800',
  aguardando: 'bg-slate-100 text-slate-600', escalonado: 'bg-rose-100 text-rose-700',
  resolvido: 'bg-emerald-100 text-emerald-700',
};
const COR_FATURA: Record<string, string> = {
  pago: 'bg-emerald-100 text-emerald-700', aberto: 'bg-sky-100 text-sky-700', vencido: 'bg-rose-100 text-rose-700',
};
const COR_AVARIA: Record<string, string> = {
  analise: 'bg-amber-100 text-amber-800', aprovada: 'bg-sky-100 text-sky-700',
  contestada: 'bg-rose-100 text-rose-700', paga: 'bg-emerald-100 text-emerald-700',
};
const COR_MULTA: Record<string, string> = {
  notificada: 'bg-sky-100 text-sky-700', em_recurso: 'bg-amber-100 text-amber-800',
  paga: 'bg-emerald-100 text-emerald-700', vencida: 'bg-rose-100 text-rose-700',
};
const COR_SITUACAO: Record<string, string> = {
  ativo: 'bg-emerald-100 text-emerald-700', manutencao: 'bg-amber-100 text-amber-800', parado: 'bg-slate-100 text-slate-600',
};

/* ------------------------------------------------------------------ *
 * Catálogo de widgets disponíveis.
 * ------------------------------------------------------------------ */
export const CATALOGO_WIDGETS: WidgetInicio[] = [
  {
    id: 'atencao', titulo: 'Precisa da sua atenção', aba: 'Visão geral', href: '/portal/inicio', full: true,
    descricao: 'Pendências urgentes de chamados, faturas e multas',
    render: () => (
      <div className="-mx-5 -mb-5 -mt-1">
        {ATENCAO.map((a) => (
          <Link key={a.texto} href={a.href} className="flex items-center gap-4 border-t border-slate-100 px-5 py-3 transition hover:bg-slate-50">
            <AlertCircle size={15} className="shrink-0 text-primary-600" />
            <span className="flex-1">
              <span className="block text-[13px] font-semibold text-slate-800">{a.texto}</span>
              <span className="block text-xs text-slate-500">{a.detalhe}</span>
            </span>
            <span className="flex items-center gap-1 text-xs font-bold text-primary-700">{a.acao} <ArrowRight size={13} /></span>
          </Link>
        ))}
      </div>
    ),
  },
  {
    id: 'kpis', titulo: 'Indicadores da frota', aba: 'Visão geral', href: '/portal/relatorios', full: true,
    descricao: 'Frota total, chamados, manutenções e multas',
    render: () => (
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard label="Frota total" valor="42" detalhe="100% ativa" cor="border-l-[#0e2233]" detalheCor="text-emerald-600" />
        <KpiCard label="Chamados abertos" valor="6" detalhe="2 fora do SLA" cor="border-l-primary-600" detalheCor="text-primary-700" />
        <KpiCard label="Manutenções no mês" valor="11" detalhe="+3 vs mês anterior" cor="border-l-sky-600" />
        <KpiCard label="Multas em aberto" valor="2" detalhe="1 com prazo próximo" cor="border-l-amber-500" detalheCor="text-amber-600" />
      </div>
    ),
  },
  {
    id: 'frota-regiao', titulo: 'Frota por região', aba: 'Relatórios', href: '/portal/relatorios?aba=regiao',
    descricao: 'Distribuição da frota total pelo Brasil',
    render: () => (
      <div className="space-y-3">
        {REGIOES.map((r) => (
          <div key={r.nome}>
            <div className="mb-1.5 flex justify-between text-[13px] font-semibold text-slate-700">
              <span>{r.nome}</span><span className="font-mono">{r.qtd}</span>
            </div>
            <BarraProgresso pct={r.pct} />
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'servicos-grafico', titulo: 'Gráfico de serviços', aba: 'Relatórios', href: '/portal/relatorios',
    descricao: 'Comparativo mensal por tipo de serviço',
    render: () => (
      <div className="flex h-40 items-end gap-3">
        {SERVICOS_MES.map((s) => (
          <div key={s.mes} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <div className="w-full rounded-t-md bg-[#0e2233]" style={{ height: `${s.h}%` }} />
            <span className="text-[10px] text-slate-500">{s.mes}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'atendimentos', titulo: 'Atendimentos realizados', aba: 'Serviços', href: '/portal/servicos', full: true,
    descricao: 'Quantidade por tipo de serviço',
    render: () => (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {ATENDIMENTOS.map((a) => (
          <div key={a.label}>
            <p className="text-xs font-semibold text-slate-500">{a.label}</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{a.valor}</p>
            <p className="font-mono text-[11px] text-slate-400">{a.pct} da frota</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'entrada-saida', titulo: 'Entrada e saída de manutenções', aba: 'Serviços', href: '/portal/servicos', full: true,
    descricao: 'Comparativo entre entrada e saída de veículos',
    render: () => (
      <>
        <div className="flex h-32 items-end gap-2.5">
          {ENTRADA_SAIDA.map((m) => (
            <div key={m.mes} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <div className="flex h-full items-end gap-[3px]">
                <div className="w-2.5 rounded-t bg-sky-500" style={{ height: `${m.e}%` }} />
                <div className="w-2.5 rounded-t bg-[#0e2233]" style={{ height: `${m.s}%` }} />
              </div>
              <span className="text-[10px] text-slate-500">{m.mes}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-4 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-sky-500" />Entrada</span>
          <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#0e2233]" />Saída</span>
        </div>
      </>
    ),
  },
  {
    id: 'chamados', titulo: 'Central de Chamados', aba: 'Operação', href: '/portal/chamados',
    descricao: 'Últimos chamados abertos e seus status',
    render: () => (
      <MiniTabela
        colunas={['Chamado', 'Placa', 'Status']}
        linhas={CHAMADOS.slice(0, 5).map((c) => [
          <span key="id"><span className="block font-mono font-semibold text-slate-700">{c.id}</span><span className="block text-[11px] text-slate-400">{c.categoria}</span></span>,
          <span key="p" className="font-mono text-slate-600">{c.placa}</span>,
          <Badge key="s" texto={c.status} cor={COR_CHAMADO[c.status]} />,
        ])}
      />
    ),
  },
  {
    id: 'veiculos', titulo: 'Veículos / CRLV', aba: 'Operação', href: '/portal/veiculos',
    descricao: 'Frota, situação e licenciamento',
    render: () => (
      <MiniTabela
        colunas={['Placa', 'Modelo', 'Situação']}
        linhas={VEICULOS.slice(0, 5).map((v) => [
          <span key="p" className="font-mono font-semibold text-slate-700">{v.placa}</span>,
          <span key="m"><span className="block text-slate-700">{v.modelo}</span><span className="block text-[11px] text-slate-400">{v.regiao}</span></span>,
          <Badge key="s" texto={v.situacao} cor={COR_SITUACAO[v.situacao]} />,
        ])}
      />
    ),
  },
  {
    id: 'faturas', titulo: 'Faturamento', aba: 'Financeiro', href: '/portal/faturamento',
    descricao: 'Notas fiscais, vencimentos e status',
    render: () => (
      <MiniTabela
        colunas={['Nota', 'Vencimento', 'Valor', 'Status']}
        linhas={FATURAS.slice(0, 5).map((f) => [
          <span key="nf" className="font-mono font-semibold text-slate-700">{f.nf}</span>,
          <span key="v" className="font-mono text-slate-500">{f.vencimento}</span>,
          <span key="val" className="font-mono text-slate-700">{f.valor}</span>,
          <Badge key="s" texto={f.status} cor={COR_FATURA[f.status]} />,
        ])}
      />
    ),
  },
  {
    id: 'avarias', titulo: 'Cobrança de Avarias', aba: 'Financeiro', href: '/portal/avarias',
    descricao: 'Avarias em análise, aprovadas e pagas',
    render: () => (
      <MiniTabela
        colunas={['ID', 'Placa', 'Valor', 'Status']}
        linhas={AVARIAS.slice(0, 5).map((a) => [
          <span key="id"><span className="block font-mono font-semibold text-slate-700">{a.id}</span><span className="block text-[11px] text-slate-400">{a.descricao}</span></span>,
          <span key="p" className="font-mono text-slate-600">{a.placa}</span>,
          <span key="v" className="font-mono text-slate-700">{a.valor}</span>,
          <Badge key="s" texto={a.status} cor={COR_AVARIA[a.status]} />,
        ])}
      />
    ),
  },
  {
    id: 'multas', titulo: 'Multas', aba: 'Financeiro', href: '/portal/multas',
    descricao: 'Autuações, prazos e situação',
    render: () => (
      <MiniTabela
        colunas={['Auto', 'Placa', 'Valor', 'Status']}
        linhas={MULTAS.slice(0, 5).map((m) => [
          <span key="a"><span className="block font-mono font-semibold text-slate-700">{m.auto}</span><span className="block text-[11px] text-slate-400">{m.infracao}</span></span>,
          <span key="p" className="font-mono text-slate-600">{m.placa}</span>,
          <span key="v" className="font-mono text-slate-700">{m.valor}</span>,
          <Badge key="s" texto={m.status.replace('_', ' ')} cor={COR_MULTA[m.status]} />,
        ])}
      />
    ),
  },
  {
    id: 'telemetria', titulo: 'Vamos Controle', aba: 'Visão geral', href: '/portal/vamos-controle',
    descricao: 'Rastreamento e telemetria em tempo real',
    render: () => (
      <MiniTabela
        colunas={['Placa', 'Local', 'Velocidade']}
        linhas={TELEMETRIA.slice(0, 5).map((t) => [
          <span key="p" className="font-mono font-semibold text-slate-700">{t.placa}</span>,
          <span key="l"><span className="block text-slate-700">{t.local}</span><span className="block text-[11px] text-slate-400">{t.atualizado}</span></span>,
          <span key="v" className="font-mono text-slate-600">{t.velocidade}</span>,
        ])}
      />
    ),
  },
];

/** Ordem padrão da visão de Início (reproduz o panorama original). */
export const VISAO_PADRAO = ['atencao', 'kpis', 'frota-regiao', 'servicos-grafico', 'atendimentos', 'entrada-saida'];
