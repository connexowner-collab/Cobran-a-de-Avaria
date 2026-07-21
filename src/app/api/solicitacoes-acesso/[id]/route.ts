import { NextRequest, NextResponse } from 'next/server';
import { atualizarStatusSolicitacao, getSolicitacaoById, reloadStoreFromFile } from '@/lib/store';
import type { StatusSolicitacaoAcesso } from '@/types';

export const dynamic = 'force-dynamic';

const STATUS_VALIDOS: StatusSolicitacaoAcesso[] = ['pendente', 'em_atendimento', 'concluido'];

/** PATCH /api/solicitacoes-acesso/[id] — movimenta o status do chamado. */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    reloadStoreFromFile();
    const { id } = params;
    if (!getSolicitacaoById(id)) {
      return NextResponse.json({ error: 'Solicitação não encontrada.' }, { status: 404 });
    }
    const body = await request.json();
    const status = body?.status as StatusSolicitacaoAcesso;
    if (!STATUS_VALIDOS.includes(status)) {
      return NextResponse.json({ error: 'Status inválido.' }, { status: 400 });
    }
    const atualizada = atualizarStatusSolicitacao(id, status);
    return NextResponse.json(atualizada);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erro ao atualizar solicitação';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
