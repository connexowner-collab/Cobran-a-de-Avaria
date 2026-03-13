import { NextRequest, NextResponse } from 'next/server';
import { getGrupoById, atualizarGrupo, reloadStoreFromFile, grupoNomeEmUso } from '@/lib/store';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    reloadStoreFromFile();
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
    const { nome, responsavelId, contratoIds, ativo, divisoes } = body;
    if (nome !== undefined) {
      const nomeTrim = String(nome).trim();
      if (grupoNomeEmUso(nomeTrim, id)) {
        return NextResponse.json(
          { error: 'Já existe um grupo com este nome. Escolha outro nome.' },
          { status: 409 }
        );
      }
    }
    const grupo = atualizarGrupo(id, {
      ...(nome !== undefined && { nome: String(nome).trim() }),
      ...(responsavelId !== undefined && { responsavelId }),
      ...(Array.isArray(contratoIds) && { contratoIds }),
      ...(typeof ativo === 'boolean' && { ativo }),
      ...(Array.isArray(divisoes) && { divisoes }),
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
