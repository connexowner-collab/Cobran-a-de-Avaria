'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import type { Grupo, Perfil } from '@/types';
import type { PermissaoUsuario } from '@/types';
import { MatrizPermissoes } from '@/components/MatrizPermissoes';
import ModalCriarPerfil from '@/components/ModalCriarPerfil';
import DropdownGruposMultiplo from '@/components/DropdownGruposMultiplo';

/** Aplica máscara de CPF (000.000.000-00) sobre os dígitos digitados. */
function mascararCpf(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
}

function NovoUsuarioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [perfilId, setPerfilId] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [solicitacaoId, setSolicitacaoId] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [grupoIds, setGrupoIds] = useState<string[]>([]);
  const [permissoes, setPermissoes] = useState<PermissaoUsuario>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [modalCriarPerfilOpen, setModalCriarPerfilOpen] = useState(false);

  const loadPerfis = useCallback(() => {
    fetch('/api/perfis')
      .then((res) => res.json())
      .then((data) => setPerfis(Array.isArray(data) ? data : []));
  }, []);

  const [divisaoIds, setDivisaoIds] = useState<string[]>([]);

  // Prefill quando vem de uma solicitação de acesso (aba Solicitação de Acessos).
  useEffect(() => {
    const nomeQ = searchParams.get('nome');
    const emailQ = searchParams.get('email');
    const cpfQ = searchParams.get('cpf');
    const solQ = searchParams.get('solicitacaoId');
    if (nomeQ) setNome(nomeQ);
    if (emailQ) setEmail(emailQ);
    if (cpfQ) setCpf(mascararCpf(cpfQ));
    if (solQ) setSolicitacaoId(solQ);
  }, [searchParams]);

  useEffect(() => {
    fetch('/api/grupos?comDivisoes=1')
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setGrupos(list);
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

  const addGrupo = (id: string) => {
    if (!id || grupoIds.includes(id)) return;
    setGrupoIds((prev) => [...prev, id]);
  };

  const removeGrupo = (id: string) => {
    setGrupoIds((prev) => prev.filter((g) => g !== id));
  };

  const addDivisao = (id: string) => {
    if (!id || divisaoIds.includes(id)) return;
    setDivisaoIds((prev) => [...prev, id]);
  };

  const removeDivisao = (id: string) => {
    setDivisaoIds((prev) => prev.filter((d) => d !== id));
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
        ...(cpf.trim() && { cpf: cpf.trim() }),
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
        setError(err?.error || 'Erro ao salvar usuário.');
        setSubmitting(false);
      });
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 md:max-w-4xl md:px-8 lg:max-w-5xl lg:px-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/gestao-usuarios?aba=usuarios"
          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          title="Voltar à lista de usuários"
          aria-label="Voltar à lista de usuários"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Novo usuário</h1>
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
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  CPF {solicitacaoId && <span className="text-xs font-normal text-slate-400">(da solicitação {solicitacaoId})</span>}
                </label>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(mascararCpf(e.target.value))}
                  className="input-field"
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Informe o CPF para concluir automaticamente a solicitação de acesso correspondente.
                </p>
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
            </div>
          </div>

          <div className="lg:min-h-[280px]">
            {perfilId ? (
              <div className="card p-4 sm:p-6 lg:p-6 lg:sticky lg:top-4">
                <p className="mb-4 text-sm text-slate-600">
                  Módulos e funcionalidades do perfil selecionado. Ajuste se necessário.
                </p>
                <MatrizPermissoes permissoes={permissoes} onChange={setPermissoes} readOnly />
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500 lg:min-h-[200px] lg:flex lg:items-center lg:justify-center">
                Selecione um perfil de acesso à esquerda para definir os módulos que este usuário poderá acessar.
              </div>
            )}
          </div>
        </div>

        <ModalCriarPerfil
          open={modalCriarPerfilOpen}
          onClose={() => setModalCriarPerfilOpen(false)}
          onSalvo={(perfil) => {
            loadPerfis();
            setPerfilId(perfil.id);
            setModalCriarPerfilOpen(false);
          }}
        />

        <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-4">
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

export default function NovoUsuarioPage() {
  return (
    <Suspense>
      <NovoUsuarioContent />
    </Suspense>
  );
}
