import { NextResponse } from 'next/server';
import { getOrganization } from '@/lib/assoconnect';

export async function GET() {
  try {
    const org = await getOrganization();
    return NextResponse.json({
      ...org,
      id: org['@id'],
    });
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 }
    );
  }
}
