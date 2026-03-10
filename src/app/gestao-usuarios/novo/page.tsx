'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Cliente } from '@/types';
import type { PermissaoUsuario } from '@/types';
import { MatrizPermissoes } from '@/components/MatrizPermissoes';

export default function NovoUsuarioPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [clienteId, setClienteId] = useState('');
  const [permissoes, setPermissoes] = useState<PermissaoUsuario>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/clientes')
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setClientes(list);
        if (list.length > 0 && !clienteId) setClienteId(list[0].id);
      });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!nome.trim() || !email.trim() || !clienteId) {
      setError('Preencha nome, e-mail e cliente.');
      return;
    }
    setSubmitting(true);
    fetch('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        ativo,
        clienteId,
        permissoes,
      }),
    })
      .then((res) => {
        if (!res.ok) return res.json().then((d) => Promise.reject(d));
        return res.json();
      })
      .then(() => router.push('/'))
      .catch((err) => {
        setError(err?.error || 'Erro ao salvar usuário.');
        setSubmitting(false);
      });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          title="Voltar ao menu inicial"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Novo usuário</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Dados do usuário</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Nome *</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="input-field"
                placeholder="Nome completo"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">E-mail *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="email@cliente.com"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Cliente *</label>
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Selecione</option>
                {clientes.filter((c) => c.ativo).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nomeFantasia || c.razaoSocial}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                id="ativo"
                checked={ativo}
                onChange={(e) => setAtivo(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="ativo" className="text-sm font-medium text-slate-700">
                Usuário ativo
              </label>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <MatrizPermissoes permissoes={permissoes} onChange={setPermissoes} />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Salvando...' : 'Salvar usuário'}
          </button>
          <Link href="/" className="btn-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
