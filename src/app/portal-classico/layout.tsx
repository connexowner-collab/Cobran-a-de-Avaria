'use client';

/*
 * Portal do Cliente — versão "clássica" (layout fiel ao portal de produção).
 * Menu lateral CLARO com menu completo, barra escura no topo com o usuário,
 * sub-cabeçalho (play + nome + Filtrar/Personalizar) e rodapé "Fale Conosco".
 * Apenas as telas liberadas (Serviços, Central de Chamados, Novo Chamado) são
 * navegáveis; os demais itens do menu aparecem para fidelidade visual.
 */

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, FileText, DollarSign, MapPin, HelpCircle, Car, Receipt,
  Megaphone, Bell, ChevronDown, ChevronRight, Menu, Play, Pencil,
  Filter, Sparkles, Phone, MessageCircle, Mail,
} from 'lucide-react';

/* Rótulo do sub-cabeçalho conforme a rota. */
const TITULOS: Record<string, string> = {
  '/portal-classico/servicos': 'Serviços de Manutenção',
  '/portal-classico/chamados': 'Central de Chamados',
  '/portal-classico/multas': 'Multas',
};

export default function PortalClassicoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [aberto, setAberto] = useState<Record<string, boolean>>({ Relatórios: true, Manutenção: true });
  const on = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const toggle = (k: string) => setAberto((p) => ({ ...p, [k]: !p[k] }));
  const titulo = TITULOS[pathname] ?? 'Início';

  const itemCls = (ativo: boolean, sub = false) =>
    `relative flex w-full items-center gap-3 rounded-lg py-2.5 text-left text-[13.5px] transition ${sub ? 'pl-11 pr-3' : 'px-3'} ${
      ativo ? 'bg-white/10 font-bold text-white' : 'font-semibold text-white/70 hover:bg-white/5 hover:text-white'
    }`;
  const Marca = ({ ativo }: { ativo: boolean }) =>
    ativo ? <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-white" /> : null;

  return (
    <div className="tema-classico flex min-h-screen bg-slate-100">
      {menuOpen && <div className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden" onClick={() => setMenuOpen(false)} aria-hidden />}

      {/* ===== Sidebar clara (fiel à produção) ===== */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-y-auto bg-[#0b1f33] transition-transform duration-200 lg:z-30 lg:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 pb-3 pt-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/grupo-vamos-squarelogo-1642582508943.webp" alt="Grupo Vamos" className="h-10 w-10 object-contain" />
          <span className="flex flex-col leading-none">
            <span className="text-[9px] font-bold tracking-[0.28em] text-white/50">GRUPO</span>
            <span className="text-[22px] font-black leading-[0.9] tracking-tight text-white">VAMOS<span className="align-super text-[8px]">®</span></span>
          </span>
        </div>

        <nav className="flex-1 px-3 py-3">
          {/* Início */}
          <button type="button" className={itemCls(false)}><Home size={18} /> Início</button>

          {/* Relatórios */}
          <button type="button" onClick={() => toggle('Relatórios')} className={itemCls(false)}>
            <FileText size={18} /> <span className="flex-1">Relatórios</span>
            <ChevronDown size={14} className={`transition-transform ${aberto['Relatórios'] ? 'rotate-180' : ''}`} />
          </button>
          {aberto['Relatórios'] && (
            <div className="mb-0.5">
              <button type="button" className={itemCls(false, true)}>Modelos</button>
              <button type="button" className={itemCls(false, true)}>Distribuição da Frota</button>
              {/* Manutenção */}
              <button type="button" onClick={() => toggle('Manutenção')} className={itemCls(false, true)}>
                <span className="flex-1">Manutenção</span>
                <ChevronDown size={13} className={`transition-transform ${aberto['Manutenção'] ? 'rotate-180' : ''}`} />
              </button>
              {aberto['Manutenção'] && (
                <div className="ml-3">
                  <Link href="/portal-classico/chamados" onClick={() => setMenuOpen(false)} className={itemCls(on('/portal-classico/chamados'), true)}>
                    <Marca ativo={on('/portal-classico/chamados')} /> Central de Chamados
                  </Link>
                  <Link href="/portal-classico/servicos" onClick={() => setMenuOpen(false)} className={itemCls(on('/portal-classico/servicos'), true)}>
                    <Marca ativo={on('/portal-classico/servicos')} /> Serviços de Manutenção
                  </Link>
                </div>
              )}
            </div>
          )}

          <Link href="/portal-classico/multas" onClick={() => setMenuOpen(false)} className={itemCls(on('/portal-classico/multas'))}>
            <Marca ativo={on('/portal-classico/multas')} /> <Receipt size={18} /> Multas
          </Link>

          <button type="button" className={itemCls(false)}><DollarSign size={18} /> Faturamento</button>
          <button type="button" className={itemCls(false)}><MapPin size={18} /> Vamos Controle</button>
          <button type="button" className={itemCls(false)}><HelpCircle size={18} /> Central de Dúvidas</button>
          <button type="button" className={itemCls(false)}>
            <Car size={18} /> <span className="flex-1">Gestão de Veículos</span> <ChevronRight size={14} />
          </button>
        </nav>
      </aside>

      {/* ===== Conteúdo ===== */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:ml-64">
        {/* Barra escura do topo */}
        <header className="sticky top-0 z-20 flex h-12 items-center gap-2 bg-[#0b1f33] px-4 text-white sm:px-6">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 lg:hidden"
          >
            <Menu size={18} />
          </button>
          <div className="flex-1" />
          <button aria-label="Comunicados" className="relative flex h-8 w-8 items-center justify-center rounded-lg text-white/80 hover:bg-white/10">
            <Megaphone size={16} /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
          </button>
          <button aria-label="Notificações" className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 hover:bg-white/10">
            <Bell size={16} />
          </button>
          <div className="flex items-center gap-2 pl-2">
            <span className="hidden text-right leading-tight sm:block">
              <span className="block text-[12px] font-bold">Marcos Alexandre Gomes De Queiroz</span>
              <span className="block text-[10px] text-white/50">VAMOS LOCACAO</span>
            </span>
            <ChevronDown size={14} className="text-white/60" />
          </div>
        </header>

        {/* Painel de conteúdo com sub-cabeçalho */}
        <div className="min-w-0 flex-1 px-3 py-3 sm:px-5 sm:py-5">
          <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
            {/* Sub-cabeçalho: play + nome/rota + Filtrar/Personalizar */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-slate-900 text-slate-900">
                  <Play size={22} className="ml-0.5" fill="currentColor" />
                </span>
                <div>
                  <p className="flex items-center gap-1.5 text-[15px] font-extrabold text-slate-900">lucas <Pencil size={13} className="text-slate-400" /></p>
                  <p className="text-[13px] text-slate-500">{titulo}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-semibold text-slate-600 hover:bg-slate-50">
                  <Filter size={14} /> Filtrar
                </button>
                <button className="inline-flex items-center gap-1.5 rounded-lg bg-[#0b1f33] px-3 py-2 text-[13px] font-semibold text-white hover:bg-[#0e2a45]">
                  <Sparkles size={14} /> Personalizar
                </button>
              </div>
            </div>

            {children}
          </div>
        </div>

        {/* ===== Rodapé ===== */}
        <footer className="bg-[#0b1f33] px-4 py-8 text-white/80 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-[auto_1fr_1fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg bg-[#c41e3a] px-3 py-3 text-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/grupo-vamos-squarelogo-1642582508943.webp" alt="Grupo Vamos" className="h-8 w-8 object-contain" />
                <span className="text-[11px] font-black leading-tight">RENOVANDO<br />FROTAS.<br />INOVANDO<br />NEGÓCIOS.</span>
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-white/45">Fale Conosco</p>
              <ul className="space-y-1.5 text-[13px] text-white/80">
                <li className="flex items-center gap-2"><Phone size={14} className="text-white/45" /> 0800 025 4141</li>
                <li className="flex items-center gap-2"><MessageCircle size={14} className="text-white/45" /> (11) 97837-9385</li>
                <li className="flex items-center gap-2"><Mail size={14} className="text-white/45" /> sac@grupovamos.com.br</li>
              </ul>
              <p className="mt-3 text-xs font-bold uppercase tracking-wide text-white/45">Matriz</p>
              <p className="text-[13px] text-white/80">Rua Dr. Renato Paes de Barros, 1017 6º andar — Itaim Bibi, São Paulo/SP · CEP 04530-001</p>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-white/45">Institucional</p>
              <p className="text-[13px] text-white/80">Nosso Site</p>
              <p className="mt-4 text-xs font-bold uppercase tracking-wide text-white/45">Siga o Grupo Vamos</p>
              <p className="text-[13px] text-white/80">Facebook · Instagram · LinkedIn · YouTube</p>
              <p className="mt-4 text-[11px] font-bold text-white/40">UMA EMPRESA DO GRUPO SIMPAR</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-4">
            {['VAMOS LOCAÇÃO', 'VAMOS SEMINOVOS', 'VW TRANSRIO', 'VAMOS', 'TIETÊ', 'HM', 'BMB', 'TRUCKVAN'].map((m) => (
              <span key={m} className="rounded bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white/70 ring-1 ring-white/15">{m}</span>
            ))}
          </div>
          <p className="mt-6 text-center text-[11px] text-white/40">Grupo Vamos 2026 — Todos os direitos reservados</p>
        </footer>
      </div>
    </div>
  );
}
