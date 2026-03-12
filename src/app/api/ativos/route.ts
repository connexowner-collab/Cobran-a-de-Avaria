import { NextRequest, NextResponse } from 'next/server';
import { getAtivosByContratoIds } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const idsParam = request.nextUrl.searchParams.get('contratoIds') ?? '';
    const contratoIds = idsParam ? idsParam.split(',').map((s) => s.trim()).filter(Boolean) : [];
    const ativos = getAtivosByContratoIds(contratoIds);
    return NextResponse.json(ativos);
  } catch (e) {
    return NextResponse.json(
      { error: 'Erro ao listar ativos' },
      { status: 500 }
    );
  }
}
