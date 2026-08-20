'use client';

import { Fragment, useMemo, useState } from 'react';
import {
  ChevronRight, Download, UserCheck, Clock, X, Check,
  FileDown, Bell, Info, CircleDollarSign, Wallet, MessageSquare, MessageCircle, type LucideIcon,
} from 'lucide-react';
import { MULTAS, VEICULOS, modeloDaPlaca, type Multa } from '@/lib/portalData';
import {
  PageTitle, StatusBadge, KpiCard, KpiRow, FunilEtapas,
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

/* Régua (linha do tempo) do processo administrativo da multa. */
type Regua = 'notificacao' | 'identificacao' | 'paga' | 'reembolsado';
const REGUA_ORDEM: Regua[] = ['notificacao', 'identificacao', 'paga', 'reembolsado'];
const REGUA_LABEL: Record<Regua, string> = {
  notificacao: 'Notificação',
  identificacao: 'Identificação do Condutor',
  paga: 'Multa paga para o órgão',
  reembolsado: 'Valor Reembolsado',
};
const REGUA_ICON: Record<Regua, LucideIcon> = {
  notificacao: Bell,
  identificacao: UserCheck,
  paga: CircleDollarSign,
  reembolsado: Wallet,
};
/** Chave usada no StatusBadge (cor) para cada etapa da régua. */
const REGUA_BADGE: Record<Regua, string> = {
  notificacao: 'notificada',                 // âmbar
  identificacao: 'aguardando_identificacao', // índigo
  paga: 'analise',                           // azul
  reembolsado: 'resolvido',                  // verde
};
/** Etapa da régua em que a multa se encontra. */
function reguaDe(m: Multa): Regua {
  if (m.reembolsado) return 'reembolsado';
  if (m.status === 'paga') return 'paga';
  if (m.status === 'aguardando_identificacao') return 'identificacao';
  return 'notificacao'; // notificada, em_recurso, vencida
}

/** Ação pendente do cliente: multa aguardando identificação, ainda não identificada
 *  e dentro do prazo (é onde aparece o botão "Identificar condutor"). */
function acaoPendente(m: Multa): boolean {
  if (m.status !== 'aguardando_identificacao' || m.condutorIdentificado) return false;
  const sla = slaIdentificacao(m.prazoIdentificacao);
  return sla ? sla.liberado : true;
}

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

/** Classifica o prazo de identificação em semáforo (para o KPI). */
function bucketPrazo(prazo?: string): 'vermelho' | 'amarelo' | 'verde' | null {
  const p = prazo ? parseBR(prazo) : null;
  if (!p) return null;
  const dias = diasEntre(HOJE, p);
  if (dias <= 0) return 'vermelho';
  if (dias <= 7) return 'amarelo';
  return 'verde';
}

/** Gera e baixa um modelo de procuração (.doc editável) pré-preenchido com os dados da multa. */
function baixarProcuracao(m: Multa) {
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Procuração - ${m.auto}</title>
<style>body{font-family:Arial,Helvetica,sans-serif;font-size:12pt;line-height:1.7;margin:2.5cm}h1{text-align:center;font-size:14pt;margin-bottom:24px}.linha{margin-top:22px}.ass{margin-top:52px}</style></head>
<body>
<h1>PROCURAÇÃO PARA INDICAÇÃO DE CONDUTOR</h1>
<p>Pelo presente instrumento particular, o(a) <b>OUTORGANTE</b> (proprietário(a)/possuidor(a) do veículo de placa <b>${m.placa}</b>) nomeia e constitui seu bastante procurador(a) o(a) <b>OUTORGADO(A)</b> abaixo qualificado(a), condutor(a) responsável pela infração de trânsito registrada no Auto de Infração <b>${m.auto}</b> — ${m.infracao}, ocorrida em <b>${m.data}</b>, no local ${m.local} — com poderes específicos para assumir a responsabilidade pela referida infração e assinar o formulário de identificação do condutor junto ao órgão autuador.</p>
<p class="linha"><b>OUTORGANTE (empresa / proprietário):</b><br>Nome / Razão social: ____________________________________________<br>CNPJ / CPF: ______________________________</p>
<p class="linha"><b>OUTORGADO (condutor responsável):</b><br>Nome: ____________________________________________<br>CPF: ____________________&nbsp;&nbsp;CNH nº: ____________________&nbsp;&nbsp;Categoria: ______</p>
<p class="linha">Local e data: ______________________________, ______ / ______ / __________.</p>
<p class="ass">_________________________________________<br>Assinatura do OUTORGANTE</p>
<p class="ass">_________________________________________<br>Assinatura do OUTORGADO (condutor)</p>
</body></html>`;
  const blob = new Blob(['﻿', html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Procuracao-${m.auto}.doc`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ------------------------------------------------------------------ *
 * Modal instrucional de identificação do condutor: prazo + como fazer +
 * procuração + dados da empresa. A indicação é feita pelo cliente no órgão
 * (Senatran/carteira digital); a situação da identificação vem do SERPRO.
 * ------------------------------------------------------------------ */
function ModalIdentificarCondutor({ multa, onFechar }: { multa: Multa; onFechar: () => void }) {
  // Dados da empresa/proprietário — vêm do PDV, somente leitura.
  const empresa = { razaoSocial: 'Vamos Locação S.A.', cnpj: '12.345.678/0001-90', responsavel: 'Lucas Pessoa Duarte' };
  const sla = slaIdentificacao(multa.prazoIdentificacao);
  const prazoVencido = !!sla && !sla.liberado;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onFechar}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-semibold text-slate-500">{multa.auto} · {multa.placa}</p>
            <h3 className="text-lg font-extrabold text-slate-900">Identificar condutor</h3>
            <p className="mt-0.5 text-[13px] text-slate-500">{multa.infracao}</p>
          </div>
          <button onClick={onFechar} aria-label="Fechar" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><X size={18} /></button>
        </div>

        {/* Prazo */}
        {sla && (
          <div className={`mb-4 flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-[12px] font-semibold ${
            prazoVencido ? 'bg-rose-50 text-rose-700' : bucketPrazo(multa.prazoIdentificacao) === 'amarelo' ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'
          }`}>
            <Clock size={15} /> {prazoVencido ? 'Prazo de identificação encerrado' : 'Prazo para identificação'}: <b>{multa.prazoIdentificacao}</b> · {sla.label}
          </div>
        )}

        {prazoVencido ? (
          <div className="rounded-lg bg-slate-50 px-3.5 py-3 text-[13px] text-slate-600">
            O prazo para indicar o condutor ao órgão foi encerrado. Não é mais possível fazer a indicação; a responsabilidade permanece com o proprietário/empresa (pontuação e pagamento seguem no veículo).
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-lg bg-sky-50 px-3.5 py-3 text-[12px] text-sky-900">
              <p className="mb-1 font-bold">Como fazer a indicação:</p>
              <ol className="ml-4 list-decimal space-y-0.5">
                <li>Baixe o modelo de procuração já preenchido com os dados da multa.</li>
                <li>Preencha os dados do condutor no documento e colha as assinaturas.</li>
                <li>Faça a indicação do condutor no órgão (Senatran / carteira digital) dentro do prazo.</li>
              </ol>
            </div>
            <button type="button" onClick={() => baixarProcuracao(multa)} className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary-200 bg-primary-50 py-2.5 text-[13px] font-semibold text-primary-700 hover:bg-primary-100">
              <FileDown size={16} /> Baixar modelo de procuração
            </button>
            <div className="rounded-lg border border-slate-200 bg-slate-50/60">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
                <p className="text-[13px] font-bold text-slate-700">Dados da empresa / proprietário</p>
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-500">via PDV</span>
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 px-4 py-3 text-[13px]">
                <div><dt className="text-[11px] text-slate-400">Razão social</dt><dd className="font-semibold text-slate-800">{empresa.razaoSocial}</dd></div>
                <div><dt className="text-[11px] text-slate-400">CNPJ</dt><dd className="font-mono text-slate-700">{empresa.cnpj}</dd></div>
                <div className="col-span-2"><dt className="text-[11px] text-slate-400">Responsável</dt><dd className="font-semibold text-slate-800">{empresa.responsavel}</dd></div>
              </dl>
            </div>
          </div>
        )}

        <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
          <button type="button" onClick={onFechar} className="btn-primary text-[13px]">Entendi</button>
        </div>
      </div>
    </div>
  );
}

