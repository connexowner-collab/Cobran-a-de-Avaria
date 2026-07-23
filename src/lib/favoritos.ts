'use client';

import { useCallback, useEffect, useState } from 'react';

const KEY = 'portal_favoritos';
const EVENT = 'portal-favoritos-atualizado';

function ler(): string[] {
  try {
    const s = localStorage.getItem(KEY);
    return s ? (JSON.parse(s) as string[]) : [];
  } catch {
    return [];
  }
}

/**
 * Telas favoritadas pelo usuário (persistidas em localStorage e sincronizadas
 * entre a sidebar e a tela de Início via evento de janela).
 */
export function useFavoritos() {
  const [favoritos, setFavoritos] = useState<string[]>([]);

  useEffect(() => {
    const atualizar = () => setFavoritos(ler());
    atualizar();
    window.addEventListener(EVENT, atualizar);
    window.addEventListener('storage', atualizar);
    return () => {
      window.removeEventListener(EVENT, atualizar);
      window.removeEventListener('storage', atualizar);
    };
  }, []);

  const toggle = useCallback((href: string) => {
    const atual = ler();
    const novo = atual.includes(href) ? atual.filter((h) => h !== href) : [...atual, href];
    try { localStorage.setItem(KEY, JSON.stringify(novo)); } catch { /* ignora */ }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return {
    favoritos,
    isFavorito: useCallback((href: string) => favoritos.includes(href), [favoritos]),
    toggle,
  };
}
