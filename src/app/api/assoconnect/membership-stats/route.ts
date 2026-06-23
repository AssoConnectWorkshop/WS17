import { NextRequest, NextResponse } from 'next/server';
import { getMembershipStats } from '@/lib/assoconnect';

export async function GET(request: NextRequest) {
  try {
    const periodFrom = request.nextUrl.searchParams.get('periodFrom') || undefined;
    const periodTo = request.nextUrl.searchParams.get('periodTo') || undefined;

    const stats = await getMembershipStats(undefined, periodFrom, periodTo);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching membership stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch membership stats' },
      { status: 500 }
    );
  }
}