/** Número do WhatsApp da Central de Multas e link com mensagem pré-preenchida. */
const WHATSAPP_CENTRAL = '5511978379385';
function linkWhatsApp(texto: string): string {
  return `https://wa.me/${WHATSAPP_CENTRAL}?text=${encodeURIComponent(texto)}`;
}

/* ------------------------------------------------------------------ *
 * Central de Multas: redireciona o cliente para o WhatsApp da equipe de multas.
 * ------------------------------------------------------------------ */
function ModalCentralMultas({ multa, onFechar }: { multa: Multa; onFechar: () => void }) {
  /* Mensagem pré-preenchida para o WhatsApp (dados da multa + solicitante). */
  const msgWhatsApp = [
    'Olá! Preciso de suporte sobre uma multa.',
    '',
    `AIT: ${multa.auto}`,
    `Placa: ${multa.placa}`,
    `Infração: ${multa.infracao}`,
    'Solicitante: Lucas Pessoa',
  ].join('\n');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onFechar}>
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6 pb-4">
          <div>
            <p className="font-mono text-xs font-semibold text-slate-500">{multa.auto} · {multa.placa}</p>
            <h3 className="mt-0.5 text-lg font-extrabold text-slate-900">Central de Multas</h3>
            <p className="mt-0.5 text-[13px] text-slate-500">{multa.infracao}</p>
          </div>
          <button onClick={onFechar} aria-label="Fechar" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><X size={18} /></button>
        </div>

        {/* Conversa */}
        <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 p-6">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Fale com a equipe de multas</p>
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl bg-white px-3.5 py-2.5 text-[13px] text-slate-700 shadow-sm">
              <p className="mb-0.5 text-[11px] font-semibold text-slate-500">Central de Multas · Vamos</p>
              <p>Olá! Fale com a equipe de multas pelo WhatsApp — prazo de identificação, como indicar o condutor, contestação ou valor. Ao clicar abaixo, você é redirecionado com uma mensagem já preenchida com os dados desta multa.</p>
            </div>
          </div>
        </div>

        {/* Ação: WhatsApp */}
        <div className="border-t border-slate-100 p-4">
          <a
            href={linkWhatsApp(msgWhatsApp)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-emerald-700"
          >
            <MessageCircle size={16} /> Entrar em contato pelo WhatsApp
          </a>
          <p className="mt-2 text-center text-[11px] text-slate-400">Você será redirecionado ao WhatsApp com uma mensagem já preenchida com os dados desta multa.</p>
        </div>
      </div>
    </div>
  );
}

