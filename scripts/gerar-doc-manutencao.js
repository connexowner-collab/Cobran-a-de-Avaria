/**
 * Gera o documento Word (.docx) de Escopo e Especificação Funcional (redação PO)
 * do MÓDULO MANUTENÇÃO — telas "Serviços", "Central de Chamados" e "Nova Manutenção",
 * incluindo a integração com o sistema GEO Manutenção.
 * Mesmo padrão do documento de Critérios de Aceite e Regras de Negócio.
 * Executar: node scripts/gerar-doc-manutencao.js
 * Saída: docs/Escopo_Modulo_Manutencao.docx  (ou defina DOC_OUT para outro nome)
 */
const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  WidthType,
  ShadingType,
} = require('docx');

const border = { style: BorderStyle.SINGLE, size: 1, color: '333333' };
const cellBorders = { top: border, bottom: border, left: border, right: border };

function p(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, ...opts })],
    spacing: { after: 120 },
    ...opts.paragraph,
  });
}
function li(text) {
  return new Paragraph({ children: [new TextRun('• ' + text)], spacing: { after: 40 } });
}
function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(text)], spacing: { before: 240 } });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(text)] });
}

function tableHeader(...cells) {
  return new TableRow({
    tableHeader: true,
    children: cells.map((text) =>
      new TableCell({
        borders: cellBorders,
        shading: { fill: 'F0F0F0', type: ShadingType.CLEAR },
        children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })],
      })
    ),
  });
}
function tableRow(...cells) {
  return new TableRow({
    children: cells.map((text) =>
      new TableCell({
        borders: cellBorders,
        children: [new Paragraph({ children: [new TextRun(String(text))] })],
      })
    ),
  });
}
function table(header, rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [tableHeader(...header), ...rows.map((r) => tableRow(...r))],
  });
}

const children = [];
const add = (...nodes) => children.push(...nodes);

/* ================================================================== *
 * CAPA
 * ================================================================== */
add(
  new Paragraph({
    heading: HeadingLevel.TITLE,
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'Escopo e Especificação Funcional — Módulo Manutenção', bold: true, size: 36 })],
    spacing: { after: 240 },
  }),
  p('Projeto: Gestão de Usuários – Portal do Cliente'),
  p('Módulo: Manutenção · Telas: Serviços, Central de Chamados e Nova Manutenção'),
  p('Versão do documento: 2.0'),
  p('Objetivo (visão PO): Como Product Owner, definimos que o cliente do portal deve acompanhar toda a manutenção da sua frota em um único módulo — consultando o histórico completo de serviços e ordens de serviço na tela "Serviços", acompanhando/interagindo com as manutenções em aberto na tela "Central de Chamados" e solicitando novas manutenções na tela "Nova Manutenção". A fonte de dados de manutenção é o sistema GEO Manutenção; os agendamentos e as solicitações de chamado criados no portal também são enviados ao GEO. A integração deve ser feita por API, de forma clara, filtrável e auditável.', { paragraph: { spacing: { after: 360 } } }),
);

/* ================================================================== *
 * 1. VISÃO GERAL
 * ================================================================== */
add(
  h1('1. Visão Geral do Módulo'),
  h2('1.1 Telas do módulo'),
  p('O módulo Manutenção é composto por três telas que compartilham a mesma base de manutenções (atendimentos e ordens de serviço):', { paragraph: { spacing: { after: 80 } } }),
  li('Serviços — visão gerencial e histórica de todos os atendimentos da frota (em aberto e finalizados), com KPIs, gráfico por tipo, funil por etapa e relatório detalhado com ordens de serviço.'),
  li('Central de Chamados — visão operacional apenas das manutenções em aberto, com funil por etapa e acompanhamento/interação por atendimento. Os atendimentos finalizados ficam na tela Serviços.'),
  li('Nova Manutenção (Agendamento) — assistente em passos para o cliente solicitar uma nova manutenção; ao finalizar, gera um número de atendimento e envia a solicitação ao GEO, que passa a ser acompanhada nas outras duas telas.'),

  h2('1.2 Fonte de dados (GEO Manutenção)'),
  p('A fonte única de manutenções do módulo é o sistema GEO Manutenção. Os dados exibidos (atendimentos, ordens de serviço, etapas, datas e cobrança de avaria) são obtidos do GEO via API. Os agendamentos e as solicitações de chamado (Nova Manutenção) originados no portal são enviados ao GEO pela mesma integração. O desenvolvimento dessa API é parte do escopo (ver seção 5).'),

  h2('1.3 Perfis e permissões (visão do módulo)'),
  p('O acesso ao módulo e a cada funcionalidade é controlado por perfil de acesso (ver seção 8). As telas respeitam as permissões do usuário: sem permissão de visualização, a tela não é exibida no menu; ações específicas (exportar, responder, solicitar nova manutenção) dependem da funcionalidade correspondente estar habilitada no perfil.'),
);

/* ================================================================== *
 * 2. TELA SERVIÇOS
 * ================================================================== */
