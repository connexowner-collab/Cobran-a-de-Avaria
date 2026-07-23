'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Plus, Send, X, Eye, CalendarClock, LogIn, LogOut, Wrench, Flag,
} from 'lucide-react';
import { CHAMADOS, type Chamado, type ChamadoStatus } from '@/lib/portalData';
import {
  PageTitle, StatusBadge, FilterChip, KpiCard, KpiRow, Toolbar, ToolbarSpacer,
  DataTable, Th, TablePagination, usePaginacao,
  ColunaFiltro, ThFiltro, useFiltrosColuna, type ColDef,
} from '@/components/portal/ui';
import {
  slaInfo, EsteiraManutencao, BlocoSla, BlocoConversa, type EtapaManutencao,
} from '@/lib/acompanhamento';

const STATUS_LABEL: Record<ChamadoStatus, string> = {
  aberto: 'Aberto',
  atendimento: 'Em atendimento',
  aguardando: 'Aguardando cliente',
  escalonado: 'Escalonado',
  resolvido: 'Resolvido',
};

/** Deriva a esteira de manutenção a partir do status do chamado. */
function etapasDoChamado(c: Chamado): EtapaManutencao[] {
  const resolvido = c.status === 'resolvido';
  let idx = 0;
  let detalhe: string | undefined;
  switch (c.status) {
    case 'aberto': idx = 0; detalhe = 'Aguardando agendamento'; break;
    case 'atendimento': idx = 2; detalhe = 'Serviços em execução'; break;
    case 'aguardando': idx = 2; detalhe = 'Aguardando retorno'; break;
    case 'escalonado': idx = 2; detalhe = 'Chamado escalonado'; break;
    case 'resolvido': idx = 4; break;
  }
  const base = [
    { label: 'Agendado', icon: CalendarClock },
    { label: 'Entrada na oficina', icon: LogIn },
    { label: 'Em manutenção', icon: Wrench },
    { label: 'Saída da oficina', icon: LogOut },
    { label: 'Finalizado', icon: Flag },
  ];
  return base.map((b, i) => ({
    ...b,
    data: i === 0 ? c.abertoHa : '—',
    estado: resolvido ? 'concluido' : i < idx ? 'concluido' : i === idx ? 'atual' : 'pendente',
    detalhe: i === idx && !resolvido ? detalhe : undefined,
  }));
}

/** Status considerados "em aberto" — os únicos exibidos na Central de Chamados.
 *  Chamados resolvidos/finalizados ficam na aba Serviços. */
const STATUS_EM_ABERTO: ChamadoStatus[] = ['aberto', 'atendimento', 'aguardando', 'escalonado'];

const FILTROS: Array<{ key: ChamadoStatus | 'todos'; label: string }> = [
  { key: 'todos', label: 'Todos' },
  { key: 'aberto', label: 'Aberto' },
  { key: 'atendimento', label: 'Em atendimento' },
  { key: 'aguardando', label: 'Aguardando' },
  { key: 'escalonado', label: 'Escalonado' },
];

