'use client';

import { useMemo, useState } from 'react';
import { Download, FileDown, Search, X, List, FileSearch } from 'lucide-react';
import { VEICULOS, type VeiculoSituacao, type CrlvStatus, type VeiculoFrota } from '@/lib/portalData';
import {
  PageTitle, StatusBadge, FilterChip, KpiCard, KpiRow, Toolbar, ToolbarSpacer,
  DataTable, Th, TablePagination,
} from '@/components/portal/ui';

const SITUACAO_LABEL: Record<VeiculoSituacao, string> = {
  ativo: 'Ativo',
  manutencao: 'Em manutenção',
  parado: 'Parado',
};

const CRLV_LABEL: Record<CrlvStatus, string> = {
  vigente: 'Vigente',
  a_vencer: 'A vencer',
  vencido: 'Vencido',
  sem: 'Sem CRLV',
};

const FILTROS: Array<{ key: CrlvStatus | 'todos'; label: string }> = [
  { key: 'todos', label: 'Todos' },
  { key: 'vigente', label: 'Vigentes' },
  { key: 'a_vencer', label: 'A vencer' },
  { key: 'vencido', label: 'Vencidos' },
  { key: 'sem', label: 'Sem CRLV' },
];

/** Normaliza para comparação: remove tudo que não for letra/número e caixa alta. */
const norm = (s: string) => s.replace(/[^a-z0-9]/gi, '').toUpperCase();

function ModalDadosCompletos({ veiculo, onFechar }: { veiculo: VeiculoFrota; onFechar: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onFechar}>
      <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="font-mono text-xs font-semibold text-slate-500">{veiculo.frota}</p>
            <h3 className="text-lg font-extrabold text-slate-900">{veiculo.modelo}</h3>
            <p className="text-xs text-slate-500">{veiculo.categoria}</p>
          </div>
          <button onClick={onFechar} aria-label="Fechar" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Dados do ativo</p>
        <dl className="mb-5 grid grid-cols-2 gap-x-4 gap-y-3 text-[13px]">
          <div><dt className="text-xs font-bold uppercase text-slate-400">Placa</dt><dd className="font-mono font-semibold">{veiculo.placa}</dd></div>
          <div><dt className="text-xs font-bold uppercase text-slate-400">Ano modelo</dt><dd className="font-mono">{veiculo.anoModelo}</dd></div>
          <div><dt className="text-xs font-bold uppercase text-slate-400">Km rodado</dt><dd className="font-mono">{veiculo.km}</dd></div>
          <div><dt className="text-xs font-bold uppercase text-slate-400">Situação operacional</dt><dd><StatusBadge status={veiculo.situacao} label={SITUACAO_LABEL[veiculo.situacao]} /></dd></div>
          <div><dt className="text-xs font-bold uppercase text-slate-400">Contrato</dt><dd className="font-mono">{veiculo.contrato}</dd></div>
          <div><dt className="text-xs font-bold uppercase text-slate-400">Centro de custo</dt><dd>{veiculo.frota}</dd></div>
        </dl>

        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">CRLV</p>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[13px]">
          <div><dt className="text-xs font-bold uppercase text-slate-400">Chassi</dt><dd className="font-mono">{veiculo.chassi}</dd></div>
          <div><dt className="text-xs font-bold uppercase text-slate-400">Renavam</dt><dd className="font-mono">{veiculo.renavam}</dd></div>
          <div><dt className="text-xs font-bold uppercase text-slate-400">Exercício</dt><dd className="font-mono">{veiculo.crlvAno}</dd></div>
          <div><dt className="text-xs font-bold uppercase text-slate-400">Status do documento</dt><dd><StatusBadge status={veiculo.crlvStatus} label={CRLV_LABEL[veiculo.crlvStatus]} /></dd></div>
        </dl>

        {veiculo.crlvStatus !== 'sem' && (
          <button className="btn-primary mt-6 w-full gap-1.5 text-[13px]">
            <Download size={15} /> Baixar CRLV
          </button>
        )}
      </div>
    </div>
  );
}

