import { NextRequest, NextResponse } from 'next/server';
import { getUsuarios, criarUsuario, reloadStoreFromFile } from '@/lib/store';

function emailJaCadastrado(email: string, excluirUsuarioId?: string): boolean {
  const normalizado = email.trim().toLowerCase();
  const todos = getUsuarios();
  return todos.some(
    (u) => u.email.toLowerCase() === normalizado && u.id !== excluirUsuarioId
  );
}

const DEFAULT_ITENS_POR_PAGINA = 25;

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    reloadStoreFromFile();
    const searchParams = request.nextUrl.searchParams;
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
      { items: [], totalItens: 0, totalPaginas: 0, error: 'Erro ao listar usuários' },
      { status: 200 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    reloadStoreFromFile();
    const body = await request.json();
    const { nome, email, ativo = true, clienteId, grupoId, grupoIds, divisaoIds, perfilId, permissoes = {} } = body;
    if (!nome || !email) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: nome e email' },
        { status: 400 }
      );
    }
    const ids = Array.isArray(grupoIds) && grupoIds.length > 0 ? grupoIds : grupoId ? [grupoId] : [];
    const divIds = Array.isArray(divisaoIds) ? divisaoIds : [];
    if (ids.length === 0 && divIds.length === 0 && !clienteId) {
      return NextResponse.json(
        { error: 'Informe ao menos um grupo de cliente (grupoIds ou grupoId), divisão (divisaoIds) ou cliente (clienteId)' },
        { status: 400 }
      );
    }
    const emailNorm = (email as string).trim().toLowerCase();
    if (emailJaCadastrado(emailNorm)) {
      return NextResponse.json(
        { error: 'Já existe um usuário cadastrado com este e-mail.' },
        { status: 409 }
      );
    }
    const usuario = criarUsuario({
      nome,
      email: emailNorm,
      ativo: Boolean(ativo),
      clienteId: clienteId || '',
      ...(ids.length > 0 && { grupoIds: ids }),
      ...(divIds.length > 0 && { divisaoIds: divIds }),
      ...(perfilId && { perfilId: String(perfilId) }),
      permissoes: permissoes && typeof permissoes === 'object' ? permissoes : {},
    });
    return NextResponse.json(usuario, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erro ao criar usuário';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