add(
  h1('2. Tela "Serviços"'),
  p('Como cliente do portal, quero visualizar todos os serviços da minha frota (indicadores, gráficos, funil por etapa e um relatório detalhado por atendimento e ordem de serviço), com filtros por coluna e detalhes sob demanda, para acompanhar a operação de manutenção e identificar veículos parados, motivos recorrentes e cobranças de avaria — sem depender de suporte.', { paragraph: { spacing: { after: 120 } } }),

  h2('2.1 Campos e colunas do Relatório de Serviços'),
  table(['Coluna', 'Origem (GEO)', 'Formato / valores', 'Filtro'], [
    ['Nº de atendimento', 'atendimento.numero', 'Texto (código)', 'Texto, múltiplos valores'],
    ['Status do atendimento', 'derivado de atendimento.status', 'Em aberto / Finalizado', 'Lista suspensa'],
    ['Motivo', 'derivado de atendimento.tipo', 'Preventiva / Corretiva / Sinistro / Outros', 'Lista suspensa'],
    ['Nº de OS', 'atendimento.ordens', 'Quantidade / lista de OS', '—'],
    ['Placa', 'atendimento.placa', 'Texto (sem hífen)', 'Texto, múltiplos valores'],
    ['Chassi', 'atendimento.chassi', 'Texto', 'Texto, múltiplos valores'],
    ['Nº de Série', 'atendimento.numeroSerie', 'Texto', 'Texto, múltiplos valores'],
    ['Marca/Modelo', 'atendimento.marcaModelo', 'Texto', 'Texto'],
    ['Agendamento', 'atendimento.agendamento', 'Data (dd/mm/aaaa) ou —', 'Texto (data)'],
    ['Entrada', 'atendimento.dataEntrada', 'Data ou —', 'Texto (data)'],
    ['Saída', 'atendimento.saida', 'Data ou —', 'Texto (data)'],
    ['Conclusão', 'atendimento.dataConclusao', 'Data ou —', 'Texto (data)'],
    ['Situação do Veículo', 'derivado de atendimento.status', 'Parado / Rodando', 'Lista suspensa'],
    ['Cobrança de avaria', 'derivado de ordens[].temAvaria', 'Sim / Não', 'Lista suspensa'],
    ['Mais detalhes', '—', 'Ações (info, resumo, acompanhar)', '—'],
  ]),

  h2('2.2 Campos da subtabela de Ordens de Serviço (linha expandida)'),
  table(['Coluna', 'Origem (GEO)', 'Formato / valores'], [
    ['Nº da OS', 'ordem.numero', 'Texto (código)'],
    ['Motivo da OS', 'ordem.motivo', 'Texto (ex.: PNEU, FREIO)'],
    ['Status da OS', 'ordem.status', 'Aberta / Em execução / Aguardando peça / Finalizada'],
    ['Dias em manutenção', 'calculado (entrada → saída/hoje)', 'Número de dias (+ "Em andamento" se sem saída)'],
    ['Entrada', 'ordem.dataEntrada', 'Data ou —'],
    ['Previsão de saída', 'atendimento.previsao', 'Data ou —'],
    ['Saída', 'ordem.dataSaida', 'Data ou —'],
    ['Cobrança de avaria', 'ordem.temAvaria', 'Sim / Não'],
    ['Mais detalhes', '—', 'Ações (detalhes da OS, resumo)'],
  ]),

  h2('2.3 Critérios de aceite – Indicadores e visão geral'),
  p('CA-S01 – Dado que abro a tela Serviços, quando a página carrega, então devo ver os KPIs "Frota total" (total de veículos e equipamentos da operação) e "Em oficina agora" (quantidade de veículos com manutenção em aberto).'),
  p('CA-S02 – Dado que estou na tela Serviços, quando visualizo o "Gráfico de Serviços", então devo ver a evolução dos serviços empilhada por tipo (Preventiva, Corretiva, Sinistro, Outros) no período, podendo alternar a visão entre "Dia" e "Mês".'),
  p('CA-S03 – Dado que estou na tela Serviços, quando visualizo "Top motivos de serviço", então devo ver os motivos mais recorrentes no período, cada um com a quantidade e o percentual sobre o total.'),
  p('CA-S04 – Dado que estou na tela Serviços, quando visualizo "Atendimentos Realizados", então devo ver a quantidade por tipo de serviço (Total, Preventiva, Corretiva, Sinistro, Outros) com o respectivo percentual.'),

  h2('2.4 Critérios de aceite – Funil por etapa'),
  p('CA-S05 – Dado que estou na tela Serviços, quando visualizo o funil "Atendimentos por etapa", então devo ver as etapas da manutenção (Aguardando Agendamento, Agendado, Em Manutenção, Disponível retirada da manutenção, Manutenção Finalizada), cada uma com a contagem de atendimentos naquela etapa.'),
  p('CA-S06 – Dado que cliquei em uma etapa do funil, quando a seleção é aplicada, então a lista do "Relatório de Serviços" deve exibir apenas os atendimentos daquela etapa; ao clicar novamente na mesma etapa, o filtro deve ser removido.'),

  h2('2.5 Critérios de aceite – Relatório de Serviços (tabela por atendimento)'),
  p('CA-S07 – Dado que estou no "Relatório de Serviços", quando a tabela carrega, então cada linha agrupadora deve representar um atendimento e exibir as colunas descritas na seção 2.1.'),
  p('CA-S08 – Dado que estou no relatório, quando observo a coluna "Situação do Veículo", então ela deve mostrar "Parado" para atendimentos em aberto e "Rodando" para atendimentos finalizados.'),
  p('CA-S09 – Dado que estou no relatório, quando observo a coluna "Cobrança de avaria", então ela deve mostrar "Sim" quando qualquer ordem de serviço do atendimento tiver cobrança de avaria, e "Não" caso contrário.'),
  p('CA-S10 – Como cliente, devo poder filtrar cada coluna pela sua célula de filtro, conforme o tipo indicado na seção 2.1 (texto com múltiplos valores, lista suspensa ou texto de data).'),
  p('CA-S11 – Dado que apliquei filtros de coluna e/ou uma etapa do funil, quando os dois estão ativos, então a lista deve refletir a interseção dos critérios e a paginação deve recalcular sobre o resultado filtrado.'),
  p('CA-S12 – Dado que a lista está paginada, quando há mais de uma página de resultados, então devo poder navegar entre páginas e ajustar a quantidade de itens por página.'),
  p('CA-S13 – Dado que não há atendimentos para os filtros atuais, quando a lista fica vazia, então o sistema deve exibir "Nenhum atendimento encontrado com os filtros atuais."'),
  p('CA-S14 – Como cliente, devo ver na área do relatório as ações "Baixar planilha" e "Agendar Manutenção", sendo que "Agendar Manutenção" leva para o fluxo de Nova Manutenção (via Central de Chamados).'),

  h2('2.6 Critérios de aceite – Ordens de serviço (linha expandida)'),
  p('CA-S15 – Dado que estou em uma linha de atendimento, quando eu expando a linha, então devo ver a subtabela de ordens de serviço com as colunas descritas na seção 2.2.'),
  p('CA-S16 – Dado que observo uma OS, quando o status é diferente de "Finalizada" (OS ainda sem data de saída), então "Dias em manutenção" deve ser calculado até a data de referência atual e indicar que está "Em andamento"; quando finalizada, deve considerar a data de saída.'),
  p('CA-S17 – Dado que observo a coluna "Cobrança de avaria" da OS, quando a OS gera avaria, então deve exibir "Sim"; caso contrário, "Não".'),

  h2('2.7 Critérios de aceite – Detalhes do atendimento e da OS (modais)'),
  p('CA-S18 – Dado que aciono "Informação (problema relatado)" em um atendimento, quando o modal abre, então devo ver o problema relatado no chamado, o condutor e os dados do atendimento (por exemplo, contrato, centro de custo e datas de agendamento, entrada e saída).'),
  p('CA-S19 – Dado que aciono o resumo de um atendimento/OS, quando o modal abre, então devo ver os itens autorizados para manutenção agrupados por OS, exibindo descrição, finalidade e quantidade — sem valores monetários.'),
  p('CA-S20 – Dado que aciono "Detalhes da OS", quando o modal abre, então devo ver os dados da OS e um bloco "Cobrança de avaria": se a OS tem avaria, exibir "Sim" com a orientação de que o detalhamento será tratado no momento da cobrança da avaria; caso contrário, "Não · sem cobrança de avaria para esta OS."'),
  p('CA-S21 – Dado que um atendimento está em aberto, quando visualizo suas ações, então devo ver a ação "Acompanhar manutenção", que abre o acompanhamento (linha do tempo de etapas e histórico de interações). Essa ação não aparece para atendimentos finalizados.'),
);

