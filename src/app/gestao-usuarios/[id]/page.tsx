'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, KeyRound } from 'lucide-react';
import type { Grupo, Perfil } from '@/types';
import type { PermissaoUsuario } from '@/types';
import { MatrizPermissoes } from '@/components/MatrizPermissoes';
import ModalCriarPerfil from '@/components/ModalCriarPerfil';
import DropdownGruposMultiplo from '@/components/DropdownGruposMultiplo';

export default function EditarUsuarioPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [perfilId, setPerfilId] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [grupoIds, setGrupoIds] = useState<string[]>([]);
  const [divisaoIds, setDivisaoIds] = useState<string[]>([]);
  const [permissoes, setPermissoes] = useState<PermissaoUsuario>({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [modalCriarPerfilOpen, setModalCriarPerfilOpen] = useState(false);
  const [resetSenhaLoading, setResetSenhaLoading] = useState(false);
  const [resetSenhaMessage, setResetSenhaMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const skipNextPerfilApply = useRef(false);

  const loadPerfis = useCallback(() => {
    fetch('/api/perfis')
      .then((res) => res.json())
      .then((data) => setPerfis(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch('/api/grupos?comDivisoes=1').then((r) => r.json()),
      fetch('/api/perfis').then((r) => r.json()),
      fetch(`/api/usuarios/${id}`).then((r) => (r.ok ? r.json() : null)),
    ]).then(([gruposData, perfisData, usuario]) => {
      const list = Array.isArray(gruposData) ? gruposData : [];
      setGrupos(list);
      setPerfis(Array.isArray(perfisData) ? perfisData : []);
      if (usuario) {
        setNome(usuario.nome);
        setEmail(usuario.email);
        setAtivo(usuario.ativo);
        setGrupoIds(usuario.grupoIds ?? (usuario.grupoId ? [usuario.grupoId] : []));
        setDivisaoIds(usuario.divisaoIds ?? []);
        setPermissoes(usuario.permissoes && typeof usuario.permissoes === 'object' ? { ...usuario.permissoes } : {});
        skipNextPerfilApply.current = true;
        setPerfilId(usuario.perfilId ?? '');
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (skipNextPerfilApply.current) {
      skipNextPerfilApply.current = false;
      return;
    }
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

  const addGrupo = (grupoId: string) => {
    if (!grupoId || grupoIds.includes(grupoId)) return;
    setGrupoIds((prev) => [...prev, grupoId]);
  };

  const removeGrupo = (grupoId: string) => {
    setGrupoIds((prev) => prev.filter((g) => g !== grupoId));
  };

  const addDivisao = (divId: string) => {
    if (!divId || divisaoIds.includes(divId)) return;
    setDivisaoIds((prev) => [...prev, divId]);
  };

  const removeDivisao = (divId: string) => {
    setDivisaoIds((prev) => prev.filter((d) => d !== divId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!nome.trim() || !email.trim()) {
      setError('Preencha nome e e-mail.');
      return;
    }
    if (grupoIds.length === 0 && divisaoIds.length === 0) {
      setError('Adicione ao menos um grupo ou divisão de cliente.');
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
        grupoIds,
        divisaoIds,
        perfilId: perfilId || undefined,
        permissoes: permissoes && typeof permissoes === 'object' ? permissoes : {},
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
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 md:max-w-4xl md:px-8 lg:max-w-5xl lg:px-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          title="Voltar ao menu inicial"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Editar usuário</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2 lg:items-start lg:gap-8">
          <div className="card space-y-4 p-4 sm:p-6 lg:p-6">
            <h2 className="text-lg font-semibold text-slate-900">Dados do usuário</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
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
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">Grupo de cliente *</label>
                <DropdownGruposMultiplo
                  grupos={grupos}
                  grupoIds={grupoIds}
                  divisaoIds={divisaoIds}
                  onAddGrupo={addGrupo}
                  onRemoveGrupo={removeGrupo}
                  onAddDivisao={addDivisao}
                  onRemoveDivisao={removeDivisao}
                  ariaLabel="Adicionar grupo ou divisão de cliente"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">Perfil de acesso</label>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={perfilId}
                    onChange={(e) => setPerfilId(e.target.value)}
                    className="input-field min-w-0 flex-1 sm:min-w-[200px]"
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
                    className="btn-secondary inline-flex shrink-0 items-center gap-1.5"
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

          <div className="lg:min-h-[280px]">
            <div className="card p-4 sm:p-6 lg:p-6 lg:sticky lg:top-4">
              <p className="mb-4 text-sm text-slate-600">
                {perfilId
                  ? 'Módulos e funcionalidades do perfil selecionado. Ajuste se necessário.'
                  : 'Módulos e funcionalidades deste usuário. Selecione um perfil para aplicar um conjunto de acessos ou edite manualmente.'}
              </p>
              <MatrizPermissoes permissoes={permissoes} onChange={setPermissoes} readOnly />
            </div>
          </div>
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

        <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-4">
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
