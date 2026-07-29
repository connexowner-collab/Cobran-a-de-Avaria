import GuardaLiberacao from '@/components/portal/GuardaLiberacao';

/** Bloqueia o acesso à Administração de Acessos quando não liberada nesta fase. */
export default function GestaoUsuariosLayout({ children }: { children: React.ReactNode }) {
  return <GuardaLiberacao>{children}</GuardaLiberacao>;
}
