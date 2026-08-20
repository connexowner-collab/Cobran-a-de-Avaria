/**
 * Dados mockados do Portal do Cliente (parte 2 do protótipo).
 * Estrutura de menus fiel ao portal atual (portaldocliente.vamoslocacao.com.br),
 * com as novas áreas propostas: Central de Chamados, Notificações e
 * Faturamento self-service.
 */

/**
 * Grupos de cliente / distribuições de frota vinculados ao perfil logado.
 * O seletor do topo do portal permite alternar entre eles; ao trocar, o portal
 * recarrega com os ativos do grupo selecionado.
 */
export interface GrupoDistribuicao {
  id: string;
  /** Nome do grupo de cliente (ex.: "Frota Sul"). */
  nome: string;
  /** Distribuição/base do grupo (ex.: "Distribuição SP"). */
  distribuicao: string;
  /** Quantidade de ativos do grupo (exibido no dropdown). */
  ativos: number;
  regiao: string;
}

export const GRUPOS_DISTRIBUICAO: GrupoDistribuicao[] = [
  { id: 'g-sp', nome: 'Frota Sul', distribuicao: 'Distribuição SP', ativos: 42, regiao: 'Sudeste' },
  { id: 'g-rj', nome: 'Frota Sudeste', distribuicao: 'Distribuição RJ', ativos: 28, regiao: 'Sudeste' },
  { id: 'g-rs', nome: 'Frota Sul', distribuicao: 'Distribuição RS', ativos: 35, regiao: 'Sul' },
  { id: 'g-ba', nome: 'Frota Nordeste', distribuicao: 'Distribuição BA', ativos: 19, regiao: 'Nordeste' },
  { id: 'g-go', nome: 'Frota Centro-Oeste', distribuicao: 'Distribuição GO', ativos: 24, regiao: 'Centro-Oeste' },
];

export type ChamadoStatus = 'aberto' | 'atendimento' | 'resolvido';

export interface ChamadoResposta {
  autor: string;
  origem: 'cliente' | 'suporte';
  horario: string;
  texto: string;
}

export interface Chamado {
  id: string;
  categoria: string;
  placa: string;
  status: ChamadoStatus;
  /** Data de abertura do chamado (dd/mm/aaaa). */
  dataAbertura: string;
  abertoHa: string;
  /** Descrição registrada na abertura do chamado. */
  descricao: string;
  solicitante: string;
  responsavel: string;
  respostas: ChamadoResposta[];
}

