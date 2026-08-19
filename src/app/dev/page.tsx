'use client';

/*
 * Link do DESENVOLVEDOR.
 * Acesse /dev para entrar no portal com TODAS as telas destravadas.
 * Redireciona para a primeira tela liberada com ?dev=1, que ativa o modo
 * desenvolvedor neste navegador. Para voltar à visão do cliente, basta abrir
 * o link do cliente (/portal, sem ?dev=1).
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROTA_PADRAO } from '@/lib/liberacao';

export default function EntradaDesenvolvedor() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`${ROTA_PADRAO}?dev=1`);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm font-semibold text-white/70">
      Entrando no modo desenvolvedor…
    </div>
  );
}
