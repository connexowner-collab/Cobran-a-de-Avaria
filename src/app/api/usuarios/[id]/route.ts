import { NextRequest, NextResponse } from 'next/server';
import { getUsuarioById, atualizarUsuario, excluirUsuario } from '@/lib/store';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const usuario = getUsuarioById(id);
    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }
    return NextResponse.json(usuario);
  } catch (e) {
    return NextResponse.json(
      { error: 'Erro ao buscar usuário' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nome, email, ativo, clienteId, grupoId, permissoes } = body;
    const usuario = atualizarUsuario(id, {
      ...(nome !== undefined && { nome }),
      ...(email !== undefined && { email }),
      ...(ativo !== undefined && { ativo: Boolean(ativo) }),
      ...(clienteId !== undefined && { clienteId }),
      ...(grupoId !== undefined && { grupoId }),
      ...(permissoes !== undefined && { permissoes }),
    });
    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }
    return NextResponse.json(usuario);
  } catch (e) {
    return NextResponse.json(
      { error: 'Erro ao atualizar usuário' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ok = excluirUsuario(id);
    if (!ok) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: 'Erro ao excluir usuário' },
      { status: 500 }
    );
  }
}