const CHAMADOS_BASE: Chamado[] = [
  {
    id: 'CH-3391', categoria: 'Falha no sistema de freios', placa: 'SHQ6B80', status: 'atendimento',
    dataAbertura: '20/07/2026', abertoHa: 'Aberto há 2h', descricao: 'Veículo apresentando ruído forte ao frear; já reduzimos a velocidade de operação. Solicito verificação urgente do sistema de freios.', solicitante: 'Marcos Lima', responsavel: 'Ana Torres',
    respostas: [
      { autor: 'Marcos Lima', origem: 'cliente', horario: '09:12', texto: 'Veículo apresentando ruído forte ao frear, já reduzimos a velocidade de operação.' },
      { autor: 'Ana Torres', origem: 'suporte', horario: '09:40', texto: 'Chamado recebido, acionando equipe de campo mais próxima da unidade.' },
      { autor: 'Ana Torres', origem: 'suporte', horario: '10:55', texto: 'Técnico a caminho, previsão de chegada em 40 min.' },
    ],
  },
  {
    id: 'CH-3388', categoria: 'Pneu furado - eixo traseiro', placa: 'JBL5B25', status: 'atendimento',
    dataAbertura: '19/07/2026', abertoHa: 'Aberto há 1d', descricao: 'Pneu traseiro direito furou durante o trajeto; veículo parado no acostamento aguardando socorro.', solicitante: 'Fernanda Reis', responsavel: 'Diego Souza',
    respostas: [
      { autor: 'Fernanda Reis', origem: 'cliente', horario: 'Ontem 14:02', texto: 'Pneu traseiro direito furou durante o trajeto.' },
      { autor: 'Diego Souza', origem: 'suporte', horario: 'Ontem 14:30', texto: 'Guincho acionado, aguardando confirmação de disponibilidade do estepe.' },
    ],
  },
  {
    id: 'CH-3379', categoria: 'Painel indicando falha no motor', placa: 'DSA9924', status: 'atendimento',
    dataAbertura: '17/07/2026', abertoHa: 'Aberto há 3d', descricao: 'Luz de injeção acesa constantemente no painel, com perda de potência do motor.', solicitante: 'Carlos Mota', responsavel: 'Equipe Técnica SP',
    respostas: [
      { autor: 'Carlos Mota', origem: 'cliente', horario: 'Seg 08:10', texto: 'Luz de injeção acesa constantemente no painel.' },
      { autor: 'Equipe Técnica SP', origem: 'suporte', horario: 'Seg 11:20', texto: 'Encaminhado para diagnóstico presencial, agenda em análise.' },
    ],
  },
  {
    id: 'CH-3365', categoria: 'Solicitação de veículo reserva', placa: 'JBL5E88', status: 'resolvido',
    dataAbertura: '15/07/2026', abertoHa: 'Aberto há 5d', descricao: 'Precisamos de veículo reserva enquanto o titular está em manutenção.', solicitante: 'Patrícia Nunes', responsavel: 'Ana Torres',
    respostas: [
      { autor: 'Patrícia Nunes', origem: 'cliente', horario: 'Qui 07:45', texto: 'Precisamos de veículo reserva enquanto o titular está em manutenção.' },
      { autor: 'Ana Torres', origem: 'suporte', horario: 'Qui 09:00', texto: 'Veículo reserva disponibilizado no pátio de São Paulo.' },
    ],
  },
  {
    id: 'CH-3360', categoria: 'Vidro trincado', placa: 'SHQ6B80', status: 'resolvido',
    dataAbertura: '14/07/2026', abertoHa: 'Aberto há 6d', descricao: 'Vidro dianteiro trincou com impacto de pedra na rodovia.', solicitante: 'Marcos Lima', responsavel: 'Diego Souza',
    respostas: [
      { autor: 'Marcos Lima', origem: 'cliente', horario: 'Qua 10:00', texto: 'Vidro dianteiro trincou com impacto de pedra na rodovia.' },
      { autor: 'Diego Souza', origem: 'suporte', horario: 'Qua 15:00', texto: 'Troca de vidro realizada, veículo liberado.' },
    ],
  },
  {
    id: 'CH-3352', categoria: 'Ar-condicionado sem gelar', placa: 'DSA9924', status: 'aberto',
    dataAbertura: '12/07/2026', abertoHa: 'Aberto há 8d', descricao: 'Ar-condicionado parou de gelar; motorista relatando calor excessivo na cabine.', solicitante: 'Carlos Mota', responsavel: '—',
    respostas: [
      { autor: 'Carlos Mota', origem: 'cliente', horario: 'Seg 09:00', texto: 'Ar-condicionado parou de gelar, motorista relatando calor excessivo em cabine.' },
    ],
  },
  {
    id: 'CH-3406', categoria: 'Ruído na suspensão dianteira', placa: 'JBL5B26', status: 'atendimento',
    dataAbertura: '20/07/2026', abertoHa: 'Aberto há 5h', descricao: 'Barulho de batida na suspensão dianteira ao passar em lombadas.', solicitante: 'Fernanda Reis', responsavel: 'Diego Souza',
    respostas: [
      { autor: 'Fernanda Reis', origem: 'cliente', horario: 'Hoje 07:20', texto: 'Barulho de batida na suspensão dianteira ao passar em lombadas.' },
      { autor: 'Diego Souza', origem: 'suporte', horario: 'Hoje 08:05', texto: 'Agendado diagnóstico na oficina de Campinas para hoje à tarde.' },
    ],
  },
  {
    id: 'CH-3399', categoria: 'Solicitação de segunda via de crachá', placa: '—', status: 'resolvido',
    dataAbertura: '16/07/2026', abertoHa: 'Aberto há 4d', descricao: 'Motorista perdeu o crachá de acesso ao pátio de Campinas; solicito segunda via.', solicitante: 'Patrícia Nunes', responsavel: 'Ana Torres',
    respostas: [
      { autor: 'Patrícia Nunes', origem: 'cliente', horario: 'Ter 10:00', texto: 'Motorista perdeu o crachão de acesso ao pátio de Campinas.' },
      { autor: 'Ana Torres', origem: 'suporte', horario: 'Ter 11:30', texto: 'Segunda via emitida e enviada por e-mail.' },
    ],
  },
  {
    id: 'CH-3410', categoria: 'Vazamento de óleo no motor', placa: 'RTX4C12', status: 'aberto',
    dataAbertura: '20/07/2026', abertoHa: 'Aberto há 1h', descricao: 'Identificado vazamento de óleo embaixo do motor na retroescavadeira.', solicitante: 'Carlos Mota', responsavel: '—',
    respostas: [
      { autor: 'Carlos Mota', origem: 'cliente', horario: 'Hoje 11:40', texto: 'Identificado vazamento de óleo embaixo do motor na retroescavadeira.' },
    ],
  },
  {
    id: 'CH-3345', categoria: 'Erro no painel de telemetria', placa: 'MNT7D45', status: 'atendimento',
    dataAbertura: '11/07/2026', abertoHa: 'Aberto há 9d', descricao: 'Painel de telemetria não atualiza a localização do equipamento há 2 dias.', solicitante: 'Marcos Lima', responsavel: 'Equipe Técnica SP',
    respostas: [
      { autor: 'Marcos Lima', origem: 'cliente', horario: 'Qui 08:00', texto: 'Painel de telemetria não atualiza a localização do equipamento há 2 dias.' },
      { autor: 'Equipe Técnica SP', origem: 'suporte', horario: 'Qui 09:15', texto: 'Reinicialização remota enviada, aguardando confirmação do cliente.' },
    ],
  },
];

/* ------------------------------------------------------------------ *
 * Gerador de chamados fictícios — popula a Central de Chamados com um
 * volume realista, cobrindo assuntos além de manutenção (documentação,
 * financeiro, cadastro, telemetria etc.). Determinístico (sem random),
 * para o build/SSR ficar estável.
 * ------------------------------------------------------------------ */
