import { NextRequest, NextResponse } from 'next/server';
import { getGruposList, criarGrupo } from '@/lib/store';

export async function GET() {
  try {
    const list = getGruposList();
    return NextResponse.json(list);
  } catch (e) {
    return NextResponse.json(
      { error: 'Erro ao listar grupos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nomeGrupo, responsavelId, contratoIds } = body;
    if (!nomeGrupo || typeof nomeGrupo !== 'string' || !responsavelId || !Array.isArray(contratoIds)) {
      return NextResponse.json(
        { error: 'Dados inválidos: nomeGrupo, responsavelId e contratoIds são obrigatórios' },
        { status: 400 }
      );
    }
    const grupo = criarGrupo({
      nome: nomeGrupo.trim(),
      responsavelId,
      contratoIds,
    });
    return NextResponse.json(grupo, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: 'Erro ao criar grupo' },
      { status: 500 }
    );
  }
}
