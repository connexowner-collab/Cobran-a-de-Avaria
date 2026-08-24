'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus, X, Check, ArrowUp, ArrowDown, RotateCcw, ArrowRight,
  LayoutGrid, SlidersHorizontal, Search, Star,
} from 'lucide-react';
import { CATALOGO_WIDGETS, VISAO_PADRAO, type WidgetInicio } from '@/lib/inicioWidgets';
import { getTela } from '@/lib/portalNav';
import { useFavoritos } from '@/lib/favoritos';

const VISAO_STORAGE_KEY = 'portal_inicio_visao';

function getWidget(id: string): WidgetInicio | undefined {
  return CATALOGO_WIDGETS.find((w) => w.id === id);
}

export default function PortalInicioPage() {
  const [visao, setVisao] = useState<string[]>(VISAO_PADRAO);
  const [carregado, setCarregado] = useState(false);
  const [editando, setEditando] = useState(false);
  const [catalogoOpen, setCatalogoOpen] = useState(false);
  const { favoritos, toggle: toggleFavorito } = useFavoritos();
  const telasFavoritas = favoritos.map(getTela).filter((t): t is NonNullable<typeof t> => Boolean(t));

  // Restaura a visão personalizada salva.
  useEffect(() => {
    try {
      const salvo = localStorage.getItem(VISAO_STORAGE_KEY);
      if (salvo) {
        const ids = (JSON.parse(salvo) as string[]).filter(getWidget);
        if (ids.length) setVisao(ids);
      }
    } catch { /* ignora */ }
    setCarregado(true);
  }, []);

  // Persiste a visão sempre que muda (após o carregamento inicial).
  useEffect(() => {
    if (!carregado) return;
    try { localStorage.setItem(VISAO_STORAGE_KEY, JSON.stringify(visao)); } catch { /* ignora */ }
  }, [visao, carregado]);

  const adicionar = (id: string) => setVisao((v) => (v.includes(id) ? v : [...v, id]));
  const remover = (id: string) => setVisao((v) => v.filter((x) => x !== id));
  const mover = (id: string, dir: -1 | 1) =>
    setVisao((v) => {
      const i = v.indexOf(id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= v.length) return v;
      const novo = [...v];
      [novo[i], novo[j]] = [novo[j], novo[i]];
      return novo;
    });
  const restaurarPadrao = () => setVisao(VISAO_PADRAO);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-extrabold text-slate-900">Olá, Lucas</h1>
          <p className="text-[13px] text-slate-500">
            {editando
              ? 'Monte sua visão: adicione, reordene ou remova os itens de qualquer aba do portal.'
              : 'Aqui está o panorama da sua frota hoje, 17/07/2026.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {editando && (
            <>
              <button
                type="button"
                onClick={() => setCatalogoOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-primary-700"
              >
                <Plus size={15} /> Adicionar visão
              </button>
              <button
                type="button"
                onClick={restaurarPadrao}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[13px] font-semibold text-slate-600 hover:bg-slate-50"
                title="Restaurar visão padrão"
              >
                <RotateCcw size={15} /> Padrão
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setEditando((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-semibold ${
              editando
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {editando ? <><Check size={15} /> Concluir</> : <><SlidersHorizontal size={15} /> Personalizar</>}
          </button>
        </div>
      </div>

      {/* Telas favoritas — acesso rápido montado pelo usuário via estrela no menu lateral */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <Star size={15} className="text-amber-400" fill="currentColor" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Telas favoritas</p>
        </div>
        {telasFavoritas.length === 0 ? (
          <div className="card flex items-center gap-3 px-5 py-4 text-[13px] text-slate-500">
            <Star size={16} className="shrink-0 text-slate-300" />
            <span>Favorite telas pela <b className="text-slate-600">estrela</b> no menu lateral para acessá-las rápido por aqui.</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {telasFavoritas.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                {...(t.externo && { target: '_blank', rel: 'noopener noreferrer' })}
                className="card group relative flex items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">{t.icon}</span>
                <span className="min-w-0 flex-1 text-[13px] font-bold text-slate-800 group-hover:text-primary-700">{t.label}</span>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorito(t.href); }}
                  aria-label={`Remover ${t.label} dos favoritos`}
                  title="Remover dos favoritos"
                  className="shrink-0 rounded p-1 text-amber-400 hover:text-amber-500"
                >
                  <Star size={15} fill="currentColor" />
                </button>
              </Link>
            ))}
          </div>
        )}
      </div>

      {visao.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
          <LayoutGrid size={32} className="text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">Sua visão está vazia</p>
          <p className="max-w-sm text-xs text-slate-500">Adicione tabelas e relatórios de qualquer aba do portal para montar sua tela de início.</p>
          <button
            type="button"
            onClick={() => { setEditando(true); setCatalogoOpen(true); }}
            className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-primary-700"
          >
            <Plus size={15} /> Adicionar visão
          </button>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {visao.map((id, idx) => {
            const w = getWidget(id);
            if (!w) return null;
            return (
              <section
                key={id}
                className={`card flex flex-col p-5 ${w.full ? 'xl:col-span-2' : ''} ${editando ? 'ring-1 ring-primary-200' : ''}`}
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-800">{w.titulo}</p>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{w.aba}</span>
                    </div>
                    <p className="text-xs text-slate-500">{w.descricao}</p>
                  </div>
                  {editando ? (
                    <div className="flex shrink-0 items-center gap-1">
                      <button type="button" onClick={() => mover(id, -1)} disabled={idx === 0}
                        className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30" title="Mover para cima"><ArrowUp size={15} /></button>
                      <button type="button" onClick={() => mover(id, 1)} disabled={idx === visao.length - 1}
                        className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30" title="Mover para baixo"><ArrowDown size={15} /></button>
                      <button type="button" onClick={() => remover(id)}
                        className="rounded-md p-1 text-rose-400 hover:bg-rose-50 hover:text-rose-600" title="Remover"><X size={15} /></button>
                    </div>
                  ) : (
                    <Link href={w.href} className="flex shrink-0 items-center gap-1 text-xs font-bold text-primary-700 hover:text-primary-800">
                      Ver tudo <ArrowRight size={13} />
                    </Link>
                  )}
                </div>
                <div className="flex-1">{w.render()}</div>
              </section>
            );
          })}
        </div>
      )}

      {catalogoOpen && (
        <ModalCatalogo
          visao={visao}
          onAdicionar={adicionar}
          onRemover={remover}
          onFechar={() => setCatalogoOpen(false)}
        />
      )}
    </div>
  );
}