function gerarChamados(): Chamado[] {
  /** Assuntos gerais de chamado — manutenção é só uma parte do conjunto. */
  const CATEGORIAS = [
    'Falha no sistema de freios', 'Pneu furado - eixo traseiro', 'Painel indicando falha no motor',
    'Ar-condicionado sem gelar', 'Ruído na suspensão dianteira', 'Vazamento de óleo no motor',
    'Vidro trincado', 'Solicitação de veículo reserva', 'Solicitação de guincho',
    'Dúvida sobre fatura', 'Solicitação de 2ª via de boleto', 'Contestação de multa lançada',
    'Atualização de cadastro do condutor', 'Solicitação de 2ª via de CRLV', 'Troca de titularidade',
    'Erro no painel de telemetria', 'Rastreador sem sinal', 'Agendamento de revisão preventiva',
    'Solicitação de segunda via de crachá', 'Dúvida sobre contrato',
  ];
  const STATUSES: ChamadoStatus[] = [
    'aberto', 'atendimento', 'atendimento', 'atendimento', 'resolvido',
    'resolvido', 'atendimento', 'aberto', 'atendimento', 'resolvido',
  ];
  const PLACAS = ['SHQ6B80', 'JBL5B25', 'DSA9924', 'JBL5E88', 'JBL5B26', 'RTX4C12', 'MNT7D45', 'JBL5B27', '—'];
  const SOLICITANTES = ['Marcos Lima', 'Fernanda Reis', 'Carlos Mota', 'Patrícia Nunes', 'Rafael Dias', 'Juliana Alves', 'Bruno Costa', 'Sandra Melo'];
  const RESPONSAVEIS = ['Ana Torres', 'Diego Souza', 'Equipe Técnica SP', 'Central de Atendimento', 'Financeiro Vamos'];

  /** Referência "hoje" do protótipo, para derivar a data de abertura. */
  const HOJE_PORTAL = new Date(2026, 6, 20); // 20/07/2026
  const fmt = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

  /* Volume de chamados por mês (índice 0 = 11 meses atrás … 11 = mês atual).
     Valores variados de propósito, com leve tendência de alta nos meses recentes,
     para o gráfico "chamados por mês" não ficar uniforme. */
  const PADRAO_MES = [5, 9, 6, 11, 7, 13, 8, 14, 10, 12, 9, 16];

  const chamados: Chamado[] = [];
  let seq = 0;
  for (let m = 0; m < 12; m++) {
    const mesOffset = 11 - m; // 11 (mais antigo) … 0 (mês atual)
    const qtd = PADRAO_MES[m];
    for (let j = 0; j < qtd; j++) {
      const i = seq++;
      const id = `CH-${3200 + i * 3}`;
      const categoria = CATEGORIAS[i % CATEGORIAS.length];
      const placa = PLACAS[i % PLACAS.length];
      const solicitante = SOLICITANTES[i % SOLICITANTES.length];

      const diaMax = mesOffset === 0 ? 19 : 27; // mês atual não pode passar do dia de hoje
      const dia = 1 + ((i * 7 + j * 3) % diaMax);
      const dRef = new Date(HOJE_PORTAL.getFullYear(), HOJE_PORTAL.getMonth() - mesOffset, dia);
      const dataAbertura = fmt(dRef);
      const diffDias = Math.max(0, Math.round((HOJE_PORTAL.getTime() - dRef.getTime()) / 86_400_000));

      // Meses recentes concentram os chamados em aberto; anteriores já resolvidos.
      const status: ChamadoStatus = mesOffset <= 1 ? STATUSES[i % STATUSES.length] : 'resolvido';
      const resolvido = status === 'resolvido';
      const responsavel = status === 'aberto' ? '—' : RESPONSAVEIS[i % RESPONSAVEIS.length];
      const abertoHa = diffDias < 1 ? 'Aberto hoje' : `Aberto há ${diffDias}d`;
      const descricao = `${categoria}${placa !== '—' ? ` no ativo ${placa}` : ''}. Registrado por ${solicitante} para análise da equipe Vamos.`;

      chamados.push({
        id, categoria, placa, status, dataAbertura, abertoHa, descricao, solicitante, responsavel,
        respostas: [
          { autor: solicitante, origem: 'cliente', horario: `${String(7 + (i % 10)).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}`, texto: `${categoria} relatada${placa !== '—' ? ` no ativo ${placa}` : ''}.` },
          ...(status !== 'aberto'
            ? [{ autor: responsavel, origem: 'suporte' as const, horario: `${String(9 + (i % 8)).padStart(2, '0')}:${String((i * 11) % 60).padStart(2, '0')}`, texto: resolvido ? 'Chamado atendido e concluído.' : 'Chamado em tratativa pela equipe responsável.' }]
            : []),
        ],
      });
    }
  }
  return chamados;
}

export const CHAMADOS: Chamado[] = [...CHAMADOS_BASE, ...gerarChamados()];

export type FaturaStatus = 'pago' | 'aberto' | 'vencido';

export interface Fatura {
  nf: string;
  competencia: string;
  valor: string;
  vencimento: string;
  status: FaturaStatus;
}

export const FATURAS: Fatura[] = [
  { nf: 'NF-88421', competencia: '07/2026', valor: 'R$ 184.250,00', vencimento: '10/08/2026', status: 'aberto' },
  { nf: 'NF-87990', competencia: '06/2026', valor: 'R$ 182.100,00', vencimento: '10/07/2026', status: 'pago' },
  { nf: 'NF-87540', competencia: '05/2026', valor: 'R$ 181.780,00', vencimento: '10/06/2026', status: 'pago' },
  { nf: 'NF-87102', competencia: '04/2026', valor: 'R$ 179.990,00', vencimento: '10/05/2026', status: 'pago' },
  { nf: 'NF-86677', competencia: '03/2026', valor: 'R$ 24.310,00', vencimento: '10/04/2026', status: 'vencido' },
  { nf: 'NF-86201', competencia: '02/2026', valor: 'R$ 178.420,00', vencimento: '10/03/2026', status: 'pago' },
];

export type VeiculoSituacao = 'ativo' | 'manutencao' | 'parado';

/** Status do documento CRLV (SLA de licenciamento). "sem" = máquina/implemento sem CRLV. */
export type CrlvStatus = 'vigente' | 'a_vencer' | 'vencido' | 'sem';

