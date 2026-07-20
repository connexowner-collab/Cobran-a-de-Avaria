/**
 * Dados mockados do Portal do Cliente (parte 2 do protótipo).
 * Estrutura de menus fiel ao portal atual (portaldocliente.vamoslocacao.com.br),
 * com as novas áreas propostas: Central de Chamados, Notificações e
 * Faturamento self-service.
 */

export type ChamadoStatus = 'aberto' | 'atendimento' | 'aguardando' | 'escalonado' | 'resolvido';

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
  abertoHa: string;
  /** Minutos restantes de SLA (negativo = estourado). */
  slaMin: number;
  solicitante: string;
  responsavel: string;
  respostas: ChamadoResposta[];
}

export const CHAMADOS: Chamado[] = [
  {
    id: 'CH-3391', categoria: 'Falha no sistema de freios', placa: 'SHQ6B80', status: 'atendimento',
    abertoHa: 'Aberto há 2h', slaMin: -30, solicitante: 'Marcos Lima', responsavel: 'Ana Torres',
    respostas: [
      { autor: 'Marcos Lima', origem: 'cliente', horario: '09:12', texto: 'Veículo apresentando ruído forte ao frear, já reduzimos a velocidade de operação.' },
      { autor: 'Ana Torres', origem: 'suporte', horario: '09:40', texto: 'Chamado recebido, acionando equipe de campo mais próxima da unidade.' },
      { autor: 'Ana Torres', origem: 'suporte', horario: '10:55', texto: 'Técnico a caminho, previsão de chegada em 40 min.' },
    ],
  },
  {
    id: 'CH-3388', categoria: 'Pneu furado - eixo traseiro', placa: 'JBL5B25', status: 'aguardando',
    abertoHa: 'Aberto há 1d', slaMin: 120, solicitante: 'Fernanda Reis', responsavel: 'Diego Souza',
    respostas: [
      { autor: 'Fernanda Reis', origem: 'cliente', horario: 'Ontem 14:02', texto: 'Pneu traseiro direito furou durante o trajeto.' },
      { autor: 'Diego Souza', origem: 'suporte', horario: 'Ontem 14:30', texto: 'Guincho acionado, aguardando confirmação de disponibilidade do estepe.' },
    ],
  },
  {
    id: 'CH-3379', categoria: 'Painel indicando falha no motor', placa: 'DSA9924', status: 'escalonado',
    abertoHa: 'Aberto há 3d', slaMin: -260, solicitante: 'Carlos Mota', responsavel: 'Equipe Técnica SP',
    respostas: [
      { autor: 'Carlos Mota', origem: 'cliente', horario: 'Seg 08:10', texto: 'Luz de injeção acesa constantemente no painel.' },
      { autor: 'Equipe Técnica SP', origem: 'suporte', horario: 'Seg 11:20', texto: 'Escalonado para diagnóstico presencial, agenda em análise.' },
    ],
  },
  {
    id: 'CH-3365', categoria: 'Solicitação de veículo reserva', placa: 'JBL5E88', status: 'resolvido',
    abertoHa: 'Aberto há 5d', slaMin: 900, solicitante: 'Patrícia Nunes', responsavel: 'Ana Torres',
    respostas: [
      { autor: 'Patrícia Nunes', origem: 'cliente', horario: 'Qui 07:45', texto: 'Precisamos de veículo reserva enquanto o titular está em manutenção.' },
      { autor: 'Ana Torres', origem: 'suporte', horario: 'Qui 09:00', texto: 'Veículo reserva disponibilizado no pátio de São Paulo.' },
    ],
  },
  {
    id: 'CH-3360', categoria: 'Vidro trincado', placa: 'SHQ6B80', status: 'resolvido',
    abertoHa: 'Aberto há 6d', slaMin: 1200, solicitante: 'Marcos Lima', responsavel: 'Diego Souza',
    respostas: [
      { autor: 'Marcos Lima', origem: 'cliente', horario: 'Qua 10:00', texto: 'Vidro dianteiro trincou com impacto de pedra na rodovia.' },
      { autor: 'Diego Souza', origem: 'suporte', horario: 'Qua 15:00', texto: 'Troca de vidro realizada, veículo liberado.' },
    ],
  },
  {
    id: 'CH-3352', categoria: 'Ar-condicionado sem gelar', placa: 'DSA9924', status: 'aberto',
    abertoHa: 'Aberto há 8d', slaMin: 40, solicitante: 'Carlos Mota', responsavel: '—',
    respostas: [
      { autor: 'Carlos Mota', origem: 'cliente', horario: 'Seg 09:00', texto: 'Ar-condicionado parou de gelar, motorista relatando calor excessivo em cabine.' },
    ],
  },
  {
    id: 'CH-3406', categoria: 'Ruído na suspensão dianteira', placa: 'JBL5B26', status: 'atendimento',
    abertoHa: 'Aberto há 5h', slaMin: 55, solicitante: 'Fernanda Reis', responsavel: 'Diego Souza',
    respostas: [
      { autor: 'Fernanda Reis', origem: 'cliente', horario: 'Hoje 07:20', texto: 'Barulho de batida na suspensão dianteira ao passar em lombadas.' },
      { autor: 'Diego Souza', origem: 'suporte', horario: 'Hoje 08:05', texto: 'Agendado diagnóstico na oficina de Campinas para hoje à tarde.' },
    ],
  },
  {
    id: 'CH-3399', categoria: 'Solicitação de segunda via de crachá', placa: '—', status: 'resolvido',
    abertoHa: 'Aberto há 4d', slaMin: 600, solicitante: 'Patrícia Nunes', responsavel: 'Ana Torres',
    respostas: [
      { autor: 'Patrícia Nunes', origem: 'cliente', horario: 'Ter 10:00', texto: 'Motorista perdeu o crachão de acesso ao pátio de Campinas.' },
      { autor: 'Ana Torres', origem: 'suporte', horario: 'Ter 11:30', texto: 'Segunda via emitida e enviada por e-mail.' },
    ],
  },
  {
    id: 'CH-3410', categoria: 'Vazamento de óleo no motor', placa: 'RTX4C12', status: 'aberto',
    abertoHa: 'Aberto há 1h', slaMin: 170, solicitante: 'Carlos Mota', responsavel: '—',
    respostas: [
      { autor: 'Carlos Mota', origem: 'cliente', horario: 'Hoje 11:40', texto: 'Identificado vazamento de óleo embaixo do motor na retroescavadeira.' },
    ],
  },
  {
    id: 'CH-3345', categoria: 'Erro no painel de telemetria', placa: 'MNT7D45', status: 'aguardando',
    abertoHa: 'Aberto há 9d', slaMin: 30, solicitante: 'Marcos Lima', responsavel: 'Equipe Técnica SP',
    respostas: [
      { autor: 'Marcos Lima', origem: 'cliente', horario: 'Qui 08:00', texto: 'Painel de telemetria não atualiza a localização do equipamento há 2 dias.' },
      { autor: 'Equipe Técnica SP', origem: 'suporte', horario: 'Qui 09:15', texto: 'Reinicialização remota enviada, aguardando confirmação do cliente.' },
    ],
  },
];

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

