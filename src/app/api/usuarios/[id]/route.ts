import { NextRequest, NextResponse } from 'next/server';
import { getUsuarioById, atualizarUsuario, excluirUsuario, getUsuarios, reloadStoreFromFile } from '@/lib/store';

function emailJaCadastrado(email: string, excluirUsuarioId: string): boolean {
  const normalizado = email.trim().toLowerCase();
  const todos = getUsuarios();
  return todos.some(
    (u) => u.email.toLowerCase() === normalizado && u.id !== excluirUsuarioId
  );
}

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    reloadStoreFromFile();
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
    reloadStoreFromFile();
    const { id } = await params;
    const body = await request.json();
    const { nome, email, ativo, clienteId, grupoId, grupoIds, divisaoIds, perfilId, permissoes } = body;
    if (email !== undefined && email !== null && String(email).trim()) {
      if (emailJaCadastrado(String(email), id)) {
        return NextResponse.json(
          { error: 'Já existe um usuário cadastrado com este e-mail.' },
          { status: 409 }
        );
      }
    }
    const update: { nome?: string; email?: string; ativo?: boolean; clienteId?: string; grupoId?: string; grupoIds?: string[]; divisaoIds?: string[]; perfilId?: string; permissoes?: Record<string, boolean> } = {
      ...(nome !== undefined && { nome }),
      ...(email !== undefined && { email }),
      ...(ativo !== undefined && { ativo: Boolean(ativo) }),
      ...(clienteId !== undefined && { clienteId }),
      ...(permissoes !== undefined && { permissoes }),
      ...(perfilId !== undefined && { perfilId: perfilId ? String(perfilId) : undefined }),
    };
    if (grupoIds !== undefined) {
      update.grupoIds = Array.isArray(grupoIds) ? grupoIds : [];
    } else if (grupoId !== undefined) {
      update.grupoId = grupoId;
    }
    if (divisaoIds !== undefined) {
      update.divisaoIds = Array.isArray(divisaoIds) ? divisaoIds : [];
    }
    const usuario = atualizarUsuario(id, update);
    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }
    return NextResponse.json(usuario);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erro ao atualizar usuário';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rawId = (await params).id;
    const id = typeof rawId === 'string' ? decodeURIComponent(rawId).trim() : '';
    if (!id || id === 'undefined' || id === 'null') {
      return NextResponse.json(
        { error: 'ID do usuário inválido.' },
        { status: 400 }
      );
    }
    // Garante que o store está em sync com o arquivo (evita 404 quando a listagem veio de outro contexto)
    reloadStoreFromFile();
    const ok = excluirUsuario(id);
    if (!ok) {
      return NextResponse.json(
        { error: 'Usuário não encontrado. O registro pode já ter sido excluído ou o ID é inválido.' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: 'Erro ao excluir usuário' },
      { status: 500 }
    );
  }
}
