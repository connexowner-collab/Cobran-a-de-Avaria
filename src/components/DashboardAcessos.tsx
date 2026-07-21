'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Download, Users, UserX, ShieldAlert, Activity, Send, MonitorSmartphone, Building2, TriangleAlert,
  X, Mail, ChevronRight, Lock, Unlock,
} from 'lucide-react';
import type { Usuario } from '@/types';
import {
  ACESSOS_CLIENTES, TELAS_MAIS_ACESSADAS, REGRA_BLOQUEIO_DIAS,
  telasDoCliente, type AcessoCliente, type TelaMaisAcessada,
} from '@/lib/acessosData';

const DIA = 86_400_000;

function diasDesde(iso?: string | null): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.floor((Date.now() - t) / DIA));
}

/** Cliente do dashboard com os usuários reais (do store) e métricas derivadas deles. */
interface ClienteMerged extends AcessoCliente {
  users: Usuario[];
  count: number;
  /** Dias desde o acesso mais recente entre os usuários; null = nenhum acessou. */
  dias: number | null;
  nunca: boolean;
  clienteBloqueado: boolean;
  bloqueadosCount: number;
}

/* ───────────────────────── Exportação Excel (CSV/BOM) ───────────────────────── */
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

function Barra({ pct, cor = 'bg-[#0e2233]' }: { pct: number; cor?: string }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full ${cor}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ───────────────────────── Situação por inatividade ───────────────────────── */
type Situacao = 'ativo' | 'atencao' | 'bloqueado' | 'nunca';

function situacaoDe(m: ClienteMerged): Situacao {
  if (m.clienteBloqueado) return 'bloqueado';
  if (m.nunca) return 'nunca';
  if (m.dias !== null && m.dias >= 60) return 'atencao';
  return 'ativo';
}

const SITUACAO_INFO: Record<Situacao, { label: string; cls: string }> = {
  ativo: { label: 'Ativo', cls: 'bg-slate-100 text-slate-600' },
  atencao: { label: 'Em risco', cls: 'bg-amber-100 text-amber-800' },
  nunca: { label: 'Nunca acessou', cls: 'bg-indigo-100 text-indigo-700' },
  bloqueado: { label: 'Bloqueado', cls: 'bg-rose-100 text-rose-700' },
};

type Detalhe = { tipo: 'cliente'; clienteId: string } | { tipo: 'tela'; t: TelaMaisAcessada };

export default function DashboardAcessos() {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [flash, setFlash] = useState<string | null>(null);
  const [detalhe, setDetalhe] = useState<Detalhe | null>(null);
  const [salvandoId, setSalvandoId] = useState<string | null>(null);

  const carregarUsuarios = useCallback(() => {
    setCarregando(true);
    return fetch('/api/usuarios?pagina=1&itensPorPagina=1000')
      .then((r) => r.json())
      .then((data) => setUsers(Array.isArray(data?.items) ? data.items : []))
      .catch(() => setUsers([]))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => { carregarUsuarios(); }, [carregarUsuarios]);

  const usersByCliente = useMemo(() => {
    const m = new Map<string, Usuario[]>();
    users.forEach((u) => {
      const arr = m.get(u.clienteId) ?? [];
      arr.push(u);
      m.set(u.clienteId, arr);
    });
    return m;
  }, [users]);

  const merged = useMemo<ClienteMerged[]>(
    () =>
      ACESSOS_CLIENTES.map((c) => {
        const us = usersByCliente.get(c.clienteId) ?? [];
        const acessoMs = us
          .map((u) => (u.ultimoAcessoEm ? new Date(u.ultimoAcessoEm).getTime() : null))
          .filter((x): x is number => x !== null);
        const ultimo = acessoMs.length ? Math.max(...acessoMs) : null;
        const dias = ultimo !== null ? Math.max(0, Math.floor((Date.now() - ultimo) / DIA)) : null;
        const nunca = us.length > 0 && us.every((u) => !u.ultimoAcessoEm);
        const bloqueadosCount = us.filter((u) => !u.ativo).length;
        const clienteBloqueado = us.length > 0 && us.every((u) => !u.ativo);
        return { ...c, users: us, count: us.length, dias, nunca, clienteBloqueado, bloqueadosCount };
      }),
    [usersByCliente],
  );

  const maxAcessos = Math.max(...merged.map((c) => c.acessos90d), 1);
  const topClientes = useMemo(() => [...merged].sort((a, b) => b.acessos90d - a.acessos90d).slice(0, 8), [merged]);
  const porCnpj = useMemo(() => [...merged].sort((a, b) => b.acessos90d - a.acessos90d), [merged]);
  const diasEfetivo = (m: ClienteMerged) => (m.dias === null ? m.criadoDiasAtras : m.dias);
  const semAcesso = useMemo(
    () =>
      [...merged]
        .filter((m) => m.count > 0 && (m.nunca || (m.dias !== null && m.dias >= 60)))
        .sort((a, b) => diasEfetivo(b) - diasEfetivo(a)),
    [merged],
  );

  const totalClientes = merged.length;
  const nuncaAcessaram = merged.filter((m) => m.count > 0 && m.nunca).length;
  const clientesBloqueados = merged.filter((m) => m.clienteBloqueado).length;
  const usuariosBloqueados = users.filter((u) => !u.ativo).length;
  const acessos90d = merged.reduce((s, c) => s + c.acessos90d, 0);

  const reenviarAcesso = (m: ClienteMerged) => {
    setFlash(`Cobrança de acesso reenviada para ${m.nomeFantasia} (${m.count || m.usuarios} usuário(s)).`);
    setTimeout(() => setFlash(null), 4000);
  };

  const alternarBloqueio = async (u: Usuario) => {
    setSalvandoId(u.id);
    try {
      const res = await fetch(`/api/usuarios/${u.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !u.ativo }),
      });
      if (res.ok) {
        await carregarUsuarios();
        setFlash(`${u.nome} foi ${!u.ativo ? 'desbloqueado' : 'bloqueado'}. A mudança reflete também na aba Usuários.`);
        setTimeout(() => setFlash(null), 4000);
      } else {
        setFlash('Não foi possível alterar o bloqueio do usuário.');
        setTimeout(() => setFlash(null), 4000);
      }
    } catch {
      setFlash('Erro de conexão ao alterar o bloqueio.');
      setTimeout(() => setFlash(null), 4000);
    } finally {
      setSalvandoId(null);
    }
  };

  const clienteDetalhe = detalhe?.tipo === 'cliente' ? merged.find((m) => m.clienteId === detalhe.clienteId) ?? null : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-slate-900">Dashboard de acessos</h2>
        <p className="text-sm text-slate-500">
          Uso do Portal do Cliente, integrado à aba Usuários: quem mais acessa, quem nunca acessou e bloqueios por inatividade.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <p className="text-[13px] text-amber-900">
          <b>Gestão automática de acessos:</b> clientes que passarem de <b>{REGRA_BLOQUEIO_DIAS} dias</b> sem
          acessar o portal têm os usuários <b>bloqueados automaticamente</b>. Atualmente <b>{usuariosBloqueados}</b> usuário(s)
          bloqueado(s). Bloquear/desbloquear aqui reflete na aba <b>Usuários</b>.
        </p>
      </div>

      {flash && (
        <div role="status" aria-live="polite" className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {flash}
        </div>
      )}

      {carregando ? (
        <div className="flex justify-center py-16 text-slate-500">Carregando dados de acesso...</div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <div className="card border-l-4 border-l-[#0e2233] p-5">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500"><Users className="h-3.5 w-3.5" /> Clientes</p>
              <p className="mt-2 text-[32px] font-extrabold leading-none text-slate-900">{totalClientes}</p>
              <p className="mt-2 text-xs font-semibold text-slate-500">{users.length} usuários no total</p>
            </div>
            <div className="card border-l-4 border-l-indigo-500 p-5">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500"><UserX className="h-3.5 w-3.5" /> Nunca acessaram</p>
              <p className="mt-2 text-[32px] font-extrabold leading-none text-slate-900">{nuncaAcessaram}</p>
              <p className="mt-2 text-xs font-semibold text-indigo-600">precisam de cobrança</p>
            </div>
            <div className="card border-l-4 border-l-rose-500 p-5">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500"><ShieldAlert className="h-3.5 w-3.5" /> Usuários bloqueados</p>
              <p className="mt-2 text-[32px] font-extrabold leading-none text-slate-900">{usuariosBloqueados}</p>
              <p className="mt-2 text-xs font-semibold text-rose-600">{clientesBloqueados} cliente(s) por 90d+</p>
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
                <p className="text-xs text-slate-500">Ranking por acessos nos últimos 90 dias · clique para ver os usuários</p>
              </div>
              <BotaoExcel
                onClick={() =>
                  baixarExcel(
                    'clientes-mais-acessam',
                    ['Cliente', 'CNPJ', 'Grupo', 'Usuários', 'Acessos (90d)', 'Dias sem acesso'],
                    topClientes.map((c) => [c.nomeFantasia, c.cnpj, c.grupo, c.count, c.acessos90d, c.dias ?? 'Nunca acessou']),
                  )
                }
              />
            </div>
            <div className="space-y-3">
              {topClientes.map((c) => (
                <button
                  key={c.clienteId}
                  type="button"
                  onClick={() => setDetalhe({ tipo: 'cliente', clienteId: c.clienteId })}
                  className="block w-full rounded-lg text-left transition hover:bg-slate-50"
                >
                  <div className="mb-1 flex items-center justify-between text-[13px]">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      {c.nomeFantasia}
                      <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                    </span>
                    <span className="font-mono text-slate-500">{c.acessos90d} acessos</span>
                  </div>
                  <Barra pct={Math.round((c.acessos90d / maxAcessos) * 100)} cor="bg-sky-500" />
                </button>
              ))}
            </div>
          </div>

          {/* Top 3 telas + por CNPJ */}
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
                      TELAS_MAIS_ACESSADAS.flatMap((t) => t.topClientes.map((tc) => [t.tela, t.acessos, tc.nome, tc.acessos])),
                    )
                  }
                />
              </div>
              <div className="space-y-4">
                {TELAS_MAIS_ACESSADAS.slice(0, 3).map((t, i) => (
                  <button
                    key={t.tela}
                    type="button"
                    onClick={() => setDetalhe({ tipo: 'tela', t })}
                    className="block w-full rounded-lg border border-slate-200 p-3.5 text-left transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-[13px] font-bold text-slate-800">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0e2233] text-[10px] font-bold text-white">{i + 1}</span>
                        {t.tela}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-xs text-slate-500">
                        {t.acessos.toLocaleString('pt-BR')} acessos
                        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {t.topClientes.map((tc, j) => (
                        <span key={tc.nome} className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${j === 0 ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600'}`}>
                          {tc.nome} · {tc.acessos}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

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
                      <tr
                        key={c.clienteId}
                        onClick={() => setDetalhe({ tipo: 'cliente', clienteId: c.clienteId })}
                        className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >
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

          {/* Clientes sem acesso / nunca acessaram */}
          <div className="card p-5">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="flex items-center gap-1.5 text-sm font-bold text-slate-800"><TriangleAlert className="h-4 w-4 text-amber-500" /> Clientes sem acesso e nunca acessaram</p>
                <p className="text-xs text-slate-500">Dias sem acessar o portal, situação e cobrança de acesso · clique na linha para gerir usuários</p>
              </div>
              <BotaoExcel
                onClick={() =>
                  baixarExcel(
                    'clientes-sem-acesso',
                    ['Cliente', 'CNPJ', 'Usuários', 'Dias sem acesso', 'Situação'],
                    semAcesso.map((c) => [
                      c.nomeFantasia,
                      c.cnpj,
                      c.count,
                      c.dias === null ? `Nunca acessou (criado há ${c.criadoDiasAtras}d)` : c.dias,
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
                    const dias = diasEfetivo(c);
                    return (
                      <tr
                        key={c.clienteId}
                        onClick={() => setDetalhe({ tipo: 'cliente', clienteId: c.clienteId })}
                        className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >
                        <td className="px-3 py-2.5 font-semibold text-slate-800">{c.nomeFantasia}</td>
                        <td className="px-3 py-2.5 font-mono text-xs text-slate-500">{c.cnpj}</td>
                        <td className="px-3 py-2.5 text-center text-slate-600">{c.count}</td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`font-mono font-semibold ${dias >= REGRA_BLOQUEIO_DIAS ? 'text-rose-600' : dias >= 60 ? 'text-amber-600' : 'text-slate-600'}`}>
                            {c.dias === null ? `nunca · ${c.criadoDiasAtras}d` : `${dias}d`}
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
                            onClick={(e) => { e.stopPropagation(); reenviarAcesso(c); }}
                            className="inline-flex items-center gap-1.5 rounded-md border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 hover:bg-primary-100"
                          >
                            <Send className="h-3.5 w-3.5" />
                            {c.nunca ? 'Cobrar acesso' : 'Reenviar acesso'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Detalhe contextual */}
      {detalhe?.tipo === 'cliente' && clienteDetalhe && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => e.target === e.currentTarget && setDetalhe(null)}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {(() => {
              const c = clienteDetalhe;
              const sit = situacaoDe(c);
              const telas = telasDoCliente(c);
              const maxTela = Math.max(...telas.map((t) => t.acessos), 1);
              return (
                <>
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-6 py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">{c.nomeFantasia}</h3>
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${SITUACAO_INFO[sit].cls}`}>
                          {SITUACAO_INFO[sit].label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{c.razaoSocial} · {c.cnpj} · Grupo {c.grupo}</p>
                    </div>
                    <button type="button" onClick={() => setDetalhe(null)} aria-label="Fechar" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                      <X size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3 px-6 py-4">
                    <div className="rounded-lg bg-slate-50 px-3 py-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Acessos (90d)</p>
                      <p className="text-xl font-extrabold text-slate-900">{c.acessos90d}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 px-3 py-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Usuários</p>
                      <p className="text-xl font-extrabold text-slate-900">{c.count}{c.bloqueadosCount > 0 && <span className="ml-1 text-xs font-semibold text-rose-600">({c.bloqueadosCount} bloq.)</span>}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 px-3 py-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Sem acesso</p>
                      <p className={`text-xl font-extrabold ${(c.dias ?? c.criadoDiasAtras) >= REGRA_BLOQUEIO_DIAS ? 'text-rose-600' : 'text-slate-900'}`}>
                        {c.dias === null ? 'Nunca' : `${c.dias}d`}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 pb-2">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Usuários do cliente (mesmos da aba Usuários)</p>
                    <div className="overflow-hidden rounded-lg border border-slate-200">
                      <table className="w-full text-left text-[13px]">
                        <thead className="bg-slate-50">
                          <tr className="text-[11px] uppercase tracking-wide text-slate-500">
                            <th className="px-3 py-2 font-bold">Nome</th>
                            <th className="px-3 py-2 font-bold">E-mail</th>
                            <th className="px-3 py-2 font-bold">Último acesso</th>
                            <th className="px-3 py-2 font-bold">Status</th>
                            <th className="px-3 py-2 text-right font-bold">Ação</th>
                          </tr>
                        </thead>
                        <tbody>
                          {c.users.map((u) => {
                            const d = diasDesde(u.ultimoAcessoEm);
                            return (
                              <tr key={u.id} className="border-t border-slate-100">
                                <td className="px-3 py-2 font-semibold text-slate-800">{u.nome}</td>
                                <td className="px-3 py-2 text-slate-500"><span className="inline-flex items-center gap-1"><Mail className="h-3 w-3 text-slate-400" />{u.email}</span></td>
                                <td className="px-3 py-2">
                                  <span className={`font-mono text-xs font-semibold ${d === null ? 'text-indigo-600' : d >= REGRA_BLOQUEIO_DIAS ? 'text-rose-600' : 'text-slate-500'}`}>
                                    {d === null ? 'Nunca acessou' : `há ${d}d`}
                                  </span>
                                </td>
                                <td className="px-3 py-2">
                                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${u.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                    {u.ativo ? 'Ativo' : 'Bloqueado'}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-right">
                                  <button
                                    type="button"
                                    disabled={salvandoId === u.id}
                                    onClick={() => alternarBloqueio(u)}
                                    className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold disabled:opacity-50 ${
                                      u.ativo
                                        ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                                        : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                    }`}
                                  >
                                    {u.ativo ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                                    {salvandoId === u.id ? '...' : u.ativo ? 'Bloquear' : 'Desbloquear'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                          {c.users.length === 0 && (
                            <tr><td colSpan={5} className="px-3 py-6 text-center text-slate-400">Nenhum usuário cadastrado para este cliente.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {telas.length > 0 && (
                    <div className="px-6 py-3">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Telas mais acessadas por este cliente</p>
                      <div className="space-y-2">
                        {telas.map((t) => (
                          <div key={t.tela}>
                            <div className="mb-0.5 flex justify-between text-[13px]">
                              <span className="text-slate-700">{t.tela}</span>
                              <span className="font-mono text-slate-500">{t.acessos}</span>
                            </div>
                            <Barra pct={Math.round((t.acessos / maxTela) * 100)} cor="bg-sky-500" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
                    <button
                      type="button"
                      onClick={() => { reenviarAcesso(c); }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                    >
                      <Send className="h-4 w-4" />
                      {c.nunca ? 'Cobrar acesso' : 'Reenviar acesso'}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {detalhe?.tipo === 'tela' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => e.target === e.currentTarget && setDetalhe(null)}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{detalhe.t.tela}</h3>
                <p className="text-xs text-slate-500">{detalhe.t.acessos.toLocaleString('pt-BR')} acessos no período</p>
              </div>
              <button type="button" onClick={() => setDetalhe(null)} aria-label="Fechar" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Clientes que mais acessam esta tela</p>
              <div className="space-y-3">
                {detalhe.t.topClientes.map((tc, i) => {
                  const maxCli = Math.max(...detalhe.t.topClientes.map((x) => x.acessos), 1);
                  return (
                    <div key={tc.nome}>
                      <div className="mb-1 flex items-center justify-between text-[13px]">
                        <span className="flex items-center gap-2 font-semibold text-slate-700">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0e2233] text-[10px] font-bold text-white">{i + 1}</span>
                          {tc.nome}
                        </span>
                        <span className="font-mono text-slate-500">{tc.acessos} acessos</span>
                      </div>
                      <Barra pct={Math.round((tc.acessos / maxCli) * 100)} cor="bg-sky-500" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
