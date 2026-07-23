'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Download } from 'lucide-react';
import { VEICULOS, type VeiculoFrota } from '@/lib/portalData';
import {
  PageTitle, KpiCard, BarraProgresso, KpiRow, SectionCard, DataTable, Th, TablePagination,
  Toolbar, ToolbarSpacer, FilterChip, usePaginacao,
  ColunaFiltro, ThFiltro, useFiltrosColuna, type ColDef,
} from '@/components/portal/ui';

const ABAS = [
  { key: 'idade', label: 'Idade da frota' },
  { key: 'km', label: 'Quilometragem' },
  { key: 'regiao', label: 'Distribuição da frota' },
];

const ANO_REFERENCIA = 2026;

function faixaIdade(anoModelo: string): string {
  const idade = ANO_REFERENCIA - Number(anoModelo);
  if (idade <= 1) return '0-1 ano';
  if (idade <= 2) return '1-2 anos';
  if (idade <= 3) return '2-3 anos';
  if (idade <= 4) return '3-4 anos';
  return '4+ anos';
}

const IDADE_FAIXAS = [
  { label: '0-1 ano', valor: 14, h: 70 },
  { label: '1-2 anos', valor: 20, h: 100 },
  { label: '2-3 anos', valor: 16, h: 80 },
  { label: '3-4 anos', valor: 9, h: 45 },
  { label: '4+ anos', valor: 5, h: 25 },
];

const REGIOES = [
  { nome: 'Sudeste', qtd: 22, pct: 52 },
  { nome: 'Sul', qtd: 9, pct: 22 },
  { nome: 'Nordeste', qtd: 6, pct: 14 },
  { nome: 'Centro-Oeste', qtd: 3, pct: 8 },
  { nome: 'Norte', qtd: 2, pct: 4 },
];

function AbaIdade() {
  const [faixaAtiva, setFaixaAtiva] = useState<string | null>(null);

  const veiculosBase = useMemo(() => VEICULOS.filter((v) => !faixaAtiva || faixaIdade(v.anoModelo) === faixaAtiva), [faixaAtiva]);
  const cols = useMemo<ColDef<VeiculoFrota>[]>(() => [
    { key: 'placa', get: (v) => v.placa, multi: true },
    { key: 'modelo', get: (v) => v.modelo },
    { key: 'ano', get: (v) => v.anoModelo },
    { key: 'idade', get: (v) => faixaIdade(v.anoModelo) },
  ], []);
  const { val, set, filtradas: veiculos } = useFiltrosColuna(veiculosBase, cols);

  const pag = usePaginacao(veiculos, 10);

  return (
    <>
      <KpiRow cols={3}>
        <KpiCard label="Idade média" valor="2,3 anos" cor="border-l-[#0e2233]" />
        <KpiCard label="Mais antigo" valor="6 anos" cor="border-l-amber-500" />
        <KpiCard label="Renovados (12m)" valor="9" cor="border-l-sky-600" />
      </KpiRow>
      <SectionCard titulo="Distribuição por faixa de idade" subtitulo="Clique em uma faixa para filtrar a listagem abaixo" className="mb-6">
        <div className="flex h-52 items-end gap-5 px-2">
          {IDADE_FAIXAS.map((f) => {
            const ativa = faixaAtiva === f.label;
            return (
              <button
                key={f.label}
                onClick={() => setFaixaAtiva(ativa ? null : f.label)}
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <span className={`font-mono text-xs font-bold ${ativa ? 'text-primary-700' : 'text-slate-700'}`}>{f.valor}</span>
                <div
                  className={`w-full rounded-t-lg transition ${ativa ? 'bg-primary-600' : 'bg-[#0e2233] hover:bg-[#173049]'}`}
                  style={{ height: `${f.h}%` }}
                />
                <span className={`text-[11px] ${ativa ? 'font-bold text-primary-700' : 'text-slate-500'}`}>{f.label}</span>
              </button>
            );
          })}
        </div>
      </SectionCard>

      <Toolbar>
        <span className="text-sm font-bold text-slate-800">Veículos {faixaAtiva ? `· ${faixaAtiva}` : ''}</span>
      </Toolbar>

      <DataTable
        colSpan={4}
        vazio={veiculos.length === 0}
        vazioLabel="Nenhum veículo encontrado com os filtros atuais."
        head={
          <>
            <Th>Placa</Th>
            <Th>Modelo</Th>
            <Th>Ano modelo</Th>
            <Th>Idade</Th>
          </>
        }
        filterRow={
          <>
            <ThFiltro><ColunaFiltro value={val('placa')} onChange={set('placa')} placeholder="Placa" multi ariaLabel="Filtrar placa" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('modelo')} onChange={set('modelo')} placeholder="Modelo" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('ano')} onChange={set('ano')} placeholder="Ano" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('idade')} onChange={set('idade')} placeholder="Idade" /></ThFiltro>
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
            <td className="px-4 py-3.5 font-mono font-semibold">{v.placa}</td>
            <td className="px-4 py-3.5">{v.modelo}</td>
            <td className="px-4 py-3.5 font-mono text-xs">{v.anoModelo}</td>
            <td className="px-4 py-3.5 text-xs text-slate-500">{faixaIdade(v.anoModelo)}</td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}

