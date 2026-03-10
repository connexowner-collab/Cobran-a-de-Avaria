import type { Metadata } from 'next';
import './globals.css';
import { PdvShell } from '@/components/PdvShell';

export const metadata: Metadata = {
  title: 'Portal do Cliente - Gestão de clientes/Externo',
  description: 'Gestão de usuários e permissões por cliente',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-50 antialiased">
        <PdvShell>{children}</PdvShell>
      </body>
    </html>
  );
}
