import { NextResponse } from 'next/server';
import { getClientes } from '@/lib/store';

export async function GET() {
  try {
    const clientes = getClientes();
    return NextResponse.json(clientes);
  } catch (e) {
    return NextResponse.json(
      { error: 'Erro ao listar clientes' },
      { status: 500 }
    );
  }
}
