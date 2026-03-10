'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Building2, LayoutDashboard, FileText } from 'lucide-react';
import { clsx } from 'clsx';

const nav = [
  { href: '/', label: 'Início', icon: LayoutDashboard },
  { href: '/gestao-usuarios', label: 'Gestão de clientes/Externo', icon: Users },
  { href: '/clientes', label: 'Clientes', icon: Building2 },
  { href: '/api-docs', label: 'API (Swagger)', icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 z-30 h-full w-[var(--sidebar-width)] border-r border-slate-200 bg-white"
      aria-label="Navegação principal"
    >
      <div className="flex h-full flex-col">
        <div className="flex h-[var(--header-height)] items-center border-b border-slate-200 px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold text-slate-800">
            <LayoutDashboard className="h-6 w-6 text-primary-600" />
            Portal do Cliente
          </Link>
        </div>
        <nav className="flex-1 space-y-0.5 p-3">
          {nav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
