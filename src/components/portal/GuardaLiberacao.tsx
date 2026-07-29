'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { rotaLiberada, ROTA_PADRAO } from '@/lib/liberacao';
import { useLiberarTudo } from '@/lib/useLiberacao';

/**
 * Impede o acesso a módulos não liberados nesta fase.
 * Se a rota atual não estiver liberada (e não estiver em modo desenvolvedor),
 * bloqueia o conteúdo e redireciona para a primeira tela liberada.
 */
export default function GuardaLiberacao({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { liberarTudo, pronto } = useLiberarTudo();
  const liberada = rotaLiberada(pathname, liberarTudo);

  useEffect(() => {
    if (pronto && !liberada) router.replace(ROTA_PADRAO);
  }, [pronto, liberada, router]);

  // Aguarda a checagem (localStorage/URL) antes de decidir — evita "piscar" bloqueio.
  if (!pronto) return null;

  if (!liberada) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <Lock size={26} />
        </span>
        <p className="text-lg font-bold text-slate-800">Módulo indisponível nesta fase</p>
        <p className="max-w-sm text-sm text-slate-500">
          Esta tela ainda não foi liberada para acesso. Redirecionando…
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
