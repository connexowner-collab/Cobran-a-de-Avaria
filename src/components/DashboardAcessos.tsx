'use client';

import { useMemo, useState } from 'react';
import {
  Download, Users, UserX, ShieldAlert, Activity, Send, MonitorSmartphone, Building2, TriangleAlert,
} from 'lucide-react';
import {
  ACESSOS_CLIENTES, TELAS_MAIS_ACESSADAS, REGRA_BLOQUEIO_DIAS,
  estaBloqueadoPorInatividade, diasSemAcessoEfetivo, type AcessoCliente,
} from '@/lib/acessosData';

/* ───────────────────────── Exportação Excel (CSV/BOM) ───────────────────────── */
/** Gera um arquivo .csv (aberto direto no Excel) com separador ";" e BOM UTF-8. */
function baixarExcel(nomeArquivo: string, colunas: string[], linhas: (string | number)[][]) {
  const escape = (v: string | number) => {
    const s = String(v ?? '');
    return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const conteudo = [colunas, ...linhas].map((l) => l.map(escape).join(';')).join('\r\n');
  const blob = new Blob(['﻿' + conteudo], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${nomeArquivo}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function BotaoExcel({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
    >
      <Download className="h-3.5 w-3.5" /> Exportar Excel
    </button>
  );
}

/* ───────────────────────── Situação por inatividade ───────────────────────── */
type Situacao = 'ativo' | 'atencao' | 'bloqueado' | 'nunca';

function situacaoDe(c: AcessoCliente): Situacao {
  if (estaBloqueadoPorInatividade(c)) return 'bloqueado';
  if (c.diasSemAcesso === null) return 'nunca';
  if (c.diasSemAcesso >= 60) return 'atencao';
  return 'ativo';
}

const SITUACAO_INFO: Record<Situacao, { label: string; cls: string }> = {
  ativo: { label: 'Ativo', cls: 'bg-slate-100 text-slate-600' },
  atencao: { label: 'Em risco', cls: 'bg-amber-100 text-amber-800' },
  nunca: { label: 'Nunca acessou', cls: 'bg-indigo-100 text-indigo-700' },
  bloqueado: { label: 'Bloqueado (90d+)', cls: 'bg-rose-100 text-rose-700' },
};

function Barra({ pct, cor = 'bg-[#0e2233]' }: { pct: number; cor?: string }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full ${cor}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function DashboardAcessos() {
  const [flash, setFlash] = useState<string | null>(null);

  const maxAcessos = Math.max(...ACESSOS_CLIENTES.map((c) => c.acessos90d), 1);

  const topClientes = useMemo(
    () => [...ACESSOS_CLIENTES].sort((a, b) => b.acessos90d - a.acessos90d).slice(0, 8),
    [],
  );
  const porCnpj = useMemo(
    () => [...ACESSOS_CLIENTES].sort((a, b) => b.acessos90d - a.acessos90d),
    [],
  );
  const semAcesso = useMemo(
    () =>
      [...ACESSOS_CLIENTES]
        .filter((c) => c.diasSemAcesso === null || c.diasSemAcesso >= 60)
        .sort((a, b) => diasSemAcessoEfetivo(b) - diasSemAcessoEfetivo(a)),
    [],
  );

  const totalClientes = ACESSOS_CLIENTES.length;
  const nuncaAcessaram = ACESSOS_CLIENTES.filter((c) => c.diasSemAcesso === null).length;
  const bloqueados = ACESSOS_CLIENTES.filter(estaBloqueadoPorInatividade).length;
  const acessos90d = ACESSOS_CLIENTES.reduce((s, c) => s + c.acessos90d, 0);

  const reenviarAcesso = (c: AcessoCliente) => {
    setFlash(`Cobrança de acesso reenviada para ${c.nomeFantasia} (${c.usuarios} usuário${c.usuarios > 1 ? 's' : ''}).`);
    setTimeout(() => setFlash(null), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-slate-900">Dashboard de acessos</h2>
        <p className="text-sm text-slate-500">
          Uso do Portal do Cliente: quem mais acessa, quem nunca acessou e telas mais usadas.
        </p>
      </div>

      {/* Aviso da regra de bloqueio automático */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <p className="text-[13px] text-amber-900">
          <b>Gestão automática de acessos:</b> clientes que passarem de <b>{REGRA_BLOQUEIO_DIAS} dias</b> sem
          acessar o portal têm os usuários <b>bloqueados automaticamente</b>. Atualmente <b>{bloqueados}</b> cliente(s)
          nesta condição. Use “Reenviar acesso” para cobrar o primeiro acesso de quem nunca entrou.
        </p>
      </div>

      {flash && (
        <div role="status" aria-live="polite" className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {flash}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <div className="card border-l-4 border-l-[#0e2233] p-5">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500"><Users className="h-3.5 w-3.5" /> Clientes</p>
          <p className="mt-2 text-[32px] font-extrabold leading-none text-slate-900">{totalClientes}</p>
          <p className="mt-2 text-xs font-semibold text-slate-500">com acesso cadastrado</p>
        </div>
        <div className="card border-l-4 border-l-indigo-500 p-5">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500"><UserX className="h-3.5 w-3.5" /> Nunca acessaram</p>
          <p className="mt-2 text-[32px] font-extrabold leading-none text-slate-900">{nuncaAcessaram}</p>
          <p className="mt-2 text-xs font-semibold text-indigo-600">precisam de cobrança</p>
        </div>
        <div className="card border-l-4 border-l-rose-500 p-5">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500"><ShieldAlert className="h-3.5 w-3.5" /> Bloqueados (90d+)</p>
          <p className="mt-2 text-[32px] font-extrabold leading-none text-slate-900">{bloqueados}</p>
          <p className="mt-2 text-xs font-semibold text-rose-600">inativos por regra</p>
        </div>
        <div className="card border-l-4 border-l-sky-600 p-5">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500"><Activity className="h-3.5 w-3.5" /> Acessos (90d)</p>
          <p className="mt-2 text-[32px] font-extrabold leading-none text-slate-900">{acessos90d.toLocaleString('pt-BR')}</p>
          <p className="mt-2 text-xs font-semibold text-slate-500">no período</p>
        </div>
      </div>

      {/* Top clientes que mais acessam */}
      <div className="card p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-800">Clientes que mais acessam</p>
            <p className="text-xs text-slate-500">Ranking por acessos nos últimos 90 dias</p>
          </div>
          <BotaoExcel
            onClick={() =>
              baixarExcel(
                'clientes-mais-acessam',
                ['Cliente', 'CNPJ', 'Grupo', 'Usuários', 'Acessos (90d)', 'Dias sem acesso'],
                topClientes.map((c) => [c.nomeFantasia, c.cnpj, c.grupo, c.usuarios, c.acessos90d, c.diasSemAcesso ?? 'Nunca acessou']),
              )
            }
          />
        </div>
        <div className="space-y-3">
          {topClientes.map((c) => (
            <div key={c.clienteId}>
              <div className="mb-1 flex items-center justify-between text-[13px]">
                <span className="font-semibold text-slate-700">{c.nomeFantasia}</span>
                <span className="font-mono text-slate-500">{c.acessos90d} acessos</span>
              </div>
              <Barra pct={Math.round((c.acessos90d / maxAcessos) * 100)} cor="bg-sky-500" />
            </div>
          ))}
        </div>
      </div>

      {/* Top 3 telas mais acessadas + por CNPJ */}
      <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
        <div className="card p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="flex items-center gap-1.5 text-sm font-bold text-slate-800"><MonitorSmartphone className="h-4 w-4 text-slate-400" /> Telas mais acessadas</p>
              <p className="text-xs text-slate-500">Top 3 telas e os clientes que mais usam cada uma</p>
            </div>
            <BotaoExcel
              onClick={() =>
                baixarExcel(
                  'telas-mais-acessadas',
                  ['Tela', 'Acessos', 'Cliente', 'Acessos do cliente'],
                  TELAS_MAIS_ACESSADAS.flatMap((t) =>
                    t.topClientes.map((tc) => [t.tela, t.acessos, tc.nome, tc.acessos]),
                  ),
                )
              }
            />
          </div>
          <div className="space-y-4">
            {TELAS_MAIS_ACESSADAS.slice(0, 3).map((t, i) => (
              <div key={t.tela} className="rounded-lg border border-slate-200 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[13px] font-bold text-slate-800">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0e2233] text-[10px] font-bold text-white">{i + 1}</span>
                    {t.tela}
                  </span>
                  <span className="font-mono text-xs text-slate-500">{t.acessos.toLocaleString('pt-BR')} acessos</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {t.topClientes.map((tc, j) => (
                    <span key={tc.nome} className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${j === 0 ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600'}`}>
                      {tc.nome} · {tc.acessos}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Por CNPJ / grupo */}
        <div className="card p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="flex items-center gap-1.5 text-sm font-bold text-slate-800"><Building2 className="h-4 w-4 text-slate-400" /> Empresas por CNPJ</p>
              <p className="text-xs text-slate-500">Acessos por grupo de cliente / CNPJ</p>
            </div>
            <BotaoExcel
              onClick={() =>
                baixarExcel(
                  'acessos-por-cnpj',
                  ['Cliente', 'CNPJ', 'Grupo', 'Acessos (90d)'],
                  porCnpj.map((c) => [c.razaoSocial, c.cnpj, c.grupo, c.acessos90d]),
                )
              }
            />
          </div>
          <div className="max-h-72 overflow-y-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="px-2 py-2 font-bold">Cliente</th>
                  <th className="px-2 py-2 font-bold">CNPJ</th>
                  <th className="px-2 py-2 text-right font-bold">Acessos</th>
                </tr>
              </thead>
              <tbody>
                {porCnpj.map((c) => (
                  <tr key={c.clienteId} className="border-b border-slate-100 last:border-0">
                    <td className="px-2 py-2 font-semibold text-slate-700">{c.nomeFantasia}</td>
                    <td className="px-2 py-2 font-mono text-xs text-slate-500">{c.cnpj}</td>
                    <td className="px-2 py-2 text-right font-mono text-slate-600">{c.acessos90d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Clientes sem acesso / risco de bloqueio */}
      <div className="card p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-bold text-slate-800"><TriangleAlert className="h-4 w-4 text-amber-500" /> Clientes sem acesso e nunca acessaram</p>
            <p className="text-xs text-slate-500">Dias sem acessar o portal, situação e cobrança de acesso</p>
          </div>
          <BotaoExcel
            onClick={() =>
              baixarExcel(
                'clientes-sem-acesso',
                ['Cliente', 'CNPJ', 'Usuários', 'Dias sem acesso', 'Situação'],
                semAcesso.map((c) => [
                  c.nomeFantasia,
                  c.cnpj,
                  c.usuarios,
                  c.diasSemAcesso === null ? `Nunca acessou (criado há ${c.criadoDiasAtras}d)` : c.diasSemAcesso,
                  SITUACAO_INFO[situacaoDe(c)].label,
                ]),
              )
            }
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2.5 font-bold">Cliente</th>
                <th className="px-3 py-2.5 font-bold">CNPJ</th>
                <th className="px-3 py-2.5 text-center font-bold">Usuários</th>
                <th className="px-3 py-2.5 text-center font-bold">Dias sem acesso</th>
                <th className="px-3 py-2.5 font-bold">Situação</th>
                <th className="px-3 py-2.5 text-right font-bold">Ação</th>
              </tr>
            </thead>
            <tbody>
              {semAcesso.map((c) => {
                const sit = situacaoDe(c);
                const dias = diasSemAcessoEfetivo(c);
                return (
                  <tr key={c.clienteId} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-3 py-2.5 font-semibold text-slate-800">{c.nomeFantasia}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-slate-500">{c.cnpj}</td>
                    <td className="px-3 py-2.5 text-center text-slate-600">{c.usuarios}</td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`font-mono font-semibold ${dias >= REGRA_BLOQUEIO_DIAS ? 'text-rose-600' : dias >= 60 ? 'text-amber-600' : 'text-slate-600'}`}>
                        {c.diasSemAcesso === null ? `nunca · ${c.criadoDiasAtras}d` : `${dias}d`}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${SITUACAO_INFO[sit].cls}`}>
                        {SITUACAO_INFO[sit].label}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => reenviarAcesso(c)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 hover:bg-primary-100"
                      >
                        <Send className="h-3.5 w-3.5" />
                        {c.diasSemAcesso === null ? 'Cobrar acesso' : 'Reenviar acesso'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
