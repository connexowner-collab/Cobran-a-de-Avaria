'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { LogoVamos } from '@/components/portal/ui';

function NovaSenhaContent() {
  const router = useRouter();
  const usuarioId = useSearchParams().get('u');
  const [senha, setSenha] = useState('');
  const [confirma, setConfirma] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const requisitos = [
    { ok: senha.length >= 8, txt: 'Mínimo de 8 caracteres' },
    { ok: /[A-Za-z]/.test(senha) && /\d/.test(senha), txt: 'Letras e números' },
    { ok: senha.length > 0 && senha === confirma, txt: 'As senhas coincidem' },
  ];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    if (senha.length < 8 || !/[A-Za-z]/.test(senha) || !/\d/.test(senha)) {
      setErro('A senha deve ter ao menos 8 caracteres, com letras e números.');
      return;
    }
    if (senha !== confirma) {
      setErro('A confirmação não coincide com a nova senha.');
      return;
    }
    setSalvando(true);
    // Conclui: limpa o flag de senha provisória do usuário.
    if (usuarioId) {
      fetch('/api/usuarios/verificar-acesso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: usuarioId }),
      }).finally(() => router.push('/portal/inicio'));
    } else {
      router.push('/portal/inicio');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center"><LogoVamos altura={40} /></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <h1 className="text-2xl font-extrabold text-slate-900">Defina sua nova senha</h1>
          <p className="mt-1 text-sm text-slate-500">
            Você acessou com uma senha provisória. Cadastre uma nova senha para continuar.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {erro && <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">{erro}</div>}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Nova senha</label>
              <div className="relative">
                <input
                  type={mostrar ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="input-field py-3 pr-11 font-mono"
                  placeholder="Nova senha"
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setMostrar((v) => !v)} aria-label={mostrar ? 'Ocultar' : 'Mostrar'} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {mostrar ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Confirmar nova senha</label>
              <input
                type={mostrar ? 'text' : 'password'}
                value={confirma}
                onChange={(e) => setConfirma(e.target.value)}
                className="input-field py-3 font-mono"
                placeholder="Repita a nova senha"
                autoComplete="new-password"
              />
            </div>

            <ul className="space-y-1">
              {requisitos.map((r) => (
                <li key={r.txt} className={`flex items-center gap-1.5 text-xs ${r.ok ? 'text-emerald-600' : 'text-slate-400'}`}>
                  <CheckCircle2 size={14} /> {r.txt}
                </li>
              ))}
            </ul>

            <button type="submit" disabled={salvando} className="btn-primary w-full py-3.5 text-[15px]">
              {salvando ? 'Salvando...' : 'Salvar e entrar no portal'}
            </button>
          </form>

          <p className="mt-5 flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck size={14} /> Ambiente seguro
          </p>
        </div>
      </div>
    </div>
  );
}

export default function NovaSenhaPage() {
  return (
    <Suspense>
      <NovaSenhaContent />
    </Suspense>
  );
}
