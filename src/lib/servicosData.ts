import type { EtapaManutencaoKey } from '@/lib/acompanhamento';

/* ------------------------------------------------------------------ *
 * Base compartilhada de MANUTENÇÕES (atendimentos / ordens de serviço).
 * Fonte única usada pela tela de Serviços e pela Central de Atendimento,
 * para que as duas telas mostrem exatamente as mesmas manutenções.
 * ------------------------------------------------------------------ */

/* Data de referência do protótipo (para calcular imobilização/atrasos). */
export const HOJE = new Date(2026, 6, 20); // 20/07/2026

export function parseBR(d: string): Date | null {
  if (!d || d === '—') return null;
  const [dd, mm, yy] = d.split('/').map(Number);
  return new Date(yy, mm - 1, dd);
}
export function diasEntre(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

export type TipoServico = 'preventiva' | 'corretiva' | 'sinistro' | 'outros';

/** Ordem de Serviço: um atendimento pode ter várias, com motivos diversos. */
export interface OrdemServico {
  numero: string;
  /** Mesmo vocabulário de "motivo do atendimento". */
  motivo: string;
  status: 'Aberta' | 'Em execução' | 'Aguardando peça' | 'Finalizada';
  dataEntrada: string;
  dataSaida: string;
  /** Se a OS gera cobrança de avaria. */
  temAvaria: boolean;
}

export interface AtendimentoServico {
  numero: string;
  status: 'finalizado' | 'aberta';
  motivo: string;
  tipo: TipoServico;
  /** Ordens de Serviço vinculadas ao atendimento (uma ou várias). */
  ordens: OrdemServico[];
  placa: string;
  /** Chassi OU nº de série identificam o ativo (sempre um dos dois). */
  chassi: string;
  numeroSerie: string;
  marcaModelo: string;
  agendamento: string;
  dataEntrada: string;
  previsao: string;
  saida: string;
  dataConclusao: string;
  situacao: string;
}

const ATENDIMENTOS_BASE: AtendimentoServico[] = [
  { numero: '972972', status: 'finalizado', motivo: 'PNEU', tipo: 'corretiva', ordens: [{ numero: 'OS-338271', motivo: 'PNEU', status: 'Finalizada', dataEntrada: '26/06/2026', dataSaida: '05/07/2026', temAvaria: false }, { numero: 'OS-338290', motivo: 'FREIO', status: 'Finalizada', dataEntrada: '06/07/2026', dataSaida: '13/07/2026', temAvaria: true }], placa: 'JBL5B25', chassi: '9535V6TB0PR009032', numeroSerie: '—', marcaModelo: 'VW 11-180 Delivery', agendamento: '25/06/2026', dataEntrada: '26/06/2026', previsao: '28/06/2026', saida: '13/07/2026', dataConclusao: '13/07/2026', situacao: 'Rodando' },
  { numero: '957964', status: 'finalizado', motivo: 'CORRETIVA', tipo: 'corretiva', ordens: [{ numero: 'OS-330145', motivo: 'ELÉTRICA', status: 'Finalizada', dataEntrada: '15/11/2025', dataSaida: '21/11/2025', temAvaria: false }], placa: 'JBL5B27', chassi: '9535V6TB0PR009127', numeroSerie: '—', marcaModelo: 'VW 11-180 Delivery', agendamento: '15/11/2025', dataEntrada: '15/11/2025', previsao: '20/11/2025', saida: '21/11/2025', dataConclusao: '21/11/2025', situacao: 'Rodando' },
  { numero: '951200', status: 'finalizado', motivo: 'REVISÃO PREVENTIVA', tipo: 'preventiva', ordens: [{ numero: 'OS-325509', motivo: 'REVISÃO PREVENTIVA', status: 'Finalizada', dataEntrada: '10/05/2026', dataSaida: '12/05/2026', temAvaria: false }, { numero: 'OS-325520', motivo: 'PNEU', status: 'Finalizada', dataEntrada: '10/05/2026', dataSaida: '11/05/2026', temAvaria: false }, { numero: 'OS-325533', motivo: 'FREIO', status: 'Finalizada', dataEntrada: '11/05/2026', dataSaida: '12/05/2026', temAvaria: true }], placa: 'SHQ6B80', chassi: '9535V6TB0PR009242', numeroSerie: '—', marcaModelo: 'VW 11-180 Delivery', agendamento: '10/05/2026', dataEntrada: '10/05/2026', previsao: '12/05/2026', saida: '12/05/2026', dataConclusao: '12/05/2026', situacao: 'Rodando' },
  { numero: '948877', status: 'finalizado', motivo: 'SINISTRO', tipo: 'sinistro', ordens: [{ numero: 'OS-321880', motivo: 'SINISTRO', status: 'Finalizada', dataEntrada: '03/04/2026', dataSaida: '25/04/2026', temAvaria: true }, { numero: 'OS-321895', motivo: 'ELÉTRICA', status: 'Finalizada', dataEntrada: '10/04/2026', dataSaida: '25/04/2026', temAvaria: false }], placa: 'JBL5E88', chassi: 'YV2RT40A8LB456789', numeroSerie: '—', marcaModelo: 'Volvo FH 460', agendamento: '02/04/2026', dataEntrada: '03/04/2026', previsao: '20/04/2026', saida: '25/04/2026', dataConclusao: '25/04/2026', situacao: 'Rodando' },
  { numero: '2066903', status: 'aberta', motivo: 'DESMOBILIZAÇÃO', tipo: 'outros', ordens: [{ numero: 'OS-344012', motivo: 'DESMOBILIZAÇÃO', status: 'Aberta', dataEntrada: '—', dataSaida: '—', temAvaria: false }], placa: 'SIE8F02', chassi: '9BM958074HB778812', numeroSerie: '—', marcaModelo: 'Mercedes Accelo 815', agendamento: '02/07/2026', dataEntrada: '—', previsao: '20/07/2026', saida: '—', dataConclusao: '—', situacao: 'Agendado' },
  { numero: '2066895', status: 'aberta', motivo: 'AFERIÇÃO TACÓGRAFO', tipo: 'preventiva', ordens: [{ numero: 'OS-343988', motivo: 'AFERIÇÃO TACÓGRAFO', status: 'Aberta', dataEntrada: '09/07/2026', dataSaida: '—', temAvaria: false }, { numero: 'OS-343999', motivo: 'ELÉTRICA', status: 'Aberta', dataEntrada: '10/07/2026', dataSaida: '—', temAvaria: false }], placa: 'BXW9D72', chassi: '9535V6TB0PR010455', numeroSerie: '—', marcaModelo: 'VW 11-180 Delivery', agendamento: '08/07/2026', dataEntrada: '09/07/2026', previsao: '18/07/2026', saida: '—', dataConclusao: '—', situacao: 'Em avaliação' },
  { numero: '2066894', status: 'aberta', motivo: 'PNEU', tipo: 'corretiva', ordens: [{ numero: 'OS-343970', motivo: 'PNEU', status: 'Em execução', dataEntrada: '11/07/2026', dataSaida: '—', temAvaria: true }], placa: 'TXI3F16', chassi: '9BM958074HB779340', numeroSerie: '—', marcaModelo: 'Mercedes Accelo 815', agendamento: '10/07/2026', dataEntrada: '11/07/2026', previsao: '17/07/2026', saida: '—', dataConclusao: '—', situacao: 'Em oficina' },
  { numero: '2066880', status: 'aberta', motivo: 'CORRETIVA', tipo: 'corretiva', ordens: [{ numero: 'OS-343900', motivo: 'SUSPENSÃO', status: 'Finalizada', dataEntrada: '12/07/2026', dataSaida: '18/07/2026', temAvaria: false }, { numero: 'OS-343911', motivo: 'FREIO', status: 'Finalizada', dataEntrada: '13/07/2026', dataSaida: '19/07/2026', temAvaria: true }], placa: '—', chassi: '—', numeroSerie: 'SN-JCB-099887', marcaModelo: 'JCB 3CX', agendamento: '12/07/2026', dataEntrada: '12/07/2026', previsao: '19/07/2026', saida: '19/07/2026', dataConclusao: '—', situacao: 'Aguardando liberação' },
  { numero: '2066910', status: 'aberta', motivo: 'REVISÃO PREVENTIVA', tipo: 'preventiva', ordens: [{ numero: 'OS-344050', motivo: 'REVISÃO PREVENTIVA', status: 'Aberta', dataEntrada: '—', dataSaida: '—', temAvaria: false }], placa: 'FQA7H21', chassi: '9BWZZZ377VT004321', numeroSerie: '—', marcaModelo: 'VW 11-180 Delivery', agendamento: '—', dataEntrada: '—', previsao: '—', saida: '—', dataConclusao: '—', situacao: 'Aguardando agendamento' },
];

/** Item autorizado para manutenção (peça ou serviço). */
export interface ItemServico {
  os: string;
  codigo: string;
  descricao: string;
  observacao: string;
  finalidade: string;
  qtde: number;
  valorUnitario: string;
  valorTotal: string;
  tipo: 'servico' | 'peca';
}

/** Dados adicionais por atendimento (problema relatado, itens, veículo/cliente, totais). */
export interface DetalheAtendimento {
  descricaoProblema: string;
  condutor: string;
  cliente: string;
  numeroContrato: string;
  centroCusto: string;
  km: string;
  anoVeiculo: string;
  modeloCompleto: string;
  itens: ItemServico[];
  totalServicos: string;
  totalPecas: string;
  totalAtendimento: string;
}

const DETALHES_BASE: Record<string, DetalheAtendimento> = {
  '972972': {
    descricaoProblema: 'Pneus dianteiros com desgaste acentuado e vibração acima de 80 km/h. Solicitada recapagem.',
    condutor: 'Marcos Lima', cliente: 'Bebidas Fruki Sa', numeroContrato: '119791', centroCusto: 'NOVO CLIENTE',
    km: '63.316', anoVeiculo: '2022/2022', modeloCompleto: 'VW - VolksWagen - 11-180 Delivery 4x2 2p (diesel)(E5)',
    itens: [
      { os: 'OS-338271', codigo: '101404', descricao: 'RECAPAGEM 235/75R17,5', observacao: 'DVRM', finalidade: 'MANUTENCAO/CONSERVACAO - FROTA', qtde: 2, valorUnitario: 'R$ 0,00', valorTotal: 'R$ 0,00', tipo: 'servico' },
      { os: 'OS-338290', codigo: '204101', descricao: 'PASTILHA DE FREIO DIANTEIRA', observacao: '—', finalidade: 'MANUTENCAO/CONSERVACAO - FROTA', qtde: 1, valorUnitario: 'R$ 210,00', valorTotal: 'R$ 210,00', tipo: 'peca' },
    ],
    totalServicos: 'R$ 0,00', totalPecas: 'R$ 210,00', totalAtendimento: 'R$ 210,00',
  },
  '957964': {
    descricaoProblema: 'Falha intermitente no sistema elétrico; luzes do painel oscilando.',
    condutor: 'Fernanda Reis', cliente: 'Bebidas Fruki Sa', numeroContrato: '119791', centroCusto: 'MATRIZ',
    km: '92.410', anoVeiculo: '2022/2022', modeloCompleto: 'VW - VolksWagen - 11-180 Delivery 4x2 2p (diesel)(E5)',
    itens: [
      { os: 'OS-330145', codigo: '305220', descricao: 'REPARO DO CHICOTE ELÉTRICO', observacao: '—', finalidade: 'MANUTENCAO/CONSERVACAO - FROTA', qtde: 1, valorUnitario: 'R$ 480,00', valorTotal: 'R$ 480,00', tipo: 'servico' },
    ],
    totalServicos: 'R$ 480,00', totalPecas: 'R$ 0,00', totalAtendimento: 'R$ 480,00',
  },
  '951200': {
    descricaoProblema: 'Veículo atingiu 130.000 km; revisão preventiva programada.',
    condutor: 'Patrícia Nunes', cliente: 'Matriz SP Ltda', numeroContrato: '120455', centroCusto: 'MATRIZ SP',
    km: '128.430', anoVeiculo: '2023/2023', modeloCompleto: 'VW - VolksWagen - 11-180 Delivery 4x2 2p (diesel)(E5)',
    itens: [
      { os: 'OS-325509', codigo: '400010', descricao: 'REVISÃO PREVENTIVA 130.000 KM', observacao: '—', finalidade: 'MANUTENCAO/CONSERVACAO - FROTA', qtde: 1, valorUnitario: 'R$ 890,00', valorTotal: 'R$ 890,00', tipo: 'servico' },
      { os: 'OS-325520', codigo: '101404', descricao: 'PNEU 235/75R17,5', observacao: '—', finalidade: 'MANUTENCAO/CONSERVACAO - FROTA', qtde: 2, valorUnitario: 'R$ 1.150,00', valorTotal: 'R$ 2.300,00', tipo: 'peca' },
      { os: 'OS-325533', codigo: '204101', descricao: 'JOGO DE PASTILHAS DE FREIO', observacao: '—', finalidade: 'MANUTENCAO/CONSERVACAO - FROTA', qtde: 1, valorUnitario: 'R$ 320,00', valorTotal: 'R$ 320,00', tipo: 'peca' },
    ],
    totalServicos: 'R$ 890,00', totalPecas: 'R$ 2.620,00', totalAtendimento: 'R$ 3.510,00',
  },
  '948877': {
    descricaoProblema: 'Colisão lateral (sinistro). Amassado na porta e lataria danificada.',
    condutor: 'Carlos Mota', cliente: 'Matriz SP Ltda', numeroContrato: '120455', centroCusto: 'MATRIZ SP',
    km: '340.120', anoVeiculo: '2023/2023', modeloCompleto: 'Volvo - FH 460 6x2 (diesel)',
    itens: [
      { os: 'OS-321880', codigo: '510300', descricao: 'FUNILARIA E PINTURA - PORTA LD', observacao: 'SINISTRO', finalidade: 'SINISTRO', qtde: 1, valorUnitario: 'R$ 3.200,00', valorTotal: 'R$ 3.200,00', tipo: 'servico' },
      { os: 'OS-321895', codigo: '305220', descricao: 'CHICOTE ELÉTRICO DA PORTA', observacao: '—', finalidade: 'SINISTRO', qtde: 1, valorUnitario: 'R$ 640,00', valorTotal: 'R$ 640,00', tipo: 'peca' },
    ],
    totalServicos: 'R$ 3.200,00', totalPecas: 'R$ 640,00', totalAtendimento: 'R$ 3.840,00',
  },
  '2066903': {
    descricaoProblema: 'Solicitação de vistoria de desmobilização do ativo.',
    condutor: '—', cliente: 'Delta Logística Ltda', numeroContrato: '121088', centroCusto: 'OPERAÇÃO SP',
    km: '—', anoVeiculo: '2021/2021', modeloCompleto: 'Mercedes - Accelo 815 (diesel)',
    itens: [
      { os: 'OS-344012', codigo: '600001', descricao: 'VISTORIA DE DESMOBILIZAÇÃO', observacao: '—', finalidade: 'DESMOBILIZAÇÃO', qtde: 1, valorUnitario: 'R$ 350,00', valorTotal: 'R$ 350,00', tipo: 'servico' },
    ],
    totalServicos: 'R$ 350,00', totalPecas: 'R$ 0,00', totalAtendimento: 'R$ 350,00',
  },
  '2066895': {
    descricaoProblema: 'Tacógrafo com selo vencido; necessária aferição obrigatória.',
    condutor: 'Marcos Lima', cliente: 'Bebidas Fruki Sa', numeroContrato: '119791', centroCusto: 'MATRIZ',
    km: '110.220', anoVeiculo: '2022/2022', modeloCompleto: 'VW - VolksWagen - 11-180 Delivery 4x2 2p (diesel)(E5)',
    itens: [
      { os: 'OS-343988', codigo: '700120', descricao: 'AFERIÇÃO DE TACÓGRAFO', observacao: '—', finalidade: 'MANUTENCAO/CONSERVACAO - FROTA', qtde: 1, valorUnitario: 'R$ 180,00', valorTotal: 'R$ 180,00', tipo: 'servico' },
      { os: 'OS-343999', codigo: '305221', descricao: 'SENSOR DO TACÓGRAFO', observacao: 'AGUARDANDO PEÇA', finalidade: 'MANUTENCAO/CONSERVACAO - FROTA', qtde: 1, valorUnitario: 'R$ 260,00', valorTotal: 'R$ 260,00', tipo: 'peca' },
    ],
    totalServicos: 'R$ 180,00', totalPecas: 'R$ 260,00', totalAtendimento: 'R$ 440,00',
  },
  '2066894': {
    descricaoProblema: 'Pneu do eixo traseiro furado; troca necessária.',
    condutor: 'Fernanda Reis', cliente: 'Delta Logística Ltda', numeroContrato: '121088', centroCusto: 'OPERAÇÃO SP',
    km: '88.500', anoVeiculo: '2021/2021', modeloCompleto: 'Mercedes - Accelo 815 (diesel)',
    itens: [
      { os: 'OS-343970', codigo: '101404', descricao: 'PNEU 235/75R17,5', observacao: '—', finalidade: 'MANUTENCAO/CONSERVACAO - FROTA', qtde: 2, valorUnitario: 'R$ 1.150,00', valorTotal: 'R$ 2.300,00', tipo: 'peca' },
    ],
    totalServicos: 'R$ 0,00', totalPecas: 'R$ 2.300,00', totalAtendimento: 'R$ 2.300,00',
  },
  '2066880': {
    descricaoProblema: 'Vazamento hidráulico e ruído na suspensão do equipamento.',
    condutor: '—', cliente: 'Obra Jundiaí S.A.', numeroContrato: '121500', centroCusto: 'OBRA JUNDIAÍ',
    km: '8.940 h', anoVeiculo: '2024/2024', modeloCompleto: 'JCB - 3CX Retroescavadeira',
    itens: [
      { os: 'OS-343900', codigo: '820044', descricao: 'REPARO SISTEMA HIDRÁULICO', observacao: '—', finalidade: 'MANUTENCAO/CONSERVACAO - FROTA', qtde: 1, valorUnitario: 'R$ 1.480,00', valorTotal: 'R$ 1.480,00', tipo: 'servico' },
      { os: 'OS-343911', codigo: '204120', descricao: 'KIT DE VEDAÇÃO HIDRÁULICA', observacao: '—', finalidade: 'MANUTENCAO/CONSERVACAO - FROTA', qtde: 1, valorUnitario: 'R$ 390,00', valorTotal: 'R$ 390,00', tipo: 'peca' },
    ],
    totalServicos: 'R$ 1.480,00', totalPecas: 'R$ 390,00', totalAtendimento: 'R$ 1.870,00',
  },
  '2066910': {
    descricaoProblema: 'Solicitação de revisão preventiva; aguardando agendamento com a oficina.',
    condutor: 'Rafael Dias', cliente: 'Bebidas Fruki Sa', numeroContrato: '119791', centroCusto: 'MATRIZ',
    km: '54.900', anoVeiculo: '2023/2023', modeloCompleto: 'VW - VolksWagen - 11-180 Delivery 4x2 2p (diesel)(E5)',
    itens: [
      { os: 'OS-344050', codigo: '400010', descricao: 'REVISÃO PREVENTIVA', observacao: '—', finalidade: 'MANUTENCAO/CONSERVACAO - FROTA', qtde: 1, valorUnitario: 'R$ 0,00', valorTotal: 'R$ 0,00', tipo: 'servico' },
    ],
    totalServicos: 'R$ 0,00', totalPecas: 'R$ 0,00', totalAtendimento: 'R$ 0,00',
  },
};

export const DETALHE_PADRAO: DetalheAtendimento = {
  descricaoProblema: 'Sem descrição registrada no chamado.',
  condutor: '—', cliente: '—', numeroContrato: '—', centroCusto: '—', km: '—', anoVeiculo: '—', modeloCompleto: '—',
  itens: [], totalServicos: 'R$ 0,00', totalPecas: 'R$ 0,00', totalAtendimento: 'R$ 0,00',
};

/* ------------------------------------------------------------------ *
 * Gerador de manutenções fictícias — popula as tabelas com bastante dados.
 * Determinístico (sem random), para o build/SSR ficar estável.
 * ------------------------------------------------------------------ */
function gerarManutencoes(n: number): { atendimentos: AtendimentoServico[]; detalhes: Record<string, DetalheAtendimento> } {
  const MODELOS = ['VW 11-180 Delivery', 'Mercedes Accelo 815', 'Volvo FH 460', 'Scania R 450', 'VW Constellation 24.280', 'Iveco Tector 240E28', 'Ford Cargo 1719'];
  const MOTIVOS: { motivo: string; tipo: TipoServico }[] = [
    { motivo: 'REVISÃO PREVENTIVA', tipo: 'preventiva' },
    { motivo: 'PNEU', tipo: 'corretiva' },
    { motivo: 'FREIO', tipo: 'corretiva' },
    { motivo: 'ELÉTRICA', tipo: 'corretiva' },
    { motivo: 'MOTOR', tipo: 'corretiva' },
    { motivo: 'SUSPENSÃO', tipo: 'corretiva' },
    { motivo: 'AR-CONDICIONADO', tipo: 'corretiva' },
    { motivo: 'SINISTRO', tipo: 'sinistro' },
    { motivo: 'AFERIÇÃO TACÓGRAFO', tipo: 'preventiva' },
    { motivo: 'DESMOBILIZAÇÃO', tipo: 'outros' },
  ];
  const CONDUTORES = ['Marcos Lima', 'Fernanda Reis', 'Carlos Mota', 'Patrícia Nunes', 'Rafael Dias', 'Juliana Alves', 'Bruno Costa', 'Sandra Melo', 'Eduardo Pires', 'Camila Rocha'];
  const CLIENTES = ['Bebidas Fruki Sa', 'Matriz SP Ltda', 'Delta Logística Ltda', 'Obra Jundiaí S.A.', 'Transportes Vale Verde'];
  const CENTROS = ['MATRIZ', 'MATRIZ SP', 'OPERAÇÃO SP', 'OBRA JUNDIAÍ', 'FILIAL CAMPINAS'];
  const ESTAGIOS: EtapaManutencaoKey[] = ['finalizado', 'finalizado', 'finalizado', 'manutencao', 'agendado', 'finalizado', 'saida', 'manutencao', 'finalizado', 'aguardando_agendamento'];

  const L = 'ABCDEFGHJKLMNPRSTUVWXYZ';
  const placaDe = (i: number) => `${L[(i * 7 + 2) % L.length]}${L[(i * 5 + 9) % L.length]}${L[(i * 11 + 4) % L.length]}${(i * 3) % 10}${L[(i * 13 + 6) % L.length]}${(i * 7) % 10}${(i * 9 + 1) % 10}`;
  const dd = (offset: number) => {
    const d = new Date(HOJE);
    d.setDate(d.getDate() + offset);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const atendimentos: AtendimentoServico[] = [];
  const detalhes: Record<string, DetalheAtendimento> = {};

  for (let i = 0; i < n; i++) {
    const numero = String(2067000 + i);
    const etapa = ESTAGIOS[i % ESTAGIOS.length];
    const mo = MOTIVOS[i % MOTIVOS.length];
    const modelo = MODELOS[i % MODELOS.length];
    const condutor = CONDUTORES[i % CONDUTORES.length];
    const cliente = CLIENTES[i % CLIENTES.length];
    const centro = CENTROS[i % CENTROS.length];
    const placa = placaDe(i);
    const temAvaria = i % 4 === 0;
    const reembolso = `R$ ${200 + (i % 12) * 85},00`;
    const baseAg = -(20 + (i % 40));

    let agendamento = '—', dataEntrada = '—', previsao = '—', saida = '—', dataConclusao = '—';
    let status: AtendimentoServico['status'] = 'aberta';
    let situacao = 'Aguardando agendamento';
    let osStatus: OrdemServico['status'] = 'Aberta';

    switch (etapa) {
      case 'aguardando_agendamento':
        situacao = 'Aguardando agendamento'; osStatus = 'Aberta';
        break;
      case 'agendado':
        agendamento = dd(3 + (i % 10)); previsao = dd(8 + (i % 10));
        situacao = 'Agendado'; osStatus = 'Aberta';
        break;
      case 'manutencao':
        agendamento = dd(baseAg); dataEntrada = dd(baseAg + 2); previsao = dd(2 + (i % 6));
        situacao = 'Em oficina'; osStatus = 'Em execução';
        break;
      case 'saida':
        agendamento = dd(baseAg); dataEntrada = dd(baseAg + 1); previsao = dd(baseAg + 5); saida = dd(-(1 + (i % 3)));
        situacao = 'Aguardando liberação'; osStatus = 'Finalizada';
        break;
      case 'finalizado':
        agendamento = dd(baseAg); dataEntrada = dd(baseAg + 1); previsao = dd(baseAg + 4); saida = dd(baseAg + 6); dataConclusao = saida;
        status = 'finalizado'; situacao = 'Rodando'; osStatus = 'Finalizada';
        break;
    }

    const dataSaidaOS = etapa === 'finalizado' || etapa === 'saida' ? saida : '—';
    const ordens: OrdemServico[] = [
      { numero: `OS-${400000 + i * 2}`, motivo: mo.motivo, status: osStatus, dataEntrada, dataSaida: dataSaidaOS, temAvaria },
    ];
    if (i % 3 === 0) {
      const mo2 = MOTIVOS[(i + 3) % MOTIVOS.length];
      ordens.push({ numero: `OS-${400001 + i * 2}`, motivo: mo2.motivo, status: osStatus, dataEntrada, dataSaida: dataSaidaOS, temAvaria: false });
    }

    atendimentos.push({
      numero, status, motivo: mo.motivo, tipo: mo.tipo, ordens,
      placa, chassi: `9BW${String(100000000 + i * 137).slice(0, 9)}`, numeroSerie: '—',
      marcaModelo: modelo, agendamento, dataEntrada, previsao, saida, dataConclusao, situacao,
    });

    detalhes[numero] = {
      descricaoProblema: `Atendimento de ${mo.motivo.toLowerCase()} registrado para o veículo ${placa}.`,
      condutor, cliente, numeroContrato: String(120000 + (i % 900)), centroCusto: centro,
      km: String((30 + (i % 200)) * 1000), anoVeiculo: `${2021 + (i % 4)}/${2021 + (i % 4)}`, modeloCompleto: modelo,
      itens: ordens.map((o, k) => ({
        os: o.numero, codigo: String(100000 + (i % 900) + k), descricao: o.motivo, observacao: '—',
        finalidade: 'MANUTENCAO/CONSERVACAO - FROTA', qtde: 1,
        valorUnitario: temAvaria ? reembolso : 'R$ 0,00', valorTotal: temAvaria ? reembolso : 'R$ 0,00',
        tipo: o.motivo === 'REVISÃO PREVENTIVA' || o.motivo === 'AFERIÇÃO TACÓGRAFO' ? 'servico' : 'peca',
      })),
      totalServicos: 'R$ 0,00', totalPecas: temAvaria ? reembolso : 'R$ 0,00', totalAtendimento: temAvaria ? reembolso : 'R$ 0,00',
    };
  }

  return { atendimentos, detalhes };
}

const GERADOS = gerarManutencoes(50);

export const ATENDIMENTOS_SERVICO: AtendimentoServico[] = [...ATENDIMENTOS_BASE, ...GERADOS.atendimentos];
export const DETALHES_ATENDIMENTO: Record<string, DetalheAtendimento> = { ...DETALHES_BASE, ...GERADOS.detalhes };

export const getDetalhe = (numero: string): DetalheAtendimento => DETALHES_ATENDIMENTO[numero] ?? DETALHE_PADRAO;

/** Etapa atual de um atendimento (mesma linha do tempo do modal). */
export function etapaAtendimento(a: AtendimentoServico): EtapaManutencaoKey {
  if (a.status === 'finalizado') return 'finalizado';
  if (a.agendamento === '—') return 'aguardando_agendamento';
  if (a.dataEntrada === '—') return 'agendado';
  if (a.saida !== '—') return 'saida';
  return 'manutencao';
}
