'use client';

import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { VEICULOS } from '@/lib/portalData';
import {
  PageTitle, KpiCard, KpiRow, BarraProgresso, FilterChip, Toolbar, ToolbarSpacer,
  SearchInput, DataTable, Th, TablePagination, SectionCard, usePaginacao,
} from '@/components/portal/ui';

const FROTA_TOTAL = 42;

const MODELOS = [
  { nome: 'VW 11-180 Delivery', categoria: 'Caminhão leve', qtd: 14, anoMedio: '2022' },
  { nome: 'Mercedes Accelo 815', categoria: 'Caminhão médio', qtd: 9, anoMedio: '2021' },
  { nome: 'Volvo FH 460', categoria: 'Caminhão pesado', qtd: 6, anoMedio: '2023' },
  { nome: 'JCB 3CX', categoria: 'Retroescavadeira', qtd: 4, anoMedio: '2024' },
  { nome: 'Case CX210', categoria: 'Escavadeira', qtd: 3, anoMedio: '2023' },
  { nome: 'Manitou MRT', categoria: 'Manipulador telescópico', qtd: 2, anoMedio: '2024' },
  { nome: 'Outros modelos', categoria: 'Diversos', qtd: 4, anoMedio: '—' },
];

const CATEGORIAS = ['Todas', ...Array.from(new Set(VEICULOS.map((v) => v.categoria)))];

export default function ModelosPage() {
  const [categoria, setCategoria] = useState('Todas');
  const [modeloAtivo, setModeloAtivo] = useState<string | null>(null);
  const [busca, setBusca] = useState('');

  const veiculos = useMemo(() => {
    return VEICULOS
      .filter((v) => categoria === 'Todas' || v.categoria === categoria)
      .filter((v) => !modeloAtivo || v.modelo === modeloAtivo)
      .filter(
        (v) =>
          !busca ||
          v.placa.toLowerCase().includes(busca.toLowerCase()) ||
          v.modelo.toLowerCase().includes(busca.toLowerCase()),
      );
  }, [categoria, modeloAtivo, busca]);

  const modelosVisiveis = MODELOS.filter((m) => categoria === 'Todas' || m.categoria === categoria);

  const pag = usePaginacao(veiculos, 10);

  return (
    <div>
      <PageTitle
        titulo="Modelos"
        subtitulo="Composição da frota por modelo e categoria"
        acao={
          <button className="btn-secondary gap-1.5 text-[13px]">
            <Download size={14} /> Baixar planilha
          </button>
        }
      />

      <KpiRow cols={3}>
        <KpiCard label="Frota total" valor={String(FROTA_TOTAL)} detalhe="veículos e equipamentos" cor="border-l-[#0e2233]" />
        <KpiCard label="Modelos distintos" valor="6" detalhe="+ outros modelos" cor="border-l-sky-600" />
        <KpiCard label="Modelo predominante" valor="VW 11-180" detalhe="33% da frota" cor="border-l-primary-600" />
      </KpiRow>

      {/* Filtro por categoria */}
      <Toolbar>
        {CATEGORIAS.map((c) => (
          <FilterChip key={c} label={c} active={categoria === c} onClick={() => { setCategoria(c); setModeloAtivo(null); }} />
        ))}
      </Toolbar>

      {/* Composição por modelo — tabela compacta que escala com muitas variações.
          Cada linha é clicável para filtrar a listagem de veículos abaixo. */}
      <SectionCard titulo="Composição por modelo" subtitulo="Clique em um modelo para filtrar os veículos" className="mb-6 !p-0 overflow-hidden">
        <div className="max-h-[420px] overflow-y-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-500">
                <Th>Modelo</Th>
                <Th className="hidden sm:table-cell">Categoria</Th>
                <Th className="hidden md:table-cell text-center">Ano médio</Th>
                <Th className="text-right">Unidades</Th>
                <Th className="w-[34%] min-w-[9rem]">% da frota</Th>
              </tr>
            </thead>
            <tbody>
              {modelosVisiveis.map((m) => {
                const pct = Math.round((m.qtd / FROTA_TOTAL) * 100);
                const ativo = modeloAtivo === m.nome;
                return (
                  <tr
                    key={m.nome}
                    onClick={() => setModeloAtivo(ativo ? null : m.nome)}
                    className={`cursor-pointer border-b border-slate-100 last:border-0 transition ${ativo ? 'bg-primary-50' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${ativo ? 'text-primary-700' : 'text-slate-800'}`}>{m.nome}</span>
                      <span className="mt-0.5 block text-xs text-slate-500 sm:hidden">{m.categoria}</span>
                    </td>
                    <td className="hidden px-4 py-3 text-slate-500 sm:table-cell">{m.categoria}</td>
                    <td className="hidden px-4 py-3 text-center font-mono text-xs text-slate-500 md:table-cell">{m.anoMedio}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">{m.qtd}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1"><BarraProgresso pct={pct} cor={ativo ? 'bg-primary-600' : 'bg-[#0e2233]'} /></div>
                        <span className="w-9 shrink-0 text-right font-mono text-xs font-semibold text-slate-500">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Listagem individual de veículos */}
      <Toolbar>
        <span className="text-sm font-bold text-slate-800">
          Veículos {modeloAtivo ? `· ${modeloAtivo}` : ''}
        </span>
        <ToolbarSpacer />
        <SearchInput value={busca} onChange={setBusca} placeholder="Placa ou modelo..." />
      </Toolbar>

      <DataTable
        colSpan={6}
        vazio={veiculos.length === 0}
        vazioLabel="Nenhum veículo encontrado com os filtros atuais."
        head={
          <>
            <Th>Placa</Th>
            <Th>Modelo</Th>
            <Th>Categoria</Th>
            <Th>Ano</Th>
            <Th>Km</Th>
            <Th>Contrato</Th>
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
        {pag.pageItens.map((v) => (
          <tr key={v.placa} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
            <td className="px-4 py-3.5">
              <span className="rounded-md border border-slate-200 px-2 py-1 font-mono text-xs font-semibold">{v.placa}</span>
            </td>
            <td className="px-4 py-3.5 font-semibold text-slate-800">{v.modelo}</td>
            <td className="px-4 py-3.5 text-xs text-slate-500">{v.categoria}</td>
            <td className="px-4 py-3.5 font-mono text-xs">{v.anoModelo}</td>
            <td className="px-4 py-3.5 font-mono text-xs">{v.km}</td>
            <td className="px-4 py-3.5 font-mono text-xs text-slate-500">{v.contrato}</td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
