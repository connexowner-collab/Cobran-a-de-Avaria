'use client';

import { useEffect, useState } from 'react';
import { LIBERAR_TUDO, aplicarModoDevDaURL, modoDevAtivo } from '@/lib/liberacao';

/**
 * Resolve, no navegador, se o acesso está totalmente liberado.
 * Retorna { liberarTudo, pronto, modoDev }:
 *  - pronto  = já leu localStorage/URL (evita bloquear antes da checagem).
 *  - modoDev = destravado via ?dev=1 (mostra o indicador de desenvolvedor).
 */
export function useLiberarTudo(): { liberarTudo: boolean; pronto: boolean; modoDev: boolean } {
  const [estado, setEstado] = useState({ liberarTudo: LIBERAR_TUDO, pronto: false, modoDev: false });

  useEffect(() => {
    aplicarModoDevDaURL(window.location.search);
    const dev = modoDevAtivo();
    setEstado({ liberarTudo: LIBERAR_TUDO || dev, pronto: true, modoDev: dev });
  }, []);

  return estado;
}
