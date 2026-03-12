import { NextRequest, NextResponse } from 'next/server';
import { searchClienteContratoByCnpj } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const cnpj = request.nextUrl.searchParams.get('cnpj') ?? '';
    const options = searchClienteContratoByCnpj(cnpj);
    return NextResponse.json(options);
  } catch (e) {
    return NextResponse.json(
      { error: 'Erro ao buscar cliente/contrato' },
      { status: 500 }
    );
  }
}
