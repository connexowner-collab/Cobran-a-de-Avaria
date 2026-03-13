import { NextResponse } from 'next/server';
import { getClientes } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const clientes = getClientes();
    return NextResponse.json(clientes);
  } catch (e) {
    return NextResponse.json([]);
  }
}
