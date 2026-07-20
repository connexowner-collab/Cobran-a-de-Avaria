'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ShieldCheck, Truck, Headset } from 'lucide-react';
import { LogoVamos } from '@/components/portal/ui';

/** Login do Portal do Cliente (protótipo — qualquer credencial entra). */
export default function PortalLoginPage() {
  const router = useRouter();
  const [documento, setDocumento] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [entrando, setEntrando] = useState(false);

  const entrar = (e: React.FormEvent) => {
    e.preventDefault();
    setEntrando(true);
    router.push('/portal/inicio');
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Painel de marca */}
      <div className="relative m-4 hidden flex-1 overflow-hidden rounded-3xl bg-[#0c1620] lg:block">
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(150deg, #0e2233 0%, #10293e 45%, #5c1020 100%)',
          }}
        />
        {/* Grade decorativa sutil */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute left-10 top-10 rounded-xl bg-white px-4 py-2.5 shadow-lg">
          <LogoVamos altura={34} />
        </div>
        <div className="absolute bottom-14 left-10 right-10">
          <span className="mb-5 inline-block rounded-full bg-primary-600/90 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white">
            Portal do Cliente
          </span>
          <h1 className="max-w-xl text-4xl font-extrabold leading-tight text-white xl:text-5xl">
            Soluções que facilitam a gestão do negócio.
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/80">
            Controle total da sua frota — chamados, documentos, manutenções e
            relatórios em um só lugar, com tecnologia e inovação.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {['Chamados com SLA', 'CRLV da frota', '2ª via de boletos', 'Telemetria em tempo real'].map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <LogoVamos altura={38} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900">Bem-vindo de volta</h2>
          <p className="mt-1 text-sm text-slate-500">
            Acesse com seu CPF ou CNPJ para gerenciar sua frota
          </p>

          <form onSubmit={entrar} className="mt-8 space-y-4">
            <div>
              <label htmlFor="documento" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                CPF ou CNPJ
              </label>
              <input
                id="documento"
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                placeholder="000.000.000-00"
                autoComplete="username"
                className="input-field py-3 font-mono"
              />
            </div>
            <div>
              <label htmlFor="senha" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Senha
              </label>
              <div className="relative">
                <input
                  id="senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Sua senha"
                  autoComplete="current-password"
                  className="input-field py-3 pr-11 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {mostrarSenha ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <div className="text-right">
              <a href="#" className="text-[13px] font-semibold text-primary-700 hover:text-primary-600">
                Esqueci a senha
              </a>
            </div>
            <button
              type="submit"
              disabled={entrando}
              className="btn-primary w-full py-3.5 text-[15px]"
            >
              {entrando ? 'Entrando...' : 'Entrar no portal'}
            </button>
          </form>

          <p className="mt-5 text-[13px] text-slate-500">
            Não tem acesso?{' '}
            <a href="#" className="font-semibold text-primary-700 hover:text-primary-600">
              Solicite seu cadastro
            </a>
          </p>

          <div className="mt-8 flex gap-5 border-t border-slate-200 pt-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={15} /> Ambiente seguro
            </span>
            <span className="flex items-center gap-1.5">
              <Headset size={15} /> Suporte 0800 025 4141
            </span>
            <span className="flex items-center gap-1.5">
              <Truck size={15} /> Grupo Vamos
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