export default function MultasPage() {
  const [filtro, setFiltro] = useState<Regua | 'todos'>('todos');
  /** Filtro pelo prazo de identificação (semáforo) — null = sem filtro. */
  const [filtroPrazo, setFiltroPrazo] = useState<'vermelho' | 'amarelo' | 'verde' | null>(null);
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [identificar, setIdentificar] = useState<Multa | null>(null);
  const [chatMulta, setChatMulta] = useState<Multa | null>(null);

  // Agrupamento acumulado por placa — a visão principal desta tela.
  const porPlacaBase = useMemo(() => {
    const grupos = new Map<string, Multa[]>();
    MULTAS.forEach((m) => {
      grupos.set(m.placa, [...(grupos.get(m.placa) ?? []), m]);
    });
    return Array.from(grupos.entries())
      .map(([placa, multas]) => {
        return {
          placa,
          modelo: modeloDaPlaca(placa),
          qtd: multas.length,
          valor: multas.reduce((s, m) => s + valorNum(m.valor), 0),
          pontos: multas.reduce((s, m) => s + m.pontos, 0),
          pendentes: multas.filter(acaoPendente).length,
        };
      })
      .sort((a, b) => b.qtd - a.qtd || b.valor - a.valor);
  }, []);
  const topPlacas = porPlacaBase.slice(0, TOP_N);

  /* Ranking dos condutores indicados com mais multas (top 5). */
  const topCondutores = useMemo(() => {
    const mapa = new Map<string, { qtd: number; placas: Set<string> }>();
    MULTAS.forEach((m) => {
      if (!m.condutor) return;
      const e = mapa.get(m.condutor) ?? { qtd: 0, placas: new Set<string>() };
      e.qtd++;
      e.placas.add(m.placa);
      mapa.set(m.condutor, e);
    });
    return Array.from(mapa.entries())
      .map(([nome, v]) => ({ nome, qtd: v.qtd, placas: v.placas.size }))
      .sort((a, b) => b.qtd - a.qtd)
      .slice(0, TOP_N);
  }, []);

  // Multas que batem com o filtro de status + filtros por coluna.
  const multasBase = useMemo(() => MULTAS.filter((m) => {
    if (filtro !== 'todos' && reguaDe(m) !== filtro) return false;
    if (filtroPrazo) {
      if (m.status !== 'aguardando_identificacao') return false;
      if (bucketPrazo(m.prazoIdentificacao) !== filtroPrazo) return false;
    }
    return true;
  }), [filtro, filtroPrazo]);
  const cols = useMemo<ColDef<Multa>[]>(() => [
    { key: 'placa', get: (m) => m.placa, multi: true },
    { key: 'auto', get: (m) => m.auto, multi: true },
    { key: 'infracao', get: (m) => m.infracao },
    { key: 'data', get: (m) => m.data },
    { key: 'valor', get: (m) => m.valor },
    { key: 'prazo', get: (m) => m.prazo },
    { key: 'status', get: (m) => STATUS_LABEL[m.status] },
    { key: 'condutor', get: (m) => m.condutor ?? '' },
  ], []);
  const { val, set, filtradas: linhasFiltradas } = useFiltrosColuna(multasBase, cols);

  // Agrupa o resultado filtrado por placa, mantendo só quem tem alguma multa correspondente.
  const grupos = useMemo(() => {
    const map = new Map<string, Multa[]>();
    linhasFiltradas.forEach((m) => map.set(m.placa, [...(map.get(m.placa) ?? []), m]));
    return Array.from(map.entries())
      .map(([placa, multas]) => {
        return {
          placa,
          modelo: modeloDaPlaca(placa),
          multas,
          valor: multas.reduce((s, m) => s + valorNum(m.valor), 0),
          pontos: multas.reduce((s, m) => s + m.pontos, 0),
          pendentes: multas.filter(acaoPendente).length,
        };
      })
      .sort((a, b) => b.multas.length - a.multas.length);
  }, [linhasFiltradas]);

  const pag = usePaginacao(grupos, 10);

  // Com filtro de status ou busca ativos, expande automaticamente os grupos com resultado.
  const filtroAtivo = filtro !== 'todos' || filtroPrazo !== null || !!val('condutor');
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
  const identSemaforo = useMemo(() => {
    const cont = { vermelho: 0, amarelo: 0, verde: 0 };
    MULTAS.filter((m) => m.status === 'aguardando_identificacao').forEach((m) => {
      const b = bucketPrazo(m.prazoIdentificacao);
      if (b) cont[b] += 1;
    });
    return cont;
  }, []);

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

      {/* Aviso: os valores são o valor original da multa no órgão (não o valor final cobrado). */}
      <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[12px] text-rose-700">
        <Info size={15} className="mt-0.5 shrink-0" />
        <p>Os valores exibidos são o <b>valor original da multa no órgão autuador</b>. No reembolso à Vamos pode ser acrescida a <b>taxa administrativa do seu contrato</b> — valor sujeito a alteração.</p>
      </div>

      <KpiRow>
        <KpiCard label="Total de multas" valor={String(totalMultas)} detalhe={`${placasComMulta} veículos envolvidos`} cor="border-l-[#0e2233]" />
        <KpiCard label="Aguardando identificação" valor={String(aguardandoIdent)} detalhe="condutor a identificar" cor="border-l-indigo-500" detalheCor="text-indigo-700" />
        <KpiCard label="Valor total (órgão)" valor={fmtBRL(valorTotal)} detalhe="Soma dos valores do órgão" cor="border-l-primary-600" detalheCor="text-primary-700" />
        <KpiCard label="Placas com multas" valor={String(placasComMulta)} detalhe={`de ${VEICULOS.length} veículos na frota`} cor="border-l-sky-600" />
      </KpiRow>

      {/* KPI semáforo — prazos de identificação do condutor */}
      {aguardandoIdent > 0 && (
        <div className="card mb-6 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-indigo-50/60 px-5 py-3">
            <div className="flex items-center gap-2">
              <UserCheck size={16} className="text-indigo-600" />
              <span className="text-[13px] font-bold text-slate-800">Identificação de condutor — acompanhe os prazos</span>
            </div>
            <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Bell size={13} className="text-amber-500" /> Enviamos lembretes automáticos conforme o prazo se aproxima
            </span>
          </div>
          <div className="grid grid-cols-3 divide-x divide-slate-100">
            {([
              { k: 'vermelho', label: 'Urgente', sub: 'vencidas ou vence hoje', dot: 'bg-rose-500', txt: 'text-rose-600', ativoBg: 'bg-rose-50 ring-1 ring-inset ring-rose-200', n: identSemaforo.vermelho },
              { k: 'amarelo', label: 'Prazo próximo', sub: 'até 7 dias', dot: 'bg-amber-500', txt: 'text-amber-600', ativoBg: 'bg-amber-50 ring-1 ring-inset ring-amber-200', n: identSemaforo.amarelo },
              { k: 'verde', label: 'No prazo', sub: 'mais de 7 dias', dot: 'bg-emerald-500', txt: 'text-emerald-600', ativoBg: 'bg-emerald-50 ring-1 ring-inset ring-emerald-200', n: identSemaforo.verde },
            ] as const).map((s) => {
              const ativo = filtroPrazo === s.k;
              return (
              <button
                key={s.k}
                onClick={() => setFiltroPrazo((prev) => (prev === s.k ? null : s.k))}
                aria-pressed={ativo}
                className={`relative flex flex-col items-start gap-1 px-3 py-3 text-left transition sm:px-5 sm:py-4 ${ativo ? s.ativoBg : 'hover:bg-slate-50'}`}
              >
                {ativo && <Check size={14} className={`absolute right-2 top-2 sm:right-3 sm:top-3 ${s.txt}`} />}
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 sm:gap-2 sm:text-[12px]"><i className={`h-2.5 w-2.5 shrink-0 rounded-full ${s.dot}`} /> {s.label}</span>
                <span className={`text-2xl font-extrabold sm:text-3xl ${s.txt}`}>{s.n}</span>
                <span className="text-[11px] text-slate-400">{s.sub}</span>
              </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Régua (linha do tempo) do processo da multa — clique para filtrar a lista. */}
      <FunilEtapas
        titulo="Situação da multa"
        subtitulo="Etapas do processo · clique numa etapa para filtrar a lista abaixo"
        etapas={REGUA_ORDEM.map((k) => ({
          key: k,
          label: REGUA_LABEL[k],
          icon: REGUA_ICON[k],
          count: MULTAS.filter((m) => reguaDe(m) === k).length,
        }))}
        ativo={filtro === 'todos' ? null : filtro}
        onSelecionar={(k) => setFiltro((k as Regua) ?? 'todos')}
        className="mb-6"
      />

      {/* Rankings lado a lado: veículos e condutores com mais multas. */}
      <div className="mb-6 grid items-start gap-4 lg:grid-cols-2">
      <SectionCard
        titulo="Top veículos com mais multas"
        subtitulo={`Os ${Math.min(TOP_N, placasComMulta)} veículos com mais ocorrências — clique para ver o detalhe na lista abaixo`}
      >
        <div className="divide-y divide-slate-100">
          {topPlacas.map((p, i) => {
            const ativo = val('placa') === p.placa;
            return (
            <button
              key={p.placa}
              onClick={() => {
                set('placa')(ativo ? '' : p.placa);
                setExpandidos((prev) => new Set(prev).add(p.placa));
              }}
              aria-pressed={ativo}
              className={`-mx-2 flex w-[calc(100%+1rem)] items-center gap-4 rounded-lg px-2 py-3 text-left transition ${ativo ? 'bg-primary-50 ring-1 ring-inset ring-primary-200' : 'hover:bg-slate-50'}`}
            >
              <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-slate-100 text-[12px] font-extrabold text-slate-600">
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
            </button>
            );
          })}
        </div>
      </SectionCard>

      {/* Ranking de condutores indicados com mais multas */}
      <SectionCard
        titulo="Top condutores indicados com mais multas"
        subtitulo="Condutores indicados com maior número de multas na frota"
      >
        {topCondutores.length === 0 ? (
          <p className="py-4 text-center text-[13px] text-slate-400">Nenhum condutor indicado até o momento.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {topCondutores.map((c, i) => {
              const ativoCond = val('condutor') === c.nome;
              return (
              <button
                key={c.nome}
                onClick={() => set('condutor')(ativoCond ? '' : c.nome)}
                aria-pressed={ativoCond}
                className={`-mx-2 flex w-[calc(100%+1rem)] items-center gap-4 rounded-lg px-2 py-3 text-left transition ${ativoCond ? 'bg-primary-50 ring-1 ring-inset ring-primary-200' : 'hover:bg-slate-50'}`}
              >
                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-slate-100 text-[12px] font-extrabold text-slate-600">
                  {i + 1}º
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-800">{c.nome}</p>
                  <p className="truncate text-xs text-slate-400">clique para filtrar a lista</p>
                </div>
                <div className="flex-none text-right">
                  <p className="font-mono text-sm font-bold text-slate-800">
                    {c.qtd} <span className="text-xs font-semibold text-slate-400">multa{c.qtd > 1 ? 's' : ''}</span>
                  </p>
                  <p className="text-xs text-slate-500">Indicado em {c.placas} ativo{c.placas > 1 ? 's' : ''}</p>
                </div>
              </button>
              );
            })}
          </div>
        )}
      </SectionCard>
      </div>

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
        colSpan={7}
        vazio={grupos.length === 0}
        vazioLabel="Nenhuma multa encontrada com os filtros atuais."
        filterRow={
          <>
            <ThFiltro />
            <ThFiltro><ColunaFiltro value={val('placa')} onChange={set('placa')} placeholder="Placa" multi ariaLabel="Filtrar placa" /></ThFiltro>
            <ThFiltro />
            <ThFiltro />
            <ThFiltro />
            <ThFiltro />
            <ThFiltro />
          </>
        }
        head={
          <>
            <Th className="w-10" />
            <Th>Veículo</Th>
            <Th>Qtd multas</Th>
            <Th>Valor total (órgão)</Th>
            <Th>Pontos</Th>
            <Th>Ações Pendentes</Th>
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
                className={`cursor-pointer border-b border-slate-200 transition-colors ${aberto ? 'bg-primary-50 hover:bg-primary-100/70' : 'bg-slate-100 hover:bg-slate-200/70'}`}
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
                <td className="px-4 py-3">
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
                      {g.pendentes} {g.pendentes > 1 ? 'Ações Pendentes' : 'Ação Pendente'}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end">
                    <button className="btn-secondary gap-1.5 px-3 py-1.5 text-xs">
                      <Download size={13} /> Todas do veículo
                    </button>
                  </div>
                </td>
              </tr>

              {/* Multas do veículo (expansível) — sub-tabela com cabeçalho próprio */}
              {aberto && (
                <tr>
                  <td colSpan={7} className="bg-slate-50/70 p-0">
                    <div className="px-5 py-3">
                      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                        <table className="w-full text-left text-[13px]">
                          <thead className="bg-slate-50">
                            <tr className="text-[10px] uppercase tracking-wide text-slate-500">
                              <th className="w-10 px-3 py-2" />
                              <th className="px-3 py-2 font-bold">Auto</th>
                              <th className="px-3 py-2 font-bold">Infração</th>
                              <th className="px-3 py-2 font-bold">Data</th>
                              <th className="px-3 py-2 font-bold">Valor original (órgão)</th>
                              <th className="px-3 py-2 text-center font-bold">Pontos</th>
                              <th className="px-3 py-2 font-bold">Prazo de identificação</th>
                              <th className="px-3 py-2 font-bold">Identificação do condutor</th>
                              <th className="px-3 py-2 font-bold">Nome do Indicado</th>
                              <th className="px-3 py-2 font-bold">Status</th>
                              <th className="px-3 py-2 text-center font-bold">Paga ao órgão</th>
                              <th className="px-3 py-2 text-center font-bold">Reembolsada à Vamos</th>
                              <th className="px-3 py-2 text-right font-bold">Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {g.multas.map((m) => {
                              const ehIdent = reguaDe(m) === 'identificacao';
                              const slaM = ehIdent ? slaIdentificacao(m.prazoIdentificacao) : null;
                              const identVencido = !!slaM && !slaM.liberado;
                              return (
                              <tr key={m.auto} className={`border-t border-slate-100 hover:bg-slate-50 ${selecionados.has(m.auto) ? 'bg-primary-50/40' : ''}`}>
                                <td className="px-3 py-2">
                                  <input type="checkbox" checked={selecionados.has(m.auto)} onChange={() => toggleUma(m.auto)} aria-label={`Selecionar ${m.auto}`} className="h-4 w-4 rounded border-slate-300" />
                                </td>
                                <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-slate-500">{m.auto}</td>
                                <td className="px-3 py-2">
                                  <p className="font-semibold text-slate-800">{m.infracao}</p>
                                  <p className="text-xs text-slate-500">{m.local}</p>
                                </td>
                                <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{m.data}</td>
                                <td className="whitespace-nowrap px-3 py-2 font-mono font-semibold">{m.valor}</td>
                                <td className="px-3 py-2 text-center font-mono text-xs">{m.pontos}</td>
                                <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{m.prazo}</td>
                                <td className="px-3 py-2">
                                  {m.condutorIdentificado === 'identificado' ? (
                                    <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-600"><Check size={12} /> Identificado</span>
                                  ) : m.condutorIdentificado === 'nao' || (ehIdent && identVencido) ? (
                                    <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-rose-600"><X size={12} /> Não identificado</span>
                                  ) : ehIdent ? (
                                    <span className="text-[12px] text-slate-400">Pendente</span>
                                  ) : (
                                    <span className="text-slate-300">—</span>
                                  )}
                                </td>
                                <td className="whitespace-nowrap px-3 py-2 text-slate-700">{m.condutor ?? '—'}</td>
                                <td className="whitespace-nowrap px-3 py-2">
                                  <StatusBadge status={REGUA_BADGE[reguaDe(m)]} label={REGUA_LABEL[reguaDe(m)]} />
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {m.status === 'paga' ? (
                                    <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-600"><Check size={12} /> Sim</span>
                                  ) : (
                                    <span className="text-slate-300">—</span>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {m.status !== 'paga' ? (
                                    <span className="text-slate-300">—</span>
                                  ) : m.reembolsado ? (
                                    <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-600"><Check size={12} /> Sim</span>
                                  ) : (
                                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">Não</span>
                                  )}
                                </td>
                                <td className="px-3 py-2">
                                  <div className="flex justify-end gap-1.5">
                                    {ehIdent && !m.condutorIdentificado && !identVencido && (
                                      <button type="button" onClick={() => setIdentificar(m)} title="Como identificar o condutor" className="btn-primary gap-1.5 whitespace-nowrap px-3 py-1.5 text-xs">
                                        <UserCheck size={13} /> Identificar condutor
                                      </button>
                                    )}
                                    <button type="button" onClick={() => setChatMulta(m)} title="Falar com a Central de Multas" aria-label="Falar com a Central de Multas" className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100 hover:text-primary-700">
                                      <MessageSquare size={15} />
                                    </button>
                                    <button className="btn-secondary gap-1.5 whitespace-nowrap px-3 py-1.5 text-xs">
                                      <Download size={13} /> Notificação
                                    </button>
                                  </div>
                                </td>
                              </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          );
        })}
      </DataTable>

      {identificar && (
        <ModalIdentificarCondutor
          multa={identificar}
          onFechar={() => setIdentificar(null)}
        />
      )}

      {chatMulta && (
        <ModalCentralMultas multa={chatMulta} onFechar={() => setChatMulta(null)} />
      )}
    </div>
  );
}
