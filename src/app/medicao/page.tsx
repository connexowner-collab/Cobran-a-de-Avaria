'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronDown } from 'lucide-react';

type RowMedicao = {
  id: string;
  centroCusto: string;
  cnpj: string;
  cliente: string;
  segmento: string;
  responsavelMedicao: string;
  vigenciaMes: string;
  frota: string;
  valorMedicao: string;
  tipoEmissao: string;
};

const MOCK_DATA: RowMedicao[] = [
  {
    id: '1',
    centroCusto: '123456',
    cnpj: '06.012.137/0001-01',
    cliente: 'LUCAS PESSOA DUARTE',
    segmento: 'Agro',
    responsavelMedicao: '38.223.490 Lucas Rosa Leite',
    vigenciaMes: 'Fevereiro',
    frota: '1',
    valorMedicao: 'R$ 113.933,34',
    tipoEmissao: 'Provisão',
  },
  {
    id: '2',
    centroCusto: '123456',
    cnpj: '86.012.137/0001-81',
    cliente: 'LUCAS PESSOA DUARTE',
    segmento: 'Agro',
    responsavelMedicao: '38.225.400 Lucas Rosa Leite',
    vigenciaMes: 'Março',
    frota: '1',
    valorMedicao: 'R$ 7.128,04',
    tipoEmissao: 'Provisão',
  },
];

function matchCol(filtro: string, valor: string): boolean {
  return !String(filtro).trim() || String(valor).toLowerCase().includes(String(filtro).trim().toLowerCase());
}

export default function MedicaoPage() {
  const [filtroCentroCusto, setFiltroCentroCusto] = useState('');
  const [filtroCnpj, setFiltroCnpj] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroSegmento, setFiltroSegmento] = useState('');
  const [filtroResponsavel, setFiltroResponsavel] = useState('');
  const [filtroVigenciaMes, setFiltroVigenciaMes] = useState('');
  const [filtroFrota, setFiltroFrota] = useState('');
  const [filtroValorMedicao, setFiltroValorMedicao] = useState('');
  const [filtroTipoEmissao, setFiltroTipoEmissao] = useState('');

  const filtered = useMemo(
    () =>
      MOCK_DATA.filter(
        (r) =>
          matchCol(filtroCentroCusto, r.centroCusto) &&
          matchCol(filtroCnpj, r.cnpj) &&
          matchCol(filtroCliente, r.cliente) &&
          matchCol(filtroSegmento, r.segmento) &&
          matchCol(filtroResponsavel, r.responsavelMedicao) &&
          matchCol(filtroVigenciaMes, r.vigenciaMes) &&
          matchCol(filtroFrota, r.frota) &&
          matchCol(filtroValorMedicao, r.valorMedicao) &&
          matchCol(filtroTipoEmissao, r.tipoEmissao)
      ),
    [
      filtroCentroCusto,
      filtroCnpj,
      filtroCliente,
      filtroSegmento,
      filtroResponsavel,
      filtroVigenciaMes,
      filtroFrota,
      filtroValorMedicao,
      filtroTipoEmissao,
    ]
  );

  const FilterInput = ({
    value,
    onChange,
    placeholder = 'Filtrar...',
    ariaLabel,
    showSearch = true,
  }: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    ariaLabel: string;
    showSearch?: boolean;
  }) => (
    <div className="relative min-w-0">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className={`input-field input-field--no-border py-1.5 pl-2 text-xs ${showSearch ? 'pr-8' : 'pr-2'}`}
        aria-label={ariaLabel}
      />
      {showSearch && (
        <Search className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" aria-hidden />
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-slate-900">Medição</h2>

      <div className="table-container">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Centro de Custo</th>
              <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">CNPJ</th>
              <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Cliente</th>
              <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Segmento</th>
              <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Responsável pela Medição</th>
              <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Vigência Mês</th>
              <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Frota</th>
              <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Valor Medição</th>
              <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Tipo de Emissão</th>
              <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600" />
            </tr>
            <tr className="border-t border-slate-200 bg-slate-100/80">
              <th className="px-2 py-1.5">
                <FilterInput value={filtroCentroCusto} onChange={setFiltroCentroCusto} ariaLabel="Filtrar centro de custo" />
              </th>
              <th className="px-2 py-1.5">
                <FilterInput value={filtroCnpj} onChange={setFiltroCnpj} ariaLabel="Filtrar CNPJ" />
              </th>
              <th className="px-2 py-1.5">
                <FilterInput value={filtroCliente} onChange={setFiltroCliente} ariaLabel="Filtrar cliente" />
              </th>
              <th className="px-2 py-1.5">
                <FilterInput value={filtroSegmento} onChange={setFiltroSegmento} ariaLabel="Filtrar segmento" />
              </th>
              <th className="px-2 py-1.5">
                <FilterInput value={filtroResponsavel} onChange={setFiltroResponsavel} ariaLabel="Filtrar responsável pela medição" />
              </th>
              <th className="px-2 py-1.5">
                <FilterInput value={filtroVigenciaMes} onChange={setFiltroVigenciaMes} ariaLabel="Filtrar vigência mês" />
              </th>
              <th className="px-2 py-1.5">
                <FilterInput value={filtroFrota} onChange={setFiltroFrota} ariaLabel="Filtrar frota" />
              </th>
              <th className="px-2 py-1.5">
                <FilterInput value={filtroValorMedicao} onChange={setFiltroValorMedicao} placeholder="R$ 0,00" ariaLabel="Filtrar valor medição" showSearch={false} />
              </th>
              <th className="px-2 py-1.5">
                <FilterInput value={filtroTipoEmissao} onChange={setFiltroTipoEmissao} ariaLabel="Filtrar tipo de emissão" />
              </th>
              <th className="px-2 py-1.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-10 text-center text-slate-600">
                  Nenhum registro encontrado. Ajuste os filtros.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50">
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-900">{r.centroCusto}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-600">{r.cnpj}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-600">{r.cliente}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-600">{r.segmento}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-600">{r.responsavelMedicao}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-600">{r.vigenciaMes}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-600">{r.frota}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-600">{r.valorMedicao}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-600">{r.tipoEmissao}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-right">
                    <button
                      type="button"
                      className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-primary-600"
                      title="Ações"
                      aria-label="Ações"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