/* ================================================================== *
 * 3. CENTRAL DE CHAMADOS
 * ================================================================== */
add(
  h1('3. Tela "Central de Chamados"'),
  p('Como cliente do portal, quero acompanhar as manutenções da minha frota que estão em aberto, visualizando a etapa de cada uma e interagindo por atendimento (linha do tempo e mensagens), para saber o andamento e a previsão de saída sem precisar ligar para a central.', { paragraph: { spacing: { after: 120 } } }),

  h2('3.1 Campos e colunas da lista'),
  table(['Coluna', 'Origem (GEO)', 'Formato / valores', 'Filtro'], [
    ['Atendimento', 'atendimento.numero', 'Texto (código)', 'Texto, múltiplos valores'],
    ['Motivo', 'atendimento.motivo', 'Texto', 'Texto'],
    ['Placa / Ativo', 'placa ou numeroSerie', 'Placa quando houver; senão nº de série', 'Texto, múltiplos valores'],
    ['Condutor', 'detalhe.condutor', 'Texto', 'Texto'],
    ['Marca/Modelo', 'atendimento.marcaModelo', 'Texto', 'Texto'],
    ['Previsão de saída', 'atendimento.previsao', 'Data ou —', '—'],
    ['Etapa', 'derivado das datas do atendimento', 'Selo colorido da etapa atual', '— (usar funil)'],
  ]),

  h2('3.2 Critérios de aceite – Base e indicadores'),
  p('CA-C01 – Dado que abro a Central de Chamados, quando a página carrega, então a lista deve conter apenas as manutenções em aberto (as mesmas manutenções da tela Serviços que ainda não foram finalizadas).'),
  p('CA-C02 – Dado que estou na Central de Chamados, quando a página carrega, então devo ver os KPIs "Frota total" e "Em oficina agora" (quantidade de manutenções em aberto).'),

  h2('3.3 Critérios de aceite – Funil por etapa'),
  p('CA-C03 – Dado que estou na Central de Chamados, quando visualizo o funil "Manutenções por etapa", então devo ver as etapas com a contagem de manutenções em aberto em cada uma.'),
  p('CA-C04 – Dado que cliquei em uma etapa (exceto "Manutenção Finalizada"), quando a seleção é aplicada, então a lista deve exibir apenas as manutenções daquela etapa; clicar novamente remove o filtro.'),
  p('CA-C05 – Dado que a etapa "Manutenção Finalizada" não possui contagem nesta tela, quando eu clico nela, então o sistema deve me levar para a tela Serviços (onde ficam os atendimentos finalizados).'),

  h2('3.4 Critérios de aceite – Lista de manutenções'),
  p('CA-C06 – Dado que estou na Central de Chamados, quando a tabela carrega, então cada linha deve exibir as colunas descritas na seção 3.1.'),
  p('CA-C07 – Como cliente, devo poder filtrar por coluna: Atendimento (múltiplos valores), Motivo, Placa/Ativo (múltiplos valores), Condutor e Marca/Modelo.'),
  p('CA-C08 – Dado que a coluna "Placa/Ativo" identifica o veículo, quando o ativo não possui placa, então deve ser exibido o número de série no lugar da placa.'),
  p('CA-C09 – Dado que não há manutenções para os filtros atuais, quando a lista fica vazia, então o sistema deve exibir "Nenhuma manutenção encontrada com os filtros atuais."'),
  p('CA-C10 – Dado que a lista está paginada, quando há vários resultados, então devo poder navegar entre páginas e ajustar a quantidade de itens por página.'),

  h2('3.5 Critérios de aceite – Acompanhamento do atendimento (modal)'),
  p('CA-C11 – Dado que clico em uma linha da lista, quando o modal de acompanhamento abre, então devo ver o cabeçalho com número do atendimento, motivo, veículo, condutor, cliente e o selo da etapa atual.'),
  p('CA-C12 – Dado que o modal está aberto, quando visualizo "Andamento da manutenção", então devo ver a esteira de etapas (Aguardando Agendamento → Agendado → Em Manutenção → Disponível retirada da manutenção → Manutenção Finalizada), com a etapa atual destacada e as anteriores concluídas.'),
  p('CA-C13 – Dado que o modal está aberto, quando visualizo o histórico, então devo ver a linha do tempo de interações (por exemplo: problema relatado pelo condutor, confirmação da central, entrada na oficina e saída/liberação, quando existirem).'),
  p('CA-C14 – Dado que o modal está aberto, quando quero responder, então devo ter um campo "Responder ao atendimento..." e um botão "Enviar"; a mensagem enviada é registrada no GEO e vinculada ao atendimento (ver CA-I03).'),
  p('CA-C15 – Como cliente, devo ver a ação "Nova Manutenção", que leva ao fluxo de agendamento de manutenção (seção 4).'),
);

