import { NextRequest, NextResponse } from 'next/server';
import { addSection } from '@/lib/reports';

type RouteParams = {
  params: Promise<{ reportId: string }>;
};

export async function POST(request: NextRequest, context: RouteParams) {
  try {
    const { reportId } = await context.params;
    const body = await request.json();

    const section = await addSection(reportId, body);
    return NextResponse.json(section, { status: 201 });
  } catch (error) {
    console.error('Error creating section:', error);
    return NextResponse.json(
      { error: 'Failed to create section' },
      { status: 500 }
    );
  }
}
