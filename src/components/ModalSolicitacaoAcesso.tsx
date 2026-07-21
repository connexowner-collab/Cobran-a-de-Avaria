'use client';

import { useState } from 'react';
import { X, ClipboardList, Search, CheckCircle2, ArrowLeft, Building2 } from 'lucide-react';
import type { SolicitacaoAcesso } from '@/types';
import { STATUS_SOLICITACAO_LABEL } from '@/types';

type Modo = 'escolha' | 'solicitar' | 'acompanhar';

/* ── Máscaras ── */
function mascararCpf(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
}
function mascararCnpj(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5');
}
function mascararTelefone(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 10) {
    return d.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  }
  return d.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
}

const CAMPOS_INICIAIS = {
  nomeEmpresa: '',
  cnpj: '',
  nomeCompleto: '',
  cpf: '',
  dataNascimento: '',
  emailCorporativo: '',
  telefoneComercial: '',
  telefoneCelular: '',
};

function statusClasse(status: SolicitacaoAcesso['status']): string {
  if (status === 'pendente') return 'bg-amber-100 text-amber-800';
  if (status === 'em_atendimento') return 'bg-sky-100 text-sky-800';
  return 'bg-emerald-100 text-emerald-800';
}

export default function ModalSolicitacaoAcesso({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [modo, setModo] = useState<Modo>('escolha');
  const [campos, setCampos] = useState({ ...CAMPOS_INICIAIS });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [protocolo, setProtocolo] = useState<string | null>(null);

  // Acompanhamento
  const [cpfBusca, setCpfBusca] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [buscou, setBuscou] = useState(false);
  const [resultados, setResultados] = useState<SolicitacaoAcesso[]>([]);

  if (!open) return null;

  const fechar = () => {
    setModo('escolha');
    setCampos({ ...CAMPOS_INICIAIS });
    setErro('');
    setProtocolo(null);
    setCpfBusca('');
    setBuscou(false);
    setResultados([]);
    onClose();
  };

  const set = (campo: keyof typeof CAMPOS_INICIAIS, valor: string) =>
    setCampos((prev) => ({ ...prev, [campo]: valor }));

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    if (campos.cpf.replace(/\D/g, '').length !== 11) {
      setErro('Informe um CPF válido.');
      return;
    }
    setEnviando(true);
    try {
      const res = await fetch('/api/solicitacoes-acesso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campos),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data?.error || 'Não foi possível enviar a solicitação.');
        setEnviando(false);
        return;
      }
      setProtocolo(data.id);
    } catch {
      setErro('Erro de conexão. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  const acompanhar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    if (cpfBusca.replace(/\D/g, '').length !== 11) {
      setErro('Informe um CPF válido.');
      return;
    }
    setBuscando(true);
    setBuscou(false);
    try {
      const res = await fetch(`/api/solicitacoes-acesso?cpf=${encodeURIComponent(cpfBusca)}`);
      const data = await res.json();
      setResultados(Array.isArray(data?.items) ? data.items : []);
      setBuscou(true);
    } catch {
      setErro('Erro ao consultar. Tente novamente.');
    } finally {
      setBuscando(false);
    }
  };

  const inputCls =
    'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500';
  const labelCls = 'mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => e.target === e.currentTarget && fechar()}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            {modo !== 'escolha' && !protocolo && (
              <button
                type="button"
                onClick={() => { setModo('escolha'); setErro(''); }}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Voltar"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <h3 className="text-lg font-bold text-slate-900">
              {protocolo
                ? 'Solicitação enviada'
                : modo === 'solicitar'
                  ? 'Solicitar cadastro'
                  : modo === 'acompanhar'
                    ? 'Acompanhar solicitação'
                    : 'Solicite seu cadastro'}
            </h3>
          </div>
          <button
            type="button"
            onClick={fechar}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          {/* ── Sucesso ── */}
          {protocolo ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-500" />
              <p className="text-sm text-slate-600">Sua solicitação foi registrada com sucesso.</p>
              <p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-400">Protocolo</p>
              <p className="font-mono text-2xl font-extrabold text-slate-900">{protocolo}</p>
              <p className="mt-3 text-xs text-slate-500">
                Guarde este protocolo. Você pode consultar o andamento em “Acompanhar solicitação” usando seu CPF.
              </p>
              <button type="button" onClick={fechar} className="btn-primary mt-5 w-full py-2.5">
                Concluir
              </button>
            </div>
          ) : modo === 'escolha' ? (
            /* ── Escolha ── */
            <div className="space-y-3">
              <p className="text-sm text-slate-500">O que você deseja fazer?</p>
              <button
                type="button"
                onClick={() => { setModo('solicitar'); setErro(''); }}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-primary-400 hover:bg-primary-50/40"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
                  <ClipboardList size={20} />
                </span>
                <span>
                  <span className="block text-sm font-bold text-slate-800">Solicitar cadastro</span>
                  <span className="block text-xs text-slate-500">Preencha o formulário para pedir seu acesso ao portal.</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => { setModo('acompanhar'); setErro(''); }}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-primary-400 hover:bg-primary-50/40"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                  <Search size={20} />
                </span>
                <span>
                  <span className="block text-sm font-bold text-slate-800">Acompanhar solicitação</span>
                  <span className="block text-xs text-slate-500">Consulte o status do seu chamado usando seu CPF.</span>
                </span>
              </button>
            </div>
          ) : modo === 'solicitar' ? (
            /* ── Formulário ── */
            <form onSubmit={enviar} className="space-y-4">
              {erro && <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">{erro}</div>}
              <div>
                <label className={labelCls}>Qual o nome da empresa? *</label>
                <input className={inputCls} value={campos.nomeEmpresa} onChange={(e) => set('nomeEmpresa', e.target.value)} required />
              </div>
              <div>
                <label className={labelCls}>Qual o CNPJ da empresa? *</label>
                <input className={inputCls} value={campos.cnpj} onChange={(e) => set('cnpj', mascararCnpj(e.target.value))} placeholder="00.000.000/0000-00" inputMode="numeric" required />
              </div>
              <div>
                <label className={labelCls}>Nome completo *</label>
                <input className={inputCls} value={campos.nomeCompleto} onChange={(e) => set('nomeCompleto', e.target.value)} required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>CPF *</label>
                  <input className={inputCls} value={campos.cpf} onChange={(e) => set('cpf', mascararCpf(e.target.value))} placeholder="000.000.000-00" inputMode="numeric" required />
                </div>
                <div>
                  <label className={labelCls}>Data de nascimento *</label>
                  <input type="date" className={inputCls} value={campos.dataNascimento} onChange={(e) => set('dataNascimento', e.target.value)} required />
                </div>
              </div>
              <div>
                <label className={labelCls}>E-mail corporativo *</label>
                <input type="email" className={inputCls} value={campos.emailCorporativo} onChange={(e) => set('emailCorporativo', e.target.value)} placeholder="nome@empresa.com" required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Telefone comercial *</label>
                  <input className={inputCls} value={campos.telefoneComercial} onChange={(e) => set('telefoneComercial', mascararTelefone(e.target.value))} placeholder="(00) 0000-0000" inputMode="numeric" required />
                </div>
                <div>
                  <label className={labelCls}>Telefone celular</label>
                  <input className={inputCls} value={campos.telefoneCelular} onChange={(e) => set('telefoneCelular', mascararTelefone(e.target.value))} placeholder="(00) 00000-0000" inputMode="numeric" />
                </div>
              </div>
              <button type="submit" disabled={enviando} className="btn-primary w-full py-2.5">
                {enviando ? 'Enviando...' : 'Enviar solicitação'}
              </button>
            </form>
          ) : (
            /* ── Acompanhar ── */
            <div className="space-y-4">
              <form onSubmit={acompanhar} className="space-y-3">
                {erro && <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">{erro}</div>}
                <div>
                  <label className={labelCls}>Informe seu CPF</label>
                  <div className="flex gap-2">
                    <input className={inputCls} value={cpfBusca} onChange={(e) => setCpfBusca(mascararCpf(e.target.value))} placeholder="000.000.000-00" inputMode="numeric" />
                    <button type="submit" disabled={buscando} className="btn-primary shrink-0 px-4">
                      {buscando ? '...' : 'Buscar'}
                    </button>
                  </div>
                </div>
              </form>

              {buscou && (
                resultados.length === 0 ? (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                    Nenhuma solicitação encontrada para este CPF.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {resultados.map((s) => (
                      <div key={s.id} className="rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm font-bold text-slate-700">{s.id}</span>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClasse(s.status)}`}>
                            {STATUS_SOLICITACAO_LABEL[s.status]}
                          </span>
                        </div>
                        <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-slate-800">
                          <Building2 size={14} className="text-slate-400" /> {s.nomeEmpresa}
                        </p>
                        <p className="text-xs text-slate-500">
                          Enviada em {new Date(s.criadoEm).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
