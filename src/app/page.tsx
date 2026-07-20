'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Users, FileText, Search, Truck } from 'lucide-react';

const STAR_SVG = (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const STAR_OUTLINE_SVG = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

type ModuleId = 'gestao-usuarios' | 'portal-cliente' | 'api-docs';

const MODULES: { id: ModuleId; title: string; desc: string; href: string; icon: React.ReactNode }[] = [
  {
    id: 'gestao-usuarios',
    title: 'Gestão de clientes/Externo',
    desc: 'Cadastre e edite usuários por cliente e defina módulos e funcionalidades de acesso.',
    href: '/gestao-usuarios',
    icon: <Users className="w-[22px] h-[22px]" />,
  },
  {
    id: 'portal-cliente',
    title: 'Portal do Cliente (novo)',
    desc: 'Protótipo do novo portal: login, dashboard, chamados, faturamento, veículos e mais.',
    href: '/portal',
    icon: <Truck className="w-[22px] h-[22px]" />,
  },
  {
    id: 'api-docs',
    title: 'API (Swagger)',
    desc: 'Documentação e testes da API de gestão de usuários.',
    href: '/api-docs',
    icon: <FileText className="w-[22px] h-[22px]" />,
  },
];

const MODULES_BY_ID = Object.fromEntries(MODULES.map((m) => [m.id, m])) as Record<ModuleId, (typeof MODULES)[number]>;

const INITIAL_FAVORITE_ORDER: ModuleId[] = MODULES.map((m) => m.id);

export default function HomePage() {
  const [favoriteOrder, setFavoriteOrder] = useState<ModuleId[]>(INITIAL_FAVORITE_ORDER);

  const toggleFavorite = useCallback((id: ModuleId) => {
    setFavoriteOrder((prev) => {
      const idx = prev.indexOf(id);
      if (idx >= 0) return prev.filter((x) => x !== id);
      return [id, ...prev];
    });
  }, []);

  const isFavorite = useCallback(
    (id: ModuleId) => favoriteOrder.includes(id),
    [favoriteOrder]
  );

  return (
    <div className="plataforma-layout">
      <div className="plataforma-top">
        <header className="plataforma-header">
          <div className="plataforma-header-left">
            <div className="header-logo-wrap" aria-hidden>
              <img
                src="/grupo-vamos-squarelogo-1642582508943.webp"
                alt="Vamos Locação"
                className="header-logo"
                onError={(e) => {
                  const el = e.currentTarget;
                  el.onerror = null;
                  el.src = '/logo-vamos.svg';
                }}
              />
            </div>
            <button type="button" className="icon-btn" aria-label="Menu">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
          </div>
          <div className="plataforma-header-right">
            <button type="button" className="icon-btn" aria-label="Suporte">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
              </svg>
            </button>
            <button type="button" className="icon-btn icon-btn-bell" aria-label="Notificações">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="badge">0</span>
            </button>
            <button type="button" className="user-dropdown">
              OPERAÇÕES
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          </div>
        </header>

        <div className="plataforma-hero-area">
          <section className="plataforma-hero">
            <h1>Plataforma Digital Vamos</h1>
            <p className="subtitle">
              Acesso às funcionalidades da operação do Grupo Vamos — Portal do Cliente
            </p>
            <div className="plataforma-search">
              <span className="search-icon" aria-hidden>
                <Search className="w-[18px] h-[18px]" />
              </span>
              <input type="search" placeholder="Pesquisar ..." aria-label="Pesquisar" />
            </div>
          </section>

          <div className="bem-vindo-wrap">
            <div className="bem-vindo-card">
              <div className="bem-vindo-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div className="bem-vindo-text">
                <h3>Bem vindo!</h3>
                <div className="nome">Operações</div>
                <div className="doc">Gestão de usuários e permissões do portal</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="plataforma-cards-layer">
        <h2 className="plataforma-section-title plataforma-section-title--red">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          Favoritos
        </h2>
        <section className="plataforma-section">
          <div className="favoritos-scroll">
            {favoriteOrder.map((id) => {
              const item = MODULES_BY_ID[id];
              if (!item) return null;
              const isFav = isFavorite(item.id);
              return (
                <div key={item.id} className="favorito-card">
                  <button
                    type="button"
                    className={`star-btn star-fav ${isFav ? 'star-filled' : 'star-outline'}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite(item.id);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    aria-label={isFav ? `Remover ${item.title} dos favoritos` : `Adicionar ${item.title} aos favoritos`}
                  >
                    {isFav ? STAR_SVG : STAR_OUTLINE_SVG}
                  </button>
                  <Link href={item.href} className="favorito-card-link">
                    <div className="card-row">
                      <div className="card-icon-wrap">{item.icon}</div>
                      <span className="card-title">{item.title}</span>
                    </div>
                    <p className="card-desc">{item.desc}</p>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="plataforma-bottom">
        <section className="faturamento-section">
          <div className="faturamento-section-header">
            <span className="red-line" aria-hidden />
            <span className="section-label">Operações</span>
          </div>
          <div className="faturamento-cards">
            {MODULES.map((item) => (
              <Link key={item.id} href={item.href} className="faturamento-card">
                <span className="faturamento-card-icon">{item.icon}</span>
                <span className="faturamento-card-label">{item.title}</span>
                <button
                  type="button"
                  className={`faturamento-star-btn ${isFavorite(item.id) ? 'star-filled' : 'star-outline'}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite(item.id);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  aria-label={isFavorite(item.id) ? `Remover ${item.title} dos favoritos` : `Adicionar ${item.title} aos favoritos`}
                >
                  {isFavorite(item.id) ? STAR_SVG : STAR_OUTLINE_SVG}
                </button>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
