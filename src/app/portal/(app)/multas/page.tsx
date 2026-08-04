'use client';

import { Fragment, useMemo, useState } from 'react';
import {
  ChevronRight, Download, UserCheck, Clock, X, Check, IdCard,
  FileSignature, FileDown, Bell, ArrowLeft, ArrowRight,
} from 'lucide-react';
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

/** Classifica o prazo de identificação em semáforo (para o KPI). */
function bucketPrazo(prazo?: string): 'vermelho' | 'amarelo' | 'verde' | null {
  const p = prazo ? parseBR(prazo) : null;
  if (!p) return null;
  const dias = diasEntre(HOJE, p);
  if (dias <= 0) return 'vermelho';
  if (dias <= 7) return 'amarelo';
  return 'verde';
}

const CATEGORIAS_CNH = ['A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE'];

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

/* Área de upload compacta e reutilizável. */
function UploadDoc({ file, onFile, icon, titulo, dica }: { file: File | null; onFile: (f: File | null) => void; icon: React.ReactNode; titulo: string; dica: string }) {
  return (
    <label className="group flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/60 px-4 py-5 text-center transition hover:border-primary-400 hover:bg-primary-50/40">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm transition group-hover:text-primary-600">
        {file ? <Check size={17} className="text-emerald-600" /> : icon}
      </span>
      <span className="text-[13px] font-semibold text-slate-600">{file ? file.name : titulo}</span>
      <span className="text-[11px] text-slate-400">{dica}</span>
      <input type="file" accept="image/*,application/pdf,.doc,.docx" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
    </label>
  );
}

/* ------------------------------------------------------------------ *
 * Wizard de identificação do condutor: passo a passo + procuração + envio.
 * ------------------------------------------------------------------ */
const PASSOS_IDENT = ['Condutor', 'Documentos', 'Revisão'];

