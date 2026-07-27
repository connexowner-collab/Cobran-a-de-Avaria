'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus, Send, X, Eye, CalendarClock, LogIn, LogOut, Wrench, Flag,
} from 'lucide-react';
import { CHAMADOS, type Chamado, type ChamadoStatus } from '@/lib/portalData';
import {
  PageTitle, StatusBadge, KpiCard, KpiRow,
  DataTable, Th, TablePagination, usePaginacao,
  ColunaFiltro, ThFiltro, useFiltrosColuna, FunilEtapas, type ColDef,
} from '@/components/portal/ui';
import {
  slaInfo, EsteiraManutencao, BlocoSla, BlocoConversa, ETAPAS_MANUTENCAO,
  type EtapaManutencao, type EtapaManutencaoKey,
} from '@/lib/acompanhamento';

const STATUS_LABEL: Record<ChamadoStatus, string> = {
  aberto: 'Aberto',
  atendimento: 'Em atendimento',
  aguardando: 'Aguardando cliente',
  escalonado: 'Escalonado',
  resolvido: 'Resolvido',
};

/** Etapa de cada chamado na linha do tempo da manutenção (mesma do modal e do funil).
 *  Distribuída por chamado para representar toda a esteira (Agendado → Saída). */
const ETAPA_CHAMADO: Record<string, EtapaManutencaoKey> = {
  'CH-3352': 'agendado', 'CH-3410': 'agendado',
  'CH-3391': 'entrada',
  'CH-3406': 'manutencao', 'CH-3388': 'manutencao', 'CH-3379': 'manutencao',
  'CH-3345': 'saida',
};
function etapaChamado(c: Chamado): EtapaManutencaoKey {
  if (c.status === 'resolvido') return 'finalizado';
  return ETAPA_CHAMADO[c.id] ?? 'manutencao';
}

const ETAPA_IDX: Record<EtapaManutencaoKey, number> = {
  agendado: 0, entrada: 1, manutencao: 2, saida: 3, finalizado: 4,
};
const DETALHE_ETAPA: Record<EtapaManutencaoKey, string | undefined> = {
  agendado: 'Aguardando agendamento',
  entrada: 'Veículo na oficina',
  manutencao: 'Serviços em execução',
  saida: 'Aguardando liberação',
  finalizado: undefined,
};

/** Deriva a esteira de manutenção a partir da etapa do chamado. */
function etapasDoChamado(c: Chamado): EtapaManutencao[] {
  const etapa = etapaChamado(c);
  const idx = ETAPA_IDX[etapa];
  const resolvido = etapa === 'finalizado';
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
    detalhe: i === idx && !resolvido ? DETALHE_ETAPA[etapa] : undefined,
  }));
}

/** Status considerados "em aberto" — os únicos exibidos na Central de Chamados.
 *  Chamados resolvidos/finalizados ficam na aba Serviços. */
const STATUS_EM_ABERTO: ChamadoStatus[] = ['aberto', 'atendimento', 'aguardando', 'escalonado'];

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
  const router = useRouter();
  const [aberto, setAberto] = useState<Chamado | null>(null);

  /** Base da Central de Chamados: somente chamados em aberto. */
  const chamadosEmAberto = useMemo(
    () => CHAMADOS.filter((c) => STATUS_EM_ABERTO.includes(c.status)),
    [],
  );

  const listaBase = chamadosEmAberto;
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

  /* Timeline (espelho de Serviços): só etapas em aberto, sem contagem.
     Ao clicar, leva o usuário para a tela de Serviços. */
  const etapasAbertas = ETAPAS_MANUTENCAO
    .filter((e) => e.key !== 'finalizado')
    .map((e) => ({ ...e, count: 0 }));

  return (
    <div>
      <PageTitle
        titulo="Central de Chamados"
        subtitulo="Chamados de manutenção em aberto · o histórico de finalizados fica em Serviços"
        novo
        acao={
          <Link href="/portal/agendamentos" className="btn-primary gap-1.5 text-[13px]">
            <Plus size={15} /> Nova Manutenção
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

      <FunilEtapas
        titulo="Manutenções por etapa"
        subtitulo="Acompanhe a esteira em Serviços · clique numa etapa para abrir"
        etapas={etapasAbertas}
        ativo={null}
        onSelecionar={() => router.push('/portal/servicos')}
        mostrarContagem={false}
        className="mb-6"
      />

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
