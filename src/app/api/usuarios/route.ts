import { NextRequest, NextResponse } from 'next/server';
import { getUsuarios, criarUsuario } from '@/lib/store';

const DEFAULT_ITENS_POR_PAGINA = 25;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clienteId = searchParams.get('clienteId') ?? undefined;
    const grupoId = searchParams.get('grupoId') ?? undefined;
    const busca = searchParams.get('busca') ?? undefined;
    const ativoParam = searchParams.get('ativo');
    const ativo = ativoParam === 'true' ? true : ativoParam === 'false' ? false : undefined;
    const pagina = Math.max(1, parseInt(searchParams.get('pagina') ?? '1', 10) || 1);
    const itensPorPagina = Math.min(100, Math.max(1, parseInt(searchParams.get('itensPorPagina') ?? String(DEFAULT_ITENS_POR_PAGINA), 10) || DEFAULT_ITENS_POR_PAGINA));

    const todos = getUsuarios({ clienteId, grupoId, busca, ativo });
    const totalItens = todos.length;
    const totalPaginas = Math.max(1, Math.ceil(totalItens / itensPorPagina));
    const inicio = (pagina - 1) * itensPorPagina;
    const items = todos.slice(inicio, inicio + itensPorPagina);

    return NextResponse.json({ items, totalItens, totalPaginas });
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