export interface VeiculoFrota {
  frota: string;
  placa: string;
  chassi: string;
  renavam: string;
  anoModelo: string;
  modelo: string;
  categoria: string;
  km: string;
  /** Km rodado no último mês. '—' para ativos medidos em horas. */
  kmMes: string;
  contrato: string;
  situacao: VeiculoSituacao;
  regiao: string;
  /** Ano de exercício do CRLV (licenciamento). '—' quando não se aplica. */
  crlvAno: string;
  crlvStatus: CrlvStatus;
}

const VEICULOS_BASE: VeiculoFrota[] = [
  { frota: 'BEBIDAS FRUKI', placa: 'JBL5B25', chassi: '9535V6TB0PR009032', renavam: '01317228496', anoModelo: '2022', modelo: 'VW 11-180 Delivery', categoria: 'Caminhão leve', km: '96.200 km', kmMes: '3.640 km', contrato: 'CTR-2023-0087', situacao: 'ativo', regiao: 'Sul', crlvAno: '2026', crlvStatus: 'vigente' },
  { frota: 'BEBIDAS FRUKI', placa: 'JBL5B26', chassi: '9535V6TB1PR009041', renavam: '01317229891', anoModelo: '2022', modelo: 'VW 11-180 Delivery', categoria: 'Caminhão leve', km: '92.410 km', kmMes: '3.510 km', contrato: 'CTR-2023-0087', situacao: 'ativo', regiao: 'Sul', crlvAno: '2026', crlvStatus: 'vigente' },
  { frota: 'BEBIDAS FRUKI', placa: 'JBL5B27', chassi: '9535V6TB0PR009127', renavam: '01317231390', anoModelo: '2022', modelo: 'VW 11-180 Delivery', categoria: 'Caminhão leve', km: '88.930 km', kmMes: '3.280 km', contrato: 'CTR-2023-0087', situacao: 'ativo', regiao: 'Sul', crlvAno: '2025', crlvStatus: 'a_vencer' },
  { frota: 'MATRIZ SP', placa: 'SHQ6B80', chassi: '9535V6TB0PR009242', renavam: '01317232655', anoModelo: '2023', modelo: 'VW 11-180 Delivery', categoria: 'Caminhão leve', km: '128.430 km', kmMes: '4.120 km', contrato: 'CTR-2024-0193', situacao: 'ativo', regiao: 'Sudeste', crlvAno: '2026', crlvStatus: 'vigente' },
  { frota: 'MATRIZ SP', placa: 'DSA9924', chassi: '9BM958074HB123456', renavam: '01317233981', anoModelo: '2021', modelo: 'Mercedes Accelo 815', categoria: 'Caminhão médio', km: '210.900 km', kmMes: '5.980 km', contrato: 'CTR-2024-0155', situacao: 'manutencao', regiao: 'Sudeste', crlvAno: '2025', crlvStatus: 'vencido' },
  { frota: 'MATRIZ SP', placa: 'JBL5E88', chassi: 'YV2RT40A8LB456789', renavam: '01317235112', anoModelo: '2023', modelo: 'Volvo FH 460', categoria: 'Caminhão pesado', km: '340.120 km', kmMes: '7.210 km', contrato: 'CTR-2024-0210', situacao: 'ativo', regiao: 'Sudeste', crlvAno: '2026', crlvStatus: 'vigente' },
  { frota: 'OBRA JUNDIAÍ', placa: 'RTX4C12', chassi: 'JCB3CX4TC02233445', renavam: '01317236774', anoModelo: '2024', modelo: 'JCB 3CX', categoria: 'Retroescavadeira', km: '8.940 h', kmMes: '—', contrato: 'CTR-2025-0031', situacao: 'parado', regiao: 'Sudeste', crlvAno: '—', crlvStatus: 'sem' },
  { frota: 'OBRA JUNDIAÍ', placa: 'MNT7D45', chassi: 'MANMRT2550C099887', renavam: '01317238001', anoModelo: '2024', modelo: 'Manitou MRT 2550', categoria: 'Manipulador telescópico', km: '3.210 h', kmMes: '—', contrato: 'CTR-2025-0044', situacao: 'ativo', regiao: 'Sudeste', crlvAno: '—', crlvStatus: 'sem' },
];

/* Gerador determinístico compartilhado (sem aleatoriedade real → sem divergência de hidratação). */
function criarRnd(seedInicial: number) {
  let seed = seedInicial;
  return () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
}

const MODELOS_FROTA_GEN = [
  { modelo: 'VW 11-180 Delivery', categoria: 'Caminhão leve' },
  { modelo: 'Mercedes Accelo 815', categoria: 'Caminhão médio' },
  { modelo: 'Volvo FH 460', categoria: 'Caminhão pesado' },
  { modelo: 'Scania R 450', categoria: 'Caminhão pesado' },
  { modelo: 'VW Constellation 24.280', categoria: 'Caminhão pesado' },
  { modelo: 'Iveco Tector 11-190', categoria: 'Caminhão médio' },
  { modelo: 'Ford Cargo 1719', categoria: 'Caminhão médio' },
  { modelo: 'Mercedes Atego 2426', categoria: 'Caminhão médio' },
  { modelo: 'Volvo FMX 500', categoria: 'Caminhão pesado' },
  { modelo: 'JCB 3CX', categoria: 'Retroescavadeira' },
  { modelo: 'Manitou MRT 2550', categoria: 'Manipulador telescópico' },
] as const;