/* ================================================================== *
 * 4. NOVA MANUTENÇÃO
 * ================================================================== */
add(
  h1('4. Tela "Nova Manutenção" (Agendamento)'),
  p('Como cliente do portal, quero solicitar uma nova manutenção em poucos passos — identificando o veículo, escolhendo os serviços, anexando fotos e definindo a agenda — para abrir um chamado de manutenção que é enviado ao GEO e passa a ser acompanhado nas telas Serviços e Central de Chamados.', { paragraph: { spacing: { after: 120 } } }),

  h2('4.1 Campos por passo do assistente'),
  table(['Passo', 'Campo', 'Obrigatório', 'Formato / validação'], [
    ['1. Veículo', 'Tipo de identificação', 'Sim', 'Seleção única: Placa, Chassi ou Nº de Série'],
    ['1. Veículo', 'Identificação do veículo', 'Sim', 'Texto ≥ 5 caracteres, maiúsculas; habilitado só após escolher o tipo'],
    ['1. Veículo', 'Km do veículo', 'Sim', 'Apenas números'],
    ['2. Serviços', 'Serviços', 'Sim (≥ 1)', 'Seleção múltipla no catálogo (13 opções)'],
    ['2. Serviços', 'Detalhe por serviço', 'Não', 'Texto por serviço selecionado'],
    ['2. Serviços', 'Observações Gerais', 'Sim', 'Texto'],
    ['2. Serviços', 'Anexos (imagens)', 'Não', 'Imagens JPG/PNG, múltiplas'],
    ['3. Fotos', 'Foto do hodômetro', 'Não', 'Imagem JPG/PNG'],
    ['3. Fotos', 'Foto da placa', 'Não', 'Imagem JPG/PNG'],
    ['3. Fotos', 'Mais fotos', 'Não', 'Imagens JPG/PNG, múltiplas'],
    ['4. Agenda', 'Endereço de referência', 'Sim', 'Texto'],
    ['4. Agenda', 'Data', 'Sim', 'Data'],
    ['4. Agenda', 'Horário sugerido', 'Sim', 'Hora'],
    ['4. Agenda', 'Nome / Condutor', 'Sim', 'Texto'],
    ['4. Agenda', 'E-mail', 'Sim', 'E-mail válido'],
    ['4. Agenda', 'Celular', 'Sim', 'Telefone'],
  ]),
  p('Catálogo de serviços (passo 2): Revisão preventiva, Corretiva, Freios, Motor, Ar-condicionado, Pneus, Elétrica, Suspensão, Funilaria e pintura, Vidros, Aferição de tacógrafo, Sinistro, Outro.', { paragraph: { spacing: { before: 80, after: 160 } } }),

  h2('4.2 Critérios de aceite – Fluxo em passos (assistente)'),
  p('CA-N01 – Dado que acesso "Nova Manutenção", quando a tela abre, então devo ver um assistente em 4 passos — Veículo, Serviços, Fotos e Agenda — com indicação visual do passo atual e dos concluídos, e um link "Voltar para a Central de Chamados".'),
  p('CA-N02 – Dado que estou em um passo com campos obrigatórios não preenchidos, quando observo o botão de avançar, então ele deve permanecer desabilitado até que as condições do passo (seção 4.1) sejam atendidas.'),
  p('CA-N03 – Dado que estou em um passo posterior ao primeiro, quando quero revisar, então devo poder "Voltar" ao passo anterior sem perder o que já preenchi.'),

  h2('4.3 Critérios de aceite – Passos 1 a 3'),
  p('CA-N04 – Dado que estou no passo Veículo, quando escolho o tipo de identificação, então o campo de identificação é habilitado; antes de escolher o tipo, o campo permanece bloqueado com orientação.'),
  p('CA-N05 – Dado que preencho os dados do veículo, quando a identificação tem menos de 5 caracteres ou o Km está vazio, então não devo conseguir avançar; o campo Km aceita apenas números.'),
  p('CA-N06 – Dado que estou no passo Serviços, quando seleciono um ou mais serviços do catálogo, então cada serviço selecionado pode receber um detalhamento em texto e pode ser removido.'),
  p('CA-N07 – Dado que estou no passo Serviços, quando tento avançar, então devo ter ao menos um serviço selecionado e as "Observações Gerais" preenchidas; anexar imagens é opcional.'),
  p('CA-N08 – Dado que estou no passo Fotos, quando visualizo as áreas de anexo (Hodômetro, Placa e Mais fotos), então todas são opcionais, permitem pré-visualizar e remover as imagens, e posso avançar sem anexar nada.'),

  h2('4.4 Critérios de aceite – Passo 4, conclusão e apoio lateral'),
  p('CA-N09 – Dado que estou no passo Agenda, quando tento finalizar, então devo ter preenchido endereço de referência, data, horário, nome/condutor, e-mail e celular (todos obrigatórios).'),
  p('CA-N10 – Dado que finalizo a solicitação, quando o envio é concluído, então devo ver a confirmação "Agendamento solicitado!" com um número de atendimento, com opção de copiá-lo, e a orientação de acompanhar em Serviços e na Central de Chamados. O número deve ser o retornado pelo GEO (ver RN-M21).'),
  p('CA-N11 – Dado que concluí um agendamento, quando estou na tela de sucesso, então devo poder ir para Serviços, ir para a Central de Chamados ou iniciar um novo agendamento (que limpa o formulário).'),
  p('CA-N12 – Dado que estou preenchendo o assistente, quando avanço nos passos, então devo ver um "Resumo da solicitação" atualizado ao vivo (veículo, serviços e agenda).'),
  p('CA-N13 – Como cliente, devo ver a lista "Seus agendamentos" com os agendamentos recentes e seus status (Confirmado, Aguardando, Concluído).'),
);

