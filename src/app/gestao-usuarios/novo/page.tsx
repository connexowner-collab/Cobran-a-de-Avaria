'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import type { GrupoListItem, Perfil } from '@/types';
import type { PermissaoUsuario } from '@/types';
import { MatrizPermissoes } from '@/components/MatrizPermissoes';
import ModalCriarPerfil from '@/components/ModalCriarPerfil';

export default function NovoUsuarioPage() {
  const router = useRouter();
  const [grupos, setGrupos] = useState<GrupoListItem[]>([]);
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [perfilId, setPerfilId] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [grupoId, setGrupoId] = useState('');
  const [permissoes, setPermissoes] = useState<PermissaoUsuario>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [modalCriarPerfilOpen, setModalCriarPerfilOpen] = useState(false);

  const loadPerfis = useCallback(() => {
    fetch('/api/perfis')
      .then((res) => res.json())
      .then((data) => setPerfis(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    fetch('/api/grupos?pagina=1&itensPorPagina=1000')
      .then((res) => res.json())
      .then((data) => {
        const list = data?.items ?? (Array.isArray(data) ? data : []);
        setGrupos(list);
        if (list.length > 0 && !grupoId) setGrupoId(list[0].id);
      });
    loadPerfis();
  }, [loadPerfis]);

  useEffect(() => {
    if (perfilId) {
      const perfil = perfis.find((p) => p.id === perfilId);
      if (perfil) setPermissoes({ ...perfil.permissoes });
    } else {
      setPermissoes({});
    }
  }, [perfilId, perfis]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!nome.trim() || !email.trim() || !grupoId) {
      setError('Preencha nome, e-mail e grupo de cliente.');
      return;
    }
    if (!perfilId) {
      setError('Selecione um perfil de acesso.');
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
        grupoId,
        permissoes,
      }),
    })
      .then((res) => {
        if (!res.ok) return res.json().then((d) => Promise.reject(d));
        return res.json();
      })
      .then(() => router.push('/gestao-usuarios?aba=usuarios'))
      .catch((err) => {
        setError(err?.error || 'Erro ao salvar usuário.');
        setSubmitting(false);
      });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/gestao-usuarios?aba=usuarios"
          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          title="Voltar à lista de usuários"
          aria-label="Voltar à lista de usuários"
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
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Perfil de acesso</label>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={perfilId}
                  onChange={(e) => setPerfilId(e.target.value)}
                  className="input-field min-w-[200px] flex-1"
                  aria-label="Perfil de acesso"
                >
                  <option value="">Selecione um perfil</option>
                  {perfis.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setModalCriarPerfilOpen(true)}
                  className="btn-secondary inline-flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  Criar perfil
                </button>
              </div>
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

        {perfilId ? (
          <div className="card p-6">
            <p className="mb-4 text-sm text-slate-600">
              Módulos e funcionalidades do perfil selecionado. Você pode ajustar as permissões abaixo se necessário.
            </p>
            <MatrizPermissoes permissoes={permissoes} onChange={setPermissoes} />
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
            Selecione um perfil de acesso acima para definir os módulos que este usuário poderá acessar.
          </div>
        )}

        <ModalCriarPerfil
          open={modalCriarPerfilOpen}
          onClose={() => setModalCriarPerfilOpen(false)}
          onSalvo={(perfil) => {
            loadPerfis();
            setPerfilId(perfil.id);
            setModalCriarPerfilOpen(false);
          }}
        />

        <div className="flex gap-3">
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Salvando...' : 'Salvar usuário'}
          </button>
          <Link href="/gestao-usuarios?aba=usuarios" className="btn-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
