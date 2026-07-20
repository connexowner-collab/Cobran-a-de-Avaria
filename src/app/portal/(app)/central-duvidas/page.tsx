'use client';

import { useState } from 'react';
import { Search, Phone, ChevronDown, MessageCircle } from 'lucide-react';
import { FAQ_TELEFONES, FAQ_ITENS } from '@/lib/portalData';
import { PageTitle } from '@/components/portal/ui';

export default function CentralDuvidasPage() {
  const [busca, setBusca] = useState('');
  const [aberto, setAberto] = useState<number | null>(0);

  const itens = FAQ_ITENS.filter(
    (f) =>
      !busca ||
      f.pergunta.toLowerCase().includes(busca.toLowerCase()) ||
      f.resposta.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <div>
      <PageTitle
        titulo="Central de Dúvidas"
        subtitulo="Telefones importantes, perguntas frequentes e canais de atendimento"
      />

      {/* Telefones importantes */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {FAQ_TELEFONES.map((t) => (
          <div
            key={t.titulo}
            className={`card p-5 ${t.destaque ? 'border-primary-200 bg-primary-50/40' : ''}`}
          >
            <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${
              t.destaque ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              <Phone size={16} />
            </span>
            <p className="mt-3 text-sm font-bold text-slate-800">{t.titulo}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">{t.descricao}</p>
          </div>
        ))}
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[1.6fr_1fr]">
        {/* FAQ */}
        <div>
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3">
            <Search size={16} className="text-slate-400" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Digite a sua busca... ex: CRLV, boleto, multa"
              className="w-full border-none bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="card divide-y divide-slate-100">
            {itens.length === 0 && (
              <p className="px-5 py-10 text-center text-sm text-slate-400">
                Nenhum resultado para &quot;{busca}&quot;. Tente outros termos ou fale conosco.
              </p>
            )}
            {itens.map((f, i) => (
              <div key={f.pergunta}>
                <button
                  onClick={() => setAberto(aberto === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-[13.5px] font-semibold text-slate-800">{f.pergunta}</span>
                  <ChevronDown
                    size={16}
                    className={`flex-none text-slate-400 transition-transform ${aberto === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {aberto === i && (
                  <p className="px-5 pb-4 text-[13px] leading-relaxed text-slate-600">{f.resposta}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Canal direto */}
        <div className="card p-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <MessageCircle size={18} />
          </span>
          <p className="mt-3 text-sm font-bold text-slate-800">Não encontrou o que precisava?</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Fale com a gente pelo WhatsApp ou abra um chamado — nossa equipe responde
            dentro do SLA contratado.
          </p>
          <button className="btn-primary mt-4 w-full text-[13px]">Falar no WhatsApp</button>
          <button className="btn-secondary mt-2 w-full text-[13px]">Abrir chamado</button>
        </div>
      </div>
    </div>
  );
}
