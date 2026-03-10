import { NextResponse } from 'next/server';
import { MODULOS_PORTAL } from '@/types';

export async function GET() {
  return NextResponse.json(MODULOS_PORTAL);
}
