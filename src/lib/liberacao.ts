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
];

/** Destino padrão (login, logo e redirecionamentos) — a primeira tela liberada. */
export const ROTA_PADRAO = MODULOS_LIBERADOS[0] ?? '/portal/servicos';

/**
 * MODO DESENVOLVEDOR
 * ---------------------------------------------------------------------------
 * Enquanto o cliente fica restrito ao MODULOS_LIBERADOS, VOCÊ (desenvolvedor)
 * pode desbloquear TODAS as telas apenas no seu navegador:
 *
 *   - Abra qualquer tela do portal com  ?dev=1   → destrava tudo neste navegador.
 *   - Abra com                          ?dev=0   → volta a simular o cliente.
 *
 * A preferência fica salva no navegador (localStorage), então persiste ao
 * navegar. O cliente, sem esse parâmetro, continua vendo só o que foi liberado.
 */
const DEV_KEY = 'portal_acesso_dev';

/** Lê ?dev=1 / ?dev=0 da URL e grava/limpa a preferência de modo desenvolvedor. */
export function aplicarModoDevDaURL(search: string): void {
  if (typeof window === 'undefined') return;
  const dev = new URLSearchParams(search).get('dev');
  try {
    if (dev === '1' || dev === 'on') localStorage.setItem(DEV_KEY, '1');
    else if (dev === '0' || dev === 'off') localStorage.removeItem(DEV_KEY);
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