function ModalChamado({ chamado, onFechar }: { chamado: Chamado; onFechar: () => void }) {
  const sla = slaInfo(chamado.slaMin);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onFechar}>
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[13px] font-semibold text-slate-500">{chamado.id}</p>
            <h2 className="mt-0.5 text-xl font-extrabold text-slate-900">{chamado.categoria}</h2>
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
              <span>Veículo <b className="font-mono text-slate-800">{chamado.placa}</b></span>
              <span>Aberto por <b className="text-slate-800">{chamado.solicitante}</b></span>
              <span>Responsável <b className="text-slate-800">{chamado.responsavel}</b></span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={chamado.status} label={STATUS_LABEL[chamado.status]} />
            <button onClick={onFechar} aria-label="Fechar" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="mb-5">
          <BlocoSla titulo="SLA de resposta" sla={sla} />
        </div>

        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Andamento da manutenção</p>
        <div className="mb-5">
          <EsteiraManutencao etapas={etapasDoChamado(chamado)} />
        </div>

        <BlocoConversa interacoes={chamado.respostas} />

        <div className="mt-5 flex gap-2.5 border-t border-slate-100 pt-4">
          <input
            placeholder="Responder ao chamado..."
            className="input-field flex-1 bg-slate-50 py-2.5 text-[13px]"
          />
          <button className="btn-primary gap-1.5 text-[13px]">
            <Send size={14} /> Enviar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChamadosPage() {
  const [filtro, setFiltro] = useState<ChamadoStatus | 'todos'>('todos');
  const [aberto, setAberto] = useState<Chamado | null>(null);

  /** Base da Central de Chamados: somente chamados em aberto. */
  const chamadosEmAberto = useMemo(
    () => CHAMADOS.filter((c) => STATUS_EM_ABERTO.includes(c.status)),
    [],
  );

  const listaBase = useMemo(
    () => chamadosEmAberto.filter((c) => filtro === 'todos' || c.status === filtro),
    [chamadosEmAberto, filtro],
  );
  const cols = useMemo<ColDef<Chamado>[]>(() => [
    { key: 'id', get: (c) => c.id, multi: true },
    { key: 'categoria', get: (c) => c.categoria },
    { key: 'placa', get: (c) => c.placa, multi: true },
    { key: 'solicitante', get: (c) => c.solicitante },
    { key: 'responsavel', get: (c) => c.responsavel },
    { key: 'status', get: (c) => STATUS_LABEL[c.status] },
  ], []);
  const { val, set, filtradas: lista } = useFiltrosColuna(listaBase, cols);

  const pag = usePaginacao(lista, 10);

  const kpis = useMemo(() => {
    const abertos = chamadosEmAberto;
    const foraDoSla = abertos.filter((c) => c.slaMin < 0).length;
    const escalonados = abertos.filter((c) => c.status === 'escalonado').length;
    const mediaMin = abertos.length ? Math.round(abertos.reduce((s, c) => s + c.slaMin, 0) / abertos.length) : 0;
    return { abertos: abertos.length, foraDoSla, escalonados, mediaSla: slaInfo(mediaMin) };
  }, [chamadosEmAberto]);

  return (
    <div>
      <PageTitle
        titulo="Central de Chamados"
        subtitulo="Chamados de manutenção em aberto · o histórico de finalizados fica em Serviços"
        novo
        acao={
          <Link href="/portal/agendamentos" className="btn-primary gap-1.5 text-[13px]">
            <Plus size={15} /> Abrir chamado
          </Link>
        }
      />

      <KpiRow>
        <KpiCard label="Chamados abertos" valor={String(kpis.abertos)} detalhe="em andamento" cor="border-l-[#0e2233]" />
        <KpiCard label="Fora do SLA" valor={String(kpis.foraDoSla)} detalhe="ação imediata" cor="border-l-primary-600" detalheCor="text-primary-700" />
        <KpiCard
          label="SLA médio (abertos)"
          valor={kpis.mediaSla.label}
          detalhe={kpis.mediaSla.label.startsWith('Vencido') ? 'em média, no vermelho' : 'até o próximo vencimento'}
          cor="border-l-amber-500"
          detalheCor={kpis.mediaSla.cls}
        />
        <KpiCard label="Escalonados" valor={String(kpis.escalonados)} detalhe="requerem acompanhamento" cor="border-l-rose-500" detalheCor="text-rose-600" />
      </KpiRow>

      <Toolbar>
        {FILTROS.map((f) => (
          <FilterChip key={f.key} label={f.label} active={filtro === f.key} onClick={() => setFiltro(f.key)} />
        ))}
      </Toolbar>

      <DataTable
        colSpan={8}
        vazio={lista.length === 0}
        vazioLabel="Nenhum chamado encontrado com os filtros atuais."
        filterRow={
          <>
            <ThFiltro><ColunaFiltro value={val('id')} onChange={set('id')} placeholder="Chamado" multi ariaLabel="Filtrar chamado" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('categoria')} onChange={set('categoria')} placeholder="Categoria" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('placa')} onChange={set('placa')} placeholder="Placa" multi ariaLabel="Filtrar placa" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('solicitante')} onChange={set('solicitante')} placeholder="Solicitante" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('responsavel')} onChange={set('responsavel')} placeholder="Responsável" /></ThFiltro>
            <ThFiltro />
            <ThFiltro />
            <ThFiltro><ColunaFiltro value={val('status')} onChange={set('status')} placeholder="Status" /></ThFiltro>
          </>
        }
        head={
          <>
            <Th>Chamado</Th>
            <Th>Categoria</Th>
            <Th>Placa</Th>
            <Th>Solicitante</Th>
            <Th>Responsável</Th>
            <Th>Aberto</Th>
            <Th>SLA</Th>
            <Th>Status</Th>
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
            rotulo="chamados em aberto"
          />
        }
      >
        {pag.pageItens.map((c) => {
          const sla = slaInfo(c.slaMin);
          return (
            <tr
              key={c.id}
              onClick={() => setAberto(c)}
              className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50"
            >
              <td className="px-4 py-3.5 font-mono text-xs font-semibold text-slate-800">{c.id}</td>
              <td className="px-4 py-3.5 text-[13px] font-semibold text-slate-800">{c.categoria}</td>
              <td className="px-4 py-3.5 font-mono text-xs">{c.placa}</td>
              <td className="px-4 py-3.5 text-xs text-slate-600">{c.solicitante}</td>
              <td className="px-4 py-3.5 text-xs text-slate-500">{c.responsavel}</td>
              <td className="px-4 py-3.5 text-xs text-slate-400">{c.abertoHa}</td>
              <td className="px-4 py-3.5">
                <span className={`text-xs font-bold ${sla.cls}`}>{sla.label}</span>
              </td>
              <td className="px-4 py-3.5">
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge status={c.status} label={STATUS_LABEL[c.status]} />
                  <Eye size={15} className="text-slate-300" />
                </div>
              </td>
            </tr>
          );
        })}
      </DataTable>

      {aberto && <ModalChamado chamado={aberto} onFechar={() => setAberto(null)} />}
    </div>
  );
}
