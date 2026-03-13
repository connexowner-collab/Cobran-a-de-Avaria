import { NextResponse } from 'next/server';
import { getUsuarios, getGruposList } from '@/lib/store';

/** Verifica se o backend está ativo e o store responde. */
export async function GET() {
  try {
    const qtdUsuarios = getUsuarios().length;
    const qtdGrupos = getGruposList().length;
    return NextResponse.json({
      ok: true,
      store: 'conectado',
      usuarios: qtdUsuarios,
      grupos: qtdGrupos,
    });
  } catch {
    return NextResponse.json({ ok: false, store: 'erro' }, { status: 500 });
  }
}