/** Gera veículos completos para compor a frota canônica (usada por todas as abas). */
function gerarFrotaCompleta(qtd: number, placasBase: string[]): VeiculoFrota[] {
  const rnd = criarRnd(551133);
  const L = 'ABCDEFGHIJKLMNPQRSTUVWXYZ';
  const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rnd() * arr.length)];
  const pL = () => L[Math.floor(rnd() * L.length)];
  const pD = () => Math.floor(rnd() * 10);
  const dig = (n: number) => Array.from({ length: n }, pD).join('');
  const usadas = new Set<string>(placasBase);
  const frotas = ['MATRIZ SP', 'BEBIDAS FRUKI', 'OBRA JUNDIAÍ', 'FILIAL RJ', 'FILIAL PR', 'OPERAÇÃO MG'] as const;
  const regioes = ['Sudeste', 'Sudeste', 'Sudeste', 'Sul', 'Nordeste', 'Centro-Oeste', 'Norte'] as const;
  const situacoes: VeiculoSituacao[] = ['ativo', 'ativo', 'ativo', 'ativo', 'ativo', 'ativo', 'manutencao', 'parado'];
  const crlvs: CrlvStatus[] = ['vigente', 'vigente', 'vigente', 'a_vencer', 'vencido'];

  const out: VeiculoFrota[] = [];
  while (out.length < qtd) {
    const placa = `${pL()}${pL()}${pL()}${pD()}${pL()}${pD()}${pD()}`;
    if (usadas.has(placa)) continue;
    usadas.add(placa);
    const mod = pick(MODELOS_FROTA_GEN);
    const maquina = mod.categoria === 'Retroescavadeira' || mod.categoria === 'Manipulador telescópico';
    const situacao = maquina ? pick(['ativo', 'ativo', 'parado'] as VeiculoSituacao[]) : pick(situacoes);
    const crlvStatus: CrlvStatus = maquina ? 'sem' : pick(crlvs);
    const crlvAno = crlvStatus === 'sem' ? '—' : crlvStatus === 'vencido' ? '2025' : '2026';
    const km = maquina
      ? `${1 + Math.floor(rnd() * 12)}.${dig(3)} h`
      : `${20 + Math.floor(rnd() * 380)}.${dig(3)} km`;
    const kmMes = maquina ? '—' : `${1 + Math.floor(rnd() * 7)}.${dig(3)} km`;
    out.push({
      frota: pick(frotas),
      placa,
      chassi: `${pL()}${pL()}${dig(3)}${pL()}${dig(2)}${pL()}${dig(6)}`.slice(0, 17),
      renavam: `0${dig(10)}`,
      anoModelo: String(2018 + Math.floor(rnd() * 8)),
      modelo: mod.modelo,
      categoria: mod.categoria,
      km,
      kmMes,
      contrato: `CTR-202${1 + Math.floor(rnd() * 5)}-0${dig(3)}`,
      situacao,
      regiao: pick(regioes),
      crlvAno,
      crlvStatus,
    });
  }
  return out;
}

/** Frota canônica do portal (base real + gerada). Fonte única para todas as abas. */
export const VEICULOS: VeiculoFrota[] = [...VEICULOS_BASE, ...gerarFrotaCompleta(200, VEICULOS_BASE.map((v) => v.placa))];

/** Total de ativos da frota — use em qualquer KPI de "frota total". */
export const FROTA_TOTAL = VEICULOS.length;

export type AvariaStatus = 'analise' | 'aprovada' | 'contestada' | 'paga';
export type AvariaMotivo = 'Corretiva' | 'Preventiva' | 'Sinistro';

export interface Avaria {
  id: string;
  placa: string;
  numeroAtendimento: string;
  cliente: string;
  cnpjCliente: string;
  centroCusto: string;
  descricao: string;
  motivo: AvariaMotivo;
  data: string;
  valorTotal: string;
  valor: string;
  numeroDemonstrativo: string;
  status: AvariaStatus;
  /** Quantidade de fotos anexadas pela oficina como evidência da avaria. */
  fotos: number;
}

export const AVARIAS: Avaria[] = [
  { id: 'CA-2210', placa: 'SHQ6B80', numeroAtendimento: 'AT-58421', cliente: 'Vamos Locação', cnpjCliente: '12.345.678/0001-90', centroCusto: 'Matriz SP', descricao: 'Para-choque dianteiro amassado', motivo: 'Corretiva', data: '02/07/2026', valorTotal: 'R$ 4.200,00', valor: 'R$ 3.850,00', numeroDemonstrativo: 'DM-99231', status: 'analise', fotos: 3 },
  { id: 'CA-2224', placa: 'JBL5E88', numeroAtendimento: 'AT-58455', cliente: 'Vamos Locação', cnpjCliente: '12.345.678/0001-90', centroCusto: 'Matriz SP', descricao: 'Amassado na porta lateral direita', motivo: 'Sinistro', data: '12/07/2026', valorTotal: 'R$ 5.100,00', valor: 'R$ 4.480,00', numeroDemonstrativo: 'DM-99290', status: 'analise', fotos: 5 },
  { id: 'CA-2195', placa: 'JBL5B25', numeroAtendimento: 'AT-58390', cliente: 'Vamos Locação', cnpjCliente: '12.345.678/0001-90', centroCusto: 'Bebidas Fruki', descricao: 'Retrovisor direito quebrado', motivo: 'Corretiva', data: '18/06/2026', valorTotal: 'R$ 1.120,00', valor: 'R$ 980,00', numeroDemonstrativo: 'DM-99187', status: 'aprovada', fotos: 2 },
  { id: 'CA-2181', placa: 'DSA9924', numeroAtendimento: 'AT-58312', cliente: 'Vamos Locação', cnpjCliente: '12.345.678/0001-90', centroCusto: 'Matriz SP', descricao: 'Lanterna traseira trincada', motivo: 'Preventiva', data: '05/06/2026', valorTotal: 'R$ 730,00', valor: 'R$ 640,00', numeroDemonstrativo: 'DM-99102', status: 'paga', fotos: 1 },
  { id: 'CA-2166', placa: 'JBL5E88', numeroAtendimento: 'AT-58270', cliente: 'Vamos Locação', cnpjCliente: '12.345.678/0001-90', centroCusto: 'Matriz SP', descricao: 'Risco profundo na lateral do baú', motivo: 'Sinistro', data: '22/05/2026', valorTotal: 'R$ 2.640,00', valor: 'R$ 2.310,00', numeroDemonstrativo: 'DM-99044', status: 'contestada', fotos: 4 },
  { id: 'CA-2150', placa: 'JBL5B26', numeroAtendimento: 'AT-58201', cliente: 'Vamos Locação', cnpjCliente: '12.345.678/0001-90', centroCusto: 'Bebidas Fruki', descricao: 'Pneu dianteiro cortado', motivo: 'Corretiva', data: '10/05/2026', valorTotal: 'R$ 890,00', valor: 'R$ 780,00', numeroDemonstrativo: 'DM-98981', status: 'paga', fotos: 2 },
  { id: 'CA-2133', placa: 'RTX4C12', numeroAtendimento: 'AT-58122', cliente: 'Vamos Locação', cnpjCliente: '12.345.678/0001-90', centroCusto: 'Obra Jundiaí', descricao: 'Vidro lateral trincado', motivo: 'Sinistro', data: '28/04/2026', valorTotal: 'R$ 1.980,00', valor: 'R$ 1.730,00', numeroDemonstrativo: 'DM-98877', status: 'aprovada', fotos: 3 },
];

