'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus, Send, X, Eye, Clock, CalendarClock, LogOut, Wrench, Flag,
} from 'lucide-react';
import {
  PageTitle, KpiCard, KpiRow,
  DataTable, Th, TablePagination, usePaginacao,
  ColunaFiltro, ThFiltro, useFiltrosColuna, FunilEtapas, type ColDef,
} from '@/components/portal/ui';
import {
  EsteiraManutencao, BlocoConversa, ETAPAS_MANUTENCAO,
  type EtapaManutencao, type EtapaManutencaoKey, type Interacao,
} from '@/lib/acompanhamento';
import {
  ATENDIMENTOS_SERVICO, getDetalhe, etapaAtendimento,
  type AtendimentoServico,
} from '@/lib/servicosData';

/** Frota total da operação (mesmo valor usado em Serviços e na aba Modelos). */
const FROTA_TOTAL = 42;

/** Rótulo + cor do badge por etapa da manutenção. */
const ETAPA_INFO: Record<EtapaManutencaoKey, { label: string; cls: string }> = {
  aguardando_agendamento: { label: 'Aguardando Agendamento', cls: 'bg-slate-100 text-slate-600' },
  agendado: { label: 'Agendado', cls: 'bg-slate-100 text-slate-700' },
  manutencao: { label: 'Em Manutenção', cls: 'bg-sky-100 text-sky-700' },
  saida: { label: 'Disponível retirada da manutenção', cls: 'bg-amber-100 text-amber-800' },
  finalizado: { label: 'Manutenção Finalizada', cls: 'bg-emerald-100 text-emerald-700' },
};

const ETAPA_IDX: Record<EtapaManutencaoKey, number> = {
  aguardando_agendamento: 0, agendado: 1, manutencao: 2, saida: 3, finalizado: 4,
};
const DETALHE_ETAPA: Record<EtapaManutencaoKey, string | undefined> = {
  aguardando_agendamento: 'Aguardando agendamento',
  agendado: 'Agendamento confirmado',
  manutencao: 'Serviços em execução',
  saida: 'Disponível para retirada',
  finalizado: undefined,
};

/** Esteira de status da manutenção (mesma linha do tempo do modal de Serviços). */
function etapasDaManutencao(a: AtendimentoServico): EtapaManutencao[] {
  const etapa = etapaAtendimento(a);
  const idx = ETAPA_IDX[etapa];
  const finalizado = etapa === 'finalizado';
  const base = [
    { label: 'Aguardando Agendamento', icon: Clock, data: '—' },
    { label: 'Agendado', icon: CalendarClock, data: a.agendamento },
    { label: 'Em Manutenção', icon: Wrench, data: a.dataEntrada },
    { label: 'Disponível retirada da manutenção', icon: LogOut, data: a.saida },
    { label: 'Manutenção Finalizada', icon: Flag, data: a.dataConclusao },
  ];
  return base.map((b, i) => ({
    ...b,
    estado: finalizado ? 'concluido' : i < idx ? 'concluido' : i === idx ? 'atual' : 'pendente',
    detalhe: i === idx && !finalizado ? DETALHE_ETAPA[etapa] : undefined,
  }));
}

/** Linha do tempo de interações da manutenção (para o modal). */
function interacoesManutencao(a: AtendimentoServico): Interacao[] {
  const det = getDetalhe(a.numero);
  const msgs: Interacao[] = [
    { autor: det.condutor !== '—' ? det.condutor : 'Condutor', origem: 'cliente', horario: a.agendamento, texto: det.descricaoProblema },
    { autor: 'Central Vamos', origem: 'suporte', horario: a.agendamento, texto: `Agendamento do atendimento ${a.numero} recebido para ${a.motivo}.` },
  ];
  if (a.dataEntrada !== '—') msgs.push({ autor: 'Oficina', origem: 'oficina', horario: a.dataEntrada, texto: 'Veículo deu entrada na oficina. Início da avaliação.' });
  if (a.saida !== '—') msgs.push({ autor: 'Oficina', origem: 'oficina', horario: a.saida, texto: 'Veículo liberado — saída da oficina.' });
  else msgs.push({ autor: 'Central Vamos', origem: 'suporte', horario: '—', texto: 'Manutenção em andamento na oficina.' });
  return msgs;
}

const identificador = (a: AtendimentoServico) => (a.placa !== '—' ? a.placa : a.numeroSerie);

