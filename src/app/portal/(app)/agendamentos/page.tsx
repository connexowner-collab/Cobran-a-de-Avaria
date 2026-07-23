'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, CalendarClock, ArrowLeft, Upload, Plus, X, Gauge, ImagePlus } from 'lucide-react';
import { AGENDAMENTOS } from '@/lib/portalData';
import { PageTitle, StatusBadge } from '@/components/portal/ui';

const PASSOS = ['Veículo', 'Serviços', 'Fotos', 'Agenda'];
const SERVICOS_OPCOES = [
  'Revisão preventiva', 'Corretiva', 'Freios', 'Motor', 'Ar-condicionado',
  'Pneus', 'Elétrica', 'Suspensão', 'Funilaria e pintura', 'Vidros',
  'Aferição de tacógrafo', 'Sinistro', 'Outro',
];
const STATUS_LABEL = { confirmado: 'Confirmado', aguardando: 'Aguardando', concluido: 'Concluído' } as const;

interface ServicoItem { servico: string; detalhes: string; }

/* ------------------------------------------------------------------ *
 * Blocos reutilizáveis do formulário.
 * ------------------------------------------------------------------ */
function Campo({ label, obrigatorio, children }: { label: string; obrigatorio?: boolean; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="mb-1 block text-[13px] font-semibold text-slate-600">
        {obrigatorio && <span className="text-primary-600">*</span>}{label}
      </label>
      {children}
    </div>
  );
}

function UploadField({ files, onFiles, multiple, placeholder }: {
  files: File[]; onFiles: (f: File[]) => void; multiple?: boolean; placeholder: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2.5">
      <span className="min-w-0 flex-1 truncate text-[13px] text-slate-500">
        {files.length ? files.map((f) => f.name).join(', ') : placeholder}
      </span>
      <label className="shrink-0 cursor-pointer rounded-md bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700">
        Upload
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          onChange={(e) => onFiles(Array.from(e.target.files ?? []))}
        />
      </label>
    </div>
  );
}