const FILTROS_KM: Array<{ key: 'todos' | 'acima' | 'dentro'; label: string }> = [
  { key: 'todos', label: 'Todos' },
  { key: 'acima', label: 'Acima da meta' },
  { key: 'dentro', label: 'Dentro da meta' },
];
const META_KM_MES = 5000;

function AbaKm() {
  const [filtro, setFiltro] = useState<'todos' | 'acima' | 'dentro'>('todos');

  const veiculosBase = useMemo(() =>
    VEICULOS.filter((v) => v.kmMes !== '—').filter((v) => {
      if (filtro === 'todos') return true;
      const kmMes = Number(v.kmMes.replace(/\D/g, ''));
      return filtro === 'acima' ? kmMes > META_KM_MES : kmMes <= META_KM_MES;
    }),
  [filtro]);
  const cols = useMemo<ColDef<VeiculoFrota>[]>(() => [
    { key: 'placa', get: (v) => v.placa, multi: true },
    { key: 'modelo', get: (v) => v.modelo },
    { key: 'km', get: (v) => v.km },
    { key: 'kmMes', get: (v) => v.kmMes },
  ], []);
  const { val, set, filtradas: veiculos } = useFiltrosColuna(veiculosBase, cols);

  const pag = usePaginacao(veiculos, 10);

  return (
    <>
      <KpiRow cols={3}>
        <KpiCard label="Km total da frota" valor="1.842.300" detalhe="quilômetros rodados" cor="border-l-[#0e2233]" />
        <KpiCard label="Km médio/mês" valor="5.240" detalhe="por veículo" cor="border-l-sky-600" />
        <KpiCard label="Acima da meta" valor="7" detalhe="veículos · meta 5.000 km/mês" cor="border-l-amber-500" detalheCor="text-amber-600" />
      </KpiRow>

      <Toolbar>
        {FILTROS_KM.map((f) => (
          <FilterChip key={f.key} label={f.label} active={filtro === f.key} onClick={() => setFiltro(f.key)} />
        ))}
      </Toolbar>

      <DataTable
        colSpan={4}
        vazio={veiculos.length === 0}
        vazioLabel="Nenhum veículo encontrado com os filtros atuais."
        head={
          <>
            <Th>Placa</Th>
            <Th>Modelo</Th>
            <Th>Km total</Th>
            <Th>Km médio/mês</Th>
          </>
        }
        filterRow={
          <>
            <ThFiltro><ColunaFiltro value={val('placa')} onChange={set('placa')} placeholder="Placa" multi ariaLabel="Filtrar placa" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('modelo')} onChange={set('modelo')} placeholder="Modelo" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('km')} onChange={set('km')} placeholder="Km" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('kmMes')} onChange={set('kmMes')} placeholder="Km/mês" /></ThFiltro>
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
            <td className="px-4 py-3.5 font-mono font-semibold">{v.placa}</td>
            <td className="px-4 py-3.5">{v.modelo}</td>
            <td className="px-4 py-3.5 font-mono">{v.km}</td>
            <td className="px-4 py-3.5 font-mono text-slate-500">{v.kmMes}</td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}

