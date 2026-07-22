import { NextRequest, NextResponse } from 'next/server';
import { getUsuarioByCpf, setSenhaProvisoria, reloadStoreFromFile } from '@/lib/store';

export const dynamic = 'force-dynamic';

/**
 * GET ?documento=CPF — verifica se o CPF corresponde a um usuário e se está
 * com senha provisória (para o login decidir enviar à tela de nova senha).
 */
export async function GET(request: NextRequest) {
  try {
    reloadStoreFromFile();
    const documento = request.nextUrl.searchParams.get('documento') ?? '';
    const usuario = getUsuarioByCpf(documento);
    if (!usuario) return NextResponse.json({ encontrado: false, senhaProvisoria: false });
    return NextResponse.json({ encontrado: true, id: usuario.id, senhaProvisoria: !!usuario.senhaProvisoria });
  } catch {
    return NextResponse.json({ encontrado: false, senhaProvisoria: false });
  }
}

/** POST { id } — conclui a definição de nova senha (limpa o flag de provisória). */
export async function POST(request: NextRequest) {
  try {
    reloadStoreFromFile();
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 });
    const atualizado = setSenhaProvisoria(String(id), false);
    if (!atualizado) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erro ao concluir' }, { status: 500 });
  }
}
