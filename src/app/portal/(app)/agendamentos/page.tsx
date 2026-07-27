'use client';

import { useState, useEffect, useMemo, Fragment } from 'react';
import Link from 'next/link';
import {
  Check, CalendarClock, CalendarCheck, Clock, ArrowLeft, ArrowRight, Upload, X, Gauge,
  ImagePlus, Truck, Wrench, Camera, MapPin, User, Mail, Phone, Info,
  AlertTriangle, Disc3, Cog, Snowflake, CircleDot, Zap, Waves, Paintbrush2, Square,
  ShieldAlert, Ellipsis, type LucideIcon,
} from 'lucide-react';
import { AGENDAMENTOS } from '@/lib/portalData';
import { PageTitle, StatusBadge } from '@/components/portal/ui';

/* Passos do wizard, cada um com o seu ícone. */
const PASSOS: { label: string; icon: LucideIcon }[] = [
  { label: 'Veículo', icon: Truck },
  { label: 'Serviços', icon: Wrench },
  { label: 'Fotos', icon: Camera },
  { label: 'Agenda', icon: CalendarClock },
];

/* Catálogo de serviços — cada um com um ícone para a grade de seleção. */
const SERVICOS_OPCOES: { nome: string; icon: LucideIcon }[] = [
  { nome: 'Revisão preventiva', icon: CalendarCheck },
  { nome: 'Corretiva', icon: AlertTriangle },
  { nome: 'Freios', icon: Disc3 },
  { nome: 'Motor', icon: Cog },
  { nome: 'Ar-condicionado', icon: Snowflake },
  { nome: 'Pneus', icon: CircleDot },
  { nome: 'Elétrica', icon: Zap },
  { nome: 'Suspensão', icon: Waves },
  { nome: 'Funilaria e pintura', icon: Paintbrush2 },
  { nome: 'Vidros', icon: Square },
  { nome: 'Aferição de tacógrafo', icon: Gauge },
  { nome: 'Sinistro', icon: ShieldAlert },
  { nome: 'Outro', icon: Ellipsis },
];
const ICONE_SERVICO = (nome: string): LucideIcon =>
  SERVICOS_OPCOES.find((s) => s.nome === nome)?.icon ?? Wrench;

const STATUS_LABEL = { confirmado: 'Confirmado', aguardando: 'Aguardando', concluido: 'Concluído' } as const;

interface ServicoItem { servico: string; detalhes: string; }

/* ------------------------------------------------------------------ *
 * Blocos reutilizáveis do formulário.
 * ------------------------------------------------------------------ */
function CabecalhoPasso({ icon: Icon, titulo, subtitulo }: { icon: LucideIcon; titulo: string; subtitulo: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
        <Icon size={20} />
      </span>
      <div>
        <p className="text-[15px] font-extrabold text-slate-900">{titulo}</p>
        <p className="text-xs text-slate-500">{subtitulo}</p>
      </div>
    </div>
  );
}

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

/* Input com ícone à esquerda. */
function InputIcone({ icon: Icon, className = '', ...props }: { icon: LucideIcon } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <Icon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input {...props} className={`input-field w-full py-2.5 pl-9 text-[13px] ${className}`} />
    </div>
  );
}