/* ================================================================== *
 * 5. INTEGRAÇÃO GEO
 * ================================================================== */
add(
  h1('5. Integração com o Sistema GEO Manutenção (API)'),
  p('Como Product Owner, defino que o módulo Manutenção do portal não mantém dados próprios de manutenção: ele consome os dados do sistema GEO Manutenção e devolve ao GEO os agendamentos e as solicitações de chamado criados pelo cliente. Portanto, faz parte do escopo o desenvolvimento da API do GEO que permita (a) enviar/expor os dados de manutenção ao portal e (b) receber do portal as solicitações de chamado e as interações.', { paragraph: { spacing: { after: 120 } } }),

  h2('5.1 Fluxos de dados'),
  table(['Fluxo', 'Direção', 'Descrição'], [
    ['Dados de manutenção', 'GEO → Portal', 'O portal recebe do GEO os atendimentos, ordens de serviço, status/etapas, datas, identificação do ativo, condutor/cliente e o indicador de cobrança de avaria. Alimenta as telas Serviços e Central de Chamados.'],
    ['Agendamento / Nova Manutenção', 'Portal → GEO', 'Ao solicitar uma nova manutenção no portal, os dados da solicitação são enviados ao GEO, que registra o chamado e devolve o número e o status inicial.'],
    ['Interações', 'Portal → GEO', 'As respostas/interações do cliente em um atendimento são enviadas ao GEO e associadas ao chamado correspondente.'],
    ['Atualização de andamento', 'GEO → Portal', 'Mudanças de etapa, datas e novas interações registradas no GEO são refletidas no portal (esteira de andamento e histórico).'],
  ]),

  h2('5.2 Capacidades da API do GEO a desenvolver'),
  table(['Capacidade', 'Direção', 'Descrição (nível funcional)'], [
    ['Consultar manutenções', 'GEO expõe / Portal consome', 'Listar atendimentos e OS, com filtros equivalentes aos das telas (etapa, status, período, ativo, motivo) e paginação.'],
    ['Consultar detalhes', 'GEO expõe / Portal consome', 'Obter os detalhes de um atendimento/OS: problema relatado, itens autorizados, condutor, cliente, contrato e indicador de avaria.'],
    ['Receber solicitação de chamado', 'Portal envia / GEO recebe', 'Criar no GEO uma nova solicitação de manutenção a partir do portal e retornar o número e o status inicial.'],
    ['Receber interações', 'Portal envia / GEO recebe', 'Registrar no GEO as respostas/interações do cliente vinculadas a um atendimento.'],
    ['Sincronizar andamento', 'GEO expõe / Portal consome', 'Fornecer ao portal as atualizações de etapa, datas e interações (por consulta periódica ou notificação).'],
  ]),

  h2('5.3 Dicionário de dados — entidades e payloads'),
  p('Estrutura funcional dos dados trocados (nomes de campo são referência; o mapeamento definitivo é acordado com o time do GEO).', { paragraph: { spacing: { after: 80 } } }),
  p('Atendimento (GEO → Portal):', { bold: true, paragraph: { spacing: { after: 40 } } }),
  table(['Campo', 'Tipo', 'Descrição'], [
    ['numero', 'texto', 'Identificador do atendimento.'],
    ['status', 'enum', 'aberta / finalizado.'],
    ['motivo', 'texto', 'Motivo principal do atendimento.'],
    ['tipo', 'enum', 'preventiva / corretiva / sinistro / outros.'],
    ['placa, chassi, numeroSerie', 'texto', 'Identificação do ativo (placa sem hífen; nº de série quando não há placa).'],
    ['marcaModelo', 'texto', 'Marca e modelo do ativo.'],
    ['agendamento, dataEntrada, previsao, saida, dataConclusao', 'data', 'Datas do ciclo da manutenção (ou vazio/—).'],
    ['ordens[]', 'lista', 'Ordens de serviço vinculadas (ver Ordem de Serviço).'],
  ]),
  p('Ordem de Serviço (GEO → Portal):', { bold: true, paragraph: { spacing: { before: 120, after: 40 } } }),
  table(['Campo', 'Tipo', 'Descrição'], [
    ['numero', 'texto', 'Identificador da OS.'],
    ['motivo', 'texto', 'Motivo/serviço da OS.'],
    ['status', 'enum', 'Aberta / Em execução / Aguardando peça / Finalizada.'],
    ['dataEntrada, dataSaida', 'data', 'Entrada e saída da OS (ou —).'],
    ['temAvaria', 'booleano', 'Indica se a OS gera cobrança de avaria.'],
  ]),
  p('Detalhe do atendimento (GEO → Portal):', { bold: true, paragraph: { spacing: { before: 120, after: 40 } } }),
  table(['Campo', 'Tipo', 'Descrição'], [
    ['descricaoProblema', 'texto', 'Problema relatado no chamado.'],
    ['condutor, cliente', 'texto', 'Condutor e cliente do atendimento.'],
    ['numeroContrato, centroCusto', 'texto', 'Contrato e centro de custo.'],
    ['itens[]', 'lista', 'Itens autorizados: codigo, descricao, finalidade, qtde (sem valores no portal).'],
  ]),
  p('Solicitação de chamado / Nova Manutenção (Portal → GEO):', { bold: true, paragraph: { spacing: { before: 120, after: 40 } } }),
  table(['Campo', 'Tipo', 'Descrição'], [
    ['tipoIdentificacao', 'enum', 'placa / chassi / serie.'],
    ['identificacao', 'texto', 'Valor da placa/chassi/nº de série.'],
    ['km', 'número', 'Quilometragem informada.'],
    ['servicos[]', 'lista', 'Cada item: nome (do catálogo) + detalhes (texto).'],
    ['observacoes', 'texto', 'Observações gerais da solicitação.'],
    ['anexos[], fotos[]', 'arquivos', 'Imagens da solicitação, hodômetro, placa e outras (opcionais).'],
    ['endereco, data, horario', 'texto/data/hora', 'Local e agenda sugeridos.'],
    ['condutor, email, celular', 'texto', 'Contato do solicitante.'],
    ['→ retorno: numeroAtendimento, status', 'texto/enum', 'Número oficial e status inicial retornados pelo GEO.'],
  ]),
  p('Interação (Portal → GEO):', { bold: true, paragraph: { spacing: { before: 120, after: 40 } } }),
  table(['Campo', 'Tipo', 'Descrição'], [
    ['numeroAtendimento', 'texto', 'Atendimento ao qual a interação se refere.'],
    ['autor, origem', 'texto/enum', 'Autor e origem (cliente / suporte / oficina).'],
    ['texto', 'texto', 'Conteúdo da mensagem.'],
    ['horario', 'data/hora', 'Momento da interação.'],
  ]),

  h2('5.4 Mapeamento de status e etapas'),
  p('A etapa exibida no portal é derivada do estado do atendimento no GEO:', { paragraph: { spacing: { after: 80 } } }),
  table(['Condição (dados do GEO)', 'Etapa no portal'], [
    ['status = finalizado', 'Manutenção Finalizada'],
    ['sem data de agendamento', 'Aguardando Agendamento'],
    ['com agendamento, sem data de entrada', 'Agendado'],
    ['com data de saída preenchida', 'Disponível retirada da manutenção'],
    ['entrou na oficina e ainda não saiu', 'Em Manutenção'],
  ]),
  p('Status de OS (GEO → portal): Aberta, Em execução, Aguardando peça, Finalizada. Status de agendamento (lista "Seus agendamentos"): Confirmado, Aguardando, Concluído.', { paragraph: { spacing: { before: 80, after: 160 } } }),

  h2('5.5 Sincronização e tratamento de falhas'),
  li('A atualização de andamento pode ser por consulta periódica (polling) do portal ao GEO ou por notificação do GEO (webhook) — a definir (seção 5.7).'),
  li('O envio de solicitações e interações deve ser idempotente: reenvios por falha de rede não podem duplicar chamados/mensagens no GEO.'),
  li('Em caso de indisponibilidade do GEO, o portal exibe estado de erro (seção 7) sem perder a solicitação do cliente e sem apresentar dados inconsistentes.'),
  li('Toda troca é autenticada e registrada (log/auditoria) o suficiente para rastrear origem, horário e resultado.'),

  h2('5.6 Critérios de aceite – Integração'),
  p('CA-I01 – Dado que o portal exibe manutenções, quando as telas Serviços e Central de Chamados carregam, então os dados apresentados devem ser os obtidos do GEO via API (o portal não é a fonte primária desses dados).'),
  p('CA-I02 – Dado que o cliente cria uma "Nova Manutenção" no portal, quando a solicitação é confirmada, então o portal deve enviá-la ao GEO e só considerar concluída após a confirmação (com o número do chamado retornado pelo GEO).'),
  p('CA-I03 – Dado que o cliente responde a um atendimento no portal, quando ele envia a mensagem, então a interação deve ser registrada no GEO e vinculada ao atendimento correto.'),
  p('CA-I04 – Dado que um atendimento teve mudança de etapa, datas ou novas interações no GEO, quando ocorre a sincronização, então o portal deve refletir essas atualizações (funil, situação, esteira de andamento e histórico).'),
  p('CA-I05 – Dado que a API do GEO está indisponível ou retorna erro, quando o portal tenta consultar ou enviar dados, então o sistema deve tratar a falha de forma controlada (mensagem clara e sem perder a solicitação), sem exibir dados inconsistentes.'),
  p('CA-I06 – Dado que a integração envia ou recebe dados, quando qualquer troca ocorre, então ela deve ser autenticada e registrada para rastrear origem, horário e resultado.'),

  h2('5.7 Pontos em aberto (a definir com o time do GEO)'),
  li('Protocolo e formato da API (REST/JSON, SOAP, etc.) e ambientes (homologação/produção).'),
  li('Mecanismo de autenticação/autorização (token, chave, OAuth) e política de credenciais.'),
  li('Estratégia de sincronização: polling ou webhook, e a frequência aceitável de atualização.'),
  li('Dicionário de dados/mapeamento definitivo de campos, enums de status/etapas e motivos.'),
  li('Regras de idempotência, reprocessamento e limites (tamanho de anexos, paginação).'),
);