function ModalIdentificarCondutor({ multa, onFechar, onRegistrar }: { multa: Multa; onFechar: () => void; onRegistrar: (auto: string, resultado: 'identificado' | 'nao') => void }) {
  const [passo, setPasso] = useState(0);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [cnh, setCnh] = useState('');
  const [categoria, setCategoria] = useState('');
  const [fotoCnh, setFotoCnh] = useState<File | null>(null);
  const [procuracao, setProcuracao] = useState<File | null>(null);
  const [resultado, setResultado] = useState<'' | 'identificado' | 'nao'>('');
  const [motivoNao, setMotivoNao] = useState('');
  const [enviado, setEnviado] = useState(false);
  const sla = slaIdentificacao(multa.prazoIdentificacao);
  const prazoVencido = !!sla && !sla.liberado;
  const protocolo = `ID-${multa.auto.replace(/\D/g, '').slice(-6)}-${new Date().getFullYear()}`;

  const inputCls = 'input-field w-full py-2.5 text-[13px]';
  const label = 'mb-1 block text-[13px] font-semibold text-slate-600';

  const validCondutor = nome.trim().length >= 5 && cpf.replace(/\D/g, '').length === 11 && cnh.replace(/\D/g, '').length >= 9 && !!categoria;
  const validDocs = !!fotoCnh && !!procuracao;
  const podeAvancar = (passo === 0 && validCondutor) || (passo === 1 && validDocs) || (passo === 2 && resultado !== '');

  const registrar = (r: 'identificado' | 'nao') => { onRegistrar(multa.auto, r); setEnviado(true); };
  const avancar = () => {
    if (passo === 2) { if (resultado) registrar(resultado); return; }
    setPasso((p) => p + 1);
  };

  /* Pergunta final (reutilizada no fluxo normal e no caso de prazo vencido). */
  const blocoPergunta = (
    <div>
      <p className="mb-2 text-[13px] font-semibold text-slate-700">O condutor foi identificado?</p>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setResultado('identificado')} className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-[13px] font-semibold transition ${resultado === 'identificado' ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          <UserCheck size={16} /> Sim, identificado
        </button>
        <button type="button" onClick={() => setResultado('nao')} className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-[13px] font-semibold transition ${resultado === 'nao' ? 'border-slate-400 bg-slate-100 text-slate-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          <X size={16} /> Não identificado
        </button>
      </div>
      {resultado === 'nao' && (
        <div className="mt-3 space-y-2">
          <div className="rounded-lg bg-amber-50 px-3.5 py-2.5 text-[12px] text-amber-900">
            O proprietário/empresa assume a infração — pontos e pagamento seguem no veículo. A ação fica registrada no histórico.
          </div>
          <textarea value={motivoNao} onChange={(e) => setMotivoNao(e.target.value)} placeholder="Motivo (opcional): condutor não localizado, veículo compartilhado…" className="input-field w-full py-2.5 text-[13px]" rows={2} />
        </div>
      )}
    </div>
  );

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

        {enviado ? (
          <div className="flex flex-col items-center py-8 text-center">
            {resultado === 'nao' ? (
              <>
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-600"><X size={26} /></span>
                <h4 className="mt-4 text-base font-extrabold text-slate-900">Registrado: condutor não identificado</h4>
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  A multa <b className="font-mono">{multa.auto}</b> permanece de responsabilidade do proprietário/empresa — pontuação e pagamento seguem no veículo. Registro adicionado ao histórico.
                </p>
              </>
            ) : (
              <>
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><Check size={28} /></span>
                <h4 className="mt-4 text-base font-extrabold text-slate-900">Condutor identificado!</h4>
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  A identificação {nome ? <>de <b>{nome}</b> </> : ''}para a multa <b className="font-mono">{multa.auto}</b> foi registrada. Registro adicionado ao histórico.
                </p>
              </>
            )}
            <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 font-mono text-[13px] font-bold text-slate-700">Protocolo: {protocolo}</p>
            <button className="btn-secondary mt-6 text-[13px]" onClick={onFechar}>Fechar</button>
          </div>
        ) : prazoVencido ? (
          /* Prazo vencido: só a pergunta, sem o wizard */
          <div className="space-y-3">
            <div className="rounded-lg bg-rose-50 px-3.5 py-2.5 text-[12px] font-semibold text-rose-700">
              <Clock size={14} className="mr-1 inline" />Prazo de identificação encerrado ({multa.prazoIdentificacao}). Não é mais possível indicar o condutor ao órgão — registre o desfecho:
            </div>
            {blocoPergunta}
            <div className="mt-5 flex justify-between gap-2 border-t border-slate-100 pt-4">
              <button type="button" onClick={onFechar} className="btn-secondary text-[13px]">Cancelar</button>
              <button type="button" onClick={() => resultado && registrar(resultado)} disabled={!resultado} className="btn-primary gap-1.5 text-[13px]"><Check size={15} /> Registrar</button>
            </div>
          </div>
        ) : (
          <>
            {/* Prazo */}
            {sla && (
              <div className={`mb-4 flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-[12px] font-semibold ${bucketPrazo(multa.prazoIdentificacao) === 'amarelo' ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}>
                <Clock size={15} /> Prazo para identificação: <b>{multa.prazoIdentificacao}</b> · {sla.label}
              </div>
            )}

            {/* Stepper */}
            <div className="mb-5 flex items-center gap-2">
              {PASSOS_IDENT.map((p, i) => (
                <div key={p} className="flex items-center gap-2">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${i < passo ? 'bg-emerald-500 text-white' : i === passo ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {i < passo ? <Check size={12} /> : i + 1}
                  </span>
                  <span className={`text-[12px] font-semibold ${i === passo ? 'text-slate-900' : 'text-slate-400'}`}>{p}</span>
                  {i < PASSOS_IDENT.length - 1 && <span className="h-px w-6 bg-slate-200" />}
                </div>
              ))}
            </div>

            {/* Passo 1 — Condutor */}
            {passo === 0 && (
              <div className="space-y-3">
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
                    <label className={label}><span className="text-primary-600">*</span>Categoria</label>
                    <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={inputCls}>
                      <option value="">Selecione</option>
                      {CATEGORIAS_CNH.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={label}><span className="text-primary-600">*</span>Nº da CNH</label>
                  <input value={cnh} onChange={(e) => setCnh(e.target.value.replace(/\D/g, '').slice(0, 11))} placeholder="Registro da CNH" inputMode="numeric" className={`${inputCls} font-mono`} autoComplete="off" />
                </div>
              </div>
            )}

            {/* Passo 2 — Documentos (procuração + CNH) */}
            {passo === 1 && (
              <div className="space-y-3">
                <div className="rounded-lg bg-sky-50 px-3.5 py-3 text-[12px] text-sky-900">
                  <p className="mb-1 font-bold">Como fazer a indicação:</p>
                  <ol className="ml-4 list-decimal space-y-0.5">
                    <li>Baixe o modelo de procuração já preenchido com os dados da multa.</li>
                    <li>Preencha os dados e colha a assinatura do proprietário e do condutor.</li>
                    <li>Anexe a procuração assinada e a foto da CNH do condutor.</li>
                  </ol>
                </div>
                <button type="button" onClick={() => baixarProcuracao(multa)} className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary-200 bg-primary-50 py-2.5 text-[13px] font-semibold text-primary-700 hover:bg-primary-100">
                  <FileDown size={16} /> Baixar modelo de procuração
                </button>
                <div>
                  <label className={label}><span className="text-primary-600">*</span>Procuração assinada</label>
                  <UploadDoc file={procuracao} onFile={setProcuracao} icon={<FileSignature size={17} />} titulo="Anexar procuração assinada" dica="PDF, imagem ou Word" />
                </div>
                <div>
                  <label className={label}><span className="text-primary-600">*</span>Foto da CNH do condutor</label>
                  <UploadDoc file={fotoCnh} onFile={setFotoCnh} icon={<IdCard size={17} />} titulo="Anexar foto da CNH" dica="Frente da CNH legível (JPG, PNG)" />
                </div>
              </div>
            )}

            {/* Passo 3 — Revisão + pergunta final */}
            {passo === 2 && (
              <div className="space-y-4 text-[13px]">
                <div className="rounded-lg border border-slate-200">
                  <div className="border-b border-slate-100 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-500">Condutor</div>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 px-4 py-3">
                    <div><dt className="text-[11px] text-slate-400">Nome</dt><dd className="font-semibold text-slate-800">{nome}</dd></div>
                    <div><dt className="text-[11px] text-slate-400">CPF</dt><dd className="font-mono text-slate-700">{cpf}</dd></div>
                    <div><dt className="text-[11px] text-slate-400">CNH</dt><dd className="font-mono text-slate-700">{cnh} · cat. {categoria}</dd></div>
                    <div><dt className="text-[11px] text-slate-400">Documentos</dt><dd className="font-semibold text-emerald-700">Procuração + CNH anexadas</dd></div>
                  </dl>
                </div>
                {blocoPergunta}
              </div>
            )}

            {/* Rodapé */}
            <div className="mt-5 flex justify-between gap-2 border-t border-slate-100 pt-4">
              <button type="button" onClick={() => (passo === 0 ? onFechar() : setPasso((p) => p - 1))} className="btn-secondary gap-1.5 text-[13px]">
                {passo === 0 ? 'Cancelar' : <><ArrowLeft size={14} /> Voltar</>}
              </button>
              <button type="button" onClick={avancar} disabled={!podeAvancar} className="btn-primary gap-1.5 text-[13px]">
                {passo === 2 ? (resultado === 'nao' ? <><Check size={15} /> Registrar</> : <><UserCheck size={15} /> Enviar identificação</>) : <>Continuar <ArrowRight size={14} /></>}
              </button>
            </div>
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
  /** Histórico de desfecho por multa (identificado / não identificado). */
  const [registros, setRegistros] = useState<Record<string, 'identificado' | 'nao'>>({});

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

      <KpiRow>
        <KpiCard label="Total de multas" valor={String(totalMultas)} detalhe={`${placasComMulta} veículos envolvidos`} cor="border-l-[#0e2233]" />
        <KpiCard label="Aguardando identificação" valor={String(aguardandoIdent)} detalhe="condutor a identificar" cor="border-l-indigo-500" detalheCor="text-indigo-700" />
        <KpiCard label="Valor total" valor={fmtBRL(valorTotal)} detalhe="todas as multas" cor="border-l-primary-600" detalheCor="text-primary-700" />
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
              { k: 'vermelho', label: 'Urgente', sub: 'vencidas ou vence hoje', dot: 'bg-rose-500', txt: 'text-rose-600', n: identSemaforo.vermelho },
              { k: 'amarelo', label: 'Prazo próximo', sub: 'até 7 dias', dot: 'bg-amber-500', txt: 'text-amber-600', n: identSemaforo.amarelo },
              { k: 'verde', label: 'No prazo', sub: 'mais de 7 dias', dot: 'bg-emerald-500', txt: 'text-emerald-600', n: identSemaforo.verde },
            ] as const).map((s) => (
              <button key={s.k} onClick={() => setFiltro('aguardando_identificacao')} className="flex flex-col items-start gap-1 px-5 py-4 text-left transition hover:bg-slate-50">
                <span className="flex items-center gap-2 text-[12px] font-semibold text-slate-500"><i className={`h-2.5 w-2.5 rounded-full ${s.dot}`} /> {s.label}</span>
                <span className={`text-3xl font-extrabold ${s.txt}`}>{s.n}</span>
                <span className="text-[11px] text-slate-400">{s.sub}</span>
              </button>
            ))}
          </div>
        </div>
      )}

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
                        const reg = registros[m.auto];
                        if (reg) {
                          return (
                            <p className={`mt-1 flex items-center gap-1 text-[11px] font-bold ${reg === 'identificado' ? 'text-emerald-600' : 'text-slate-500'}`}>
                              {reg === 'identificado' ? <><Check size={11} /> Condutor identificado</> : <><X size={11} /> Não identificado (registrado)</>}
                            </p>
                          );
                        }
                        const sla = slaIdentificacao(m.prazoIdentificacao);
                        return sla ? <p className={`mt-1 flex items-center gap-1 text-[11px] font-bold ${sla.cls}`}><Clock size={11} /> {sla.label}</p> : null;
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        {m.status === 'aguardando_identificacao' && !registros[m.auto] && (() => {
                          const sla = slaIdentificacao(m.prazoIdentificacao);
                          const vencido = sla ? !sla.liberado : false;
                          return (
                            <button
                              type="button"
                              onClick={() => setIdentificar(m)}
                              title={vencido ? 'Prazo encerrado — registrar desfecho' : 'Identificar condutor'}
                              className="btn-primary gap-1.5 px-3 py-1.5 text-xs"
                            >
                              <UserCheck size={13} /> {vencido ? 'Registrar desfecho' : 'Identificar condutor'}
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

      {identificar && (
        <ModalIdentificarCondutor
          multa={identificar}
          onFechar={() => setIdentificar(null)}
          onRegistrar={(auto, r) => setRegistros((prev) => ({ ...prev, [auto]: r }))}
        />
      )}
    </div>
  );
}
