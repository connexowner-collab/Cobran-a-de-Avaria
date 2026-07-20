'use client';

import { Search } from 'lucide-react';

/** Peças visuais compartilhadas das telas do Portal do Cliente. */

/*
 * ─────────────────────────────────────────────────────────────────
 *  PADRÃO DE ABA DO PORTAL
 *  Toda tela segue a mesma anatomia, de cima para baixo:
 *    <PageTitle />        cabeçalho: título + subtítulo + ação primária
 *    <KpiRow />           (opcional) faixa de indicadores
 *    <SectionCard />      blocos de conteúdo em card com título padronizado
 *    <Toolbar />          filtros (esquerda) + busca/ações (direita)
 *    <DataTable />        tabelas com cabeçalho, vazio e paginação padrão
 *  Use estes componentes em vez de remontar a marcação em cada página.
 * ─────────────────────────────────────────────────────────────────
 */

/* eslint-disable @next/next/no-img-element */
/** Logomarca oficial: pin do Grupo Vamos + texto GRUPO/VAMOS. */
export function LogoVamos({ altura = 34 }: { altura?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <img
        src="/grupo-vamos-squarelogo-1642582508943.webp"
        alt="Grupo Vamos"
        style={{ height: altura }}
        className="w-auto object-contain"
      />
      <span className="flex flex-col text-left leading-none">
        <span className="text-[9px] font-bold tracking-[0.28em] text-slate-800">GRUPO</span>
        <span className="text-[22px] font-black leading-[0.9] tracking-tight text-primary-600">
          VAMOS<span className="align-super text-[8px] font-bold">®</span>
        </span>
      </span>
    </span>
  );
}

export function PageTitle({
  titulo, subtitulo, novo, acao,
}: {
  titulo: string;
  subtitulo: string;
  novo?: boolean;
  acao?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="flex items-center gap-2.5 text-[26px] font-extrabold text-slate-900">
          {titulo}
          {novo && (
            <span className="rounded-full bg-primary-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-700">
              Novo
            </span>
          )}
        </h1>
        <p className="mt-0.5 text-[13px] text-slate-500">{subtitulo}</p>
      </div>
      {acao}
    </div>
  );
}

const BADGE_STYLES: Record<string, string> = {
  // Chamados
  aberto: 'bg-primary-50 text-primary-700',
  atendimento: 'bg-amber-50 text-amber-700',
  aguardando: 'bg-sky-50 text-sky-700',
  escalonado: 'bg-rose-50 text-rose-700',
  resolvido: 'bg-emerald-50 text-emerald-700',
  // Documentos / CRLV
  valido: 'bg-emerald-50 text-emerald-700',
  vencendo: 'bg-amber-50 text-amber-700',
  vencido: 'bg-rose-50 text-rose-700',
  vigente: 'bg-emerald-50 text-emerald-700',
  a_vencer: 'bg-amber-50 text-amber-700',
  sem: 'bg-slate-100 text-slate-500',
  // Faturas
  pago: 'bg-emerald-50 text-emerald-700',
  // Veículos / telemetria
  ativo: 'bg-emerald-50 text-emerald-700',
  manutencao: 'bg-amber-50 text-amber-700',
  parado: 'bg-slate-100 text-slate-600',
  rota: 'bg-emerald-50 text-emerald-700',
  // Avarias / multas / agendamentos
  analise: 'bg-sky-50 text-sky-700',
  aprovada: 'bg-amber-50 text-amber-700',
  contestada: 'bg-violet-50 text-violet-700',
  paga: 'bg-emerald-50 text-emerald-700',
  notificada: 'bg-amber-50 text-amber-700',
  em_recurso: 'bg-sky-50 text-sky-700',
  vencida: 'bg-rose-50 text-rose-700',
  confirmado: 'bg-emerald-50 text-emerald-700',
  concluido: 'bg-slate-100 text-slate-600',
};

export function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${
        BADGE_STYLES[status] ?? 'bg-slate-100 text-slate-600'
      }`}
    >
      {label}
    </span>
  );
}

export function FilterChip({
  label, active, onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
        active
          ? 'bg-primary-600 text-white'
          : 'border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
      }`}
    >
      {label}
    </button>
  );
}

