import { NextResponse } from 'next/server';
import { SEED_RECORDS } from '@/lib/data/seed-data';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: SEED_RECORDS,
    count: SEED_RECORDS.length,
  });
}
