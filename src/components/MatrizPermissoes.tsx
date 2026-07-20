'use client';

import { useRef, useEffect } from 'react';
import type { Modulo, PermissaoUsuario } from '@/types';
import { MODULOS_PORTAL } from '@/types';

interface MatrizPermissoesProps {
  permissoes: PermissaoUsuario;
  onChange: (permissoes: PermissaoUsuario) => void;
  modulos?: Modulo[];
  /** Quando true, desabilita edição (somente leitura). Use false na tela Criar perfil. */
  readOnly?: boolean;
}

export function MatrizPermissoes({
  permissoes,
  onChange,
  modulos = MODULOS_PORTAL,
  readOnly = false,
}: MatrizPermissoesProps) {
  const toggle = (funcId: string, value: boolean) => {
    if (readOnly) return;
    onChange({ ...permissoes, [funcId]: value });
  };

  const toggleModulo = (modulo: Modulo, value: boolean) => {
    if (readOnly) return;
    const next = { ...permissoes };
    modulo.funcionalidades.forEach((f) => {
      next[f.id] = value;
    });
    onChange(next);
  };

  const isModuloAllChecked = (modulo: Modulo) =>
    modulo.funcionalidades.every((f) => permissoes[f.id]);
  const isModuloSomeChecked = (modulo: Modulo) =>
    modulo.funcionalidades.some((f) => permissoes[f.id]);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-800">Módulos e funcionalidades</h3>
      <p className="text-sm text-slate-600">
        {readOnly
          ? 'As permissões são definidas pelo perfil selecionado. Para alterar módulos e funcionalidades, use "Criar perfil".'
          : 'Marque os módulos e funcionalidades que este usuário poderá acessar no portal.'}
      </p>
      <div className={`divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white ${readOnly ? 'pointer-events-none select-none opacity-90' : ''}`}>
        {modulos.map((modulo) => (
          <ModuloRow
            key={modulo.id}
            modulo={modulo}
            permissoes={permissoes}
            onToggleFunc={toggle}
            onToggleModulo={toggleModulo}
            isModuloAllChecked={isModuloAllChecked(modulo)}
            isModuloSomeChecked={isModuloSomeChecked(modulo)}
            readOnly={readOnly}
          />
        ))}
      </div>
    </div>
  );
}

function ModuloRow({
  modulo,
  permissoes,
  onToggleFunc,
  onToggleModulo,
  isModuloAllChecked,
  isModuloSomeChecked,
  readOnly = false,
}: {
  modulo: Modulo;
  permissoes: PermissaoUsuario;
  onToggleFunc: (id: string, value: boolean) => void;
  onToggleModulo: (modulo: Modulo, value: boolean) => void;
  isModuloAllChecked: boolean;
  isModuloSomeChecked: boolean;
  readOnly?: boolean;
}) {
  const checkRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const el = checkRef.current;
    if (el) el.indeterminate = isModuloSomeChecked && !isModuloAllChecked;
  }, [isModuloAllChecked, isModuloSomeChecked]);

  return (
    <div className="p-4 first:rounded-t-lg last:rounded-b-lg">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h4 className="font-medium text-slate-900">{modulo.nome}</h4>
          <p className="text-xs text-slate-500">{modulo.descricao}</p>
        </div>
        <label className={`flex shrink-0 items-center gap-2 ${readOnly ? 'cursor-default' : ''}`}>
          <input
            ref={checkRef}
            type="checkbox"
            checked={isModuloAllChecked}
            onChange={(e) => onToggleModulo(modulo, e.target.checked)}
            disabled={readOnly}
            className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-70"
          />
          <span className="text-sm text-slate-600">Todos</span>
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 pl-0 sm:pl-4">
        {modulo.funcionalidades.map((f) => (
          <label
            key={f.id}
            className={`flex items-center gap-2 rounded px-2 py-1 ${readOnly ? 'cursor-default' : 'cursor-pointer hover:bg-slate-50'}`}
          >
            <input
              type="checkbox"
              checked={Boolean(permissoes[f.id])}
              onChange={(e) => onToggleFunc(f.id, e.target.checked)}
              disabled={readOnly}
              className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-70"
            />
            <span className="text-sm text-slate-700">{f.nome}</span>
            {f.descricao && (
              <span className="text-xs text-slate-400">({f.descricao})</span>
            )}
          </label>
        ))}
      </div>
    </div>
  );
}