export const VEICULOS: VeiculoFrota[] = [
  { frota: 'BEBIDAS FRUKI', placa: 'JBL5B25', chassi: '9535V6TB0PR009032', renavam: '01317228496', anoModelo: '2022', modelo: 'VW 11-180 Delivery', categoria: 'Caminhão leve', km: '96.200 km', kmMes: '3.640 km', contrato: 'CTR-2023-0087', situacao: 'ativo', regiao: 'Sul', crlvAno: '2026', crlvStatus: 'vigente' },
  { frota: 'BEBIDAS FRUKI', placa: 'JBL5B26', chassi: '9535V6TB1PR009041', renavam: '01317229891', anoModelo: '2022', modelo: 'VW 11-180 Delivery', categoria: 'Caminhão leve', km: '92.410 km', kmMes: '3.510 km', contrato: 'CTR-2023-0087', situacao: 'ativo', regiao: 'Sul', crlvAno: '2026', crlvStatus: 'vigente' },
  { frota: 'BEBIDAS FRUKI', placa: 'JBL5B27', chassi: '9535V6TB0PR009127', renavam: '01317231390', anoModelo: '2022', modelo: 'VW 11-180 Delivery', categoria: 'Caminhão leve', km: '88.930 km', kmMes: '3.280 km', contrato: 'CTR-2023-0087', situacao: 'ativo', regiao: 'Sul', crlvAno: '2025', crlvStatus: 'a_vencer' },
  { frota: 'MATRIZ SP', placa: 'SHQ6B80', chassi: '9535V6TB0PR009242', renavam: '01317232655', anoModelo: '2023', modelo: 'VW 11-180 Delivery', categoria: 'Caminhão leve', km: '128.430 km', kmMes: '4.120 km', contrato: 'CTR-2024-0193', situacao: 'ativo', regiao: 'Sudeste', crlvAno: '2026', crlvStatus: 'vigente' },
  { frota: 'MATRIZ SP', placa: 'DSA9924', chassi: '9BM958074HB123456', renavam: '01317233981', anoModelo: '2021', modelo: 'Mercedes Accelo 815', categoria: 'Caminhão médio', km: '210.900 km', kmMes: '5.980 km', contrato: 'CTR-2024-0155', situacao: 'manutencao', regiao: 'Sudeste', crlvAno: '2025', crlvStatus: 'vencido' },
  { frota: 'MATRIZ SP', placa: 'JBL5E88', chassi: 'YV2RT40A8LB456789', renavam: '01317235112', anoModelo: '2023', modelo: 'Volvo FH 460', categoria: 'Caminhão pesado', km: '340.120 km', kmMes: '7.210 km', contrato: 'CTR-2024-0210', situacao: 'ativo', regiao: 'Sudeste', crlvAno: '2026', crlvStatus: 'vigente' },
  { frota: 'OBRA JUNDIAÍ', placa: 'RTX4C12', chassi: 'JCB3CX4TC02233445', renavam: '01317236774', anoModelo: '2024', modelo: 'JCB 3CX', categoria: 'Retroescavadeira', km: '8.940 h', kmMes: '—', contrato: 'CTR-2025-0031', situacao: 'parado', regiao: 'Sudeste', crlvAno: '—', crlvStatus: 'sem' },
  { frota: 'OBRA JUNDIAÍ', placa: 'MNT7D45', chassi: 'MANMRT2550C099887', renavam: '01317238001', anoModelo: '2024', modelo: 'Manitou MRT 2550', categoria: 'Manipulador telescópico', km: '3.210 h', kmMes: '—', contrato: 'CTR-2025-0044', situacao: 'ativo', regiao: 'Sudeste', crlvAno: '—', crlvStatus: 'sem' },
];

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
  status: 'notificada' | 'em_recurso' | 'paga' | 'vencida';
  prazo: string;
}

