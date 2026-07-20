/**
 * Gera o documento Word (.docx) com Critérios de Aceite e Regras de Negócio (redação PO).
 * Executar: node scripts/gerar-doc-criterios.js
 * Saída: docs/Criterios_de_Aceite_e_Regras_de_Negocio.docx
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
        children: [new Paragraph({ children: [new TextRun(text)] })],
      })
    ),
  });
}

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
    children: [
      new Paragraph({
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: 'Critérios de Aceite e Regras de Negócio', bold: true, size: 36 })],
        spacing: { after: 240 },
      }),
      p('Projeto: Gestão de Usuários – Portal do Cliente'),
      p('Versão do documento: 1.1'),
      p('Objetivo (visão PO): Como Product Owner, definimos que a equipe de Operações deve conseguir gerenciar os usuários vinculados a cada cliente do Portal do Cliente e definir quais módulos e funcionalidades cada usuário pode acessar, de forma clara e auditável.', { paragraph: { spacing: { after: 360 } } }),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('1. Usuários')], spacing: { before: 240 } }),
      p('Como operador do portal, quero cadastrar e editar usuários com nome, e-mail, vínculo a grupo(s)/divisão(ões)/cliente e perfil de acesso, para que cada pessoa acesse apenas o que for autorizado e eu possa auditar e ajustar acessos sem depender de suporte técnico.', { paragraph: { spacing: { after: 120 } } }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('1.1 Critérios de aceite – Cadastro e edição')] }),
      p('CA-U01 – Dado que estou na tela de novo usuário ou de edição, quando eu tentar salvar sem preencher nome ou e-mail, então o sistema deve impedir o envio e exibir: "Preencha nome e e-mail."'),
      p('CA-U02 – Dado que estou cadastrando ou editando um usuário, quando eu não tiver selecionado nenhum grupo de cliente, nenhuma divisão nem cliente, então o sistema deve impedir o envio e exibir: "Adicione ao menos um grupo ou divisão de cliente."'),
      p('CA-U03 – Dado que estou criando um novo usuário, quando eu tentar salvar sem ter selecionado um perfil de acesso, então o sistema deve impedir o envio e exibir: "Selecione um perfil de acesso."'),
      p('CA-U04 – Dado que já existe um usuário com o e-mail X (ignorando maiúsculas/minúsculas e espaços), quando eu tentar criar ou editar outro usuário com o mesmo e-mail, então o sistema deve rejeitar e retornar: "Já existe um usuário cadastrado com este e-mail." (HTTP 409).'),
      p('CA-U05 – Dado que salvei um usuário com um perfil de acesso selecionado, quando eu reabrir esse usuário para edição, então o perfil deve aparecer selecionado e as permissões exibidas de forma consistente.'),
      p('CA-U06 – Dado que estou na tela de usuário e não estou na tela "Criar perfil", quando eu visualizar a matriz de módulos e funcionalidades, então ela deve ser somente leitura, com orientação para usar "Criar perfil" para alterar.'),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('1.2 Critérios de aceite – Listagem e filtros')] }),
      p('CA-U07 – Como operador, devo ver na lista de usuários uma coluna "Perfil de acesso" antes da coluna "Status", com o nome do perfil (ou "—" quando não houver).'),
      p('CA-U08 – Como operador, devo poder filtrar a lista por nome, e-mail, grupo de cliente, perfil de acesso, status e por intervalo de datas (criação e último acesso).'),
      p('CA-U09 – Dado que solicitei a exclusão de um usuário, quando o ID for inválido ou o usuário não existir, então o sistema deve retornar mensagem adequada (404 ou 400).'),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('2. Grupos de Cliente')], spacing: { before: 240 } }),
      p('Como operador, quero criar e editar grupos de cliente com nome, responsável e múltiplos clientes/contratos, e organizar ativos em divisões de frota, para que eu reflita a estrutura do cliente no portal e controle a quais ativos cada grupo (ou divisão) tem acesso.', { paragraph: { spacing: { after: 120 } } }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('2.1 Critérios de aceite – Criação e edição de grupo')] }),
      p('CA-G01 – Dado que estou criando um grupo, quando eu tentar salvar sem informar nome do grupo, responsável ou ao menos um cliente/contrato, então o sistema deve impedir e exibir a mensagem de dados obrigatórios.'),
      p('CA-G02 – Dado que já existe um grupo com o nome Y, quando eu tentar criar (ou editar outro grupo para o nome Y) um grupo com o mesmo nome, então o sistema deve rejeitar com: "Já existe um grupo com este nome. Escolha outro nome." (HTTP 409).'),
      p('CA-G03 – Como operador, devo selecionar mais de um cliente (contrato) no campo Cliente, com o mesmo padrão de tela usado no campo Grupo de cliente na aba Usuário (busca, dropdown que permanece aberto, chips).'),
      p('CA-G04 – Dado que estou editando um grupo, quando eu alterar a lista de clientes/contratos e salvar, então os selecionados devem ser carregados e exibidos corretamente ao reabrir o grupo.'),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('2.2 Critérios de aceite – Divisão de frota')] }),
      p('CA-G05 – Como operador, devo poder marcar ativos por checkbox; ao marcar um ou mais ativos, devo ver os botões "Gerar divisão" e "Movimentar" lado a lado.'),
      p('CA-G06 – Dado que estou na tela do grupo com ativos listados, quando eu clicar em "Gerar divisão", então o campo "Nome da divisão" deve ser exibido; antes disso, esse campo não deve aparecer.'),
      p('CA-G07 – Como operador, devo poder movimentar em lote os ativos selecionados para uma divisão; os checkboxes devem continuar visíveis mesmo após ativar a visualização "Divisão de frota".'),
      p('CA-G08 – Dado que já há uma lista de ativos exibida no grupo, quando eu adicionar outro cliente ao grupo, então a tela não deve piscar; o carregamento deve ocorrer em segundo plano e a lista deve ser atualizada ao final.'),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('3. Perfis de Acesso')], spacing: { before: 240 } }),
      p('Como operador, quero criar perfis de acesso com nome e matriz de módulos/funcionalidades, para que eu reutilize o mesmo conjunto de permissões em vários usuários e altere regras de acesso em um único lugar quando necessário.', { paragraph: { spacing: { after: 120 } } }),
      p('CA-P01 – Dado que estou na tela "Criar perfil", quando eu tentar salvar sem informar o nome do perfil, então o sistema deve impedir e exibir: "Nome do perfil é obrigatório" ou "Informe o nome do perfil."'),
      p('CA-P02 – Dado que criei um perfil e salvei, quando eu fechar a aplicação e abrir novamente, então o perfil deve continuar disponível (persistência).'),
      p('CA-P03 – Como operador, na tela "Criar perfil" devo poder marcar e desmarcar livremente os módulos e funcionalidades; fora dessa tela, a matriz de permissões deve ser somente leitura.'),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('4. Ativos e Placas')], spacing: { before: 240 } }),
      p('Como operador, quero que ativos com ou sem placa sejam suportados e exibidos de forma consistente (sem traço na placa), para que equipamentos identificados apenas por número de série também possam ser vinculados a grupos e divisões.', { paragraph: { spacing: { after: 120 } } }),
      p('CA-A01 – Como operador, devo ver ativos identificados por placa quando houver, ou por número de série quando o ativo não tiver placa.'),
      p('CA-A02 – Como decisão de produto, placas são sempre armazenadas e exibidas sem traço (ex.: ABC1D23).'),
      p('CA-A03 – Como operador, devo poder vincular ativos sem placa a grupos e divisões normalmente; o número de série é o identificador principal nesses casos.'),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('5. Regras de Negócio (Decisões de Produto)')], spacing: { before: 240 } }),
      p('As regras abaixo são decisões de produto documentadas pela PO, para que o time de desenvolvimento e a operação tenham uma única referência.', { paragraph: { spacing: { after: 200 } } }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('5.1 Usuários')] }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          tableHeader('ID', 'Regra (redação PO)'),
          tableRow('RN-U01', 'Para garantir unicidade e consistência, o e-mail do usuário é sempre normalizado (trim e minúsculas) antes de comparar e armazenar.'),
          tableRow('RN-U02', 'Permitimos que um usuário tenha múltiplos grupos e/ou múltiplas divisões; o vínculo por grupo único (legado) continua suportado, mas a lista de grupos tem prioridade quando informada.'),
          tableRow('RN-U03', 'Quando o usuário tiver apenas divisões vinculadas (sem grupos), o cliente do usuário é derivado do grupo ao qual a primeira divisão pertence.'),
          tableRow('RN-U04', 'Quando o usuário tiver apenas grupos vinculados, o cliente é derivado do primeiro contrato do primeiro grupo.'),
          tableRow('RN-U05', 'As permissões são um conjunto chave-valor (id da funcionalidade → habilitado). Podem ser definidas por perfil e persistidas por usuário, para permitir customização quando necessário.'),
          tableRow('RN-U06', 'O perfil de acesso é opcional; quando informado, deve ser persistido e exibido na listagem e na edição do usuário, para auditoria e clareza.'),
          tableRow('RN-U07', 'As datas de criação, atualização e último acesso são sempre controladas pelo sistema (ISO). O último acesso pode ser atualizado pelo PDV/portal quando o usuário fizer login.'),
        ],
      }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('5.2 Grupos e Clientes')] }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          tableHeader('ID', 'Regra (redação PO)'),
          tableRow('RN-G01', 'Um grupo é identificado por nome único e possui um responsável e uma lista de contratos (clientes). Pode ter zero ou mais divisões de frota.'),
          tableRow('RN-G02', 'Cada divisão tem identificador, nome e lista de ativos. A movimentação de ativos entre divisões é feita pelas ações "Gerar divisão" e "Movimentar".'),
          tableRow('RN-G03', 'Um grupo pode estar vinculado a vários clientes/contratos; a lista de ativos exibida é a união dos ativos de todos os contratos do grupo.'),
          tableRow('RN-G04', 'Na listagem de grupos, exibimos sempre as contagens: contratos, ativos, contatos vinculados e divisões, para apoio à operação.'),
          tableRow('RN-G05', 'Cliente e Contrato são dados de referência (somente leitura). As opções para seleção são apresentadas com razão social, número do contrato e CNPJ.'),
        ],
      }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('5.3 Perfis e Permissões')] }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          tableHeader('ID', 'Regra (redação PO)'),
          tableRow('RN-P01', 'Um perfil é composto por identificador, nome e um conjunto de permissões (id da funcionalidade → habilitado).'),
          tableRow('RN-P02', 'Ao escolher um perfil na tela de usuário, as permissões do perfil são aplicadas à matriz. Na edição, ao carregar a tela não sobrescrevemos as permissões já salvas na primeira exibição.'),
          tableRow('RN-P03', 'Os módulos e funcionalidades disponíveis são os definidos no catálogo do portal. Alterações nesse catálogo são feitas em acordo com produto e desenvolvimento.'),
          tableRow('RN-P04', 'Fora da tela "Criar perfil", a matriz de permissões é somente leitura; a orientação deve deixar claro que alterações devem ser feitas em "Criar perfil".'),
        ],
      }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('5.4 Ativos e Placas')] }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          tableHeader('ID', 'Regra (redação PO)'),
          tableRow('RN-A01', 'Um ativo possui contrato, e opcionalmente placa, além de chassi, número de série e modelo. Em tela, identificamos por placa quando existir; caso contrário, por número de série.'),
          tableRow('RN-A02', 'Placas são sempre armazenadas e exibidas sem hífen, em formato único e consistente.'),
          tableRow('RN-A03', 'Na movimentação em lote, apenas os ativos que o operador selecionou (por checkbox) são movidos para a divisão de destino; a lista da divisão é atualizada e persistida.'),
        ],
      }),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('6. Módulos e Funcionalidades do Portal')], spacing: { before: 240 } }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          tableHeader('Módulo', 'Funcionalidades'),
          tableRow('Cobrança', 'Visualizar, Exportar'),
          tableRow('Cobrança de Avaria', 'Visualizar, Registrar, Aprovar'),
          tableRow('Entregas', 'Visualizar, Rastrear'),
          tableRow('Relatórios', 'Visualizar, Exportar'),
          tableRow('Cadastros', 'Visualizar, Editar'),
          tableRow('Configurações', 'Visualizar, Editar'),
        ],
      }),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('7. Mensagens de Erro (API)')], spacing: { before: 240 } }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          tableHeader('Contexto', 'Mensagem', 'HTTP'),
          tableRow('Usuário – campos vazios', 'Campos obrigatórios: nome e email', '400'),
          tableRow('Usuário – sem vínculo', 'Informe ao menos um grupo de cliente, divisão ou cliente', '400'),
          tableRow('Usuário – e-mail duplicado', 'Já existe um usuário cadastrado com este e-mail.', '409'),
          tableRow('Grupo – dados inválidos', 'nomeGrupo, responsavelId e contratoIds obrigatórios', '400'),
          tableRow('Grupo – nome duplicado', 'Já existe um grupo com este nome. Escolha outro nome.', '409'),
          tableRow('Perfil – nome vazio', 'Nome do perfil é obrigatório', '400'),
        ],
      }),

      new Paragraph({
        children: [new TextRun({ text: 'Documento escrito do ponto de vista de Product Owner (PO), com histórias de usuário, critérios de aceite em formato Given/When/Then e regras de negócio como decisões de produto. Projeto: Gestão de Usuários – Portal do Cliente.', italics: true })],
        spacing: { before: 360 },
      }),
    ],
  }],
});

const outDir = path.join(__dirname, '..', 'docs');
const outPath = path.join(outDir, 'Criterios_de_Aceite_e_Regras_de_Negocio.docx');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outPath, buffer);
  console.log('Documento gerado:', outPath);
}).catch((err) => {
  console.error('Erro ao gerar documento:', err);
  process.exit(1);
});