function ModalCatalogo({
  visao, onAdicionar, onRemover, onFechar,
}: {
  visao: string[];
  onAdicionar: (id: string) => void;
  onRemover: (id: string) => void;
  onFechar: () => void;
}) {
  const [busca, setBusca] = useState('');
  const termo = busca.trim().toLowerCase();
  const filtrados = CATALOGO_WIDGETS.filter(
    (w) => !termo || w.titulo.toLowerCase().includes(termo) || w.aba.toLowerCase().includes(termo) || w.descricao.toLowerCase().includes(termo),
  );
  const abas = Array.from(new Set(filtrados.map((w) => w.aba)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && onFechar()}>
      <div className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Adicionar à sua visão</h3>
            <p className="text-xs text-slate-500">Escolha tabelas e relatórios de qualquer aba do portal.</p>
          </div>
          <button onClick={onFechar} aria-label="Fechar" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><X size={18} /></button>
        </div>

        <div className="border-b border-slate-100 px-5 py-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <Search size={15} className="text-slate-400" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar item (chamados, faturas, multas...)"
              className="w-full border-none bg-transparent text-[13px] text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {abas.length === 0 && <p className="py-8 text-center text-sm text-slate-400">Nenhum item encontrado.</p>}
          {abas.map((aba) => (
            <div key={aba} className="mb-5 last:mb-0">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{aba}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {filtrados.filter((w) => w.aba === aba).map((w) => {
                  const adicionado = visao.includes(w.id);
                  return (
                    <div key={w.id} className="flex items-start justify-between gap-2 rounded-xl border border-slate-200 p-3">
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-slate-800">{w.titulo}</p>
                        <p className="text-xs text-slate-500">{w.descricao}</p>
                      </div>
                      {adicionado ? (
                        <button type="button" onClick={() => onRemover(w.id)}
                          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100">
                          <Check size={13} /> Adicionado
                        </button>
                      ) : (
                        <button type="button" onClick={() => onAdicionar(w.id)}
                          className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-primary-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-primary-700">
                          <Plus size={13} /> Adicionar
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end border-t border-slate-100 px-5 py-3">
          <button type="button" onClick={onFechar} className="rounded-lg bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white hover:bg-slate-800">Concluir</button>
        </div>
      </div>
    </div>
  );
}
