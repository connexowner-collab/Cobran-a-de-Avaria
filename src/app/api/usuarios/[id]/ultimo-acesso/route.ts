import { NextRequest, NextResponse } from 'next/server';
import { reloadStoreFromFile, registrarUltimoAcesso } from '@/lib/store';

/**
 * Registra o último acesso do usuário no portal (chamado pelo PDV).
 * PATCH /api/usuarios/[id]/ultimo-acesso
 */
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const usuarioId = typeof id === 'string' ? decodeURIComponent(id).trim() : '';
    if (!usuarioId || usuarioId === 'undefined' || usuarioId === 'null') {
      return NextResponse.json(
        { error: 'ID do usuário inválido.' },
        { status: 400 }
      );
    }
    reloadStoreFromFile();
    const ok = registrarUltimoAcesso(usuarioId);
    if (!ok) {
      return NextResponse.json(
        { error: 'Usuário não encontrado.' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: 'Erro ao registrar último acesso.' },
      { status: 500 }
    );
  }
}
