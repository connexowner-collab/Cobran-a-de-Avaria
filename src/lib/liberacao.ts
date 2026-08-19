/**
 * Liberação faseada dos módulos do Portal do Cliente.
 * ---------------------------------------------------------------------------
 * ESTE É O ÚNICO LUGAR QUE VOCÊ PRECISA EDITAR para liberar/bloquear telas.
 *
 *  - Adicione ou remova rotas de MODULOS_LIBERADOS para controlar o que o
 *    cliente pode acessar nesta fase.
 *  - O menu lateral esconde automaticamente o que não está liberado.
 *  - O acesso direto por URL a um módulo bloqueado é impedido (redireciona
 *    para a primeira tela liberada) — o cliente não consegue acessar de
 *    nenhuma outra forma.
 *  - Para liberar TUDO (uso interno / validação completa), troque
 *    LIBERAR_TUDO para true.
 */

/** true = todas as telas liberadas (uso interno). false = apenas MODULOS_LIBERADOS. */
export const LIBERAR_TUDO = false;

/**
 * Rotas liberadas nesta fase (comparadas como prefixo).
 * Inclua também as sub-rotas necessárias ao fluxo de cada módulo.
 */
export const MODULOS_LIBERADOS: string[] = [
  '/portal/servicos',
  '/portal/chamados',
  '/portal/agendamentos', // fluxo "Nova Manutenção" (aberto pela Central de Chamados)
  '/portal/multas',
];

/** Destino padrão (login, logo e redirecionamentos) — a primeira tela liberada. */
export const ROTA_PADRAO = MODULOS_LIBERADOS[0] ?? '/portal/servicos';

/**
 * MODO DESENVOLVEDOR — DOIS LINKS DISTINTOS
 * ---------------------------------------------------------------------------
 * A visão é decidida pelo LINK usado para ENTRAR (não fica "grudada" no cache):
 *
 *   - Link do CLIENTE (o que você envia):  /portal  (ou qualquer tela liberada)
 *       → sempre a visão do cliente. Abrir sem ?dev=1 SEMPRE volta ao modo
 *         cliente, mesmo que o navegador já tivesse entrado como dev antes.
 *
 *   - Link do DESENVOLVEDOR:               /dev
 *       → entra no portal com TODAS as telas destravadas (redireciona para a
 *         primeira tela liberada com ?dev=1). Também vale abrir qualquer tela
 *         diretamente com ?dev=1.
 *
 * Durante a navegação interna (clicando no menu) a preferência é mantida, então
 * o desenvolvedor continua vendo tudo; basta recarregar/abrir um link limpo
 * (sem ?dev=1) para voltar à visão do cliente. Assim o link que você manda para
 * o cliente nunca mostra a visão de desenvolvedor por causa do cache.
 */
const DEV_KEY = 'portal_acesso_dev';

/**
 * Lê ?dev=1 da URL e grava/limpa a preferência de modo desenvolvedor.
 * Regra: só ?dev=1 (ou on) ATIVA o modo dev; QUALQUER outro carregamento
 * (sem parâmetro, ?dev=0, ?dev=off) volta para a visão do cliente.
 */
export function aplicarModoDevDaURL(search: string): void {
  if (typeof window === 'undefined') return;
  const dev = new URLSearchParams(search).get('dev');
  try {
    if (dev === '1' || dev === 'on') localStorage.setItem(DEV_KEY, '1');
    else localStorage.removeItem(DEV_KEY);
  } catch { /* ignora */ }
}

/** Modo desenvolvedor ativo neste navegador? */
export function modoDevAtivo(): boolean {
  if (typeof window === 'undefined') return false;
  try { return localStorage.getItem(DEV_KEY) === '1'; } catch { return false; }
}

/** Indica se um caminho está liberado (ignora a querystring). */
export function rotaLiberada(pathname: string, liberarTudo: boolean = LIBERAR_TUDO): boolean {
  if (liberarTudo) return true;
  const path = (pathname || '').split('?')[0];
  return MODULOS_LIBERADOS.some((r) => path === r || path.startsWith(`${r}/`));
}
