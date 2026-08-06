'use client';

import { Fragment, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Download, Info, Wrench, FileText, X, Clock,
  CheckCircle2, CalendarClock, ChevronRight, ChevronDown,
  Eye, LogOut, Flag, Send, CalendarPlus,
} from 'lucide-react';
import {
  PageTitle, KpiCard, KpiRow, SectionCard, SectionHeader,
  DataTable, Th, TablePagination, usePaginacao,
  ColunaFiltro, ColunaDropdown, ThFiltro, useFiltrosColuna, FunilEtapas, type ColDef,
} from '@/components/portal/ui';
import {
  EsteiraManutencao, ETAPAS_MANUTENCAO,
  type EtapaManutencao, type EtapaManutencaoKey,
} from '@/lib/acompanhamento';
import {
  HOJE, parseBR, diasEntre, ATENDIMENTOS_SERVICO, getDetalhe, etapaAtendimento,
  type TipoServico, type OrdemServico, type AtendimentoServico, type ItemServico, type DetalheAtendimento,
} from '@/lib/servicosData';
import { FROTA_TOTAL } from '@/lib/portalData';

/* Paleta categórica fria (azul/navy/índigo/cinza) — cores neutras, sem verde/vermelho,
   já que "tipo de serviço" é categoria e não status (não representa bom/ruim). */
const TIPO_INFO: Record<TipoServico, { label: string; dot: string; bar: string }> = {
  preventiva: { label: 'Preventiva', dot: 'bg-sky-500', bar: 'bg-sky-500' },
  corretiva: { label: 'Corretiva', dot: 'bg-[#0e2233]', bar: 'bg-[#0e2233]' },
  sinistro: { label: 'Sinistro', dot: 'bg-indigo-400', bar: 'bg-indigo-400' },
  outros: { label: 'Outros', dot: 'bg-slate-400', bar: 'bg-slate-400' },
};
const TIPOS_ORDEM: TipoServico[] = ['preventiva', 'corretiva', 'sinistro', 'outros'];


/** Cor do badge por status de OS. */
const COR_STATUS_OS: Record<OrdemServico['status'], string> = {
  Aberta: 'bg-indigo-100 text-indigo-700',
  'Em execução': 'bg-sky-100 text-sky-700',
  'Aguardando peça': 'bg-amber-100 text-amber-800',
  Finalizada: 'bg-emerald-100 text-emerald-700',
};

/** Dias em manutenção de uma OS (entrada -> saída, ou até hoje se em aberto). */
function diasOS(os: OrdemServico): number | null {
  const entrada = parseBR(os.dataEntrada);
  if (!entrada) return null;
  const fim = parseBR(os.dataSaida) ?? HOJE;
  return Math.max(0, diasEntre(entrada, fim));
}


/** Situação do veículo: Parado (manutenção em aberto) ou Rodando (finalizado). */
const situacaoVeiculo = (a: AtendimentoServico): 'Parado' | 'Rodando' =>
  a.status === 'finalizado' ? 'Rodando' : 'Parado';

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
  info: 'Informação do chamado',
  servico: 'Detalhes de Serviço',
  resumo: 'Resumo do atendimento',
};