/* ================================================================== *
 * 6. REGRAS DE NEGÓCIO
 * ================================================================== */
add(
  h1('6. Regras de Negócio (Decisões de Produto)'),
  p('As regras abaixo são decisões de produto documentadas pela PO, para servirem de referência única ao desenvolvimento e à operação.', { paragraph: { spacing: { after: 200 } } }),

  h2('6.1 Fonte de dados e sincronização entre telas'),
  table(['ID', 'Regra (redação PO)'], [
    ['RN-M01', 'As telas do módulo usam a mesma fonte única de manutenções (o GEO), garantindo que os mesmos dados apareçam em todas.'],
    ['RN-M02', 'A tela Serviços exibe todos os atendimentos (em aberto e finalizados). A Central de Chamados exibe apenas os atendimentos em aberto.'],
    ['RN-M03', 'Atendimentos finalizados não aparecem na Central de Chamados; seu histórico fica em Serviços. Por isso, a etapa "Manutenção Finalizada" na Central redireciona para Serviços.'],
    ['RN-M04', 'Um atendimento pode ter uma ou várias ordens de serviço (OS), com motivos distintos.'],
  ]),

  h2('6.2 Etapas da manutenção (comportamento por etapa)'),
  table(['Etapa', 'Quando ocorre', 'Comportamento no módulo'], [
    ['Aguardando Agendamento', 'Sem data de agendamento', 'Aparece na Central; pode evoluir para Agendado.'],
    ['Agendado', 'Com agendamento, sem entrada', 'Aparece na Central; aguarda entrada na oficina.'],
    ['Em Manutenção', 'Entrou na oficina, sem saída', 'Situação do veículo = Parado; contabiliza dias em manutenção.'],
    ['Disponível retirada da manutenção', 'Com data de saída', 'Veículo liberado para retirada; ainda em aberto.'],
    ['Manutenção Finalizada', 'Atendimento finalizado', 'Sai da Central; consultável em Serviços; Situação = Rodando.'],
  ]),

  h2('6.3 Identificação do ativo, situação e avaria'),
  table(['ID', 'Regra (redação PO)'], [
    ['RN-M10', 'O ativo é identificado pela placa quando houver; quando não houver placa, pelo número de série. Placas são exibidas sem hífen.'],
    ['RN-M11', 'A "Situação do Veículo" é "Parado" enquanto o atendimento está em aberto e "Rodando" quando finalizado.'],
    ['RN-M12', 'A "Cobrança de avaria" é um indicador por OS (Sim/Não). O atendimento é marcado com "Sim" quando pelo menos uma de suas OS tiver cobrança de avaria.'],
    ['RN-M13', 'O detalhamento e os valores da cobrança de avaria não são exibidos no módulo Manutenção; são tratados no momento da cobrança da avaria (módulo específico).'],
  ]),

  h2('6.4 Cálculos e datas'),
  table(['ID', 'Regra (redação PO)'], [
    ['RN-M14', '"Dias em manutenção" de uma OS é o número de dias entre a entrada e a saída; sem saída, o cálculo vai até a data atual e a OS é indicada como "Em andamento". O valor nunca é negativo.'],
    ['RN-M15', 'As contagens do funil por etapa refletem exatamente a lista exibida em cada tela (Serviços considera todos; Central considera apenas os em aberto).'],
    ['RN-M16', 'Os detalhes de itens autorizados (descrição, finalidade e quantidade) são exibidos sem valores monetários no módulo Manutenção.'],
  ]),

  h2('6.5 Agendamento / Nova Manutenção'),
  table(['ID', 'Regra (redação PO)'], [
    ['RN-M17', 'A solicitação só pode ser finalizada quando todos os campos obrigatórios de cada passo estiverem preenchidos (ver seção 4.1); fotos e anexos são opcionais.'],
    ['RN-M18', 'A identificação do veículo exige a escolha prévia do tipo (placa/chassi/nº de série) e deve ter ao menos 5 caracteres; o Km aceita apenas números.'],
    ['RN-M19', 'Ao concluir, a solicitação é enviada ao GEO; o atendimento gerado passa a ser acompanhado nas telas Serviços e Central de Chamados.'],
  ]),

  h2('6.6 Integração com o GEO'),
  table(['ID', 'Regra (redação PO)'], [
    ['RN-M20', 'O GEO é a fonte primária (fonte da verdade) dos dados de manutenção; o portal apenas consome esses dados e não os cria de forma independente.'],
    ['RN-M21', 'O número de atendimento exibido ao final da Nova Manutenção é o identificador retornado pelo GEO. Enquanto a integração não estiver disponível, o portal pode exibir um número provisório, que deve ser reconciliado com o número oficial do GEO.'],
    ['RN-M22', 'O andamento exibido (etapas, datas, esteira e histórico) reflete o estado registrado no GEO, atualizado por sincronização.'],
    ['RN-M23', 'Toda troca de dados com o GEO deve ser autenticada, idempotente e registrada para auditoria; falhas de comunicação não podem perder a solicitação do cliente nem exibir dados inconsistentes.'],
  ]),

  h2('6.7 Casos de borda'),
  table(['ID', 'Regra (redação PO)'], [
    ['RN-M24', 'Ativo sem placa: todas as telas identificam pelo número de série; nunca exibir placa "vazia" ou com traço.'],
    ['RN-M25', 'Datas ausentes (agendamento, entrada, saída, conclusão) são exibidas como "—" e não quebram cálculos nem a derivação de etapa.'],
    ['RN-M26', 'Atendimento sem OS ou OS sem itens: exibir a linha normalmente e, nos detalhes, indicar "Sem itens" em vez de erro.'],
    ['RN-M27', 'Filtros combinados (funil + colunas) sem resultados exibem a mensagem de lista vazia correspondente à tela, sem travar a paginação.'],
    ['RN-M28', 'Um mesmo atendimento em aberto deve aparecer de forma consistente em Serviços e na Central; ao ser finalizado, deixa a Central e permanece em Serviços.'],
  ]),
);

