'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Clientes é uma aba dentro de Gestão de clientes/Externo.
 * Redireciona para /gestao-usuarios?aba=clientes
 */
export default function ClientesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/gestao-usuarios?aba=clientes');
  }, [router]);

  return (
    <div className="flex justify-center py-12" role="status" aria-live="polite">
      <span className="text-slate-500">Redirecionando para Gestão de clientes/Externo...</span>
    </div>
  );
}