export const MULTAS: Multa[] = [
  { auto: 'AIT-559102', placa: 'SHQ6B80', infracao: 'Excesso de velocidade até 20%', local: 'Rod. Anhanguera, km 32 · SP', data: '28/06/2026', valor: 'R$ 195,23', pontos: 4, status: 'notificada', prazo: '28/07/2026' },
  { auto: 'AIT-556310', placa: 'SHQ6B80', infracao: 'Avanço de sinal vermelho', local: 'Marginal Tietê · São Paulo', data: '02/06/2026', valor: 'R$ 293,47', pontos: 7, status: 'paga', prazo: '—' },
  { auto: 'AIT-551987', placa: 'SHQ6B80', infracao: 'Estacionar em local proibido', local: 'Av. Paulista · São Paulo', data: '20/04/2026', valor: 'R$ 195,23', pontos: 4, status: 'vencida', prazo: '20/05/2026' },
  { auto: 'AIT-548876', placa: 'JBL5E88', infracao: 'Trafegar em faixa exclusiva', local: 'Av. do Estado · São Paulo', data: '11/06/2026', valor: 'R$ 293,47', pontos: 5, status: 'em_recurso', prazo: '11/08/2026' },
  { auto: 'AIT-540221', placa: 'JBL5E88', infracao: 'Excesso de velocidade até 20%', local: 'BR-116, km 214 · Registro/SP', data: '25/05/2026', valor: 'R$ 195,23', pontos: 4, status: 'notificada', prazo: '25/07/2026' },
  { auto: 'AIT-529981', placa: 'DSA9924', infracao: 'Avanço de sinal vermelho', local: 'Av. Ipanema · Sorocaba', data: '15/04/2026', valor: 'R$ 293,47', pontos: 7, status: 'vencida', prazo: '15/05/2026' },
  { auto: 'AIT-533402', placa: 'DSA9924', infracao: 'Excesso de velocidade até 20%', local: 'Rod. Castello Branco · Sorocaba', data: '30/04/2026', valor: 'R$ 195,23', pontos: 4, status: 'notificada', prazo: '30/07/2026' },
  { auto: 'AIT-534210', placa: 'JBL5B26', infracao: 'Estacionar em local proibido', local: 'Centro · Campinas', data: '02/05/2026', valor: 'R$ 195,23', pontos: 4, status: 'paga', prazo: '—' },
  { auto: 'AIT-521045', placa: 'JBL5B25', infracao: 'Uso de celular ao dirigir', local: 'Rod. Anhanguera, km 88 · Campinas', data: '18/03/2026', valor: 'R$ 293,47', pontos: 7, status: 'paga', prazo: '—' },
  { auto: 'AIT-560877', placa: 'RTX4C12', infracao: 'Excesso de velocidade até 20%', local: 'Rod. Anhanguera, km 55 · Jundiaí', data: '05/07/2026', valor: 'R$ 195,23', pontos: 4, status: 'notificada', prazo: '05/08/2026' },
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
  { titulo: 'Chamado CH-3391 fora do SLA', detalhe: 'Falha no sistema de freios · SHQ6B80', tempo: 'há 30 min', tipo: 'critico', href: '/portal/chamados' },
  { titulo: 'Fatura NF-86677 vencida', detalhe: 'R$ 24.310,00 · venceu em 10/04/2026', tempo: 'há 2 dias', tipo: 'critico', href: '/portal/faturamento' },
  { titulo: 'Multa AIT-559102 com prazo próximo', detalhe: 'Excesso de velocidade · SHQ6B80 · prazo 28/07/2026', tempo: 'há 3 dias', tipo: 'atencao', href: '/portal/multas' },
  { titulo: 'Agendamento AG-1102 confirmado', detalhe: 'Revisão preventiva · 22/07 às 08:30 · Barueri', tempo: 'há 4 dias', tipo: 'info', href: '/portal/agendamentos' },
];
