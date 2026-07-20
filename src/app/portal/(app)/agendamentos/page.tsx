'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Camera, CalendarClock, ArrowLeft } from 'lucide-react';
import { AGENDAMENTOS } from '@/lib/portalData';
import { PageTitle, StatusBadge } from '@/components/portal/ui';

const PASSOS = ['Veículo', 'Serviços', 'Fotos', 'Agenda'];
const SINTOMAS = ['Freios', 'Motor', 'Ar-condicionado', 'Pneus', 'Elétrica', 'Suspensão', 'Vidros', 'Outro'];
const STATUS_LABEL = { confirmado: 'Confirmado', aguardando: 'Aguardando', concluido: 'Concluído' } as const;

export default function AgendamentosPage() {
  const [passo, setPasso] = useState(0);
  const [placa, setPlaca] = useState('');
  const [km, setKm] = useState('');
  const [sintomas, setSintomas] = useState<string[]>([]);
  const [data, setData] = useState('');
  const [concluido, setConcluido] = useState(false);

  const toggleSintoma = (s: string) =>
    setSintomas((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const podeAvancar =
    (passo === 0 && placa.trim().length >= 5) ||
    (passo === 1 && sintomas.length > 0) ||
    passo === 2 ||
    (passo === 3 && data !== '');

  const avancar = () => {
    if (passo === 3) {
      setConcluido(true);
      return;
    }
    setPasso((p) => p + 1);
  };

  return (
    <div>
      <Link
        href="/portal/chamados"
        className="mb-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft size={14} /> Voltar para a Central de Chamados
      </Link>
      <PageTitle titulo="Abrir chamado" subtitulo="Agende manutenções preventivas ou corretivas em poucos passos" />

      <div className="grid items-start gap-5 xl:grid-cols-[1.3fr_1fr]">
        {/* Wizard */}
        <div className="card p-6">
          {concluido ? (
            <div className="flex flex-col items-center py-12 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Check size={28} />
              </span>
              <h2 className="mt-4 text-lg font-extrabold text-slate-900">Agendamento solicitado!</h2>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Veículo <b className="font-mono">{placa.toUpperCase()}</b> · {sintomas.join(', ')} ·{' '}
                {data.split('-').reverse().join('/')}. Você receberá a confirmação da oficina em até 2h úteis.
              </p>
              <button
                className="btn-secondary mt-6 text-[13px]"
                onClick={() => { setConcluido(false); setPasso(0); setPlaca(''); setKm(''); setSintomas([]); setData(''); }}
              >
                Fazer novo agendamento
              </button>
            </div>
          ) : (
            <>
              {/* Stepper */}
              <div className="mb-7 flex items-center gap-2">
                {PASSOS.map((label, i) => (
                  <div key={label} className="flex items-center gap-2">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full font-mono text-xs font-bold ${
                        i < passo
                          ? 'bg-emerald-500 text-white'
                          : i === passo
                            ? 'bg-primary-600 text-white'
                            : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {i < passo ? <Check size={13} /> : i + 1}
                    </span>
                    <span className={`text-[13px] font-semibold ${i === passo ? 'text-slate-900' : 'text-slate-400'}`}>
                      {label}
                    </span>
                    {i < PASSOS.length - 1 && <span className="h-px w-8 bg-slate-200" />}
                  </div>
                ))}
              </div>

              {passo === 0 && (
                <div>
                  <p className="text-[15px] font-bold text-slate-800">Dados do veículo</p>
                  <p className="mb-4 text-xs text-slate-500">Placa, chassi ou nº de série</p>
                  <input
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value)}
                    placeholder="SHQ6B80"
                    className="input-field mb-3 py-3 font-mono uppercase"
                  />
                  <input
                    value={km}
                    onChange={(e) => setKm(e.target.value)}
                    placeholder="Km atual do veículo"
                    className="input-field py-3 font-mono"
                  />
                </div>
              )}

              {passo === 1 && (
                <div>
                  <p className="text-[15px] font-bold text-slate-800">Sintomas / serviço desejado</p>
                  <p className="mb-4 text-xs text-slate-500">Selecione um ou mais itens</p>
                  <div className="flex flex-wrap gap-2">
                    {SINTOMAS.map((sTag) => {
                      const ativo = sintomas.includes(sTag);
                      return (
                        <button
                          key={sTag}
                          onClick={() => toggleSintoma(sTag)}
                          className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                            ativo
                              ? 'border border-primary-600 bg-primary-50 text-primary-700'
                              : 'border border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          {sTag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {passo === 2 && (
                <div>
                  <p className="text-[15px] font-bold text-slate-800">Fotos (opcional)</p>
                  <p className="mb-4 text-xs text-slate-500">
                    Fotos do problema ajudam a oficina a preparar peças antes da sua chegada
                  </p>
                  <div className="flex h-36 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 text-slate-400">
                    <Camera size={26} />
                    <span className="text-xs font-semibold">Arraste imagens ou clique para enviar</span>
                  </div>
                </div>
              )}

              {passo === 3 && (
                <div>
                  <p className="text-[15px] font-bold text-slate-800">Data preferida</p>
                  <p className="mb-4 text-xs text-slate-500">A oficina confirmará o melhor horário disponível</p>
                  <input
                    type="date"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    className="input-field py-3 font-mono"
                  />
                </div>
              )}

              <div className="mt-7 flex justify-end gap-2.5">
                {passo > 0 && (
                  <button className="btn-secondary text-[13px]" onClick={() => setPasso((p) => p - 1)}>
                    Voltar
                  </button>
                )}
                <button className="btn-primary text-[13px]" disabled={!podeAvancar} onClick={avancar}>
                  {passo === 3 ? 'Confirmar agendamento' : 'Continuar'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Próximos agendamentos */}
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5">
            <CalendarClock size={15} className="text-slate-400" />
            <span className="text-[13px] font-bold text-slate-800">Seus agendamentos</span>
          </div>
          {AGENDAMENTOS.map((a) => (
            <div key={a.id} className="border-b border-slate-100 px-5 py-3.5 last:border-0">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-slate-500">{a.id}</span>
                <StatusBadge status={a.status} label={STATUS_LABEL[a.status]} />
              </div>
              <p className="mt-1 text-[13px] font-semibold text-slate-800">{a.servico}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                <span className="font-mono">{a.placa}</span> · {a.data}
              </p>
              <p className="text-xs text-slate-400">{a.unidade}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
