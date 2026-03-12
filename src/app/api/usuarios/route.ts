import { NextRequest, NextResponse } from 'next/server';
import { getUsuarios, criarUsuario } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clienteId = searchParams.get('clienteId') ?? undefined;
    const grupoId = searchParams.get('grupoId') ?? undefined;
    const busca = searchParams.get('busca') ?? undefined;
    const ativoParam = searchParams.get('ativo');
    const ativo = ativoParam === 'true' ? true : ativoParam === 'false' ? false : undefined;

    const usuarios = getUsuarios({ clienteId, grupoId, busca, ativo });
    return NextResponse.json(usuarios);
  } catch (e) {
    return NextResponse.json(
      { error: 'Erro ao listar usuários' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, email, ativo = true, clienteId, grupoId, permissoes = {} } = body;
    if (!nome || !email) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: nome e email' },
        { status: 400 }
      );
    }
    if (!grupoId && !clienteId) {
      return NextResponse.json(
        { error: 'Informe grupo de cliente (grupoId) ou cliente (clienteId)' },
        { status: 400 }
      );
    }
    const usuario = criarUsuario({
      nome,
      email,
      ativo: Boolean(ativo),
      clienteId: clienteId || '',
      ...(grupoId && { grupoId }),
      permissoes: permissoes || {},
    });
    return NextResponse.json(usuario, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: 'Erro ao criar usuário' },
      { status: 500 }
    );
  }
}