function ModalManutencao({ atendimento: a, onFechar }: { atendimento: AtendimentoServico; onFechar: () => void }) {
  const det = getDetalhe(a.numero);
  const etapa = etapaAtendimento(a);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onFechar}>
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[13px] font-semibold text-slate-500">Atendimento {a.numero}</p>
            <h2 className="mt-0.5 text-xl font-extrabold text-slate-900">{a.motivo}</h2>
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
              <span>Veículo <b className="font-mono text-slate-800">{identificador(a)}</b></span>
              <span>Condutor <b className="text-slate-800">{det.condutor}</b></span>
              <span>Cliente <b className="text-slate-800">{det.cliente}</b></span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${ETAPA_INFO[etapa].cls}`}>{ETAPA_INFO[etapa].label}</span>
            <button onClick={onFechar} aria-label="Fechar" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <X size={18} />
            </button>
          </div>
        </div>

        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Andamento da manutenção</p>
        <div className="mb-5">
          <EsteiraManutencao etapas={etapasDaManutencao(a)} />
        </div>

        <BlocoConversa interacoes={interacoesManutencao(a)} />

        <div className="mt-5 flex gap-2.5 border-t border-slate-100 pt-4">
          <input
            placeholder="Responder ao atendimento..."
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
  const [etapaFiltro, setEtapaFiltro] = useState<EtapaManutencaoKey | null>(null);
  const [aberto, setAberto] = useState<AtendimentoServico | null>(null);

  /** Base da Central de Atendimento: as manutenções em aberto (mesmas de Serviços). */
  const abertas = useMemo(() => ATENDIMENTOS_SERVICO.filter((a) => a.status === 'aberta'), []);

  const listaBase = useMemo(
    () => abertas.filter((a) => !etapaFiltro || etapaAtendimento(a) === etapaFiltro),
    [abertas, etapaFiltro],
  );
  const cols = useMemo<ColDef<AtendimentoServico>[]>(() => [
    { key: 'numero', get: (a) => a.numero, multi: true },
    { key: 'motivo', get: (a) => a.motivo },
    { key: 'placa', get: (a) => identificador(a), multi: true },
    { key: 'solicitante', get: (a) => getDetalhe(a.numero).condutor },
    { key: 'modelo', get: (a) => a.marcaModelo },
  ], []);
  const { val, set, filtradas: lista } = useFiltrosColuna(listaBase, cols);

  const pag = usePaginacao(lista, 10);

  /* Timeline com todas as etapas. "Finalizado" não tem contagem (os finalizados
     ficam em Serviços) e, ao clicar, leva o usuário para a tela de Serviços. */
  const funil = useMemo(
    () => ETAPAS_MANUTENCAO.map((e) => ({
      ...e,
      count: e.key === 'finalizado' ? null : abertas.filter((a) => etapaAtendimento(a) === e.key).length,
    })),
    [abertas],
  );

  return (
    <div>
      <PageTitle
        titulo="Central de Chamados"
        subtitulo="Manutenções em aberto da frota · o histórico de finalizados fica em Serviços"
        novo
        acao={
          <Link href="/portal/agendamentos" className="btn-primary gap-1.5 text-[13px]">
            <Plus size={15} /> Nova Manutenção
          </Link>
        }
      />

      <KpiRow>
        <KpiCard label="Frota total" valor={String(FROTA_TOTAL)} detalhe="veículos e equipamentos" cor="border-l-[#0e2233]" />
        <KpiCard label="Em oficina agora" valor={String(abertas.length)} detalhe="veículos imobilizados" cor="border-l-sky-600" detalheCor="text-sky-700" />
      </KpiRow>

      <FunilEtapas
        titulo="Manutenções por etapa"
        subtitulo="Clique numa etapa para filtrar a lista · 'Manutenção Finalizada' abre em Serviços"
        etapas={funil}
        ativo={etapaFiltro}
        onSelecionar={(k) => {
          if (k === 'finalizado') { router.push('/portal/servicos'); return; }
          setEtapaFiltro(k as EtapaManutencaoKey | null);
        }}
        className="mb-6"
      />

      <DataTable
        colSpan={7}
        vazio={lista.length === 0}
        vazioLabel="Nenhuma manutenção encontrada com os filtros atuais."
        filterRow={
          <>
            <ThFiltro><ColunaFiltro value={val('numero')} onChange={set('numero')} placeholder="Atendimento" multi ariaLabel="Filtrar atendimento" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('motivo')} onChange={set('motivo')} placeholder="Motivo" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('placa')} onChange={set('placa')} placeholder="Placa / Ativo" multi ariaLabel="Filtrar placa ou ativo" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('solicitante')} onChange={set('solicitante')} placeholder="Condutor" /></ThFiltro>
            <ThFiltro><ColunaFiltro value={val('modelo')} onChange={set('modelo')} placeholder="Marca/Modelo" /></ThFiltro>
            <ThFiltro />
            <ThFiltro />
          </>
        }
        head={
          <>
            <Th>Atendimento</Th>
            <Th>Motivo</Th>
            <Th>Placa / Ativo</Th>
            <Th>Condutor</Th>
            <Th>Marca/Modelo</Th>
            <Th>Previsão de saída</Th>
            <Th>Etapa</Th>
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
            rotulo="manutenções em aberto"
          />
        }
      >
        {pag.pageItens.map((a) => {
          const det = getDetalhe(a.numero);
          const etapa = etapaAtendimento(a);
          return (
            <tr
              key={a.numero}
              onClick={() => setAberto(a)}
              className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50"
            >
              <td className="px-4 py-3.5 font-mono text-xs font-semibold text-slate-800">{a.numero}</td>
              <td className="px-4 py-3.5 text-[13px] font-semibold text-slate-800">{a.motivo}</td>
              <td className="px-4 py-3.5 font-mono text-xs">{identificador(a)}</td>
              <td className="px-4 py-3.5 text-xs text-slate-600">{det.condutor}</td>
              <td className="px-4 py-3.5 text-xs text-slate-500">{a.marcaModelo}</td>
              <td className="px-4 py-3.5 font-mono text-xs">{a.previsao}</td>
              <td className="px-4 py-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${ETAPA_INFO[etapa].cls}`}>{ETAPA_INFO[etapa].label}</span>
                  <Eye size={15} className="text-slate-300" />
                </div>
              </td>
            </tr>
          );
        })}
      </DataTable>

      {aberto && <ModalManutencao atendimento={aberto} onFechar={() => setAberto(null)} />}
    </div>
  );
}