export default function AgendamentosPage() {
  const [passo, setPasso] = useState(0);
  // Passo 1 — veículo
  const [placa, setPlaca] = useState('');
  const [km, setKm] = useState('');
  // Passo 2 — serviços
  const [servicos, setServicos] = useState<ServicoItem[]>([{ servico: '', detalhes: '' }]);
  const [observacoes, setObservacoes] = useState('');
  const [anexos, setAnexos] = useState<File[]>([]);
  // Passo 3 — fotos
  const [fotoHodometro, setFotoHodometro] = useState<File[]>([]);
  const [fotoPlaca, setFotoPlaca] = useState<File[]>([]);
  const [maisFotos, setMaisFotos] = useState<File[]>([]);
  // Passo 4 — agenda
  const [endereco, setEndereco] = useState('');
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');
  const [condutor, setCondutor] = useState('');
  const [email, setEmail] = useState('');
  const [celular, setCelular] = useState('');
  const [concluido, setConcluido] = useState(false);

  const setServico = (i: number, campo: keyof ServicoItem, valor: string) =>
    setServicos((prev) => prev.map((s, idx) => (idx === i ? { ...s, [campo]: valor } : s)));
  const addServico = () => setServicos((prev) => [...prev, { servico: '', detalhes: '' }]);
  const removeServico = (i: number) => setServicos((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i)));

  const servicosSelecionados = servicos.filter((s) => s.servico).map((s) => s.servico);

  const podeAvancar =
    (passo === 0 && placa.trim().length >= 5 && km.trim() !== '') ||
    (passo === 1 && servicosSelecionados.length > 0 && observacoes.trim() !== '') ||
    (passo === 2 && fotoHodometro.length > 0 && fotoPlaca.length > 0) ||
    (passo === 3 && !!endereco && !!data && !!horario && !!condutor && !!email && !!celular);

  const avancar = () => {
    if (passo === 3) { setConcluido(true); return; }
    setPasso((p) => p + 1);
  };

  const resetar = () => {
    setConcluido(false); setPasso(0);
    setPlaca(''); setKm('');
    setServicos([{ servico: '', detalhes: '' }]); setObservacoes(''); setAnexos([]);
    setFotoHodometro([]); setFotoPlaca([]); setMaisFotos([]);
    setEndereco(''); setData(''); setHorario(''); setCondutor(''); setEmail(''); setCelular('');
  };

  const inputCls = 'input-field w-full py-2.5 text-[13px]';
  const textareaCls = 'input-field w-full py-2.5 text-[13px] min-h-[84px] resize-y';

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
                Veículo <b className="font-mono">{placa.toUpperCase()}</b> · {servicosSelecionados.join(', ')}
                {data && <> · {data.split('-').reverse().join('/')}{horario && ` às ${horario}`}</>}. Você receberá a confirmação da oficina em até 2h úteis.
              </p>
              <button className="btn-secondary mt-6 text-[13px]" onClick={resetar}>
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

              {/* Passo 1 — Veículo */}
              {passo === 0 && (
                <div>
                  <p className="text-[15px] font-bold text-slate-800">Dados sobre o veículo para agendamento</p>
                  <p className="mb-4 text-xs text-slate-500">Insira as informações abaixo</p>
                  <Campo label="Placa, Chassi ou Nº Série do Veículo" obrigatorio>
                    <input value={placa} onChange={(e) => setPlaca(e.target.value)} placeholder="SHQ6B80" className={`${inputCls} font-mono uppercase`} />
                  </Campo>
                  <Campo label="Km do Veículo" obrigatorio>
                    <input value={km} onChange={(e) => setKm(e.target.value)} placeholder="Km atual do veículo" inputMode="numeric" className={`${inputCls} font-mono`} />
                  </Campo>
                </div>
              )}

              {/* Passo 2 — Serviços */}
              {passo === 1 && (
                <div>
                  <p className="text-[15px] font-bold text-slate-800">Serviços Necessários</p>
                  <p className="mb-4 text-xs text-slate-500">Selecione os serviços necessários</p>

                  <div className="space-y-3">
                    {servicos.map((s, i) => (
                      <div key={i} className="rounded-xl border border-slate-200 p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-[13px] font-bold text-slate-700">Selecione o serviço</p>
                          {servicos.length > 1 && (
                            <button type="button" onClick={() => removeServico(i)} aria-label="Remover serviço" className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-600">
                              <X size={15} />
                            </button>
                          )}
                        </div>
                        <select value={s.servico} onChange={(e) => setServico(i, 'servico', e.target.value)} className={`${inputCls} mb-3`}>
                          <option value="">Selecionar serviço</option>
                          {SERVICOS_OPCOES.map((op) => <option key={op} value={op}>{op}</option>)}
                        </select>
                        <label className="mb-1 block text-[13px] font-semibold text-slate-600">Adicione detalhes da solicitação</label>
                        <textarea value={s.detalhes} onChange={(e) => setServico(i, 'detalhes', e.target.value)} className={textareaCls} placeholder="Descreva o serviço desejado" />
                      </div>
                    ))}
                    <button type="button" onClick={addServico} className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-sky-200 py-2.5 text-[13px] font-semibold text-sky-600 hover:bg-sky-50">
                      <Plus size={15} /> Adicionar mais serviços
                    </button>
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <Campo label="Observações Gerais" obrigatorio>
                      <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className={textareaCls} placeholder="Digite sua observação" />
                    </Campo>
                    <label className="mb-1 block text-[13px] font-semibold text-slate-600">Deseja anexar imagens a sua solicitação?</label>
                    <UploadField files={anexos} onFiles={setAnexos} multiple placeholder="Insira um arquivo se necessário" />
                  </div>
                </div>
              )}

              {/* Passo 3 — Fotos */}
              {passo === 2 && (
                <div>
                  <p className="text-[15px] font-bold text-slate-800">Fotos do hodômetro e placa</p>
                  <p className="mb-4 text-xs text-slate-500">Anexe as fotos solicitadas</p>

                  <div className="mb-4 rounded-xl border border-slate-200 p-4">
                    <div className="mb-2 flex items-center gap-2 text-slate-700">
                      <Gauge size={16} /><p className="text-[13px] font-bold">Hodômetro</p>
                    </div>
                    <p className="mb-2 text-xs text-slate-500">Por favor, anexe uma foto do <b>Hodômetro</b> do veículo</p>
                    <Campo label="Foto do hodômetro" obrigatorio>
                      <UploadField files={fotoHodometro} onFiles={setFotoHodometro} placeholder="Selecionar foto do hodômetro" />
                    </Campo>
                  </div>

                  <div className="mb-4 rounded-xl border border-slate-200 p-4">
                    <div className="mb-2 flex items-center gap-2 text-slate-700">
                      <ImagePlus size={16} /><p className="text-[13px] font-bold">Placa</p>
                    </div>
                    <p className="mb-2 text-xs text-slate-500">Por favor, anexe uma foto da <b>Placa</b> do veículo</p>
                    <Campo label="Foto da placa" obrigatorio>
                      <UploadField files={fotoPlaca} onFiles={setFotoPlaca} placeholder="Selecionar foto da placa" />
                    </Campo>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="mb-2 flex items-center gap-2 text-slate-700">
                      <ImagePlus size={16} /><p className="text-[13px] font-bold">Mais fotos</p>
                    </div>
                    <p className="mb-2 text-xs text-slate-500">Anexe outras fotos do veículo ou do problema, caso seja necessário (opcional)</p>
                    <UploadField files={maisFotos} onFiles={setMaisFotos} multiple placeholder="Selecionar mais fotos se necessário" />
                    {maisFotos.length > 0 && (
                      <p className="mt-2 text-[11px] font-semibold text-slate-500">{maisFotos.length} foto(s) anexada(s)</p>
                    )}
                  </div>
                </div>
              )}

              {/* Passo 4 — Agenda */}
              {passo === 3 && (
                <div>
                  <p className="text-[15px] font-bold text-slate-800">Informe os dados para agendamento</p>
                  <p className="mb-4 text-xs text-slate-500">Insira os dados abaixo</p>
                  <Campo label="Endereço de referência sugerido" obrigatorio>
                    <input value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Digite o endereço de referência sugerido" className={inputCls} />
                  </Campo>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Campo label="Data" obrigatorio>
                      <input type="date" value={data} onChange={(e) => setData(e.target.value)} className={`${inputCls} font-mono`} />
                    </Campo>
                    <Campo label="Horário sugerido" obrigatorio>
                      <input type="time" value={horario} onChange={(e) => setHorario(e.target.value)} className={`${inputCls} font-mono`} />
                    </Campo>
                  </div>
                  <Campo label="Nome / Condutor" obrigatorio>
                    <input value={condutor} onChange={(e) => setCondutor(e.target.value)} placeholder="Digite nome do condutor" className={inputCls} />
                  </Campo>
                  <Campo label="E-mail" obrigatorio>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Digite o e-mail" className={inputCls} />
                  </Campo>
                  <Campo label="Celular" obrigatorio>
                    <input value={celular} onChange={(e) => setCelular(e.target.value)} placeholder="Digite o telefone do condutor" inputMode="tel" className={inputCls} />
                  </Campo>
                </div>
              )}

              <div className="mt-7 flex justify-end gap-2.5">
                {passo > 0 && (
                  <button className="btn-secondary text-[13px]" onClick={() => setPasso((p) => p - 1)}>
                    Voltar
                  </button>
                )}
                <button className="btn-primary text-[13px]" disabled={!podeAvancar} onClick={avancar}>
                  {passo === 3 ? 'Finalizar' : 'Continuar'}
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