export function KpiCard({
  label, valor, detalhe, cor = 'border-l-slate-400', detalheCor = 'text-slate-500',
}: {
  label: string;
  valor: string;
  detalhe?: string;
  cor?: string;
  detalheCor?: string;
}) {
  return (
    <div className={`card border-l-4 p-5 ${cor}`}>
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-[32px] font-extrabold leading-none text-slate-900">{valor}</p>
      {detalhe && <p className={`mt-2 text-xs font-semibold ${detalheCor}`}>{detalhe}</p>}
    </div>
  );
}

export function BarraProgresso({ pct, cor = 'bg-[#0e2233]' }: { pct: number; cor?: string }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full ${cor}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Faixa de indicadores padrão (2 colunas no mobile, N no desktop). */
export function KpiRow({ cols = 4, children }: { cols?: 3 | 4; children: React.ReactNode }) {
  const grid = cols === 3 ? 'md:grid-cols-3' : 'xl:grid-cols-4';
  return <div className={`mb-6 grid grid-cols-2 gap-4 ${grid}`}>{children}</div>;
}

/** Título de seção padronizado (usado dentro e fora de card). */
export function SectionHeader({
  titulo, subtitulo, acao, className = '',
}: {
  titulo: string;
  subtitulo?: string;
  acao?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-end justify-between gap-3 ${className}`}>
      <div>
        <p className="text-sm font-bold text-slate-800">{titulo}</p>
        {subtitulo && <p className="text-xs text-slate-500">{subtitulo}</p>}
      </div>
      {acao}
    </div>
  );
}

/** Bloco de conteúdo em card com título padronizado. */
export function SectionCard({
  titulo, subtitulo, acao, children, className = '',
}: {
  titulo?: string;
  subtitulo?: string;
  acao?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`card p-5 ${className}`}>
      {titulo && <SectionHeader titulo={titulo} subtitulo={subtitulo} acao={acao} className="mb-4" />}
      {children}
    </div>
  );
}

/** Barra de filtros + busca/ações. Filtros à esquerda, resto empurrado à direita. */
export function Toolbar({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`mb-4 flex flex-wrap items-center gap-2.5 ${className}`}>{children}</div>;
}

/** Empurra o conteúdo seguinte para a direita dentro de uma Toolbar. */
export function ToolbarSpacer() {
  return <div className="flex-1" />;
}

/** Separador vertical entre grupos de filtros. */
export function ToolbarDivider() {
  return <span className="mx-1 h-5 w-px bg-slate-200" />;
}

/** Campo de busca padronizado. */
export function SearchInput({
  value, onChange, placeholder = 'Buscar...', largura = 'w-44',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  largura?: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
      <Search size={14} className="text-slate-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${largura} border-none bg-transparent font-mono text-xs outline-none placeholder:text-slate-400`}
      />
    </div>
  );
}

/** Tabela padronizada: cabeçalho, estado vazio e rodapé (paginação) consistentes. */
export function DataTable({
  head, children, vazio, vazioLabel = 'Nenhum registro encontrado.', colSpan = 1, footer,
}: {
  head: React.ReactNode;
  children: React.ReactNode;
  vazio?: boolean;
  vazioLabel?: string;
  colSpan?: number;
  footer?: React.ReactNode;
}) {
  return (
    <div className="table-container">
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-500">
            {head}
          </tr>
        </thead>
        <tbody>
          {vazio ? (
            <tr>
              <td colSpan={colSpan} className="px-4 py-10 text-center text-sm text-slate-400">
                {vazioLabel}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
      {footer}
    </div>
  );
}

/** Célula de cabeçalho de tabela padronizada. */
export function Th({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 font-bold ${className}`}>{children}</th>;
}

/** Rodapé de paginação padrão (padrão Cobrança Avaria). */
export function TablePagination({
  info, opcoes = [5, 10, 25], valor = 5,
}: {
  info: string;
  opcoes?: number[];
  valor?: number;
}) {
  return (
    <div className="pagination">
      <span className="pagination-info">{info}</span>
      <div className="pagination-controls">
        <select defaultValue={String(valor)}>
          {opcoes.map((o) => (
            <option key={o} value={o}>{o} linhas</option>
          ))}
        </select>
      </div>
    </div>
  );
}
