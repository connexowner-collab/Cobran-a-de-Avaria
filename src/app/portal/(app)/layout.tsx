'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, BarChart3, DollarSign, Headset, MapPin, Wrench, Boxes,
  Truck, Users, HelpCircle, ChevronDown, Search, Bell, LogOut, AlertTriangle,
  AlertCircle, Info, ListFilter, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { NOTIFICACOES } from '@/lib/portalData';
import { LogoVamos } from '@/components/portal/ui';

interface NavLeaf {
  label: string;
  href: string;
  novo?: boolean;
}

interface NavItem extends NavLeaf {
  icon: React.ReactNode;
  children?: NavLeaf[];
}

const NAV: { grupo: string; itens: NavItem[] }[] = [
  {
    grupo: 'Visão geral',
    itens: [
      { label: 'Início', href: '/portal/inicio', icon: <Home size={18} /> },
      { label: 'Modelos', href: '/portal/modelos', icon: <Boxes size={18} /> },
      {
        label: 'Relatórios', href: '/portal/relatorios', icon: <BarChart3 size={18} />,
        children: [
          { label: 'Idade da frota', href: '/portal/relatorios?aba=idade' },
          { label: 'Quilometragem', href: '/portal/relatorios?aba=km' },
          { label: 'Distribuição da frota', href: '/portal/relatorios?aba=regiao' },
        ],
      },
      { label: 'Vamos Controle', href: '/portal/vamos-controle', icon: <MapPin size={18} /> },
    ],
  },
  {
    grupo: 'Operação',
    itens: [
      { label: 'Serviços', href: '/portal/servicos', icon: <Wrench size={18} /> },
      { label: 'Central de Chamados', href: '/portal/chamados', icon: <Headset size={18} />, novo: true },
      {
        label: 'Gestão de Veículos', href: '/portal/veiculos', icon: <Truck size={18} />,
        children: [
          { label: 'Veículos / CRLV', href: '/portal/veiculos' },
          { label: 'Cobrança de Avarias', href: '/portal/avarias' },
          { label: 'Multas', href: '/portal/multas' },
        ],
      },
    ],
  },
  {
    grupo: 'Financeiro',
    itens: [
      { label: 'Faturamento', href: '/portal/faturamento', icon: <DollarSign size={18} /> },
    ],
  },
  {
    grupo: 'Suporte',
    itens: [
      { label: 'Central de Dúvidas', href: '/portal/central-duvidas', icon: <HelpCircle size={18} /> },
      { label: 'Administração de Acessos', href: '/gestao-usuarios', icon: <Users size={18} />, novo: true },
    ],
  },
];

