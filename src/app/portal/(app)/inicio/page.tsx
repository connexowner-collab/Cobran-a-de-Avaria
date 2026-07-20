'use client';

import Link from 'next/link';
import {
  Headset, FileText, DollarSign, BarChart3, AlertCircle, ArrowRight,
} from 'lucide-react';
import { KpiCard, BarraProgresso } from '@/components/portal/ui';

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

const ATALHOS = [
  { label: 'Central de Chamados', desc: 'Acompanhe SLA e respostas', href: '/portal/chamados', icon: <Headset size={22} /> },
  { label: 'Veículos / CRLV', desc: 'Frota, contratos e download de CRLV', href: '/portal/veiculos', icon: <FileText size={22} /> },
  { label: 'Faturamento', desc: '2ª via de boletos e notas fiscais', href: '/portal/faturamento', icon: <DollarSign size={22} /> },
  { label: 'Relatórios de Frota', desc: 'Idade, km, região e modelos', href: '/portal/relatorios', icon: <BarChart3 size={22} /> },
];

export default function PortalInicioPage() {
  return (
    <div>
      <h1 className="text-[26px] font-extrabold text-slate-900">Olá, Lucas</h1>
      <p className="mb-6 text-[13px] text-slate-500">
        Aqui está o panorama da sua frota hoje, 17/07/2026.
      </p>

      {/* Precisa da sua atenção */}
      <div className="card mb-6 overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-100 bg-rose-50/60 px-5 py-3">
          <AlertCircle size={16} className="text-primary-600" />
          <span className="text-[13px] font-bold text-slate-800">Precisa da sua atenção</span>
          <span className="rounded-full bg-primary-600 px-2 py-0.5 text-[10px] font-bold text-white">
            {ATENCAO.length}
          </span>
        </div>
        {ATENCAO.map((a) => (
          <Link
            key={a.texto}
            href={a.href}
            className="flex items-center gap-4 border-b border-slate-100 px-5 py-3.5 transition last:border-0 hover:bg-slate-50"
          >
            <span className="flex-1">
              <span className="block text-[13.5px] font-semibold text-slate-800">{a.texto}</span>
              <span className="block text-xs text-slate-500">{a.detalhe}</span>
            </span>
            <span className="flex items-center gap-1 text-xs font-bold text-primary-700">
              {a.acao} <ArrowRight size={13} />
            </span>
          </Link>
        ))}
      </div>

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard label="Frota total" valor="42" detalhe="100% ativa" cor="border-l-[#0e2233]" detalheCor="text-emerald-600" />
        <KpiCard label="Chamados abertos" valor="6" detalhe="2 fora do SLA" cor="border-l-primary-600" detalheCor="text-primary-700" />
        <KpiCard label="Manutenções no mês" valor="11" detalhe="+3 vs mês anterior" cor="border-l-sky-600" />
        <KpiCard label="Multas em aberto" valor="2" detalhe="1 com prazo próximo" cor="border-l-amber-500" detalheCor="text-amber-600" />
      </div>

      {/* Frota por região + Gráfico de serviços */}
      <div className="mb-6 grid gap-4 xl:grid-cols-[1.05fr_1.4fr]">
        <div className="card p-5">
          <p className="text-sm font-bold text-slate-800">Frota por região</p>
          <p className="mb-4 text-xs text-slate-500">Distribuição da frota total pelo Brasil</p>
          <div className="space-y-3.5">
            {REGIOES.map((r) => (
              <div key={r.nome}>
                <div className="mb-1.5 flex justify-between text-[13px] font-semibold text-slate-700">
                  <span>{r.nome}</span>
                  <span className="font-mono">{r.qtd}</span>
                </div>
                <BarraProgresso pct={r.pct} />
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-slate-800">Gráfico de serviços</p>
              <p className="text-xs text-slate-500">Comparativo mensal por tipo de serviço</p>
            </div>
            <div className="flex gap-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-emerald-500" />Preventiva</span>
              <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#0e2233]" />Corretiva</span>
              <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-primary-600" />Sinistro</span>
            </div>
          </div>
          <div className="flex h-40 items-end gap-3">
            {SERVICOS_MES.map((s) => (
              <div key={s.mes} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <div className="w-full rounded-t-md bg-[#0e2233]" style={{ height: `${s.h}%` }} />
                <span className="text-[10px] text-slate-500">{s.mes}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Atendimentos realizados */}
      <div className="card mb-6 p-5">
        <p className="text-sm font-bold text-slate-800">Atendimentos realizados</p>
        <p className="mb-4 text-xs text-slate-500">Quantidade por tipo de serviço</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {ATENDIMENTOS.map((a) => (
            <div key={a.label}>
              <p className="text-xs font-semibold text-slate-500">{a.label}</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">{a.valor}</p>
              <p className="font-mono text-[11px] text-slate-400">{a.pct} da frota</p>
            </div>
          ))}
        </div>
      </div>

      {/* Entrada e saída de manutenções */}
      <div className="card mb-7 p-5">
        <p className="text-sm font-bold text-slate-800">Entrada e saída de manutenções</p>
        <p className="mb-4 text-xs text-slate-500">
          Comparativo entre entrada e saída de veículos em manutenções
        </p>
        <div className="flex h-32 items-end gap-2.5">
          {ENTRADA_SAIDA.map((m) => (
            <div key={m.mes} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <div className="flex h-full items-end gap-[3px]">
                <div className="w-2.5 rounded-t bg-primary-600" style={{ height: `${m.e}%` }} />
                <div className="w-2.5 rounded-t bg-[#0e2233]" style={{ height: `${m.s}%` }} />
              </div>
              <span className="text-[10px] text-slate-500">{m.mes}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-4 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-primary-600" />Entrada</span>
          <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#0e2233]" />Saída</span>
        </div>
      </div>

      {/* Acesso rápido */}
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Acesso rápido</p>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {ATALHOS.map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className="card group flex flex-col gap-2.5 p-5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="text-primary-600">{a.icon}</span>
            <span className="text-sm font-bold text-slate-800 group-hover:text-primary-700">{a.label}</span>
            <span className="text-xs text-slate-500">{a.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
