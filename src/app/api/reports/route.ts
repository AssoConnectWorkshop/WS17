import { NextRequest, NextResponse } from 'next/server';
import { getReports, createReport } from '@/lib/reports';

export async function GET(request: NextRequest) {
  try {
    const organizationId = request.nextUrl.searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId query parameter is required' },
        { status: 400 }
      );
    }

    const reports = await getReports(organizationId);
    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      organizationId,
      title,
      description,
      period_from,
      period_to,
      template_type,
      metadata,
    } = body;

    if (!organizationId || !title || !period_from || !period_to) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, title, period_from, period_to' },
        { status: 400 }
      );
    }

    const report = await createReport(organizationId, {
      title,
      description,
      period_from,
      period_to,
      template_type: template_type || 'activity',
      metadata: metadata || {},
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 }
    );
  }
}