export interface Multa {
  auto: string;
  placa: string;
  infracao: string;
  local: string;
  data: string;
  valor: string;
  pontos: number;
  status: 'notificada' | 'em_recurso' | 'paga' | 'vencida' | 'aguardando_identificacao';
  prazo: string;
  /** Prazo final para identificação do condutor (quando status = aguardando_identificacao). */
  prazoIdentificacao?: string;
  /** Situação da identificação do condutor (leitura, origem SERPRO). Ausente = ainda pendente. */
  condutorIdentificado?: 'identificado' | 'nao';
  /** Nome do condutor indicado (quando a multa já foi indicada a um condutor). */
  condutor?: string;
  /** Valor já reembolsado à Vamos pelo cliente (última etapa da régua). */
  reembolsado?: boolean;
}

/** Modelo de um veículo pela placa (a partir da frota canônica). */
export function modeloDaPlaca(placa: string): string {
  return VEICULOS.find((v) => v.placa === placa)?.modelo ?? '—';
}

/** Gera multas fictícias distribuídas entre os ativos da frota (1 a 5 por ativo). */
function gerarMultasMock(): Multa[] {
  const rnd = criarRnd(20260720);
  const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rnd() * arr.length)];
  const HOJE = new Date(2026, 6, 20);
  const fmt = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  const addDias = (base: Date, dias: number) => { const d = new Date(base); d.setDate(d.getDate() + dias); return d; };

  const infracoes = [
    { t: 'Excesso de velocidade até 20%', p: 4, v: 'R$ 130,16' },
    { t: 'Excesso de velocidade de 20% a 50%', p: 5, v: 'R$ 195,23' },
    { t: 'Avanço de sinal vermelho', p: 7, v: 'R$ 293,47' },
    { t: 'Estacionar em local proibido', p: 4, v: 'R$ 195,23' },
    { t: 'Uso de celular ao dirigir', p: 7, v: 'R$ 293,47' },
    { t: 'Trafegar em faixa exclusiva de ônibus', p: 5, v: 'R$ 293,47' },
    { t: 'Dirigir sem cinto de segurança', p: 5, v: 'R$ 195,23' },
    { t: 'Parar sobre a faixa de pedestres', p: 5, v: 'R$ 195,23' },
    { t: 'Estacionar em vaga PCD sem credencial', p: 7, v: 'R$ 293,47' },
    { t: 'Velocidade superior à máxima em mais de 50%', p: 7, v: 'R$ 880,41' },
  ] as const;
  const locais = [
    'Rod. Anhanguera, km 32 · Campinas/SP', 'Marginal Tietê · São Paulo/SP', 'Av. Paulista · São Paulo/SP',
    'BR-116, km 214 · Registro/SP', 'Av. do Estado · São Paulo/SP', 'Rod. Castello Branco, km 60 · Sorocaba/SP',
    'Av. Ipanema · Sorocaba/SP', 'Centro · Campinas/SP', 'Rod. Anhanguera, km 88 · Jundiaí/SP',
    'Rod. dos Bandeirantes, km 40 · Jundiaí/SP', 'Av. Brasil · Rio de Janeiro/RJ', 'BR-101, km 210 · Curitiba/PR',
  ] as const;
  const statusPool = ['paga', 'paga', 'paga', 'paga', 'notificada', 'notificada', 'vencida', 'em_recurso'] as const;
  // Pool de condutores (menor que a frota → condutores se repetem entre ativos, gerando ranking).
  const CONDUTORES = [
    'Carlos Henrique Alves', 'Marcos Antônio Ribeiro', 'José Aparecido Lima', 'Fernando Souza Dias',
    'Roberto Carlos Mendes', 'Anderson Luiz Ferreira', 'Paulo Sérgio Nunes', 'Edson Ramos da Silva',
    'Luciano Batista Rocha', 'Rafael Oliveira Costa', 'Sérgio Moreira Pinto', 'André Tavares Gomes',
  ] as const;

  const out: Multa[] = [];
  let contador = 700000;
  const baseLen = VEICULOS_BASE.length;
  VEICULOS.forEach((ativo, idx) => {
    if (idx < baseLen) return; // placas base já têm multas escritas à mão
    const ehLider = idx === baseLen;
    const condutorAtivo = pick(CONDUTORES); // condutor principal do ativo
    if (!ehLider && rnd() < 0.05) return; // ~5% da frota sem multas
    // Apenas o líder fica acima de 10; o restante abaixo, com viés para poucos (algumas com 1).
    const qtdMultas = ehLider ? 13 : 1 + Math.floor(rnd() * rnd() * 9); // 1 a 9, concentrado no baixo
    for (let k = 0; k < qtdMultas; k++) {
      const inf = pick(infracoes);
      const local = pick(locais);
      const dataInfracao = addDias(HOJE, -Math.floor(rnd() * 540));
      let status: Multa['status'] = pick(statusPool);
      if (rnd() < 0.1) status = 'aguardando_identificacao';

      let prazo = '—';
      let prazoIdentificacao: string | undefined;
      let condutorIdentificado: Multa['condutorIdentificado'];
      if (status === 'aguardando_identificacao') {
        const offset = Math.floor(rnd() * 50) - 10; // -10..+39 dias → semáforo vermelho/amarelo/verde
        prazoIdentificacao = fmt(addDias(HOJE, offset));
        prazo = fmt(addDias(HOJE, offset + 15));
        // Situação da identificação (origem SERPRO): parte já identificada, parte pendente.
        const r = rnd();
        if (r < 0.25) condutorIdentificado = 'identificado';
        else if (r < 0.35) condutorIdentificado = 'nao';
      } else if (status === 'vencida') {
        prazo = fmt(addDias(dataInfracao, 30));
      } else if (status !== 'paga') {
        prazo = fmt(addDias(HOJE, 10 + Math.floor(rnd() * 60)));
      }
      // Parte das multas pagas ao órgão já foi reembolsada à Vamos (última etapa da régua).
      const reembolsado = status === 'paga' && rnd() < 0.4;
      // Condutor indicado: multas que não estão pendentes de identificação já têm condutor.
      const temCondutor = status !== 'aguardando_identificacao' || condutorIdentificado === 'identificado';
      const condutor = temCondutor ? condutorAtivo : undefined;

      out.push({
        auto: `AIT-${contador++}`,
        placa: ativo.placa,
        infracao: inf.t,
        local,
        data: fmt(dataInfracao),
        valor: inf.v,
        pontos: inf.p,
        status,
        prazo,
        ...(prazoIdentificacao && { prazoIdentificacao }),
        ...(condutorIdentificado && { condutorIdentificado }),
        ...(condutor && { condutor }),
        ...(reembolsado && { reembolsado: true }),
      });
    }
  });
  return out;
}

