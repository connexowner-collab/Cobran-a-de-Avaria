import { NextRequest, NextResponse } from 'next/server';
import { getGrupoById, atualizarGrupo } from '@/lib/store';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const grupo = getGrupoById(id);
    if (!grupo) {
      return NextResponse.json({ error: 'Grupo não encontrado' }, { status: 404 });
    }
    return NextResponse.json(grupo);
  } catch (e) {
    return NextResponse.json(
      { error: 'Erro ao buscar grupo' },
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
    const { nome, responsavelId, contratoIds, ativo } = body;
    const grupo = atualizarGrupo(id, {
      ...(nome !== undefined && { nome: String(nome).trim() }),
      ...(responsavelId !== undefined && { responsavelId }),
      ...(Array.isArray(contratoIds) && { contratoIds }),
      ...(typeof ativo === 'boolean' && { ativo }),
    });
    if (!grupo) {
      return NextResponse.json({ error: 'Grupo não encontrado' }, { status: 404 });
    }
    return NextResponse.json(grupo);
  } catch (e) {
    return NextResponse.json(
      { error: 'Erro ao atualizar grupo' },
      { status: 500 }
    );
  }
}