export default function VeiculosPage() {
  const [termos, setTermos] = useState<string[]>([]);
  const [entrada, setEntrada] = useState('');
  const [buscou, setBuscou] = useState(false);
  const [verTudo, setVerTudo] = useState(false);
  const [filtro, setFiltro] = useState<CrlvStatus | 'todos'>('todos');
  const [detalhe, setDetalhe] = useState<VeiculoFrota | null>(null);

  const adicionarTermo = (valor: string) => {
    const v = valor.trim();
    if (!v) return;
    setTermos((prev) => (prev.some((t) => norm(t) === norm(v)) ? prev : [...prev, v]));
    setEntrada('');
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      adicionarTermo(entrada);
    } else if (e.key === 'Backspace' && !entrada && termos.length) {
      setTermos((prev) => prev.slice(0, -1));
    }
  };

  const buscar = () => {
    const pendentes = entrada.trim() ? [...termos, entrada.trim()] : termos;
    if (!pendentes.length) return;
    if (entrada.trim()) adicionarTermo(entrada);
    setTermos(pendentes.filter((t, i, arr) => arr.findIndex((x) => norm(x) === norm(t)) === i));
    setBuscou(true);
    setVerTudo(false);
  };

  const limpar = () => {
    setTermos([]);
    setEntrada('');
    setBuscou(false);
    setVerTudo(false);
  };

  const mostrandoLista = buscou || verTudo;

  const veiculos = useMemo(() => {
    let base = VEICULOS;
    if (buscou && !verTudo && termos.length) {
      base = base.filter((v) =>
        termos.some((t) => {
          const nt = norm(t);
          return norm(v.placa).includes(nt) || norm(v.chassi).includes(nt) || norm(v.renavam).includes(nt);
        }),
      );
    }
    return base.filter((v) => filtro === 'todos' || v.crlvStatus === filtro);
  }, [buscou, verTudo, termos, filtro]);

  const kpis = useMemo(() => {
    const count = (s: CrlvStatus) => VEICULOS.filter((v) => v.crlvStatus === s).length;
    return { vigente: count('vigente'), aVencer: count('a_vencer'), vencido: count('vencido'), sem: count('sem') };
  }, []);

  return (
    <div>
      <PageTitle
        titulo="Veículos / CRLV"
        subtitulo="Consulte e baixe o CRLV da sua frota — busque por placa, chassi ou Renavam"
        acao={
          <button className="btn-primary gap-1.5 text-[13px]">
            <FileDown size={15} /> Baixar todos os CRLVs
          </button>
        }
      />

      <KpiRow>
        <KpiCard label="CRLV vigente" valor={String(kpis.vigente)} detalhe="documento em dia" cor="border-l-emerald-500" detalheCor="text-emerald-600" />
        <KpiCard label="A vencer" valor={String(kpis.aVencer)} detalhe="renovar em breve" cor="border-l-amber-500" detalheCor="text-amber-600" />
        <KpiCard label="Vencido" valor={String(kpis.vencido)} detalhe="regularizar agora" cor="border-l-primary-600" detalheCor="text-primary-700" />
        <KpiCard label="Sem CRLV" valor={String(kpis.sem)} detalhe="máquinas e implementos" cor="border-l-slate-400" />
      </KpiRow>

      {/* Busca em destaque */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-[#0e2233] to-[#12293e] p-6 text-white shadow-sm">
        <h2 className="text-lg font-extrabold">Encontre o CRLV do seu veículo</h2>
        <p className="mt-0.5 text-[13px] text-white/70">
          Digite uma ou mais placas, chassi ou Renavam. Pressione Enter para adicionar cada um.
        </p>

        <div className="mt-4 flex flex-col gap-3 lg:flex-row">
          <div className="flex flex-1 flex-wrap items-center gap-2 rounded-xl bg-white px-3 py-2.5">
            <Search size={18} className="text-slate-400" />
            {termos.map((t) => (
              <span
                key={t}
                className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-700"
              >
                {t.toUpperCase()}
                <button
                  onClick={() => setTermos((prev) => prev.filter((x) => x !== t))}
                  aria-label={`Remover ${t}`}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={13} />
                </button>
              </span>
            ))}
            <input
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={termos.length ? 'Adicionar outra...' : 'Ex.: JBL5B25, 9535V6TB0PR009032, 01317228496'}
              className="min-w-[180px] flex-1 border-none bg-transparent py-1 font-mono text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={buscar} className="btn-primary gap-1.5 px-5 text-[13px]">
              <Search size={15} /> Buscar
            </button>
            <button
              onClick={() => { setVerTudo(true); setBuscou(false); }}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-4 py-2 text-[13px] font-bold text-white transition hover:bg-white/20"
            >
              <List size={15} /> Ver listagem completa
            </button>
          </div>
        </div>
        {(termos.length > 0 || mostrandoLista) && (
          <button onClick={limpar} className="mt-3 text-xs font-semibold text-white/70 underline-offset-2 hover:text-white hover:underline">
            Limpar busca
          </button>
        )}
      </div>

      {/* Resultado */}
      {!mostrandoLista ? (
        <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <FileSearch size={26} />
          </span>
          <p className="mt-4 text-sm font-bold text-slate-800">Busque pelo veículo que você precisa</p>
          <p className="mt-1 max-w-md text-[13px] text-slate-500">
            Digite a placa, chassi ou Renavam no campo acima para baixar o CRLV,
            ou veja a frota completa.
          </p>
          <button
            onClick={() => { setVerTudo(true); setBuscou(false); }}
            className="btn-secondary mt-5 gap-1.5 text-[13px]"
          >
            <List size={15} /> Ver listagem completa
          </button>
        </div>
      ) : (
        <>
          <Toolbar>
            {FILTROS.map((f) => (
              <FilterChip key={f.key} label={f.label} active={filtro === f.key} onClick={() => setFiltro(f.key)} />
            ))}
            <ToolbarSpacer />
            <span className="text-xs font-semibold text-slate-500">
              {verTudo
                ? `${veiculos.length} veículo(s) na frota`
                : `${veiculos.length} resultado(s) para ${termos.length} busca(s)`}
            </span>
          </Toolbar>

          <DataTable
            colSpan={7}
            vazio={veiculos.length === 0}
            vazioLabel="Nenhum veículo encontrado para a busca. Confira a placa/chassi/Renavam ou veja a listagem completa."
            head={
              <>
                <Th>Frota</Th>
                <Th>Placa</Th>
                <Th>Modelo</Th>
                <Th>Chassi / Renavam</Th>
                <Th>Ano</Th>
                <Th>Status do CRLV</Th>
                <Th />
              </>
            }
            footer={<TablePagination info={`Mostrando ${veiculos.length} de 42 veículos`} />}
          >
            {veiculos.map((v) => (
              <tr key={v.placa} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3.5 text-xs text-slate-500">{v.frota}</td>
                <td className="px-4 py-3.5">
                  <span className="rounded-md border border-slate-200 px-2 py-1 font-mono text-xs font-semibold">{v.placa}</span>
                </td>
                <td className="px-4 py-3.5">
                  <p className="font-semibold text-slate-800">{v.modelo}</p>
                  <p className="text-xs text-slate-500">{v.categoria} · {v.km}</p>
                </td>
                <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500">
                  <p>{v.chassi}</p>
                  <p>{v.renavam}</p>
                </td>
                <td className="px-4 py-3.5 font-mono text-xs">{v.anoModelo}</td>
                <td className="px-4 py-3.5">
                  <StatusBadge status={v.crlvStatus} label={CRLV_LABEL[v.crlvStatus]} />
                  {v.crlvStatus !== 'sem' && <p className="mt-0.5 font-mono text-[10px] text-slate-400">exercício {v.crlvAno}</p>}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setDetalhe(v)} className="btn-secondary px-3 py-1.5 text-xs">
                      Dados completos
                    </button>
                    {v.crlvStatus !== 'sem' && (
                      <button className="btn-primary gap-1.5 px-3 py-1.5 text-xs">
                        <Download size={13} /> CRLV
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </DataTable>
        </>
      )}

      {detalhe && <ModalDadosCompletos veiculo={detalhe} onFechar={() => setDetalhe(null)} />}
    </div>
  );
}