export const MULTAS: Multa[] = [
  { auto: 'AIT-559102', placa: 'SHQ6B80', infracao: 'Excesso de velocidade até 20%', local: 'Rod. Anhanguera, km 32 · SP', data: '28/06/2026', valor: 'R$ 195,23', pontos: 4, status: 'aguardando_identificacao', prazo: '28/07/2026', prazoIdentificacao: '30/07/2026' },
  { auto: 'AIT-556310', placa: 'SHQ6B80', infracao: 'Avanço de sinal vermelho', local: 'Marginal Tietê · São Paulo', data: '02/06/2026', valor: 'R$ 293,47', pontos: 7, status: 'paga', prazo: '—' },
  { auto: 'AIT-551987', placa: 'SHQ6B80', infracao: 'Estacionar em local proibido', local: 'Av. Paulista · São Paulo', data: '20/04/2026', valor: 'R$ 195,23', pontos: 4, status: 'vencida', prazo: '20/05/2026' },
  { auto: 'AIT-548876', placa: 'JBL5E88', infracao: 'Trafegar em faixa exclusiva', local: 'Av. do Estado · São Paulo', data: '11/06/2026', valor: 'R$ 293,47', pontos: 5, status: 'em_recurso', prazo: '11/08/2026' },
  { auto: 'AIT-540221', placa: 'JBL5E88', infracao: 'Excesso de velocidade até 20%', local: 'BR-116, km 214 · Registro/SP', data: '25/05/2026', valor: 'R$ 195,23', pontos: 4, status: 'notificada', prazo: '25/07/2026' },
  { auto: 'AIT-529981', placa: 'DSA9924', infracao: 'Avanço de sinal vermelho', local: 'Av. Ipanema · Sorocaba', data: '15/04/2026', valor: 'R$ 293,47', pontos: 7, status: 'vencida', prazo: '15/05/2026' },
  { auto: 'AIT-533402', placa: 'DSA9924', infracao: 'Excesso de velocidade até 20%', local: 'Rod. Castello Branco · Sorocaba', data: '30/04/2026', valor: 'R$ 195,23', pontos: 4, status: 'aguardando_identificacao', prazo: '30/07/2026', prazoIdentificacao: '18/07/2026' },
  { auto: 'AIT-534210', placa: 'JBL5B26', infracao: 'Estacionar em local proibido', local: 'Centro · Campinas', data: '02/05/2026', valor: 'R$ 195,23', pontos: 4, status: 'paga', prazo: '—' },
  { auto: 'AIT-521045', placa: 'JBL5B25', infracao: 'Uso de celular ao dirigir', local: 'Rod. Anhanguera, km 88 · Campinas', data: '18/03/2026', valor: 'R$ 293,47', pontos: 7, status: 'paga', prazo: '—' },
  { auto: 'AIT-560877', placa: 'RTX4C12', infracao: 'Excesso de velocidade até 20%', local: 'Rod. Anhanguera, km 55 · Jundiaí', data: '05/07/2026', valor: 'R$ 195,23', pontos: 4, status: 'aguardando_identificacao', prazo: '05/08/2026', prazoIdentificacao: '22/07/2026' },
  ...gerarMultasMock(),
];

