# Documentação do projeto

## Critérios de Aceite e Regras de Negócio

- **`Criterios_de_Aceite_e_Regras_de_Negocio.docx`** – Documento Word com todos os critérios de aceite e regras de negócio do projeto (abrir no Microsoft Word ou compatível).
- **`Criterios_de_Aceite_e_Regras_de_Negocio.html`** – Mesmo conteúdo em HTML; pode ser aberto no Word e salvo como .docx se o .docx não estiver disponível.

### Regenerar o .docx

Na raiz do projeto:

```bash
node scripts/gerar-doc-criterios.js
```

O arquivo será gerado em `docs/Criterios_de_Aceite_e_Regras_de_Negocio.docx`. É necessário ter o pacote `docx` instalado (`npm install` na raiz).