/** Monta o HTML do Resumo (mesmo layout do arquivo oficial). */
function gerarResumoHtml(a: AtendimentoServico, det: DetalheAtendimento, titulo = 'Resumo de Atendimento'): string {
  const identificacao = a.chassi !== '—' ? `Chassi: ${a.chassi}` : `Nº de Série: ${a.numeroSerie}`;
  const linhas = det.itens
    .map(
      (it) => `<tr>
        <td>${it.os}</td><td>${it.codigo}</td><td>${it.descricao}</td><td>${it.observacao}</td>
        <td>${it.finalidade}</td><td style="text-align:center">${it.qtde}</td>
      </tr>`,
    )
    .join('');
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
  <title>${titulo} ${a.numero}</title>
  <style>
    *{box-sizing:border-box} body{font-family:Arial,Helvetica,sans-serif;color:#0f172a;padding:28px;font-size:12px}
    h1{font-size:18px;margin:0 0 4px} h3{font-size:13px;margin:16px 0 4px}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:2px 24px;margin:10px 0}
    table{width:100%;border-collapse:collapse;margin-top:6px}
    th,td{border:1px solid #cbd5e1;padding:4px 6px;font-size:10.5px;vertical-align:top}
    th{background:#f1f5f9;text-align:left} .tot{margin-top:6px;text-align:right;font-size:12px}
  </style></head><body>
    <h1>${titulo}</h1>
    <p><b>N°.:</b> ${a.numero}</p>
    <div class="grid">
      <div><b>Placa:</b> ${a.placa}</div>
      <div><b>${identificacao.split(':')[0]}:</b> ${identificacao.split(': ')[1]}</div>
      <div><b>Modelo:</b> ${det.modeloCompleto}</div>
      <div><b>Ano veículo:</b> ${det.anoVeiculo}</div>
      <div><b>KM:</b> ${det.km}</div>
      <div><b>Cliente:</b> ${det.cliente}</div>
      <div><b>Nº Contrato:</b> ${det.numeroContrato}</div>
      <div><b>Centro de Custo:</b> ${det.centroCusto}</div>
      <div><b>Data Agendamento:</b> ${a.agendamento}</div>
      <div><b>Data Entrada em oficina:</b> ${a.dataEntrada}</div>
      <div><b>Data de Saída:</b> ${a.saida}</div>
    </div>
    <p><b>Informações do condutor:</b> ${det.condutor} — ${det.descricaoProblema}</p>
    <h3>ITENS AUTORIZADOS PARA MANUTENÇÃO</h3>
    <table>
      <thead><tr><th>O.S.</th><th>Nº Item</th><th>Descrição</th><th>Observação</th><th>Finalidade</th><th>Qtde</th></tr></thead>
      <tbody>${linhas || '<tr><td colspan="6" style="text-align:center">Sem itens</td></tr>'}</tbody>
    </table>
  </body></html>`;
}

/** Abre o Resumo numa nova janela e dispara a impressão (salvar como PDF). */
function abrirResumoImpressao(a: AtendimentoServico, det: DetalheAtendimento, titulo?: string) {
  const w = window.open('', '_blank', 'width=820,height=900');
  if (!w) return;
  w.document.write(gerarResumoHtml(a, det, titulo));
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 350);
}

/** Baixa uma matriz de dados como CSV (separador ; com BOM para o Excel PT-BR). */
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

/** Botão padrão de download (CSV). */
function BotaoBaixar({ onClick, texto = 'Baixar' }: { onClick: () => void; texto?: string }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
      <Download size={13} /> {texto}
    </button>
  );
}

/** Monta as etapas da esteira de manutenção de um atendimento. */
function etapasManutencao(a: AtendimentoServico): EtapaManutencao[] {
  const agendou = a.agendamento !== '—';
  const entrou = a.dataEntrada !== '—';
  const saiu = a.saida !== '—';
  const finalizado = a.status === 'finalizado' || a.dataConclusao !== '—';
  const aguardandoPeca = a.ordens.some((o) => o.status === 'Aguardando peça');
  const emExecucao = a.ordens.some((o) => o.status === 'Em execução');

  const detManut = aguardandoPeca
    ? 'Aguardando peça'
    : emExecucao
      ? 'Serviços em execução'
      : 'Em avaliação pela oficina';

  const manutEstado = finalizado || saiu ? 'concluido' : entrou ? 'atual' : 'pendente';

  return [
    { label: 'Aguardando Agendamento', data: agendou ? a.agendamento : 'Em andamento', icon: Clock, estado: agendou ? 'concluido' : 'atual' },
    { label: 'Agendado', data: a.agendamento, icon: CalendarClock, estado: agendou ? 'concluido' : 'pendente' },
    { label: 'Em Manutenção', data: manutEstado === 'atual' ? 'Em andamento' : entrou ? a.dataEntrada : '—', icon: Wrench, estado: manutEstado, detalhe: manutEstado === 'pendente' ? undefined : detManut },
    { label: 'Disponível para retirada', data: a.saida, icon: LogOut, estado: saiu ? 'concluido' : 'pendente', detalhe: saiu ? undefined : `Previsão de saída: ${a.previsao}` },
    { label: 'Manutenção Finalizada', data: a.dataConclusao, icon: Flag, estado: finalizado ? 'concluido' : 'pendente' },
  ];
}

function ModalAcompanhamento({ atendimento: a, onFechar }: { atendimento: AtendimentoServico; onFechar: () => void }) {
  const identificador = a.placa !== '—' ? a.placa : a.numeroSerie;
  const identLabel = 'Chassi / Número de série';
  const identValor = a.chassi !== '—' ? a.chassi : a.numeroSerie;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onFechar}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-semibold text-slate-500">Atendimento {a.numero} · {identificador}</p>
            <h3 className="text-lg font-extrabold text-slate-900">Acompanhar manutenção</h3>
            <p className="mt-0.5 text-[13px] text-slate-500">{a.motivo} · {a.marcaModelo}</p>
          </div>
          <button onClick={onFechar} aria-label="Fechar" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <dl className="mb-5 grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border border-slate-200 bg-slate-50/40 p-4 text-[13px]">
          <div><dt className="text-xs font-bold uppercase text-slate-400">Placa</dt><dd className="font-mono font-semibold">{a.placa}</dd></div>
          <div><dt className="text-xs font-bold uppercase text-slate-400">{identLabel}</dt><dd className="font-mono font-semibold">{identValor}</dd></div>
          <div><dt className="text-xs font-bold uppercase text-slate-400">Marca/Modelo</dt><dd className="font-semibold">{a.marcaModelo}</dd></div>
          <div><dt className="text-xs font-bold uppercase text-slate-400">Motivo do atendimento</dt><dd className="font-semibold">{a.motivo}</dd></div>
        </dl>

        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Andamento da manutenção</p>
        <div className="mb-2">
          <EsteiraManutencao etapas={etapasManutencao(a)} />
        </div>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Falar com o controlador sobre o status</p>
          <div className="mb-2 flex items-center gap-2 text-[12px] text-slate-500">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white">LP</span>
            Enviando como <b className="text-slate-700">Lucas Pessoa</b> · Cliente
          </div>
          <div className="flex gap-2.5">
            <input placeholder="Escreva sua mensagem ao controlador…" className="input-field flex-1 bg-slate-50 py-2.5 text-[13px]" />
            <button className="btn-primary gap-1.5 text-[13px]"><Send size={14} /> Enviar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalDetalheAtendimento({
  atendimento, tipo, os, onFechar,
}: {
  atendimento: AtendimentoServico;
  tipo: DetalheTipo;
  os?: OrdemServico;
  onFechar: () => void;
}) {
  const detCompleto = getDetalhe(atendimento.numero);
  // Quando é o resumo de uma OS específica, escopa itens/ordens àquela OS.
  const det = os ? { ...detCompleto, itens: detCompleto.itens.filter((i) => i.os === os.numero) } : detCompleto;
  const ordensExibidas = os ? [os] : atendimento.ordens;
  const tituloResumo = os ? 'Resumo da OS' : 'Resumo do atendimento';
  const identificacaoLabel = 'Chassi / Número de série';
  const identificacaoValor = atendimento.chassi !== '—' ? atendimento.chassi : atendimento.numeroSerie;
  const largura = tipo === 'resumo' || tipo === 'servico' ? 'max-w-2xl' : 'max-w-lg';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onFechar}>
      <div className={`max-h-[90vh] w-full ${largura} overflow-y-auto rounded-xl bg-white p-6 shadow-xl`} onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="font-mono text-xs font-semibold text-slate-500">
              Atendimento {atendimento.numero}{os ? ` · OS ${os.numero}` : ''} · {atendimento.placa !== '—' ? atendimento.placa : atendimento.numeroSerie}
            </p>
            <h3 className="text-lg font-extrabold text-slate-900">{tipo === 'resumo' ? tituloResumo : DETALHE_TITULO[tipo]}</h3>
          </div>
          <button onClick={onFechar} aria-label="Fechar" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        {/* INFORMAÇÃO: o que o usuário/condutor relatou no chamado */}
        {tipo === 'info' && (
          <div className="space-y-4 text-[13px]">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border border-slate-200 bg-slate-50/40 p-4">
              <div><dt className="text-xs font-bold uppercase text-slate-400">Placa</dt><dd className="font-mono font-semibold">{atendimento.placa}</dd></div>
              <div><dt className="text-xs font-bold uppercase text-slate-400">{identificacaoLabel}</dt><dd className="font-mono font-semibold">{identificacaoValor}</dd></div>
              <div><dt className="text-xs font-bold uppercase text-slate-400">Marca/Modelo</dt><dd className="font-semibold">{atendimento.marcaModelo}</dd></div>
              <div><dt className="text-xs font-bold uppercase text-slate-400">Motivo do atendimento</dt><dd className="font-semibold">{atendimento.motivo}</dd></div>
            </dl>
            <div className="rounded-lg border border-sky-200 bg-sky-50/60 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Problema relatado no chamado</p>
              <p className="mt-1 text-slate-800">{det.descricaoProblema}</p>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div><dt className="text-xs font-bold uppercase text-slate-400">Condutor</dt><dd className="font-semibold">{det.condutor}</dd></div>
              <div><dt className="text-xs font-bold uppercase text-slate-400">Situação do veículo</dt><dd>{situacaoVeiculo(atendimento)}</dd></div>
            </dl>
          </div>
        )}

        {/* DETALHE DE SERVIÇO: itens (mão de obra / peças) por OS, sem valores */}
        {tipo === 'servico' && (
          <div className="space-y-3 text-[13px]">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border border-slate-200 bg-slate-50/40 p-4">
              <div><dt className="text-xs font-bold uppercase text-slate-400">Placa</dt><dd className="font-mono font-semibold">{atendimento.placa}</dd></div>
              <div><dt className="text-xs font-bold uppercase text-slate-400">{identificacaoLabel}</dt><dd className="font-mono font-semibold">{identificacaoValor}</dd></div>
              <div><dt className="text-xs font-bold uppercase text-slate-400">Marca/Modelo</dt><dd className="font-semibold">{atendimento.marcaModelo}</dd></div>
              <div><dt className="text-xs font-bold uppercase text-slate-400">Motivo do atendimento</dt><dd className="font-semibold">{atendimento.motivo}</dd></div>
            </dl>
            <p className="text-xs text-slate-500">Itens de mão de obra e peças registrados pela oficina, separados por ordem de serviço.</p>
            {atendimento.ordens.map((os) => {
              const itensOS = det.itens.filter((i) => i.os === os.numero);
              return (
                <div key={os.numero} className="overflow-hidden rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2">
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-700">{os.numero}</span>
                      <span className="text-xs font-semibold text-slate-600">{os.motivo}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      {os.temAvaria && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">Avaria</span>}
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${COR_STATUS_OS[os.status]}`}>{os.status}</span>
                    </span>
                  </div>
                  <table className="w-full text-left">
                    <tbody>
                      {itensOS.length === 0 ? (
                        <tr><td className="px-3 py-3 text-center text-slate-400">Nenhum item registrado nesta OS.</td></tr>
                      ) : (
                        itensOS.map((it) => (
                          <tr key={it.codigo} className="border-t border-slate-100">
                            <td className="px-3 py-2">
                              <span className="block font-semibold text-slate-800">{it.descricao}</span>
                              <span className="block text-[11px] text-slate-400">cód. {it.codigo} · {it.finalidade}</span>
                            </td>
                            <td className="px-3 py-2">
                              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${it.tipo === 'peca' ? 'bg-indigo-100 text-indigo-700' : 'bg-sky-100 text-sky-700'}`}>
                                {it.tipo === 'peca' ? 'Peça' : 'Mão de Obra'}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right">
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                                <span className="text-slate-400">Qtd</span> {it.qtde}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        )}

        {/* RESUMO: documento igual ao arquivo oficial + download/impressão */}
        {tipo === 'resumo' && (
          <div className="space-y-4 text-[13px]">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => abrirResumoImpressao(atendimento, det, tituloResumo)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-primary-700"
              >
                <Download size={15} /> Baixar / Imprimir PDF
              </button>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border border-slate-200 p-4">
              <div><dt className="text-xs font-bold uppercase text-slate-400">Placa</dt><dd className="font-mono font-semibold">{atendimento.placa}</dd></div>
              <div><dt className="text-xs font-bold uppercase text-slate-400">{identificacaoLabel}</dt><dd className="font-mono font-semibold">{identificacaoValor}</dd></div>
              <div className="col-span-2"><dt className="text-xs font-bold uppercase text-slate-400">Modelo</dt><dd className="font-semibold">{det.modeloCompleto}</dd></div>
              <div><dt className="text-xs font-bold uppercase text-slate-400">Ano veículo</dt><dd>{det.anoVeiculo}</dd></div>
              <div><dt className="text-xs font-bold uppercase text-slate-400">KM</dt><dd className="font-mono">{det.km}</dd></div>
              <div><dt className="text-xs font-bold uppercase text-slate-400">Cliente</dt><dd className="font-semibold">{det.cliente}</dd></div>
              <div><dt className="text-xs font-bold uppercase text-slate-400">Nº Contrato</dt><dd className="font-mono">{det.numeroContrato}</dd></div>
              <div><dt className="text-xs font-bold uppercase text-slate-400">Centro de Custo</dt><dd>{det.centroCusto}</dd></div>
              <div><dt className="text-xs font-bold uppercase text-slate-400">Data Agendamento</dt><dd className="font-mono">{atendimento.agendamento}</dd></div>
              <div><dt className="text-xs font-bold uppercase text-slate-400">Data Entrada</dt><dd className="font-mono">{atendimento.dataEntrada}</dd></div>
              <div><dt className="text-xs font-bold uppercase text-slate-400">Data de Saída</dt><dd className="font-mono">{atendimento.saida}</dd></div>
            </dl>
            <div className="rounded-lg border border-sky-200 bg-sky-50/60 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Problema relatado no chamado</p>
              <p className="mt-1 text-slate-800">{det.descricaoProblema}</p>
              <p className="mt-1 text-xs text-slate-500">Condutor: <b className="text-slate-700">{det.condutor}</b></p>
            </div>
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Itens autorizados para manutenção (por OS)</p>
              <div className="space-y-2">
                {ordensExibidas.map((os) => {
                  const itensOS = det.itens.filter((i) => i.os === os.numero);
                  return (
                    <div key={os.numero} className="overflow-hidden rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-2.5 py-1.5">
                        <span className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-slate-700">{os.numero}</span>
                          <span className="text-[11px] font-semibold text-slate-600">{os.motivo}</span>
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${COR_STATUS_OS[os.status]}`}>{os.status}</span>
                      </div>
                      <table className="w-full text-left text-[12px]">
                        <tbody>
                          {itensOS.length === 0 ? (
                            <tr><td className="px-2 py-2 text-center text-slate-400">Sem itens</td></tr>
                          ) : (
                            itensOS.map((it) => (
                              <tr key={it.codigo} className="border-t border-slate-100">
                                <td className="px-2 py-1.5 font-semibold text-slate-800">{it.descricao}</td>
                                <td className="px-2 py-1.5 text-slate-500">{it.finalidade}</td>
                                <td className="px-2 py-1.5 text-center font-mono">{it.qtde}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            </div>
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
          <BotaoBaixar onClick={() => baixarCSV('grafico-servicos', [
            ['Mês', ...TIPOS_ORDEM.map((t) => TIPO_INFO[t].label)],
            ...EVOLUCAO_MENSAL.map((m) => [m.mes, ...TIPOS_ORDEM.map((t) => m.valores[t])]),
          ])} />
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

/** Opções da lista suspensa de tipo (na coluna "Motivo do atendimento"). */
const OPCOES_TIPO = TIPOS_ORDEM.map((t) => ({ value: TIPO_INFO[t].label, label: TIPO_INFO[t].label }));
/** Opções da lista suspensa de status do atendimento. */
const OPCOES_STATUS = [
  { value: 'Em aberto', label: 'Em aberto' },
  { value: 'Finalizado', label: 'Finalizado' },
];
/** Opções da lista suspensa de situação do veículo. */
const OPCOES_SITUACAO = [
  { value: 'Parado', label: 'Parado' },
  { value: 'Rodando', label: 'Rodando' },
];
/** Opções da lista suspensa de cobrança de avaria. */
const OPCOES_AVARIA = [
  { value: 'Sim', label: 'Sim' },
  { value: 'Não', label: 'Não' },
];
/** Um atendimento tem cobrança de avaria se qualquer OS dele tiver. */
const atendimentoComAvaria = (a: AtendimentoServico): boolean => a.ordens.some((o) => o.temAvaria);


export default function ServicosPage() {
  const [etapaFiltro, setEtapaFiltro] = useState<EtapaManutencaoKey | null>(null);
  const [detalhe, setDetalhe] = useState<{ atendimento: AtendimentoServico; tipo: DetalheTipo; os?: OrdemServico } | null>(null);
  const [osExpandida, setOsExpandida] = useState<string | null>(null);
  const [osDetalhe, setOsDetalhe] = useState<{ atendimento: AtendimentoServico; os: OrdemServico } | null>(null);
  const [acompanhar, setAcompanhar] = useState<AtendimentoServico | null>(null);

  const abertos = ATENDIMENTOS_SERVICO.filter((a) => a.status === 'aberta');

  /* Funil: conta os atendimentos reais por etapa (bate com a lista abaixo). */
  const funil = useMemo(
    () => ETAPAS_MANUTENCAO.map((e) => ({ ...e, count: ATENDIMENTOS_SERVICO.filter((a) => etapaAtendimento(a) === e.key).length })),
    [],
  );

  /* KPIs operacionais calculados a partir dos dados. */
  const kpis = useMemo(() => ({ emOficina: abertos.length }), [abertos]);

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

  const linhasBase = useMemo(
    () => (etapaFiltro ? ATENDIMENTOS_SERVICO.filter((a) => etapaAtendimento(a) === etapaFiltro) : ATENDIMENTOS_SERVICO),
    [etapaFiltro],
  );
  const cols = useMemo<ColDef<AtendimentoServico>[]>(() => [
    { key: 'numero', get: (a) => a.numero, multi: true },
    { key: 'statusAt', get: (a) => (a.status === 'finalizado' ? 'Finalizado' : 'Em aberto') },
    // A coluna "Motivo" filtra pelo tipo do serviço (Preventiva/Corretiva/Sinistro/Outros).
    { key: 'motivo', get: (a) => TIPO_INFO[a.tipo].label },
    { key: 'placa', get: (a) => a.placa, multi: true },
    { key: 'chassi', get: (a) => a.chassi, multi: true },
    { key: 'serie', get: (a) => a.numeroSerie, multi: true },
    { key: 'modelo', get: (a) => a.marcaModelo },
    { key: 'agendamento', get: (a) => a.agendamento },
    { key: 'entrada', get: (a) => a.dataEntrada },
    { key: 'saida', get: (a) => a.saida },
    { key: 'conclusao', get: (a) => a.dataConclusao },
    { key: 'situacao', get: (a) => situacaoVeiculo(a) },
    { key: 'avaria', get: (a) => (atendimentoComAvaria(a) ? 'Sim' : 'Não') },
  ], []);
  const { val, set, filtradas: linhas } = useFiltrosColuna(linhasBase, cols);
  const pag = usePaginacao(linhas, 10);

  return (
    <div>
      <PageTitle
        titulo="Serviços de manutenção"
        subtitulo="Serviços realizados, veículos em atendimento e disponibilidade da frota"
        acao={<BotaoBaixar texto="Baixar indicadores" onClick={() => baixarCSV('indicadores-servicos', [
          ['Indicador', 'Valor'],
          ['Frota total', FROTA_TOTAL],
          ['Em manutenção', kpis.emOficina],
        ])} />}
      />

      {/* KPIs operacionais */}
      <KpiRow>
        <KpiCard label="Frota total" valor={String(FROTA_TOTAL)} detalhe="veículos e equipamentos" cor="border-l-[#0e2233]" />
        <KpiCard label="Em manutenção" valor={String(kpis.emOficina)} detalhe="veículos imobilizados" cor="border-l-sky-600" detalheCor="text-sky-700" />
      </KpiRow>

      {/* Gráfico + composição */}
      <div className="mb-6 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <GraficoEmpilhado />

        <SectionCard
          titulo="Top motivos de serviço"
          subtitulo="Motivos mais recorrentes no período"
          acao={<BotaoBaixar onClick={() => baixarCSV('top-motivos', [['Motivo', 'Qtd', '%'], ...topMotivos.map((m) => [m.motivo, m.qtd, `${m.pct}%`])])} />}
        >
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
            { label: 'Preventiva', valor: '5', pct: '24%', icon: <i className="h-2.5 w-2.5 rounded-full bg-sky-500" /> },
            { label: 'Corretiva', valor: '15', pct: '71%', icon: <i className="h-2.5 w-2.5 rounded-full bg-[#0e2233]" /> },
            { label: 'Sinistro', valor: '1', pct: '5%', icon: <i className="h-2.5 w-2.5 rounded-full bg-indigo-400" /> },
            { label: 'Outros', valor: '1', pct: '5%', icon: <i className="h-2.5 w-2.5 rounded-full bg-slate-400" /> },
          ].map((a) => (
            <div key={a.label}>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">{a.icon}{a.label}</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">{a.valor}</p>
              <p className="font-mono text-[11px] text-slate-400">{a.pct} dos serviços</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Funil: manutenções em aberto por etapa (pré-filtro da tabela) */}
      <FunilEtapas
        titulo="Atendimentos por etapa"
        subtitulo="Clique numa etapa para filtrar a lista abaixo"
        etapas={funil}
        ativo={etapaFiltro}
        onSelecionar={(k) => setEtapaFiltro(k as EtapaManutencaoKey | null)}
        className="mb-6"
      />

      {/* Relatório de veículos */}
      <SectionHeader
        titulo="Relatório de Serviços"
        subtitulo="Atendimentos e ordens de serviço da frota"
        className="mb-3"
        acao={
          <div className="flex items-center gap-2">
            <button className="btn-secondary gap-1.5 px-3 py-2 text-xs">
              <Download size={13} /> Baixar planilha
            </button>
            <Link href="/portal/chamados" className="btn-primary gap-1.5 px-3 py-2 text-xs">
              <CalendarPlus size={13} /> Agendar Manutenção
            </Link>
          </div>
        }
      />

      <DataTable
        colSpan={15}
        vazio={linhas.length === 0}
        vazioLabel="Nenhum atendimento encontrado com os filtros atuais."
        head={
          <>
            <Th className="whitespace-nowrap">Nº de atendimento</Th>
            <Th className="whitespace-nowrap">Status do atendimento</Th>
            <Th className="whitespace-nowrap">Motivo do atendimento</Th>
            <Th className="whitespace-nowrap text-center">Nº de OS</Th>
            <Th className="whitespace-nowrap">Placa</Th>
            <Th className="whitespace-nowrap">Chassi</Th>
            <Th className="whitespace-nowrap">Nº de Série</Th>
            <Th className="whitespace-nowrap">Marca/Modelo</Th>
            <Th className="whitespace-nowrap">Agendamento</Th>
            <Th className="whitespace-nowrap">Entrada</Th>
            <Th className="whitespace-nowrap">Saída</Th>
            <Th className="whitespace-nowrap">Conclusão</Th>
            <Th className="whitespace-nowrap">Situação do Veículo</Th>
            <Th className="whitespace-nowrap">Cobrança de avaria</Th>
            <Th className="whitespace-nowrap">Mais detalhes</Th>
          </>
        }
        filterRow={
          <>
            <ThFiltro><ColunaFiltro value={val('numero')} onChange={set('numero')} placeholder="Nº atend." multi ariaLabel="Filtrar nº de atendimento" /></ThFiltro>
            <ThFiltro><ColunaDropdown value={val('statusAt')} onChange={set('statusAt')} options={OPCOES_STATUS} placeholder="Todos os status" ariaLabel="Filtrar status do atendimento" /></ThFiltro>
            <ThFiltro><ColunaDropdown value={val('motivo')} onChange={set('motivo')} options={OPCOES_TIPO} placeholder="Todos os tipos" ariaLabel="Filtrar tipo de serviço" /></ThFiltro>
            <ThFiltro />
            <ThFiltro><ColunaFiltro value={val('placa')} onChange={set('placa')} placeholder="Placa" multi ariaLabel="Filtrar placa" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('chassi')} onChange={set('chassi')} placeholder="Chassi" multi ariaLabel="Filtrar chassi" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('serie')} onChange={set('serie')} placeholder="Nº série" multi ariaLabel="Filtrar nº de série" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('modelo')} onChange={set('modelo')} placeholder="Modelo" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('agendamento')} onChange={set('agendamento')} placeholder="Data" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('entrada')} onChange={set('entrada')} placeholder="Data" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('saida')} onChange={set('saida')} placeholder="Data" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('conclusao')} onChange={set('conclusao')} placeholder="Data" /></ThFiltro>
            <ThFiltro><ColunaDropdown value={val('situacao')} onChange={set('situacao')} options={OPCOES_SITUACAO} placeholder="Todas" ariaLabel="Filtrar situação do veículo" /></ThFiltro>
            <ThFiltro><ColunaDropdown value={val('avaria')} onChange={set('avaria')} options={OPCOES_AVARIA} placeholder="Todas" ariaLabel="Filtrar cobrança de avaria" /></ThFiltro>
            <ThFiltro />
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
            rotulo="atendimentos"
          />
        }
      >
        {pag.pageItens.map((a) => {
              const emAberto = a.status === 'aberta';
              const aberto = osExpandida === a.numero;
              const stopExpand = (e: React.MouseEvent) => e.stopPropagation();
              return (
                <Fragment key={a.numero}>
                <tr
                  onClick={() => setOsExpandida(aberto ? null : a.numero)}
                  className={`cursor-pointer border-b border-slate-100 last:border-0 ${aberto ? 'bg-primary-50/40' : 'hover:bg-slate-50'}`}
                >
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <span className="inline-flex items-center gap-1 font-mono font-semibold text-slate-800">
                      {aberto ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                      {a.numero}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${a.status === 'finalizado' ? 'bg-emerald-50 text-emerald-700' : 'bg-sky-50 text-sky-700'}`}>
                      {a.status === 'finalizado' ? 'Finalizado' : 'Em aberto'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-xs font-semibold">{a.motivo}</td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-center">
                    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-100 px-1.5 text-xs font-bold text-slate-600">{a.ordens.length}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs">{a.placa}</td>
                  <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-slate-600">{a.chassi}</td>
                  <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-slate-600">{a.numeroSerie}</td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-xs">{a.marcaModelo}</td>
                  <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs">{a.agendamento}</td>
                  <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs">{a.dataEntrada}</td>
                  <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs">{a.saida}</td>
                  <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs">{a.dataConclusao}</td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${a.status === 'finalizado' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {situacaoVeiculo(a)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    {atendimentoComAvaria(a) ? (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800">Sim</span>
                    ) : (
                      <span className="text-xs text-slate-400">Não</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5" onClick={stopExpand}>
                    <div className="flex gap-1">
                      {emAberto && (
                        <button
                          title="Acompanhar manutenção"
                          aria-label="Acompanhar manutenção"
                          onClick={() => setAcompanhar(a)}
                          className="rounded-lg p-1.5 text-sky-600 hover:bg-sky-50 hover:text-sky-700"
                        >
                          <Eye size={16} />
                        </button>
                      )}
                      <button
                        title="Informação (problema relatado)"
                        onClick={() => setDetalhe({ atendimento: a, tipo: 'info' })}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#0e2233]"
                      >
                        <Info size={16} />
                      </button>
                      <button
                        title="Detalhes de Serviço (peças e serviços)"
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
                {aberto && (
                  <tr className="bg-slate-50/60">
                    <td colSpan={15} className="px-6 py-3.5">
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                        Ordens de Serviço do atendimento {a.numero} ({a.ordens.length})
                      </p>
                      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                        <table className="w-full text-left text-[12px]">
                          <thead className="bg-slate-50">
                            <tr className="text-[10px] uppercase tracking-wide text-slate-500">
                              <th className="px-3 py-2 font-bold">Nº da OS</th>
                              <th className="px-3 py-2 font-bold">Motivo da OS</th>
                              <th className="px-3 py-2 font-bold">Status da OS</th>
                              <th className="px-3 py-2 text-center font-bold">Dias em manut.</th>
                              <th className="px-3 py-2 font-bold">Entrada</th>
                              <th className="px-3 py-2 font-bold">Previsão de saída</th>
                              <th className="px-3 py-2 font-bold">Saída</th>
                              <th className="px-3 py-2 font-bold">Cobrança de avaria</th>
                              <th className="px-3 py-2 text-right font-bold">Mais detalhes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {a.ordens.map((os) => {
                              const d = diasOS(os);
                              return (
                                <tr key={os.numero} className="border-t border-slate-100">
                                  <td className="whitespace-nowrap px-3 py-2 font-mono font-semibold text-slate-700">{os.numero}</td>
                                  <td className="whitespace-nowrap px-3 py-2 font-semibold text-slate-600">{os.motivo}</td>
                                  <td className="whitespace-nowrap px-3 py-2"><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${COR_STATUS_OS[os.status]}`}>{os.status}</span></td>
                                  <td className="whitespace-nowrap px-3 py-2 text-center font-mono">{d != null ? `${d}d${os.dataSaida === '—' ? ' · Em andamento' : ''}` : '—'}</td>
                                  <td className="whitespace-nowrap px-3 py-2 font-mono">{os.dataEntrada}</td>
                                  <td className="whitespace-nowrap px-3 py-2 font-mono">{a.previsao}</td>
                                  <td className="whitespace-nowrap px-3 py-2 font-mono">{os.dataSaida}</td>
                                  <td className="whitespace-nowrap px-3 py-2">
                                    {os.temAvaria ? (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                                        Sim
                                      </span>
                                    ) : (
                                      <span className="text-slate-400">Não</span>
                                    )}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-2 text-right">
                                    <div className="flex justify-end gap-1">
                                      <button
                                        type="button"
                                        onClick={() => setOsDetalhe({ atendimento: a, os })}
                                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#0e2233]"
                                        title="Detalhes da OS"
                                        aria-label="Detalhes da OS"
                                      >
                                        <Info size={15} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setDetalhe({ atendimento: a, tipo: 'resumo', os })}
                                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#0e2233]"
                                        title="Resumo da OS"
                                        aria-label="Resumo da OS"
                                      >
                                        <FileText size={15} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
                </Fragment>
              );
            })}
      </DataTable>

      {detalhe && (
        <ModalDetalheAtendimento
          atendimento={detalhe.atendimento}
          tipo={detalhe.tipo}
          os={detalhe.os}
          onFechar={() => setDetalhe(null)}
        />
      )}

      {osDetalhe && (
        <ModalDetalheOS atendimento={osDetalhe.atendimento} os={osDetalhe.os} onFechar={() => setOsDetalhe(null)} />
      )}

      {acompanhar && (
        <ModalAcompanhamento atendimento={acompanhar} onFechar={() => setAcompanhar(null)} />
      )}
    </div>
  );
}

function ModalDetalheOS({ atendimento, os, onFechar }: { atendimento: AtendimentoServico; os: OrdemServico; onFechar: () => void }) {
  const d = diasOS(os);
  const itens = getDetalhe(atendimento.numero).itens.filter((i) => i.os === os.numero);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onFechar}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="font-mono text-xs font-semibold text-slate-500">Atendimento {atendimento.numero} · OS {os.numero}</p>
            <h3 className="text-lg font-extrabold text-slate-900">Detalhes da Ordem de Serviço</h3>
          </div>
          <button onClick={onFechar} aria-label="Fechar" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><X size={18} /></button>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[13px]">
          <div><dt className="text-xs font-bold uppercase text-slate-400">Motivo</dt><dd className="font-semibold">{os.motivo}</dd></div>
          <div><dt className="text-xs font-bold uppercase text-slate-400">Status</dt><dd><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${COR_STATUS_OS[os.status]}`}>{os.status}</span></dd></div>
          <div><dt className="text-xs font-bold uppercase text-slate-400">Entrada</dt><dd className="font-mono">{os.dataEntrada}</dd></div>
          <div><dt className="text-xs font-bold uppercase text-slate-400">Saída</dt><dd className="font-mono">{os.dataSaida}</dd></div>
          <div><dt className="text-xs font-bold uppercase text-slate-400">Dias em manutenção</dt><dd className="font-semibold">{d != null ? `${d} dias${os.dataSaida === '—' ? ' (Em andamento)' : ''}` : '—'}</dd></div>
          <div><dt className="text-xs font-bold uppercase text-slate-400">Placa / Ativo</dt><dd className="font-mono font-semibold">{atendimento.placa !== '—' ? atendimento.placa : atendimento.numeroSerie}</dd></div>
        </dl>

        {itens.length > 0 && (
          <div className="mt-4">
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">Itens desta OS</p>
            <div className="space-y-1.5">
              {itens.map((it) => (
                <div key={it.codigo} className="flex items-center justify-between gap-2 rounded-md border border-slate-200 px-3 py-2 text-[13px]">
                  <span className="font-semibold text-slate-700">{it.descricao}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                    <span className="text-slate-400">Qtd</span> {it.qtde}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={`mt-4 rounded-lg border px-4 py-3 ${os.temAvaria ? 'border-amber-200 bg-amber-50/60' : 'border-slate-200 bg-slate-50'}`}>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Cobrança de avaria</p>
          {os.temAvaria ? (
            <>
              <span className="mt-1 inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-[13px] font-bold text-amber-800">Sim</span>
              <p className="mt-1.5 text-xs text-slate-500">Esta OS possui cobrança de avaria. O detalhamento será tratado no momento da cobrança da avaria.</p>
            </>
          ) : (
            <p className="mt-1 text-sm font-semibold text-slate-600">Não · sem cobrança de avaria para esta OS.</p>
          )}
        </div>
      </div>
    </div>
  );
}
