import { NextRequest, NextResponse } from 'next/server';
import {
  getSolicitacoes,
  getSolicitacoesByCpf,
  criarSolicitacao,
  motivoBloqueioSolicitacao,
  reloadStoreFromFile,
} from '@/lib/store';

export const dynamic = 'force-dynamic';

/**
 * GET /api/solicitacoes-acesso
 *   - sem parâmetros: lista todas as solicitações (uso interno).
 *   - ?cpf=... : lista apenas as solicitações do CPF (acompanhamento público).
 */
export async function GET(request: NextRequest) {
  try {
    reloadStoreFromFile();
    const cpf = request.nextUrl.searchParams.get('cpf');
    if (cpf !== null) {
      return NextResponse.json({ items: getSolicitacoesByCpf(cpf) });
    }
    return NextResponse.json({ items: getSolicitacoes() });
  } catch {
    return NextResponse.json({ items: [], error: 'Erro ao listar solicitações' }, { status: 200 });
  }
}

/** POST /api/solicitacoes-acesso — cria uma solicitação de acesso (formulário público). */
export async function POST(request: NextRequest) {
  try {
    reloadStoreFromFile();
    const body = await request.json();
    const {
      nomeEmpresa,
      cnpj,
      nomeCompleto,
      cpf,
      dataNascimento,
      emailCorporativo,
      telefoneComercial,
      telefoneCelular,
    } = body ?? {};

    const obrigatorios: Record<string, unknown> = {
      nomeEmpresa,
      cnpj,
      nomeCompleto,
      cpf,
      dataNascimento,
      emailCorporativo,
      telefoneComercial,
    };
    const faltando = Object.entries(obrigatorios)
      .filter(([, v]) => !v || String(v).trim() === '')
      .map(([k]) => k);
    if (faltando.length > 0) {
      return NextResponse.json(
        { error: 'Preencha todos os campos obrigatórios.', campos: faltando },
        { status: 400 }
      );
    }

    const cpfDig = String(cpf).replace(/\D/g, '');
    if (cpfDig.length !== 11) {
      return NextResponse.json({ error: 'CPF inválido.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(emailCorporativo).trim())) {
      return NextResponse.json({ error: 'E-mail corporativo inválido.' }, { status: 400 });
    }

    const motivo = motivoBloqueioSolicitacao(String(cpf), String(emailCorporativo));
    if (motivo === 'cpf') {
      return NextResponse.json(
        { error: 'Já existe uma solicitação ou acesso para este CPF.' },
        { status: 409 }
      );
    }
    if (motivo === 'email') {
      return NextResponse.json(
        { error: 'Já existe uma solicitação ou acesso para este e-mail.' },
        { status: 409 }
      );
    }

    const solicitacao = criarSolicitacao({
      nomeEmpresa: String(nomeEmpresa),
      cnpj: String(cnpj),
      nomeCompleto: String(nomeCompleto),
      cpf: String(cpf),
      dataNascimento: String(dataNascimento),
      emailCorporativo: String(emailCorporativo),
      telefoneComercial: String(telefoneComercial),
      telefoneCelular: telefoneCelular ? String(telefoneCelular) : undefined,
    });
    return NextResponse.json(solicitacao, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erro ao criar solicitação';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
