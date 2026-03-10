'use client';

export function Header() {
  return (
    <header
      className="sticky top-0 z-20 flex h-[var(--header-height)] items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm"
      role="banner"
    >
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-slate-800">
          Operações
        </h1>
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-500">
        Gestão de clientes/Externo - Portal do Cliente
      </div>
    </header>
  );
}