/* ================================================================== *
 * 7. MENSAGENS E ESTADOS
 * ================================================================== */
add(
  h1('7. Mensagens e Estados de Tela'),
  h2('7.1 Mensagens de validação e feedback'),
  table(['Contexto', 'Mensagem / comportamento'], [
    ['Serviços – lista vazia', '"Nenhum atendimento encontrado com os filtros atuais."'],
    ['Central de Chamados – lista vazia', '"Nenhuma manutenção encontrada com os filtros atuais."'],
    ['Nova Manutenção – passo incompleto', 'Botão de avançar/finalizar desabilitado até preencher os obrigatórios do passo.'],
    ['Nova Manutenção – veículo', '"Escolha primeiro Placa, Chassi ou Nº de Série para habilitar o campo." (campo bloqueado)'],
    ['Nova Manutenção – Km', 'Campo aceita apenas números (caracteres não numéricos são ignorados).'],
    ['Nova Manutenção – sucesso', '"Agendamento solicitado!" com número de atendimento e opção de copiar.'],
    ['OS sem avaria (detalhe)', '"Não · sem cobrança de avaria para esta OS."'],
    ['OS com avaria (detalhe)', '"Sim" + "O detalhamento será tratado no momento da cobrança da avaria."'],
  ]),
  h2('7.2 Estados de carregamento e erro (integração GEO)'),
  table(['Estado', 'Comportamento esperado'], [
    ['Carregando', 'Exibir indicador de carregamento enquanto os dados são obtidos do GEO; não mostrar tabela vazia como se não houvesse dados.'],
    ['Erro ao consultar', 'Mensagem clara de indisponibilidade e opção de tentar novamente; não exibir dados parciais/inconsistentes.'],
    ['Erro ao enviar (agendamento/interação)', 'Preservar os dados preenchidos, informar a falha e permitir reenvio; não duplicar a solicitação (idempotência).'],
    ['Sincronização', 'Refletir atualizações de andamento sem exigir recarregar a página manualmente (conforme estratégia definida em 5.7).'],
  ]),
);

