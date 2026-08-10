'use client';

/*
 * Portal do Cliente — versão "clássica" (layout de produção).
 * Shell paralelo ao /portal, replicando a identidade visual do portal atual em
 * produção (menu escuro, topo com usuário, rodapé "Fale Conosco"). Reaproveita
 * as telas liberadas (Serviços, Central de Chamados, Novo Chamado) com os dados
 * do protótipo — apenas o layout é o de produção.
 */

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Wrench, Headset, CalendarClock, Bell, Megaphone, ChevronDown, Menu, X,
  Phone, MessageCircle, Mail, MapPin,
} from 'lucide-react';

const NAV = [
  { grupo: 'Manutenção', itens: [
    { label: 'Serviços', href: '/portal-classico/servicos', icon: Wrench },
  ] },
  { grupo: 'Atendimento', itens: [
    { label: 'Central de Chamados', href: '/portal-classico/chamados', icon: Headset },
    { label: 'Novo Chamado', href: '/portal-classico/agendamentos', icon: CalendarClock },
  ] },
];

export default function PortalClassicoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const ativo = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Backdrop mobile */}
      {menuOpen && <div className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden" onClick={() => setMenuOpen(false)} aria-hidden />}

      {/* ===== Sidebar (dark, estilo produção) ===== */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-y-auto bg-[#0b1f33] text-white transition-transform duration-200 lg:z-30 lg:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2.5 px-5 pb-3 pt-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/grupo-vamos-squarelogo-1642582508943.webp" alt="Grupo Vamos" className="h-9 w-9 object-contain" />
          <span className="flex flex-col leading-none">
            <span className="text-[9px] font-bold tracking-[0.28em] text-white/60">GRUPO</span>
            <span className="text-[20px] font-black leading-[0.9] tracking-tight text-white">VAMOS<span className="align-super text-[8px]">®</span></span>
          </span>
        </div>

        <nav className="flex-1 px-3 py-4">
          {NAV.map(({ grupo, itens }) => (
            <div key={grupo} className="mb-4">
              <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">{grupo}</p>
              {itens.map((it) => {
                const Icon = it.icon;
                const on = ativo(it.href);
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    onClick={() => setMenuOpen(false)}
                    className={`relative mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-semibold transition ${
                      on ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {on && <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-sky-400" />}
                    <Icon size={18} className="opacity-90" />
                    {it.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 px-5 py-4 text-[11px] text-white/40">Grupo JSL · Vamos Locação</div>
      </aside>

      {/* ===== Conteúdo ===== */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:ml-64">
        {/* Topo */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-slate-200 bg-white px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden"
          >
            <Menu size={18} />
          </button>
          <div className="flex-1" />
          <button aria-label="Comunicados" className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100">
            <Megaphone size={17} />
          </button>
          <button aria-label="Notificações" className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100">
            <Bell size={17} />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500" />
          </button>
          <div className="flex items-center gap-2 pl-2">
            <span className="hidden text-right leading-tight sm:block">
              <span className="block text-xs font-bold text-slate-800">Marcos Alexandre Gomes De Queiroz</span>
              <span className="block text-[10px] text-slate-400">VAMOS LOCACAO</span>
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0b1f33] text-xs font-bold text-white">MA</span>
            <ChevronDown size={14} className="text-slate-400" />
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">{children}</main>

        {/* ===== Rodapé (Fale Conosco) ===== */}
        <footer className="border-t border-slate-200 bg-white px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-[#c41e3a] px-3 py-2 text-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/grupo-vamos-squarelogo-1642582508943.webp" alt="Grupo Vamos" className="h-7 w-7 object-contain" />
                <span className="text-[11px] font-black leading-tight">RENOVANDO FROTAS.<br />INOVANDO NEGÓCIOS.</span>
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Fale Conosco</p>
              <ul className="space-y-1.5 text-[13px] text-slate-600">
                <li className="flex items-center gap-2"><Phone size={14} className="text-slate-400" /> 0800 025 4141</li>
                <li className="flex items-center gap-2"><MessageCircle size={14} className="text-slate-400" /> (11) 97837-9385</li>
                <li className="flex items-center gap-2"><Mail size={14} className="text-slate-400" /> sac@grupovamos.com.br</li>
                <li className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0 text-slate-400" /> Rua Dr. Renato Paes de Barros, 1017 6º andar — Itaim Bibi, São Paulo/SP · CEP 04530-001</li>
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Institucional</p>
              <ul className="space-y-1.5 text-[13px] text-slate-600">
                <li>Nosso Site</li>
                <li>Uma empresa do grupo SIMPAR</li>
              </ul>
            </div>
          </div>
          <p className="mt-8 border-t border-slate-100 pt-4 text-center text-[11px] text-slate-400">Grupo Vamos 2026 — Todos os direitos reservados</p>
        </footer>
      </div>
    </div>
  );
}
