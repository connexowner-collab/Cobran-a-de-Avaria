'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, KeyRound } from 'lucide-react';
import type { GrupoListItem, Perfil } from '@/types';
import type { PermissaoUsuario } from '@/types';
import { MatrizPermissoes } from '@/components/MatrizPermissoes';
import ModalCriarPerfil from '@/components/ModalCriarPerfil';

export default function EditarUsuarioPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [grupos, setGrupos] = useState<GrupoListItem[]>([]);
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [perfilId, setPerfilId] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [grupoId, setGrupoId] = useState('');
  const [permissoes, setPermissoes] = useState<PermissaoUsuario>({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [modalCriarPerfilOpen, setModalCriarPerfilOpen] = useState(false);
  const [resetSenhaLoading, setResetSenhaLoading] = useState(false);
  const [resetSenhaMessage, setResetSenhaMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadPerfis = useCallback(() => {
    fetch('/api/perfis')
      .then((res) => res.json())
      .then((data) => setPerfis(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch('/api/grupos?pagina=1&itensPorPagina=1000').then((r) => r.json()),
      fetch('/api/perfis').then((r) => r.json()),
      fetch(`/api/usuarios/${id}`).then((r) => (r.ok ? r.json() : null)),
    ]).then(([gruposData, perfisData, usuario]) => {
      const list = gruposData?.items ?? (Array.isArray(gruposData) ? gruposData : []);
      setGrupos(list);
      setPerfis(Array.isArray(perfisData) ? perfisData : []);
      if (usuario) {
        setNome(usuario.nome);
        setEmail(usuario.email);
        setAtivo(usuario.ativo);
        setGrupoId(usuario.grupoIds?.[0] ?? usuario.grupoId ?? '');
        setPermissoes(usuario.permissoes || {});
        setPerfilId(''); // perfil é apenas para pré-preencher; ao editar não vinculamos a um perfil específico
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (perfilId) {
      const perfil = perfis.find((p) => p.id === perfilId);
      if (perfil) setPermissoes({ ...perfil.permissoes });
    }
  }, [perfilId, perfis]);

  if (notFound) {
    return (
      <div className="space-y-4">
        <Link href="/gestao-usuarios?aba=usuarios" className="btn-secondary inline-flex gap-2">
          Voltar à lista
        </Link>
        <div className="card p-6">
          <p className="text-slate-600">Usuário não encontrado.</p>
          <p className="mt-2 text-sm text-slate-500">O usuário pode ter sido removido ou o link está incorreto.</p>
        </div>
      </div>
    );
  }

  const handleResetSenha = () => {
    setResetSenhaMessage(null);
    setResetSenhaLoading(true);
    fetch(`/api/usuarios/${id}/reset-senha`, { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          setResetSenhaMessage({ type: 'success', text: data.message ?? 'E-mail enviado com a nova senha.' });
        } else {
          setResetSenhaMessage({ type: 'error', text: data?.error ?? 'Erro ao enviar e-mail.' });
        }
      })
      .catch(() => setResetSenhaMessage({ type: 'error', text: 'Erro ao enviar e-mail de redefinição.' }))
      .finally(() => setResetSenhaLoading(false));
  };

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
      .then(() => router.push('/gestao-usuarios?aba=usuarios'))
      .catch((err) => {
        setError(err?.error || 'Erro ao atualizar usuário.');
        setSubmitting(false);
      });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12" role="status" aria-live="polite" aria-busy="true">
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
            <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4 sm:col-span-2">
              <button
                type="button"
                onClick={handleResetSenha}
                disabled={resetSenhaLoading}
                className="btn-secondary inline-flex items-center gap-2"
                title="Envia um e-mail para o usuário com uma nova senha de acesso"
                aria-label="Enviar e-mail com nova senha de acesso"
              >
                <KeyRound className="h-4 w-4" />
                {resetSenhaLoading ? 'Enviando...' : 'Reset de senha'}
              </button>
              {resetSenhaMessage && (
                <span
                  className={`text-sm ${resetSenhaMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}
                  role="status"
                >
                  {resetSenhaMessage.text}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="card p-6">
          <p className="mb-4 text-sm text-slate-600">
            {perfilId
              ? 'Módulos e funcionalidades do perfil selecionado. Ajuste se necessário.'
              : 'Módulos e funcionalidades deste usuário. Selecione um perfil para aplicar um conjunto de acessos ou edite manualmente.'}
          </p>
          <MatrizPermissoes permissoes={permissoes} onChange={setPermissoes} />
        </div>

        <ModalCriarPerfil
          open={modalCriarPerfilOpen}
          onClose={() => setModalCriarPerfilOpen(false)}
          onSalvo={(perfil) => {
            loadPerfis();
            setPerfilId(perfil.id);
            setPermissoes({ ...perfil.permissoes });
            setModalCriarPerfilOpen(false);
          }}
        />

        <div className="flex gap-3">
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Salvando...' : 'Salvar alterações'}
          </button>
          <Link href="/gestao-usuarios?aba=usuarios" className="btn-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
