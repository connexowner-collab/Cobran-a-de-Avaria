'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft, Home, FileText, Users, Building2 } from 'lucide-react';

const ROUTES: Record<string, { title: string; breadcrumb: string }> = {
  '/gestao-usuarios': { title: 'GESTÃO DE CLIENTES/EXTERNO', breadcrumb: 'Gestão de clientes/Externo' },
  '/clientes': { title: 'CLIENTES', breadcrumb: 'Clientes' },
  '/api-docs': { title: 'API (SWAGGER)', breadcrumb: 'API (Swagger)' },
};

function getRouteInfo(pathname: string): { title: string; breadcrumb: string } | null {
  if (ROUTES[pathname]) return ROUTES[pathname];
  if (pathname.startsWith('/gestao-usuarios')) return ROUTES['/gestao-usuarios'];
  return null;
}

export function PdvSubHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const info = getRouteInfo(pathname);

  if (!info) return null;

  const goToHome = () => router.push('/');

  return (
    <div className="pdv-sub-header">
      <div className="flex items-center flex-wrap gap-2">
        <button type="button" onClick={goToHome} className="pdv-btn-voltar" aria-label="Voltar ao menu inicial">
          <ChevronLeft className="w-[18px] h-[18px]" />
          Voltar
        </button>
        <h1 className="pdv-page-title">{info.title}</h1>
      </div>
      <nav className="pdv-breadcrumb" aria-label="Navegação">
        <Link href="/">
          <Home className="w-4 h-4" />
          Início
        </Link>
        <span className="sep">/</span>
        <span className="current">{info.breadcrumb}</span>
      </nav>
    </div>
  );
}
