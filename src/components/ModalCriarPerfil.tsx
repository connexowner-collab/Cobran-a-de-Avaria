'use client';

import { useState, useEffect } from 'react';
import type { Perfil, PermissaoUsuario } from '@/types';
import { MatrizPermissoes } from '@/components/MatrizPermissoes';

interface ModalCriarPerfilProps {
  open: boolean;
  onClose: () => void;
  /** Chamado após criar o perfil (para o pai atualizar lista e selecionar o novo). */
  onSalvo?: (perfil: Perfil) => void;
}

export default function ModalCriarPerfil({ open, onClose, onSalvo }: ModalCriarPerfilProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [nome, setNome] = useState('');
  const [permissoes, setPermissoes] = useState<PermissaoUsuario>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setStep(1);
      setNome('');
      setPermissoes({});
      setError('');
    }
  }, [open]);

  const handleContinuar = () => {
    setError('');
    if (!nome.trim()) {
      setError('Informe o nome do perfil.');
      return;
    }
    setStep(2);
  };

  const handleSalvar = async () => {
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/perfis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nome.trim(), permissoes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Erro ao criar perfil.');
        setSubmitting(false);
        return;
      }
      onSalvo?.(data);
      onClose();
    } catch {
      setError('Erro ao criar perfil.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setNome('');
    setPermissoes({});
    setError('');
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-criar-perfil-titulo">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} aria-hidden />
      <div className="relative z-10 w-full max-w-lg rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 id="modal-criar-perfil-titulo" className="text-lg font-semibold text-slate-900">
            {step === 1 ? 'Novo perfil de acesso' : 'Acessos do perfil'}
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Fechar modal"
          >
            <span aria-hidden>✕</span>
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {step === 1 ? (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Nome do perfil *</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="input-field w-full"
                placeholder="Ex: Operador, Visualizador"
                autoFocus
              />
            </div>
          ) : (
            <div>
              <p className="mb-3 text-sm text-slate-600">
                Perfil: <strong>{nome}</strong>. Marque os módulos e funcionalidades que este perfil terá.
              </p>
              <MatrizPermissoes permissoes={permissoes} onChange={setPermissoes} />
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
          {step === 1 ? (
            <>
              <button type="button" onClick={handleClose} className="btn-secondary">
                Cancelar
              </button>
              <button type="button" onClick={handleContinuar} className="btn-primary">
                Continuar
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => setStep(1)} className="btn-secondary">
                Voltar
              </button>
              <button
                type="button"
                onClick={handleSalvar}
                disabled={submitting}
                className="btn-primary"
              >
                {submitting ? 'Salvando...' : 'Salvar perfil'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