/* Área de upload com pré-visualização das imagens anexadas. */
function UploadZona({
  files, onFiles, multiple, placeholder,
}: {
  files: File[]; onFiles: (f: File[]) => void; multiple?: boolean; placeholder: string;
}) {
  const previews = useMemo(() => files.map((f) => ({ name: f.name, url: URL.createObjectURL(f) })), [files]);
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews]);

  const remover = (i: number) => onFiles(files.filter((_, idx) => idx !== i));
  const adicionar = (novos: File[]) => onFiles(multiple ? [...files, ...novos] : novos);

  return (
    <div>
      <label className="group flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/60 px-4 py-6 text-center transition hover:border-primary-400 hover:bg-primary-50/40">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm transition group-hover:text-primary-600">
          <Upload size={18} />
        </span>
        <span className="text-[13px] font-semibold text-slate-600">{placeholder}</span>
        <span className="text-[11px] text-slate-400">Clique para selecionar {multiple ? 'imagens' : 'a imagem'} (JPG, PNG)</span>
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          onChange={(e) => { adicionar(Array.from(e.target.files ?? [])); e.target.value = ''; }}
        />
      </label>

      {previews.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {previews.map((p, i) => (
            <div key={p.url} className="group relative overflow-hidden rounded-lg border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={p.name} className="h-20 w-full object-cover" />
              <button
                type="button"
                onClick={() => remover(i)}
                aria-label={`Remover ${p.name}`}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/70 text-white opacity-0 transition group-hover:opacity-100 hover:bg-rose-600"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AgendamentosPage() {
  const [passo, setPasso] = useState(0);
  // Passo 1 — veículo
  const [placa, setPlaca] = useState('');
  const [km, setKm] = useState('');
  // Passo 2 — serviços
  const [servicos, setServicos] = useState<ServicoItem[]>([]);
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

  const setDetalhe = (nome: string, detalhes: string) =>
    setServicos((prev) => prev.map((s) => (s.servico === nome ? { ...s, detalhes } : s)));
  const toggleServico = (nome: string) =>
    setServicos((prev) =>
      prev.some((s) => s.servico === nome)
        ? prev.filter((s) => s.servico !== nome)
        : [...prev, { servico: nome, detalhes: '' }],
    );

  const servicosSelecionados = servicos.map((s) => s.servico);

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
    setServicos([]); setObservacoes(''); setAnexos([]);
    setFotoHodometro([]); setFotoPlaca([]); setMaisFotos([]);
    setEndereco(''); setData(''); setHorario(''); setCondutor(''); setEmail(''); setCelular('');
  };

  const inputCls = 'input-field w-full py-2.5 text-[13px]';
  const textareaCls = 'input-field w-full py-2.5 text-[13px] min-h-[84px] resize-y';
  const dataFmt = data ? data.split('-').reverse().join('/') : '';

  return (
    <div>
      <Link
        href="/portal/chamados"
        className="mb-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft size={14} /> Voltar para a Central de Chamados
      </Link>
      <PageTitle titulo="Nova Manutenção" subtitulo="Agende manutenções preventivas ou corretivas em poucos passos" />

      <div className="grid items-start gap-5 xl:grid-cols-[1.3fr_1fr]">
        {/* Wizard */}
        <div className="card overflow-hidden">
          {concluido ? (
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60">
                <Check size={32} />
              </span>
              <h2 className="mt-4 text-lg font-extrabold text-slate-900">Agendamento solicitado!</h2>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Veículo <b className="font-mono">{placa.toUpperCase()}</b> · {servicosSelecionados.join(', ')}
                {data && <> · {dataFmt}{horario && ` às ${horario}`}</>}. Você receberá a confirmação da oficina em até 2h úteis.
              </p>
              <button className="btn-secondary mt-6 text-[13px]" onClick={resetar}>
                Fazer novo agendamento
              </button>
            </div>
          ) : (
            <>
              {/* Faixa de topo com o stepper */}
              <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-5">
                <div className="flex items-center">
                  {PASSOS.map((p, i) => {
                    const feito = i < passo;
                    const atual = i === passo;
                    const StepIcon = p.icon;
                    return (
                      <Fragment key={p.label}>
                        <div className="flex flex-col items-center gap-1.5">
                          <span
                            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${
                              feito
                                ? 'border-emerald-500 bg-emerald-500 text-white'
                                : atual
                                  ? 'border-primary-600 bg-primary-600 text-white shadow-md shadow-primary-600/20'
                                  : 'border-slate-200 bg-white text-slate-400'
                            }`}
                          >
                            {feito ? <Check size={17} /> : <StepIcon size={17} />}
                          </span>
                          <span className={`text-[11px] font-bold ${atual ? 'text-slate-900' : feito ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {p.label}
                          </span>
                        </div>
                        {i < PASSOS.length - 1 && (
                          <span className={`mx-1 mb-5 h-0.5 flex-1 rounded-full transition ${i < passo ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                        )}
                      </Fragment>
                    );
                  })}
                </div>
              </div>

              <div className="px-6 py-6">
              {/* Passo 1 — Veículo */}
              {passo === 0 && (
                <div>
                  <CabecalhoPasso icon={Truck} titulo="Dados do veículo" subtitulo="Identifique o veículo que precisa de manutenção" />
                  <Campo label="Placa, Chassi ou Nº Série do Veículo" obrigatorio>
                    <InputIcone icon={Truck} value={placa} onChange={(e) => setPlaca(e.target.value)} placeholder="SHQ6B80" className="font-mono uppercase" />
                  </Campo>
                  <Campo label="Km do Veículo" obrigatorio>
                    <InputIcone icon={Gauge} value={km} onChange={(e) => setKm(e.target.value)} placeholder="Km atual do veículo" inputMode="numeric" className="font-mono" />
                  </Campo>
                  <div className="flex items-start gap-2 rounded-lg bg-sky-50 px-3.5 py-2.5 text-[12px] text-sky-800">
                    <Info size={15} className="mt-0.5 shrink-0 text-sky-500" />
                    <p>Informe a placa como no documento. O Km ajuda a oficina a preparar a revisão correta.</p>
                  </div>
                </div>
              )}

              {/* Passo 2 — Serviços */}
              {passo === 1 && (
                <div>
                  <CabecalhoPasso icon={Wrench} titulo="Serviços necessários" subtitulo="Selecione um ou mais serviços para o chamado" />

                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {SERVICOS_OPCOES.map(({ nome, icon: Icon }) => {
                      const sel = servicosSelecionados.includes(nome);
                      return (
                        <button
                          key={nome}
                          type="button"
                          onClick={() => toggleServico(nome)}
                          aria-pressed={sel}
                          className={`relative flex flex-col items-center gap-2 rounded-xl border-2 px-2 py-3.5 text-center transition ${
                            sel
                              ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {sel && (
                            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-white">
                              <Check size={11} />
                            </span>
                          )}
                          <Icon size={20} className={sel ? 'text-primary-600' : 'text-slate-400'} />
                          <span className="text-[12px] font-semibold leading-tight">{nome}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Detalhes por serviço selecionado */}
                  {servicos.length > 0 && (
                    <div className="mt-5 space-y-2.5">
                      <p className="text-[13px] font-bold text-slate-700">Detalhe cada serviço selecionado</p>
                      {servicos.map((s) => {
                        const Icon = ICONE_SERVICO(s.servico);
                        return (
                          <div key={s.servico} className="rounded-xl border border-slate-200 p-3.5">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="flex items-center gap-2 text-[13px] font-bold text-slate-700">
                                <Icon size={15} className="text-primary-600" /> {s.servico}
                              </span>
                              <button type="button" onClick={() => toggleServico(s.servico)} aria-label={`Remover ${s.servico}`} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-600">
                                <X size={15} />
                              </button>
                            </div>
                            <textarea value={s.detalhes} onChange={(e) => setDetalhe(s.servico, e.target.value)} className={textareaCls} placeholder={`Descreva o que precisa em "${s.servico}"`} />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <Campo label="Observações Gerais" obrigatorio>
                      <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className={textareaCls} placeholder="Digite sua observação" />
                    </Campo>
                    <label className="mb-1.5 block text-[13px] font-semibold text-slate-600">Deseja anexar imagens à sua solicitação?</label>
                    <UploadZona files={anexos} onFiles={setAnexos} multiple placeholder="Anexe imagens da solicitação (opcional)" />
                  </div>
                </div>
              )}

              {/* Passo 3 — Fotos */}
              {passo === 2 && (
                <div>
                  <CabecalhoPasso icon={Camera} titulo="Fotos do veículo" subtitulo="Anexe as fotos solicitadas para agilizar o atendimento" />

                  <div className="mb-4 rounded-xl border border-slate-200 p-4">
                    <div className="mb-1 flex items-center gap-2 text-slate-700">
                      <Gauge size={16} className="text-primary-600" /><p className="text-[13px] font-bold">Hodômetro <span className="text-primary-600">*</span></p>
                    </div>
                    <p className="mb-2.5 text-xs text-slate-500">Anexe uma foto nítida do <b>hodômetro</b> do veículo.</p>
                    <UploadZona files={fotoHodometro} onFiles={setFotoHodometro} placeholder="Foto do hodômetro" />
                  </div>

                  <div className="mb-4 rounded-xl border border-slate-200 p-4">
                    <div className="mb-1 flex items-center gap-2 text-slate-700">
                      <ImagePlus size={16} className="text-primary-600" /><p className="text-[13px] font-bold">Placa <span className="text-primary-600">*</span></p>
                    </div>
                    <p className="mb-2.5 text-xs text-slate-500">Anexe uma foto da <b>placa</b> do veículo.</p>
                    <UploadZona files={fotoPlaca} onFiles={setFotoPlaca} placeholder="Foto da placa" />
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="mb-1 flex items-center gap-2 text-slate-700">
                      <Camera size={16} className="text-slate-400" /><p className="text-[13px] font-bold">Mais fotos</p>
                    </div>
                    <p className="mb-2.5 text-xs text-slate-500">Anexe outras fotos do veículo ou do problema, se necessário (opcional).</p>
                    <UploadZona files={maisFotos} onFiles={setMaisFotos} multiple placeholder="Mais fotos do veículo ou do problema" />
                  </div>
                </div>
              )}

              {/* Passo 4 — Agenda */}
              {passo === 3 && (
                <div>
                  <CabecalhoPasso icon={CalendarClock} titulo="Dados do agendamento" subtitulo="Informe onde, quando e com quem falar" />
                  <Campo label="Endereço de referência sugerido" obrigatorio>
                    <InputIcone icon={MapPin} value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Digite o endereço de referência sugerido" />
                  </Campo>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Campo label="Data" obrigatorio>
                      <InputIcone icon={CalendarCheck} type="date" value={data} onChange={(e) => setData(e.target.value)} className="font-mono" />
                    </Campo>
                    <Campo label="Horário sugerido" obrigatorio>
                      <InputIcone icon={Clock} type="time" value={horario} onChange={(e) => setHorario(e.target.value)} className="font-mono" />
                    </Campo>
                  </div>
                  <Campo label="Nome / Condutor" obrigatorio>
                    <InputIcone icon={User} value={condutor} onChange={(e) => setCondutor(e.target.value)} placeholder="Digite nome do condutor" />
                  </Campo>
                  <Campo label="E-mail" obrigatorio>
                    <InputIcone icon={Mail} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Digite o e-mail" />
                  </Campo>
                  <Campo label="Celular" obrigatorio>
                    <InputIcone icon={Phone} value={celular} onChange={(e) => setCelular(e.target.value)} placeholder="Digite o telefone do condutor" inputMode="tel" />
                  </Campo>
                </div>
              )}

              <div className="mt-7 flex justify-end gap-2.5">
                {passo > 0 && (
                  <button className="btn-secondary text-[13px]" onClick={() => setPasso((p) => p - 1)}>
                    Voltar
                  </button>
                )}
                <button className="btn-primary gap-1.5 text-[13px]" disabled={!podeAvancar} onClick={avancar}>
                  {passo === 3 ? <><Check size={15} /> Finalizar</> : <>Continuar <ArrowRight size={15} /></>}
                </button>
              </div>
              </div>
            </>
          )}
        </div>

        {/* Coluna lateral: resumo ao vivo + próximos agendamentos */}
        <div className="space-y-5">
          {!concluido && (
            <div className="card overflow-hidden">
              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/60 px-5 py-3.5">
                <Info size={15} className="text-primary-500" />
                <span className="text-[13px] font-bold text-slate-800">Resumo da solicitação</span>
              </div>
              <div className="space-y-3 px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><Truck size={15} /></span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Veículo</p>
                    <p className="truncate font-mono text-[13px] font-semibold text-slate-800">{placa ? placa.toUpperCase() : '—'}{km && <span className="ml-1 font-sans font-normal text-slate-400">· {km} km</span>}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><Wrench size={15} /></span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Serviços</p>
                    {servicosSelecionados.length ? (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {servicosSelecionados.map((s) => {
                          const Icon = ICONE_SERVICO(s);
                          return (
                            <span key={s} className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-700">
                              <Icon size={11} /> {s}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[13px] text-slate-400">Nenhum selecionado</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><CalendarClock size={15} /></span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Agenda</p>
                    <p className="text-[13px] font-semibold text-slate-800">{data ? <>{dataFmt}{horario && ` às ${horario}`}</> : <span className="font-normal text-slate-400">A definir</span>}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

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
    </div>
  );
}
