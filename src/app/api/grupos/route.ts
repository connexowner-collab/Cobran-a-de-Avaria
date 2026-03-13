import { NextRequest, NextResponse } from 'next/server';
import { getGruposList, criarGrupo, reloadStoreFromFile, grupoNomeEmUso } from '@/lib/store';

const DEFAULT_ITENS_POR_PAGINA = 25;

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pagina = Math.max(1, parseInt(searchParams.get('pagina') ?? '1', 10) || 1);
    const itensPorPagina = Math.min(100, Math.max(1, parseInt(searchParams.get('itensPorPagina') ?? String(DEFAULT_ITENS_POR_PAGINA), 10) || DEFAULT_ITENS_POR_PAGINA));

    const list = getGruposList();
    const totalItens = list.length;
    const totalPaginas = Math.max(1, Math.ceil(totalItens / itensPorPagina));
    const inicio = (pagina - 1) * itensPorPagina;
    const items = list.slice(inicio, inicio + itensPorPagina);

    return NextResponse.json({ items, totalItens, totalPaginas });
  } catch (e) {
    return NextResponse.json(
      { items: [], totalItens: 0, totalPaginas: 0, error: 'Erro ao listar grupos' },
      { status: 200 }
    );
  }
}

const MENSAGEM_NOME_DUPLICADO = 'Já existe um grupo com este nome. Escolha outro nome.';

export async function POST(request: NextRequest) {
  try {
    reloadStoreFromFile();
    const body = await request.json();
    const { nomeGrupo, responsavelId, contratoIds, divisoes } = body;
    if (!nomeGrupo || typeof nomeGrupo !== 'string' || !responsavelId || !Array.isArray(contratoIds)) {
      return NextResponse.json(
        { error: 'Dados inválidos: nomeGrupo, responsavelId e contratoIds são obrigatórios' },
        { status: 400 }
      );
    }
    const nomeTrim = String(nomeGrupo).trim();
    if (grupoNomeEmUso(nomeTrim)) {
      return NextResponse.json(
        { error: MENSAGEM_NOME_DUPLICADO },
        { status: 409 }
      );
    }
    const grupo = criarGrupo({
      nome: nomeTrim,
      responsavelId,
      contratoIds,
      ...(Array.isArray(divisoes) && { divisoes }),
    });
    return NextResponse.json(grupo, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: 'Erro ao criar grupo' },
      { status: 500 }
    );
  }
}