function AbaRegiao() {
  const [regiaoAtiva, setRegiaoAtiva] = useState<string | null>(null);

  const veiculosBase = useMemo(() => VEICULOS.filter((v) => !regiaoAtiva || v.regiao === regiaoAtiva), [regiaoAtiva]);
  const cols = useMemo<ColDef<VeiculoFrota>[]>(() => [
    { key: 'placa', get: (v) => v.placa, multi: true },
    { key: 'modelo', get: (v) => v.modelo },
    { key: 'regiao', get: (v) => v.regiao },
    { key: 'frota', get: (v) => v.frota },
  ], []);
  const { val, set, filtradas: veiculos } = useFiltrosColuna(veiculosBase, cols);

  const pag = usePaginacao(veiculos, 10);

  return (
    <>
      <SectionCard titulo="Frota por região" subtitulo="Clique em uma região para filtrar a listagem abaixo" className="mb-6">
        <div className="space-y-4">
          {REGIOES.map((r) => {
            const ativa = regiaoAtiva === r.nome;
            return (
              <button
                key={r.nome}
                onClick={() => setRegiaoAtiva(ativa ? null : r.nome)}
                className="block w-full text-left"
              >
                <div className={`mb-1.5 flex justify-between text-[13px] font-semibold ${ativa ? 'text-primary-700' : 'text-slate-700'}`}>
                  <span>{r.nome}</span>
                  <span className="font-mono">{r.qtd} veículos</span>
                </div>
                <BarraProgresso pct={r.pct} cor={ativa ? 'bg-primary-600' : 'bg-[#0e2233]'} />
              </button>
            );
          })}
        </div>
      </SectionCard>

      <Toolbar>
        {['Todas', ...REGIOES.map((r) => r.nome)].map((r) => (
          <FilterChip
            key={r}
            label={r}
            active={r === 'Todas' ? !regiaoAtiva : regiaoAtiva === r}
            onClick={() => setRegiaoAtiva(r === 'Todas' ? null : r)}
          />
        ))}
      </Toolbar>

      <DataTable
        colSpan={4}
        vazio={veiculos.length === 0}
        vazioLabel="Nenhum veículo encontrado com os filtros atuais."
        head={
          <>
            <Th>Placa</Th>
            <Th>Modelo</Th>
            <Th>Região</Th>
            <Th>Centro de custo</Th>
          </>
        }
        filterRow={
          <>
            <ThFiltro><ColunaFiltro value={val('placa')} onChange={set('placa')} placeholder="Placa" multi ariaLabel="Filtrar placa" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('modelo')} onChange={set('modelo')} placeholder="Modelo" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('regiao')} onChange={set('regiao')} placeholder="Região" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('frota')} onChange={set('frota')} placeholder="Centro de custo" /></ThFiltro>
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
            <td className="px-4 py-3.5 font-mono font-semibold">{v.placa}</td>
            <td className="px-4 py-3.5">{v.modelo}</td>
            <td className="px-4 py-3.5 text-xs text-slate-500">{v.regiao}</td>
            <td className="px-4 py-3.5 text-xs text-slate-500">{v.frota}</td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}

function RelatoriosContent() {
  const router = useRouter();
  const params = useSearchParams();
  const aba = params.get('aba') ?? 'idade';

  return (
    <div>
      <PageTitle
        titulo="Relatórios de Frota"
        subtitulo="Idade, quilometragem e distribuição regional"
        acao={
          <button className="btn-secondary gap-1.5 text-[13px]">
            <Download size={14} /> Baixar planilha
          </button>
        }
      />

      <div className="mb-6 flex gap-1 border-b border-slate-200">
        {ABAS.map((a) => (
          <button
            key={a.key}
            onClick={() => router.replace(`/portal/relatorios?aba=${a.key}`)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-[13px] font-bold transition ${
              aba === a.key
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {aba === 'idade' && <AbaIdade />}
      {aba === 'km' && <AbaKm />}
      {aba === 'regiao' && <AbaRegiao />}
    </div>
  );
}

export default function RelatoriosPage() {
  return (
    <Suspense>
      <RelatoriosContent />
    </Suspense>
  );
}
