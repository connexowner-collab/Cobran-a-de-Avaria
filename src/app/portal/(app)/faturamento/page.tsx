'use client';

import { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { FATURAS, type FaturaStatus } from '@/lib/portalData';
import {
  PageTitle, StatusBadge, FilterChip, KpiCard, KpiRow, Toolbar, ToolbarSpacer,
  DataTable, Th, TablePagination,
} from '@/components/portal/ui';

const STATUS_LABEL: Record<FaturaStatus, string> = {
  pago: 'Pago',
  aberto: 'Em aberto',
  vencido: 'Vencido',
};

const FILTROS: Array<{ key: FaturaStatus | 'todos'; label: string }> = [
  { key: 'todos', label: 'Todas' },
  { key: 'aberto', label: 'Em aberto' },
  { key: 'pago', label: 'Pagas' },
  { key: 'vencido', label: 'Vencidas' },
];

export default function FaturamentoPage() {
  const [filtro, setFiltro] = useState<FaturaStatus | 'todos'>('todos');
  const faturas = FATURAS.filter((f) => filtro === 'todos' || f.status === filtro);

  return (
    <div>
      <PageTitle
        titulo="Faturamento"
        subtitulo="Faturas, boletos e notas fiscais da locação — 2ª via imediata, sem depender do financeiro"
      />

      <KpiRow cols={3}>
        <KpiCard label="Faturado no mês" valor="R$ 184.250" detalhe="Competência 07/2026" cor="border-l-[#0e2233]" />
        <KpiCard label="Em aberto" valor="R$ 184.250" detalhe="1 fatura a vencer" cor="border-l-amber-500" detalheCor="text-amber-600" />
        <KpiCard label="Vencido" valor="R$ 24.310" detalhe="1 fatura em atraso" cor="border-l-primary-600" detalheCor="text-primary-700" />
      </KpiRow>

      <Toolbar>
        {FILTROS.map((f) => (
          <FilterChip key={f.key} label={f.label} active={filtro === f.key} onClick={() => setFiltro(f.key)} />
        ))}
        <ToolbarSpacer />
        <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
          <option>Competência 2026</option>
          <option>Competência 2025</option>
        </select>
      </Toolbar>

      <DataTable
        colSpan={6}
        vazio={faturas.length === 0}
        vazioLabel="Nenhuma fatura encontrada com os filtros atuais."
        head={
          <>
            <Th>Nota fiscal</Th>
            <Th>Competência</Th>
            <Th>Valor</Th>
            <Th>Vencimento</Th>
            <Th>Status</Th>
            <Th />
          </>
        }
        footer={<TablePagination info={`Mostrando ${faturas.length} de ${FATURAS.length} faturas`} />}
      >
        {faturas.map((f) => (
          <tr key={f.nf} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
            <td className="px-4 py-3.5 font-mono font-semibold text-slate-800">{f.nf}</td>
            <td className="px-4 py-3.5 font-mono text-xs text-slate-500">{f.competencia}</td>
            <td className="px-4 py-3.5 font-mono font-semibold">{f.valor}</td>
            <td className="px-4 py-3.5 font-mono text-xs">{f.vencimento}</td>
            <td className="px-4 py-3.5"><StatusBadge status={f.status} label={STATUS_LABEL[f.status]} /></td>
            <td className="px-4 py-3.5">
              <div className="flex justify-end gap-2">
                <button className="btn-secondary gap-1.5 px-3 py-1.5 text-xs">
                  <Download size={13} /> Boleto
                </button>
                <button className="btn-secondary gap-1.5 px-3 py-1.5 text-xs">
                  <FileText size={13} /> NF-e
                </button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
