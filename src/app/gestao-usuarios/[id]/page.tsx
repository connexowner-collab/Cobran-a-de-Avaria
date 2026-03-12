'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { GrupoListItem } from '@/types';
import type { PermissaoUsuario } from '@/types';
import { MatrizPermissoes } from '@/components/MatrizPermissoes';

export default function EditarUsuarioPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [grupos, setGrupos] = useState<GrupoListItem[]>([]);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [grupoId, setGrupoId] = useState('');
  const [permissoes, setPermissoes] = useState<PermissaoUsuario>({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch('/api/grupos').then((r) => r.json()),
      fetch(`/api/usuarios/${id}`).then((r) => (r.ok ? r.json() : null)),
    ]).then(([gruposData, usuario]) => {
      setGrupos(Array.isArray(gruposData) ? gruposData : []);
      if (usuario) {
        setNome(usuario.nome);
        setEmail(usuario.email);
        setAtivo(usuario.ativo);
        setGrupoId(usuario.grupoId || usuario.clienteId ? `grp-${usuario.clienteId}` : '');
        setPermissoes(usuario.permissoes || {});
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (notFound) {
    return (
      <div className="space-y-4">
        <Link href="/" className="btn-secondary inline-flex gap-2">
          Voltar
        </Link>
        <p className="text-slate-600">Usuário não encontrado.</p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!nome.trim() || !email.trim() || !grupoId) {
      setError('Preencha nome, e-mail e grupo de cliente.');
      return;
    }
    setSubmitting(true);
    fetch(`/api/usuarios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        ativo,
        grupoId,
        permissoes,
      }),
    })
      .then((res) => {
        if (!res.ok) return res.json().then((d) => Promise.reject(d));
        return res.json();
      })
      .then(() => router.push('/'))
      .catch((err) => {
        setError(err?.error || 'Erro ao atualizar usuário.');
        setSubmitting(false);
      });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="text-slate-500">Carregando...</span>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-slate-900">Editar usuário</h1>
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
              <label className="mb-1 block text-sm font-medium text-slate-700">Grupo de cliente *</label>
              <select
                value={grupoId}
                onChange={(e) => setGrupoId(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Selecione</option>
                {grupos.filter((g) => g.ativo).map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nome}
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
            {submitting ? 'Salvando...' : 'Salvar alterações'}
          </button>
          <Link href="/" className="btn-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
