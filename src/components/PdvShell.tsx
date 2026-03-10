'use client';

import { usePathname } from 'next/navigation';
import { PdvTopBar } from './PdvTopBar';
import { PdvSubHeader } from './PdvSubHeader';

export function PdvShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  if (isHome) {
    return <>{children}</>;
  }

  return (
    <div className="pdv-inner min-h-screen bg-[#E0E0E0]">
      <PdvTopBar />
      <PdvSubHeader />
      <main className="pdv-main">
        <div className="pdv-inner-body">{children}</div>
      </main>
    </div>
  );
}
