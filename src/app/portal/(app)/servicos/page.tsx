'use client';

import { Fragment, useMemo, useState } from 'react';
import {
  Download, Info, Wrench, FileText, X, AlertTriangle, Clock,
  CheckCircle2, CalendarClock, ChevronRight, ChevronDown,
} from 'lucide-react';
import {
  PageTitle, KpiCard, FilterChip, KpiRow, SectionCard, SectionHeader,
  Toolbar, ToolbarDivider, DataTable, Th, TablePagination, usePaginacao,
  ColunaFiltro, ThFiltro, useFiltrosColuna, type ColDef,
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

/* Paleta categórica fria (azul/navy/índigo/cinza) — cores neutras, sem verde/vermelho,
   já que "tipo de serviço" é categoria e não status (não representa bom/ruim). */
const TIPO_INFO: Record<TipoServico, { label: string; dot: string; bar: string }> = {
  preventiva: { label: 'Preventiva', dot: 'bg-sky-500', bar: 'bg-sky-500' },
  corretiva: { label: 'Corretiva', dot: 'bg-[#0e2233]', bar: 'bg-[#0e2233]' },
  sinistro: { label: 'Sinistro', dot: 'bg-indigo-400', bar: 'bg-indigo-400' },
  outros: { label: 'Outros', dot: 'bg-slate-400', bar: 'bg-slate-400' },
};
const TIPOS_ORDEM: TipoServico[] = ['preventiva', 'corretiva', 'sinistro', 'outros'];

/** Ordem de Serviço: um atendimento pode ter várias, com motivos diversos. */
interface OrdemServico {
  numero: string;
  /** Mesmo vocabulário de "motivo do atendimento". */
  motivo: string;
  status: 'Aberta' | 'Em execução' | 'Aguardando peça' | 'Finalizada';
  dataEntrada: string;
  dataSaida: string;
  /** Se a OS gera cobrança de avaria e o valor de reembolso estimado. */
  temAvaria: boolean;
  valorReembolso?: string;
}

interface AtendimentoServico {
  numero: string;
  status: 'finalizado' | 'aberta';
  motivo: string;
  tipo: TipoServico;
  /** Ordens de Serviço vinculadas ao atendimento (uma ou várias). */
  ordens: OrdemServico[];
  placa: string;
  /** Chassi OU nº de série identificam o ativo (sempre um dos dois). */
  chassi: string;
  numeroSerie: string;
  marcaModelo: string;
  agendamento: string;
  dataEntrada: string;
  previsao: string;
  saida: string;
  dataConclusao: string;
  situacao: string;
}

const ATENDIMENTOS_SERVICO: AtendimentoServico[] = [
  { numero: '972972', status: 'finalizado', motivo: 'PNEU', tipo: 'corretiva', ordens: [{ numero: 'OS-338271', motivo: 'PNEU', status: 'Finalizada', dataEntrada: '26/06/2026', dataSaida: '05/07/2026', temAvaria: false }, { numero: 'OS-338290', motivo: 'FREIO', status: 'Finalizada', dataEntrada: '06/07/2026', dataSaida: '13/07/2026', temAvaria: true, valorReembolso: 'R$ 210,00' }], placa: 'JBL5B25', chassi: '9535V6TB0PR009032', numeroSerie: '—', marcaModelo: 'VW 11-180 Delivery', agendamento: '25/06/2026', dataEntrada: '26/06/2026', previsao: '28/06/2026', saida: '13/07/2026', dataConclusao: '13/07/2026', situacao: 'Rodando' },
  { numero: '957964', status: 'finalizado', motivo: 'CORRETIVA', tipo: 'corretiva', ordens: [{ numero: 'OS-330145', motivo: 'ELÉTRICA', status: 'Finalizada', dataEntrada: '15/11/2025', dataSaida: '21/11/2025', temAvaria: false }], placa: 'JBL5B27', chassi: '9535V6TB0PR009127', numeroSerie: '—', marcaModelo: 'VW 11-180 Delivery', agendamento: '15/11/2025', dataEntrada: '15/11/2025', previsao: '20/11/2025', saida: '21/11/2025', dataConclusao: '21/11/2025', situacao: 'Rodando' },
  { numero: '951200', status: 'finalizado', motivo: 'REVISÃO PREVENTIVA', tipo: 'preventiva', ordens: [{ numero: 'OS-325509', motivo: 'REVISÃO PREVENTIVA', status: 'Finalizada', dataEntrada: '10/05/2026', dataSaida: '12/05/2026', temAvaria: false }, { numero: 'OS-325520', motivo: 'PNEU', status: 'Finalizada', dataEntrada: '10/05/2026', dataSaida: '11/05/2026', temAvaria: false }, { numero: 'OS-325533', motivo: 'FREIO', status: 'Finalizada', dataEntrada: '11/05/2026', dataSaida: '12/05/2026', temAvaria: true, valorReembolso: 'R$ 320,00' }], placa: 'SHQ6B80', chassi: '9535V6TB0PR009242', numeroSerie: '—', marcaModelo: 'VW 11-180 Delivery', agendamento: '10/05/2026', dataEntrada: '10/05/2026', previsao: '12/05/2026', saida: '12/05/2026', dataConclusao: '12/05/2026', situacao: 'Rodando' },
  { numero: '948877', status: 'finalizado', motivo: 'SINISTRO', tipo: 'sinistro', ordens: [{ numero: 'OS-321880', motivo: 'SINISTRO', status: 'Finalizada', dataEntrada: '03/04/2026', dataSaida: '25/04/2026', temAvaria: true, valorReembolso: 'R$ 3.200,00' }, { numero: 'OS-321895', motivo: 'ELÉTRICA', status: 'Finalizada', dataEntrada: '10/04/2026', dataSaida: '25/04/2026', temAvaria: false }], placa: 'JBL5E88', chassi: 'YV2RT40A8LB456789', numeroSerie: '—', marcaModelo: 'Volvo FH 460', agendamento: '02/04/2026', dataEntrada: '03/04/2026', previsao: '20/04/2026', saida: '25/04/2026', dataConclusao: '25/04/2026', situacao: 'Rodando' },
  { numero: '2066903', status: 'aberta', motivo: 'DESMOBILIZAÇÃO', tipo: 'outros', ordens: [{ numero: 'OS-344012', motivo: 'DESMOBILIZAÇÃO', status: 'Em execução', dataEntrada: '03/07/2026', dataSaida: '—', temAvaria: false }], placa: 'SIE8F02', chassi: '9BM958074HB778812', numeroSerie: '—', marcaModelo: 'Mercedes Accelo 815', agendamento: '02/07/2026', dataEntrada: '03/07/2026', previsao: '20/07/2026', saida: '—', dataConclusao: '—', situacao: 'Em oficina' },
  { numero: '2066895', status: 'aberta', motivo: 'AFERIÇÃO TACÓGRAFO', tipo: 'preventiva', ordens: [{ numero: 'OS-343988', motivo: 'AFERIÇÃO TACÓGRAFO', status: 'Aguardando peça', dataEntrada: '09/07/2026', dataSaida: '—', temAvaria: false }, { numero: 'OS-343999', motivo: 'ELÉTRICA', status: 'Em execução', dataEntrada: '10/07/2026', dataSaida: '—', temAvaria: false }], placa: 'BXW9D72', chassi: '9535V6TB0PR010455', numeroSerie: '—', marcaModelo: 'VW 11-180 Delivery', agendamento: '08/07/2026', dataEntrada: '09/07/2026', previsao: '18/07/2026', saida: '—', dataConclusao: '—', situacao: 'Aguardando peça' },
  { numero: '2066894', status: 'aberta', motivo: 'PNEU', tipo: 'corretiva', ordens: [{ numero: 'OS-343970', motivo: 'PNEU', status: 'Em execução', dataEntrada: '11/07/2026', dataSaida: '—', temAvaria: true, valorReembolso: 'R$ 1.150,00' }], placa: 'TXI3F16', chassi: '9BM958074HB779340', numeroSerie: '—', marcaModelo: 'Mercedes Accelo 815', agendamento: '10/07/2026', dataEntrada: '11/07/2026', previsao: '17/07/2026', saida: '—', dataConclusao: '—', situacao: 'Em oficina' },
  { numero: '2066880', status: 'aberta', motivo: 'CORRETIVA', tipo: 'corretiva', ordens: [{ numero: 'OS-343900', motivo: 'SUSPENSÃO', status: 'Aberta', dataEntrada: '12/07/2026', dataSaida: '—', temAvaria: false }, { numero: 'OS-343911', motivo: 'FREIO', status: 'Em execução', dataEntrada: '13/07/2026', dataSaida: '—', temAvaria: true, valorReembolso: 'R$ 390,00' }], placa: '—', chassi: '—', numeroSerie: 'SN-JCB-099887', marcaModelo: 'JCB 3CX', agendamento: '12/07/2026', dataEntrada: '12/07/2026', previsao: '19/07/2026', saida: '—', dataConclusao: '—', situacao: 'Em oficina' },
];

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

/** Item autorizado para manutenção (peça ou serviço) — base do Detalhe de Serviço e do Resumo. */
interface ItemServico {
  os: string;
  codigo: string;
  descricao: string;
  observacao: string;
  finalidade: string;
  qtde: number;
  valorUnitario: string;
  valorTotal: string;
  tipo: 'servico' | 'peca';
}

/**
 * Dados adicionais por atendimento:
 *  - descricaoProblema: o que o usuário/condutor relatou no chamado (botão Informação).
 *  - itens: peças e serviços trocados (botão Detalhe de Serviço).
 *  - dados do veículo/cliente + totais (botão Resumo do atendimento).
 */
interface DetalheAtendimento {
  descricaoProblema: string;
  condutor: string;
  cliente: string;
  numeroContrato: string;
  centroCusto: string;
  km: string;
  anoVeiculo: string;
  modeloCompleto: string;
  itens: ItemServico[];
  totalServicos: string;
  totalPecas: string;
  totalAtendimento: string;
}

const DETALHES_ATENDIMENTO: Record<string, DetalheAtendimento> = {
  '972972': {
    descricaoProblema: 'Pneus dianteiros com desgaste acentuado e vibração acima de 80 km/h. Solicitada recapagem.',
    condutor: 'Marcos Lima', cliente: 'Bebidas Fruki Sa', numeroContrato: '119791', centroCusto: 'NOVO CLIENTE',
    km: '63.316', anoVeiculo: '2022/2022', modeloCompleto: 'VW - VolksWagen - 11-180 Delivery 4x2 2p (diesel)(E5)',
    itens: [
      { os: 'OS-338271', codigo: '101404', descricao: 'RECAPAGEM 235/75R17,5', observacao: 'DVRM', finalidade: 'MANUTENCAO/CONSERVACAO - FROTA', qtde: 2, valorUnitario: 'R$ 0,00', valorTotal: 'R$ 0,00', tipo: 'servico' },
      { os: 'OS-338290', codigo: '204101', descricao: 'PASTILHA DE FREIO DIANTEIRA', observacao: '—', finalidade: 'MANUTENCAO/CONSERVACAO - FROTA', qtde: 1, valorUnitario: 'R$ 210,00', valorTotal: 'R$ 210,00', tipo: 'peca' },
    ],
    totalServicos: 'R$ 0,00', totalPecas: 'R$ 210,00', totalAtendimento: 'R$ 210,00',
  },
  '957964': {
    descricaoProblema: 'Falha intermitente no sistema elétrico; luzes do painel oscilando.',
    condutor: 'Fernanda Reis', cliente: 'Bebidas Fruki Sa', numeroContrato: '119791', centroCusto: 'MATRIZ',
    km: '92.410', anoVeiculo: '2022/2022', modeloCompleto: 'VW - VolksWagen - 11-180 Delivery 4x2 2p (diesel)(E5)',
    itens: [
      { os: 'OS-330145', codigo: '305220', descricao: 'REPARO DO CHICOTE ELÉTRICO', observacao: '—', finalidade: 'MANUTENCAO/CONSERVACAO - FROTA', qtde: 1, valorUnitario: 'R$ 480,00', valorTotal: 'R$ 480,00', tipo: 'servico' },
    ],
    totalServicos: 'R$ 480,00', totalPecas: 'R$ 0,00', totalAtendimento: 'R$ 480,00',
  },
  '951200': {
    descricaoProblema: 'Veículo atingiu 130.000 km; revisão preventiva programada.',
    condutor: 'Patrícia Nunes', cliente: 'Matriz SP Ltda', numeroContrato: '120455', centroCusto: 'MATRIZ SP',
    km: '128.430', anoVeiculo: '2023/2023', modeloCompleto: 'VW - VolksWagen - 11-180 Delivery 4x2 2p (diesel)(E5)',
    itens: [
      { os: 'OS-325509', codigo: '400010', descricao: 'REVISÃO PREVENTIVA 130.000 KM', observacao: '—', finalidade: 'MANUTENCAO/CONSERVACAO - FROTA', qtde: 1, valorUnitario: 'R$ 890,00', valorTotal: 'R$ 890,00', tipo: 'servico' },
      { os: 'OS-325520', codigo: '101404', descricao: 'PNEU 235/75R17,5', observacao: '—', finalidade: 'MANUTENCAO/CONSERVACAO - FROTA', qtde: 2, valorUnitario: 'R$ 1.150,00', valorTotal: 'R$ 2.300,00', tipo: 'peca' },
      { os: 'OS-325533', codigo: '204101', descricao: 'JOGO DE PASTILHAS DE FREIO', observacao: '—', finalidade: 'MANUTENCAO/CONSERVACAO - FROTA', qtde: 1, valorUnitario: 'R$ 320,00', valorTotal: 'R$ 320,00', tipo: 'peca' },
    ],
    totalServicos: 'R$ 890,00', totalPecas: 'R$ 2.620,00', totalAtendimento: 'R$ 3.510,00',
  },
  '948877': {
    descricaoProblema: 'Colisão lateral (sinistro). Amassado na porta e lataria danificada.',
    condutor: 'Carlos Mota', cliente: 'Matriz SP Ltda', numeroContrato: '120455', centroCusto: 'MATRIZ SP',
    km: '340.120', anoVeiculo: '2023/2023', modeloCompleto: 'Volvo - FH 460 6x2 (diesel)',
    itens: [
      { os: 'OS-321880', codigo: '510300', descricao: 'FUNILARIA E PINTURA - PORTA LD', observacao: 'SINISTRO', finalidade: 'SINISTRO', qtde: 1, valorUnitario: 'R$ 3.200,00', valorTotal: 'R$ 3.200,00', tipo: 'servico' },
      { os: 'OS-321895', codigo: '305220', descricao: 'CHICOTE ELÉTRICO DA PORTA', observacao: '—', finalidade: 'SINISTRO', qtde: 1, valorUnitario: 'R$ 640,00', valorTotal: 'R$ 640,00', tipo: 'peca' },
    ],
    totalServicos: 'R$ 3.200,00', totalPecas: 'R$ 640,00', totalAtendimento: 'R$ 3.840,00',
  },
  '2066903': {
    descricaoProblema: 'Solicitação de vistoria de desmobilização do ativo.',
    condutor: '—', cliente: 'Delta Logística Ltda', numeroContrato: '121088', centroCusto: 'OPERAÇÃO SP',
    km: '—', anoVeiculo: '2021/2021', modeloCompleto: 'Mercedes - Accelo 815 (diesel)',
    itens: [
      { os: 'OS-344012', codigo: '600001', descricao: 'VISTORIA DE DESMOBILIZAÇÃO', observacao: '—', finalidade: 'DESMOBILIZAÇÃO', qtde: 1, valorUnitario: 'R$ 350,00', valorTotal: 'R$ 350,00', tipo: 'servico' },
    ],
    totalServicos: 'R$ 350,00', totalPecas: 'R$ 0,00', totalAtendimento: 'R$ 350,00',
  },
  '2066895': {
    descricaoProblema: 'Tacógrafo com selo vencido; necessária aferição obrigatória.',
    condutor: 'Marcos Lima', cliente: 'Bebidas Fruki Sa', numeroContrato: '119791', centroCusto: 'MATRIZ',
    km: '110.220', anoVeiculo: '2022/2022', modeloCompleto: 'VW - VolksWagen - 11-180 Delivery 4x2 2p (diesel)(E5)',
    itens: [
      { os: 'OS-343988', codigo: '700120', descricao: 'AFERIÇÃO DE TACÓGRAFO', observacao: '—', finalidade: 'MANUTENCAO/CONSERVACAO - FROTA', qtde: 1, valorUnitario: 'R$ 180,00', valorTotal: 'R$ 180,00', tipo: 'servico' },
      { os: 'OS-343999', codigo: '305221', descricao: 'SENSOR DO TACÓGRAFO', observacao: 'AGUARDANDO PEÇA', finalidade: 'MANUTENCAO/CONSERVACAO - FROTA', qtde: 1, valorUnitario: 'R$ 260,00', valorTotal: 'R$ 260,00', tipo: 'peca' },
    ],
    totalServicos: 'R$ 180,00', totalPecas: 'R$ 260,00', totalAtendimento: 'R$ 440,00',
  },
  '2066894': {
    descricaoProblema: 'Pneu do eixo traseiro furado; troca necessária.',
    condutor: 'Fernanda Reis', cliente: 'Delta Logística Ltda', numeroContrato: '121088', centroCusto: 'OPERAÇÃO SP',
    km: '88.500', anoVeiculo: '2021/2021', modeloCompleto: 'Mercedes - Accelo 815 (diesel)',
    itens: [
      { os: 'OS-343970', codigo: '101404', descricao: 'PNEU 235/75R17,5', observacao: '—', finalidade: 'MANUTENCAO/CONSERVACAO - FROTA', qtde: 2, valorUnitario: 'R$ 1.150,00', valorTotal: 'R$ 2.300,00', tipo: 'peca' },
    ],
    totalServicos: 'R$ 0,00', totalPecas: 'R$ 2.300,00', totalAtendimento: 'R$ 2.300,00',
  },
  '2066880': {
    descricaoProblema: 'Vazamento hidráulico e ruído na suspensão do equipamento.',
    condutor: '—', cliente: 'Obra Jundiaí S.A.', numeroContrato: '121500', centroCusto: 'OBRA JUNDIAÍ',
    km: '8.940 h', anoVeiculo: '2024/2024', modeloCompleto: 'JCB - 3CX Retroescavadeira',
    itens: [
      { os: 'OS-343900', codigo: '820044', descricao: 'REPARO SISTEMA HIDRÁULICO', observacao: '—', finalidade: 'MANUTENCAO/CONSERVACAO - FROTA', qtde: 1, valorUnitario: 'R$ 1.480,00', valorTotal: 'R$ 1.480,00', tipo: 'servico' },
      { os: 'OS-343911', codigo: '204120', descricao: 'KIT DE VEDAÇÃO HIDRÁULICA', observacao: '—', finalidade: 'MANUTENCAO/CONSERVACAO - FROTA', qtde: 1, valorUnitario: 'R$ 390,00', valorTotal: 'R$ 390,00', tipo: 'peca' },
    ],
    totalServicos: 'R$ 1.480,00', totalPecas: 'R$ 390,00', totalAtendimento: 'R$ 1.870,00',
  },
};

const DETALHE_PADRAO: DetalheAtendimento = {
  descricaoProblema: 'Sem descrição registrada no chamado.',
  condutor: '—', cliente: '—', numeroContrato: '—', centroCusto: '—', km: '—', anoVeiculo: '—', modeloCompleto: '—',
  itens: [], totalServicos: 'R$ 0,00', totalPecas: 'R$ 0,00', totalAtendimento: 'R$ 0,00',
};

const getDetalhe = (numero: string): DetalheAtendimento => DETALHES_ATENDIMENTO[numero] ?? DETALHE_PADRAO;

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

/** Dias em manutenção: da data de entrada até a saída (ou até hoje, se ainda em aberto). */
function diasEmManutencao(a: AtendimentoServico): number | null {
  const entrada = parseBR(a.dataEntrada);
  if (!entrada) return null;
  const fim = parseBR(a.saida) ?? HOJE;
  return Math.max(0, diasEntre(entrada, fim));
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
  info: 'Informação do chamado',
  servico: 'Detalhes de Serviço',
  resumo: 'Resumo do atendimento',
};

/** Monta o HTML do Resumo de Atendimento (mesmo layout do arquivo oficial). */
function gerarResumoHtml(a: AtendimentoServico, det: DetalheAtendimento): string {
  const identificacao = a.chassi !== '—' ? `Chassi: ${a.chassi}` : `Nº de Série: ${a.numeroSerie}`;
  const linhas = det.itens
    .map(
      (it) => `<tr>
        <td>${it.os}</td><td>${it.codigo}</td><td>${it.descricao}</td><td>${it.observacao}</td>
        <td>${it.finalidade}</td><td style="text-align:center">${it.qtde}</td>
        <td style="text-align:right">${it.valorUnitario}</td><td style="text-align:right">${it.valorTotal}</td>
      </tr>`,
    )
    .join('');
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
  <title>Resumo Atendimento ${a.numero}</title>
  <style>
    *{box-sizing:border-box} body{font-family:Arial,Helvetica,sans-serif;color:#0f172a;padding:28px;font-size:12px}
    h1{font-size:18px;margin:0 0 4px} h3{font-size:13px;margin:16px 0 4px}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:2px 24px;margin:10px 0}
    table{width:100%;border-collapse:collapse;margin-top:6px}
    th,td{border:1px solid #cbd5e1;padding:4px 6px;font-size:10.5px;vertical-align:top}
    th{background:#f1f5f9;text-align:left} .tot{margin-top:6px;text-align:right;font-size:12px}
  </style></head><body>
    <h1>Resumo de Atendimento</h1>
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
      <thead><tr><th>O.S.</th><th>Nº Item</th><th>Descrição</th><th>Observação</th><th>Finalidade</th><th>Qtde</th><th>Valor unit.</th><th>Valor Total</th></tr></thead>
      <tbody>${linhas || '<tr><td colspan="8" style="text-align:center">Sem itens</td></tr>'}</tbody>
    </table>
    <div class="tot"><b>Total dos Serviços:</b> ${det.totalServicos}</div>
    <div class="tot"><b>Total das Peças:</b> ${det.totalPecas}</div>
    <div class="tot"><b>Total do Atendimento:</b> ${det.totalAtendimento}</div>
  </body></html>`;
}

/** Abre o Resumo numa nova janela e dispara a impressão (salvar como PDF). */
function abrirResumoImpressao(a: AtendimentoServico, det: DetalheAtendimento) {
  const w = window.open('', '_blank', 'width=820,height=900');
  if (!w) return;
  w.document.write(gerarResumoHtml(a, det));
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 350);
}

function ModalDetalheAtendimento({
  atendimento, tipo, onFechar,
}: {
  atendimento: AtendimentoServico;
  tipo: DetalheTipo;
  onFechar: () => void;
}) {
  const det = getDetalhe(atendimento.numero);
  const identificacaoLabel = atendimento.numeroSerie !== '—' ? 'Nº de Série' : 'Chassi';
  const identificacaoValor = atendimento.numeroSerie !== '—' ? atendimento.numeroSerie : atendimento.chassi;
  const largura = tipo === 'resumo' || tipo === 'servico' ? 'max-w-2xl' : 'max-w-lg';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onFechar}>
      <div className={`max-h-[90vh] w-full ${largura} overflow-y-auto rounded-xl bg-white p-6 shadow-xl`} onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="font-mono text-xs font-semibold text-slate-500">Atendimento {atendimento.numero} · {atendimento.placa !== '—' ? atendimento.placa : atendimento.numeroSerie}</p>
            <h3 className="text-lg font-extrabold text-slate-900">{DETALHE_TITULO[tipo]}</h3>
          </div>
          <button onClick={onFechar} aria-label="Fechar" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        {/* INFORMAÇÃO: o que o usuário/condutor relatou no chamado */}
        {tipo === 'info' && (
          <div className="space-y-4 text-[13px]">
            <div className="rounded-lg border border-sky-200 bg-sky-50/60 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Problema relatado no chamado</p>
              <p className="mt-1 text-slate-800">{det.descricaoProblema}</p>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div><dt className="text-xs font-bold uppercase text-slate-400">Condutor</dt><dd className="font-semibold">{det.condutor}</dd></div>
              <div><dt className="text-xs font-bold uppercase text-slate-400">Motivo do atendimento</dt><dd className="font-semibold">{atendimento.motivo}</dd></div>
              <div><dt className="text-xs font-bold uppercase text-slate-400">Placa</dt><dd className="font-mono font-semibold">{atendimento.placa}</dd></div>
              <div><dt className="text-xs font-bold uppercase text-slate-400">{identificacaoLabel}</dt><dd className="font-mono font-semibold">{identificacaoValor}</dd></div>
              <div><dt className="text-xs font-bold uppercase text-slate-400">Marca/Modelo</dt><dd className="font-semibold">{atendimento.marcaModelo}</dd></div>
              <div><dt className="text-xs font-bold uppercase text-slate-400">Situação do veículo</dt><dd>{atendimento.situacao}</dd></div>
            </dl>
          </div>
        )}

        {/* DETALHE DE SERVIÇO: serviços e peças trocadas, separados por OS */}
        {tipo === 'servico' && (
          <div className="space-y-3 text-[13px]">
            <p className="text-xs text-slate-500">Serviços e peças registrados pela oficina, separados por ordem de serviço.</p>
            {atendimento.ordens.map((os) => {
              const itensOS = det.itens.filter((i) => i.os === os.numero);
              return (
                <div key={os.numero} className="overflow-hidden rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2">
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-700">{os.numero}</span>
                      <span className="text-xs font-semibold text-slate-600">{os.motivo}</span>
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${COR_STATUS_OS[os.status]}`}>{os.status}</span>
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
                                {it.tipo === 'peca' ? 'Peça' : 'Serviço'}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center font-mono">{it.qtde}</td>
                            <td className="px-3 py-2 text-right font-mono font-semibold text-slate-700">{it.valorTotal}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              );
            })}
            <div className="flex flex-col items-end gap-0.5 text-[13px]">
              <span className="text-slate-500">Total dos Serviços: <b className="font-mono text-slate-700">{det.totalServicos}</b></span>
              <span className="text-slate-500">Total das Peças: <b className="font-mono text-slate-700">{det.totalPecas}</b></span>
              <span className="text-slate-800">Total do Atendimento: <b className="font-mono">{det.totalAtendimento}</b></span>
            </div>
          </div>
        )}

        {/* RESUMO: documento igual ao arquivo oficial + download/impressão */}
        {tipo === 'resumo' && (
          <div className="space-y-4 text-[13px]">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => abrirResumoImpressao(atendimento, det)}
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
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Itens autorizados para manutenção (por OS)</p>
              <div className="space-y-2">
                {atendimento.ordens.map((os) => {
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
                                <td className="whitespace-nowrap px-2 py-1.5 text-right font-mono">{it.valorTotal}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 flex flex-col items-end gap-0.5">
                <span className="text-slate-500">Total dos Serviços: <b className="font-mono text-slate-700">{det.totalServicos}</b></span>
                <span className="text-slate-500">Total das Peças: <b className="font-mono text-slate-700">{det.totalPecas}</b></span>
                <span className="text-slate-800">Total do Atendimento: <b className="font-mono">{det.totalAtendimento}</b></span>
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
  const [filtroTipo, setFiltroTipo] = useState<TipoServico | 'todos'>('todos');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'aberta' | 'finalizado'>('todos');
  const [detalhe, setDetalhe] = useState<{ atendimento: AtendimentoServico; tipo: DetalheTipo } | null>(null);
  const [osExpandida, setOsExpandida] = useState<string | null>(null);
  const [osDetalhe, setOsDetalhe] = useState<{ atendimento: AtendimentoServico; os: OrdemServico } | null>(null);

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

  const linhasBase = useMemo(
    () =>
      ATENDIMENTOS_SERVICO
        .filter((a) => filtroStatus === 'todos' || a.status === filtroStatus)
        .filter((a) => filtroTipo === 'todos' || a.tipo === filtroTipo),
    [filtroStatus, filtroTipo],
  );
  const cols = useMemo<ColDef<AtendimentoServico>[]>(() => [
    { key: 'numero', get: (a) => a.numero, multi: true },
    { key: 'statusAt', get: (a) => (a.status === 'finalizado' ? 'Finalizado' : 'Em aberto') },
    { key: 'motivo', get: (a) => a.motivo },
    { key: 'placa', get: (a) => a.placa, multi: true },
    { key: 'chassi', get: (a) => a.chassi, multi: true },
    { key: 'serie', get: (a) => a.numeroSerie, multi: true },
    { key: 'modelo', get: (a) => a.marcaModelo },
    { key: 'agendamento', get: (a) => a.agendamento },
    { key: 'entrada', get: (a) => a.dataEntrada },
    { key: 'previsao', get: (a) => a.previsao },
    { key: 'saida', get: (a) => a.saida },
    { key: 'conclusao', get: (a) => a.dataConclusao },
    { key: 'situacao', get: (a) => a.situacao },
  ], []);
  const { val, set, filtradas: linhas } = useFiltrosColuna(linhasBase, cols);
  const pag = usePaginacao(linhas, 10);

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
        <KpiCard label="Disponibilidade da frota" valor={`${kpis.disponibilidade}%`} detalhe="veículos operacionais" cor="border-l-sky-600" detalheCor="text-sky-700" />
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

      {/* Relatório de veículos */}
      <SectionHeader
        titulo="Relatório de Serviços"
        subtitulo="Atendimentos e ordens de serviço da frota"
        className="mb-3"
        acao={
          <button className="btn-secondary gap-1.5 px-3 py-2 text-xs">
            <Download size={13} /> Baixar planilha
          </button>
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
        colSpan={16}
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
            <Th className="whitespace-nowrap">Previsão de Saída</Th>
            <Th className="whitespace-nowrap">Saída</Th>
            <Th className="whitespace-nowrap">Conclusão</Th>
            <Th className="whitespace-nowrap">Dias em Manutenção</Th>
            <Th className="whitespace-nowrap">Situação do Veículo</Th>
            <Th className="whitespace-nowrap">Mais detalhes</Th>
          </>
        }
        filterRow={
          <>
            <ThFiltro><ColunaFiltro value={val('numero')} onChange={set('numero')} placeholder="Nº atend." multi ariaLabel="Filtrar nº de atendimento" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('statusAt')} onChange={set('statusAt')} placeholder="Status" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('motivo')} onChange={set('motivo')} placeholder="Motivo" /></ThFiltro>
            <ThFiltro />
            <ThFiltro><ColunaFiltro value={val('placa')} onChange={set('placa')} placeholder="Placa" multi ariaLabel="Filtrar placa" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('chassi')} onChange={set('chassi')} placeholder="Chassi" multi ariaLabel="Filtrar chassi" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('serie')} onChange={set('serie')} placeholder="Nº série" multi ariaLabel="Filtrar nº de série" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('modelo')} onChange={set('modelo')} placeholder="Modelo" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('agendamento')} onChange={set('agendamento')} placeholder="Data" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('entrada')} onChange={set('entrada')} placeholder="Data" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('previsao')} onChange={set('previsao')} placeholder="Data" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('saida')} onChange={set('saida')} placeholder="Data" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('conclusao')} onChange={set('conclusao')} placeholder="Data" /></ThFiltro>
            <ThFiltro />
            <ThFiltro><ColunaFiltro value={val('situacao')} onChange={set('situacao')} placeholder="Situação" /></ThFiltro>
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
              const dias = diasEmManutencao(a);
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
                  <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs">{a.previsao}</td>
                  <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs">{a.saida}</td>
                  <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs">{a.dataConclusao}</td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    {dias != null ? (
                      <span className={`font-mono text-xs font-semibold ${emAberto ? 'text-sky-700' : 'text-slate-600'}`}>
                        {dias}d{emAberto ? ' · em curso' : ''}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-500">{a.situacao}</td>
                  <td className="whitespace-nowrap px-4 py-3.5" onClick={stopExpand}>
                    <div className="flex gap-1">
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
                    <td colSpan={16} className="px-6 py-3.5">
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
                              <th className="px-3 py-2 font-bold">Saída</th>
                              <th className="px-3 py-2 font-bold">Cobrança de avaria</th>
                              <th className="px-3 py-2 font-bold">Valor de reembolso</th>
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
                                  <td className="whitespace-nowrap px-3 py-2 text-center font-mono">{d != null ? `${d}d${os.dataSaida === '—' ? ' · em curso' : ''}` : '—'}</td>
                                  <td className="whitespace-nowrap px-3 py-2 font-mono">{os.dataEntrada}</td>
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
                                  <td className="whitespace-nowrap px-3 py-2 font-mono font-semibold text-slate-700">
                                    {os.temAvaria ? os.valorReembolso : <span className="font-sans font-normal text-slate-400">—</span>}
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
                                        onClick={() => { const det = getDetalhe(a.numero); abrirResumoImpressao(a, { ...det, itens: det.itens.filter((i) => i.os === os.numero) }); }}
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
          onFechar={() => setDetalhe(null)}
        />
      )}

      {osDetalhe && (
        <ModalDetalheOS atendimento={osDetalhe.atendimento} os={osDetalhe.os} onFechar={() => setOsDetalhe(null)} />
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
          <div><dt className="text-xs font-bold uppercase text-slate-400">Dias em manutenção</dt><dd className="font-semibold">{d != null ? `${d} dias${os.dataSaida === '—' ? ' (em curso)' : ''}` : '—'}</dd></div>
          <div><dt className="text-xs font-bold uppercase text-slate-400">Placa / Ativo</dt><dd className="font-mono font-semibold">{atendimento.placa !== '—' ? atendimento.placa : atendimento.numeroSerie}</dd></div>
        </dl>

        {itens.length > 0 && (
          <div className="mt-4">
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">Itens desta OS</p>
            <div className="space-y-1.5">
              {itens.map((it) => (
                <div key={it.codigo} className="flex items-center justify-between gap-2 rounded-md border border-slate-200 px-3 py-2 text-[13px]">
                  <span className="font-semibold text-slate-700">{it.descricao}</span>
                  <span className="font-mono text-slate-500">{it.qtde}× · {it.valorTotal}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={`mt-4 rounded-lg border px-4 py-3 ${os.temAvaria ? 'border-amber-200 bg-amber-50/60' : 'border-slate-200 bg-slate-50'}`}>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Cobrança de avaria</p>
          {os.temAvaria ? (
            <>
              <p className="mt-1 text-[15px] font-extrabold text-amber-800">{os.valorReembolso}</p>
              <p className="text-xs text-slate-500">Valor de reembolso estimado para esta OS. O detalhamento aparecerá na <b>Cobrança desta Avarias</b>.</p>
            </>
          ) : (
            <p className="mt-1 text-sm font-semibold text-slate-600">Sem cobrança de avaria para esta OS.</p>
          )}
        </div>
      </div>
    </div>
  );
}
