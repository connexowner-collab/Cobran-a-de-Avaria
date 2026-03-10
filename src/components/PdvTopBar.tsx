'use client';

import Link from 'next/link';
import { Menu, Search, Bell, Settings, User, ChevronDown } from 'lucide-react';

export function PdvTopBar() {
  return (
    <header className="pdv-top-bar">
      <div className="pdv-top-bar-left">
        <Link href="/" className="flex items-center gap-2" aria-label="Início - Vamos Locação">
          <img
            src="/grupo-vamos-squarelogo-1642582508943.webp"
            alt="Vamos Locação"
            className="logo-vamos"
            onError={(e) => {
              const el = e.currentTarget;
              el.onerror = null;
              el.src = '/logo-vamos.svg';
            }}
          />
        </Link>
        <button type="button" className="icon-btn" aria-label="Menu">
          <Menu className="w-[22px] h-[22px]" />
        </button>
      </div>
      <div className="pdv-top-bar-right">
        <button type="button" className="icon-btn" aria-label="Pesquisar">
          <Search className="w-[22px] h-[22px]" />
        </button>
        <button type="button" className="icon-btn" aria-label="Suporte">
          <Settings className="w-[22px] h-[22px]" />
        </button>
        <button type="button" className="icon-btn icon-btn-bell" aria-label="Notificações">
          <Bell className="w-[22px] h-[22px]" />
          <span className="badge">0</span>
        </button>
        <button type="button" className="user-dropdown">
          OPERAÇÕES
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