/* ================================================================== *
 * 8. PERFIS E PERMISSÕES
 * ================================================================== */
add(
  h1('8. Perfis e Permissões'),
  p('O acesso às telas e ações do módulo é definido no perfil de acesso do usuário (catálogo de módulos/funcionalidades do portal). Proposta de mapeamento do módulo Manutenção:', { paragraph: { spacing: { after: 80 } } }),
  table(['Funcionalidade', 'Ações', 'Descrição'], [
    ['Serviços', 'Visualizar, Exportar', 'Ver KPIs, gráficos e relatório; baixar planilha.'],
    ['Central de Chamados', 'Visualizar, Responder', 'Ver manutenções em aberto e responder/interagir nos atendimentos.'],
    ['Nova Manutenção', 'Solicitar', 'Criar e enviar solicitações de agendamento de manutenção.'],
  ]),
  p('Regra: sem a permissão de visualização, a tela não aparece no menu; as ações (Exportar, Responder, Solicitar) só ficam disponíveis quando a funcionalidade correspondente estiver habilitada no perfil.', { paragraph: { spacing: { before: 80 } } }),
);

/* ================================================================== *
 * 9. MÓDULO E FUNCIONALIDADES
 * ================================================================== */
add(
  h1('9. Módulo e Funcionalidades'),
  table(['Tela', 'Funcionalidades'], [
    ['Serviços', 'Visualizar KPIs e gráficos, Filtrar por etapa e por coluna, Consultar ordens de serviço (linha expandida), Ver detalhes (problema relatado, resumo de itens, detalhes da OS), Acompanhar manutenção (em aberto), Baixar planilha, Agendar Manutenção'],
    ['Central de Chamados', 'Visualizar KPIs, Filtrar por etapa e por coluna, Acompanhar andamento (esteira + histórico), Responder ao atendimento, Nova Manutenção'],
    ['Nova Manutenção (Agendamento)', 'Assistente em 4 passos (Veículo, Serviços, Fotos, Agenda), Selecionar serviços do catálogo, Anexar fotos, Definir agenda, Gerar/receber número de atendimento, Consultar "Seus agendamentos"'],
    ['Integração GEO (API)', 'Consumir dados de manutenção do GEO, Enviar agendamentos/solicitações de chamado, Enviar interações, Sincronizar andamento, Autenticar e auditar as trocas'],
  ]),
);

/* ================================================================== *
 * 10. GLOSSÁRIO
 * ================================================================== */
add(
  h1('10. Glossário'),
  table(['Termo', 'Definição'], [
    ['GEO Manutenção', 'Sistema externo, fonte primária dos dados de manutenção e destino dos agendamentos/solicitações de chamado. Integra-se ao portal por API.'],
    ['Atendimento', 'Registro principal de uma manutenção da frota; agrupa uma ou mais ordens de serviço.'],
    ['Ordem de Serviço (OS)', 'Serviço específico dentro de um atendimento, com motivo, status e datas próprios.'],
    ['Etapa', 'Estágio atual da manutenção, derivado automaticamente das datas do atendimento.'],
    ['Situação do Veículo', 'Parado (manutenção em aberto) ou Rodando (manutenção finalizada).'],
    ['Cobrança de avaria', 'Indicador (Sim/Não) de que uma OS/atendimento gera cobrança de avaria; detalhamento tratado fora deste módulo.'],
    ['Idempotência', 'Propriedade de uma operação que, repetida com os mesmos dados, não gera duplicações (ex.: reenvio de um agendamento por falha de rede).'],
  ]),

  new Paragraph({
    children: [new TextRun({ text: 'Documento escrito do ponto de vista de Product Owner (PO), com histórias de usuário, tabelas de campos, critérios de aceite em formato Given/When/Then (Dado/Quando/Então), regras de negócio, mensagens/estados e dicionário de integração. Projeto: Gestão de Usuários – Portal do Cliente · Módulo: Manutenção (Serviços, Central de Chamados e Nova Manutenção).', italics: true })],
    spacing: { before: 360 },
  }),
);

/* ================================================================== */
const doc = new Document({
  styles: {
    default: { document: { run: { font: 'Calibri', size: 22 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', run: { size: 32, bold: true }, paragraph: { spacing: { before: 360, after: 180 } } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', run: { size: 28, bold: true }, paragraph: { spacing: { before: 280, after: 140 } } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', run: { size: 24, bold: true }, paragraph: { spacing: { before: 200, after: 100 } } },
    ],
  },
  sections: [{
    properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    children,
  }],
});

const outDir = path.join(__dirname, '..', 'docs');
const outPath = path.join(outDir, process.env.DOC_OUT || 'Escopo_Modulo_Manutencao.docx');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outPath, buffer);
  console.log('Documento gerado:', outPath);
}).catch((err) => {
  console.error('Erro ao gerar documento:', err);
  process.exit(1);
});