export interface TelemetriaVeiculo {
  placa: string;
  local: string;
  velocidade: string;
  atualizado: string;
  status: 'rota' | 'parado' | 'manutencao';
}

export const TELEMETRIA: TelemetriaVeiculo[] = [
  { placa: 'JBL5E88', local: 'BR-116, km 214 · Registro/SP', velocidade: '82 km/h', atualizado: 'há 12s', status: 'rota' },
  { placa: 'SHQ6B80', local: 'Rod. Anhanguera, km 32 · SP', velocidade: '74 km/h', atualizado: 'há 20s', status: 'rota' },
  { placa: 'JBL5B25', local: 'CD Campinas · pátio', velocidade: '0 km/h', atualizado: 'há 3min', status: 'parado' },
  { placa: 'DSA9924', local: 'Oficina Sorocaba', velocidade: '0 km/h', atualizado: 'há 40min', status: 'manutencao' },
  { placa: 'MNT7D45', local: 'Obra Jundiaí · canteiro', velocidade: '0 km/h', atualizado: 'há 5min', status: 'parado' },
];

export interface Agendamento {
  id: string;
  placa: string;
  servico: string;
  data: string;
  unidade: string;
  status: 'confirmado' | 'aguardando' | 'concluido';
}

export const AGENDAMENTOS: Agendamento[] = [
  { id: 'AG-1102', placa: 'SHQ6B80', servico: 'Revisão preventiva 130.000 km', data: '22/07/2026 · 08:30', unidade: 'Oficina Vamos · Barueri', status: 'confirmado' },
  { id: 'AG-1098', placa: 'DSA9924', servico: 'Diagnóstico de motor', data: '18/07/2026 · 14:00', unidade: 'Oficina Vamos · Sorocaba', status: 'aguardando' },
  { id: 'AG-1071', placa: 'JBL5B25', servico: 'Troca de pneus (2 unid.)', data: '02/07/2026 · 09:00', unidade: 'Oficina parceira · Campinas', status: 'concluido' },
];

export interface FaqItem {
  pergunta: string;
  resposta: string;
}

export const FAQ_TELEFONES = [
  { titulo: '0800 025 4141', descricao: 'Atendimento 24hrs para chamados de manutenção, documentação e apreensão', destaque: true },
  { titulo: 'WhatsApp (11) 97837-9385', descricao: 'Atendimento ao cliente: chamados de manutenção, documentação e apreensão', destaque: false },
  { titulo: 'WhatsApp (11) 97258-3226', descricao: 'Fale com seu Controlador de Frota sobre manutenções em andamento', destaque: false },
  { titulo: 'Montadoras e Implementadoras', descricao: 'Assistências 24hrs — telefones de atendimento emergencial', destaque: false },
];

export const FAQ_ITENS: FaqItem[] = [
  { pergunta: 'Como faço o download do CRLV dos meus veículos?', resposta: 'Acesse Gestão de Veículos › Veículos/CRLV. Você pode baixar o CRLV individual de cada veículo ou usar o botão "Baixar todos os CRLVs" para receber um arquivo único com toda a frota.' },
  { pergunta: 'Problemas com veículos recém implantados?', resposta: 'Entre em contato pelo 0800 025 4141 ou WhatsApp (11) 97837-9385. Nossa equipe de implantação acompanha os primeiros 30 dias de operação.' },
  { pergunta: 'Como abrir um chamado de manutenção?', resposta: 'Use a Central de Chamados no menu lateral e clique em "Abrir chamado" para agendar o serviço. Em emergências, ligue 0800 025 4141 (24hrs).' },
  { pergunta: 'Como emitir a 2ª via de um boleto?', resposta: 'Em Faturamento, localize a fatura desejada e clique em "Boleto". O download é imediato, sem necessidade de contatar o financeiro.' },
  { pergunta: 'Como contestar uma multa ou cobrança de avaria?', resposta: 'Em Gestão de Veículos › Multas (ou Cobrança de Avarias), abra o item desejado e use a opção "Contestar". Você pode anexar fotos e documentos que serão analisados pela nossa equipe.' },
  { pergunta: 'Como adicionar um novo usuário ao portal?', resposta: 'Em Administração de Acessos, clique em "Novo usuário", vincule o grupo de cliente ou divisão de frota e escolha o perfil de acesso. O usuário recebe as credenciais por e-mail.' },
];

export interface NotificacaoPortal {
  titulo: string;
  detalhe: string;
  tempo: string;
  tipo: 'critico' | 'atencao' | 'info';
  href: string;
}

export const NOTIFICACOES: NotificacaoPortal[] = [
  { titulo: 'Multa AIT-560877 aguardando identificação', detalhe: 'RTX4C12 · faltam 2 dias para identificar o condutor', tempo: 'há 10 min', tipo: 'critico', href: '/portal/multas' },
  { titulo: 'Manutenção 2066894 em andamento', detalhe: 'PNEU · TXI3F16', tempo: 'há 30 min', tipo: 'atencao', href: '/portal/chamados' },
  { titulo: 'Fatura NF-86677 vencida', detalhe: 'R$ 24.310,00 · venceu em 10/04/2026', tempo: 'há 2 dias', tipo: 'critico', href: '/portal/faturamento' },
  { titulo: 'Multa AIT-559102 aguardando identificação', detalhe: 'SHQ6B80 · prazo 30/07/2026 para identificar', tempo: 'há 3 dias', tipo: 'atencao', href: '/portal/multas' },
  { titulo: 'Agendamento AG-1102 confirmado', detalhe: 'Revisão preventiva · 22/07 às 08:30 · Barueri', tempo: 'há 4 dias', tipo: 'info', href: '/portal/agendamentos' },
];
