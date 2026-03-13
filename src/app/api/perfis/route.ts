import { NextRequest, NextResponse } from 'next/server';
import { getPerfis, criarPerfil, reloadStoreFromFile } from '@/lib/store';

export async function GET() {
  try {
    reloadStoreFromFile();
    const list = getPerfis();
    return NextResponse.json(list);
  } catch (e) {
    return NextResponse.json(
      { error: 'Erro ao listar perfis' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    reloadStoreFromFile();
    const body = await request.json();
    const { nome, permissoes = {} } = body;
    if (!nome || typeof nome !== 'string' || !nome.trim()) {
      return NextResponse.json(
        { error: 'Nome do perfil é obrigatório' },
        { status: 400 }
      );
    }
    const perfil = criarPerfil(nome.trim(), permissoes);
    return NextResponse.json(perfil, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: 'Erro ao criar perfil' },
      { status: 500 }
    );
  }
}
