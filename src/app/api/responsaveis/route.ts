import { NextResponse } from 'next/server';
import { getResponsaveis } from '@/lib/store';

export async function GET() {
  try {
    const list = getResponsaveis();
    return NextResponse.json(list);
  } catch (e) {
    return NextResponse.json(
      { error: 'Erro ao listar responsáveis' },
      { status: 500 }
    );
  }
}
