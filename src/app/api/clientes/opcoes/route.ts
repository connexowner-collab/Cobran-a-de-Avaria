import { NextResponse } from 'next/server';
import { getAllClienteContratoOptions } from '@/lib/store';

/** Retorna todas as opções cliente+contrato (CNPJ disponíveis) para o dropdown. */
export async function GET() {
  try {
    const options = getAllClienteContratoOptions();
    return NextResponse.json(options);
  } catch (e) {
    return NextResponse.json(
      { error: 'Erro ao listar opções de cliente' },
      { status: 500 }
    );
  }
}
