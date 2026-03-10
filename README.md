# Gestão de Usuários - Portal do Cliente

Funcionalidade para a equipe de **Operações** gerenciar os usuários vinculados a cada cliente do Portal do Cliente, definindo quais **módulos e funcionalidades** cada usuário pode acessar.

## Benefícios

- **Controle de acesso personalizado**: Permissões por usuário conforme perfil e necessidade do cliente.
- **Segurança da informação**: Redução de acessos indevidos a dados ou funcionalidades sensíveis.
- **Autonomia operacional**: Ajustes de acesso pela equipe de Operações sem depender de suporte técnico.
- **Experiência do cliente**: Usuários veem apenas os módulos relevantes, com navegação mais simples.
- **Escalabilidade**: Gestão de acessos em clientes com múltiplos usuários e estruturas complexas.

## Tecnologias

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Lucide React** (ícones)

## Como rodar

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Estrutura

- **`/`** – Início com atalhos para Gestão de Usuários e Clientes.
- **`/gestao-usuarios`** – Listagem de usuários com filtros por cliente, busca e status. Ações: novo, editar, excluir.
- **`/gestao-usuarios/novo`** – Cadastro de usuário (nome, e-mail, cliente, ativo) + matriz de permissões por módulo.
- **`/gestao-usuarios/[id]`** – Edição do usuário e permissões.
- **`/clientes`** – Listagem de clientes (somente leitura na versão atual).

## Módulos e funcionalidades

Os módulos configuráveis por usuário estão em `src/types/index.ts` (`MODULOS_PORTAL`). Incluem:

| Módulo              | Funcionalidades exemplo      |
|---------------------|-----------------------------|
| Cobrança            | Visualizar, Exportar        |
| Cobrança de Avaria  | Visualizar, Registrar, Aprovar |
| Entregas            | Visualizar, Rastrear        |
| Relatórios          | Visualizar, Exportar        |
| Cadastros           | Visualizar, Editar          |
| Configurações       | Visualizar, Editar          |

Para adicionar ou alterar módulos/funcionalidades, edite `MODULOS_PORTAL` e as APIs que consomem essas permissões no portal do cliente.

## API e documentação Swagger

A documentação da API em **OpenAPI 3.0 (Swagger)** está disponível em:

- **Interface interativa**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs) (com `npm run dev`)
- **Especificação YAML**: [http://localhost:3000/openapi.yaml](http://localhost:3000/openapi.yaml) (arquivo `public/openapi.yaml`)

Na sidebar do portal há o link **API (Swagger)** que abre a documentação. É possível testar os endpoints diretamente pela interface.

### Endpoints

- `GET /api/clientes` – Lista clientes.
- `GET /api/usuarios?clienteId=&busca=&ativo=` – Lista usuários (filtros opcionais).
- `POST /api/usuarios` – Cria usuário (body: nome, email, ativo, clienteId, permissoes).
- `GET /api/usuarios/[id]` – Busca usuário.
- `PUT /api/usuarios/[id]` – Atualiza usuário.
- `DELETE /api/usuarios/[id]` – Remove usuário.
- `GET /api/modulos` – Lista módulos e funcionalidades disponíveis.

## Dados de demonstração

O projeto usa um **store em memória** (`src/lib/store.ts`) com clientes e usuários de exemplo. Em produção, substitua por banco de dados (ex.: PostgreSQL + Prisma) e valide e-mail, cliente e permissões no backend.

## Subir para o Git

O repositório está configurado com o remote `origin` apontando para o repositório local **Portal_do_Cliente**. Para enviar suas alterações:

**Opção 1 – Script (recomendado)**  
Na raiz do projeto, no PowerShell:

```powershell
.\subir.ps1
```

Isso adiciona todas as alterações, faz commit (com mensagem padrão) e push para `origin main`. Para mensagem personalizada:

```powershell
.\subir.ps1 "feat: nova funcionalidade X"
```

**Opção 2 – Comandos manuais**

```bash
git add -A
git commit -m "sua mensagem"
git push origin main
```

## Layout

Layout base com **sidebar** (Início, Gestão de Usuários, Clientes) e **header** fixo, seguindo padrão de módulos operacionais (ex.: Cobrança de Avaria): listagem em tabela, filtros em card, formulários em cards e matriz de permissões por módulo/funcionalidade.