function NotifIcon({ tipo }: { tipo: string }) {
  if (tipo === 'critico') return <AlertCircle size={16} className="text-red-500" />;
  if (tipo === 'atencao') return <AlertTriangle size={16} className="text-amber-500" />;
  return <Info size={16} className="text-sky-500" />;
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const [colapsado, setColapsado] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Restaura a preferência de menu recolhido.
  useEffect(() => {
    try {
      setColapsado(localStorage.getItem('portal_sidebar_colapsado') === '1');
    } catch { /* ignora */ }
  }, []);

  const toggleColapsado = () => {
    setColapsado((v) => {
      const novo = !v;
      try { localStorage.setItem('portal_sidebar_colapsado', novo ? '1' : '0'); } catch { /* ignora */ }
      return novo;
    });
  };

  const isActive = (href: string) => pathname === href.split('?')[0];
  const isBranchActive = (item: NavItem) =>
    isActive(item.href) || (item.children ?? []).some((c) => isActive(c.href));

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* ===== Sidebar ===== */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col overflow-y-auto bg-[#0e2233] text-white transition-[width] duration-200 ${
          colapsado ? 'w-16' : 'w-64'
        }`}
      >
        <div className={`flex items-center pb-2 pt-5 ${colapsado ? 'justify-center px-2' : 'px-4'}`}>
          <Link
            href="/portal/inicio"
            className={`flex items-center justify-center rounded-xl bg-white ${colapsado ? 'h-11 w-11 p-1.5' : 'flex-1 px-4 py-2.5'}`}
            title="Início"
          >
            {colapsado ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src="/grupo-vamos-squarelogo-1642582508943.webp"
                alt="Grupo Vamos"
                className="h-full w-full object-contain"
              />
            ) : (
              <LogoVamos altura={32} />
            )}
          </Link>
        </div>

        <nav className="flex-1 px-3 py-3">
          {NAV.map(({ grupo, itens }) => (
            <div key={grupo} className="mb-4">
              {colapsado ? (
                <div className="mx-2 mb-2 border-t border-white/10" />
              ) : (
                <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
                  {grupo}
                </p>
              )}
              {itens.map((item) => {
                const branchActive = isBranchActive(item);
                return (
                  <div key={item.label}>
                    <Link
                      href={item.href}
                      title={colapsado ? item.label : undefined}
                      className={`group relative mb-0.5 flex items-center gap-3 rounded-lg py-2.5 text-[13.5px] font-semibold transition ${
                        colapsado ? 'justify-center px-0' : 'px-3'
                      } ${
                        branchActive
                          ? 'bg-white/10 text-white'
                          : 'text-white/70 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {branchActive && (
                        <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-primary-500" />
                      )}
                      <span className="relative opacity-90">
                        {item.icon}
                        {colapsado && item.novo && (
                          <span className="absolute -right-1.5 -top-1.5 h-2 w-2 rounded-full bg-primary-500" />
                        )}
                      </span>
                      {!colapsado && <span className="flex-1">{item.label}</span>}
                      {!colapsado && item.novo && (
                        <span className="rounded-full bg-primary-600 px-1.5 py-0.5 text-[9px] font-bold tracking-wide">
                          NOVO
                        </span>
                      )}
                      {!colapsado && item.children && (
                        <ChevronDown
                          size={14}
                          className={`transition-transform ${branchActive ? 'rotate-180' : ''}`}
                        />
                      )}
                    </Link>
                    {!colapsado && item.children && branchActive && (
                      <div className="mb-1 ml-[26px] border-l border-white/10 pl-3">
                        {item.children.map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className={`block rounded-md px-2 py-1.5 text-[12.5px] transition ${
                              isActive(sub.href)
                                ? 'font-semibold text-white'
                                : 'text-white/60 hover:text-white'
                            }`}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        {!colapsado && (
          <div className="border-t border-white/10 px-6 py-4 text-[11px] text-white/40">
            Grupo JSL · Vamos Locação
          </div>
        )}
      </aside>

      {/* Botão recolher/expandir — pequeno, redondo, na divisa entre o menu e o conteúdo */}
      <button
        type="button"
        onClick={toggleColapsado}
        aria-label={colapsado ? 'Expandir menu' : 'Recolher menu'}
        title={colapsado ? 'Expandir menu' : 'Recolher menu'}
        style={{ left: colapsado ? '3.15rem' : '15.15rem' }}
        className="fixed top-[4.5rem] z-40 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-[#0e2233] text-white/80 shadow-md transition-[left,background-color] duration-200 hover:bg-primary-600 hover:text-white"
      >
        {colapsado ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* ===== Conteúdo ===== */}
      <div className={`flex min-h-screen flex-1 flex-col transition-[margin] duration-200 ${colapsado ? 'ml-16' : 'ml-64'}`}>
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-6">
          <div className="flex w-full max-w-md items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <Search size={15} className="text-slate-400" />
            <input
              placeholder="Buscar placa, chassi, chamado, documento..."
              className="w-full border-none bg-transparent text-[13px] text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex-1" />

          <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[13px] font-semibold text-slate-700 hover:bg-slate-50">
            <ListFilter size={15} />
            Frota Sul · Distribuição SP
            <ChevronDown size={13} />
          </button>

          {/* Notificações */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen((v) => !v)}
              aria-label="Notificações"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <Bell size={16} />
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-600 px-1 text-[9px] font-bold text-white">
                {NOTIFICACOES.length}
              </span>
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-11 w-96 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                <div className="border-b border-slate-100 px-4 py-3 text-sm font-bold text-slate-800">
                  Notificações
                </div>
                {NOTIFICACOES.map((n) => (
                  <Link
                    key={n.titulo}
                    href={n.href}
                    onClick={() => setNotifOpen(false)}
                    className="flex gap-3 border-b border-slate-100 px-4 py-3 transition hover:bg-slate-50"
                  >
                    <span className="mt-0.5"><NotifIcon tipo={n.tipo} /></span>
                    <span className="flex-1">
                      <span className="block text-[13px] font-semibold text-slate-800">{n.titulo}</span>
                      <span className="block text-xs text-slate-500">{n.detalhe}</span>
                    </span>
                    <span className="text-[11px] text-slate-400">{n.tempo}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => router.push('/portal')}
            title="Sair do portal"
            className="flex items-center gap-2 rounded-lg border border-slate-200 py-1.5 pl-1.5 pr-3 hover:bg-slate-50"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
              LP
            </span>
            <span className="hidden text-left leading-tight md:block">
              <span className="block text-xs font-bold text-slate-800">Lucas Pessoa</span>
              <span className="block text-[10px] text-slate-400">Vamos Locação</span>
            </span>
            <LogOut size={14} className="text-slate-400" />
          </button>
        </header>

        <main className="flex-1 px-8 py-7">{children}</main>
      </div>
    </div>
  );
}
