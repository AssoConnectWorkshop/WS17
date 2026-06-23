import { NextRequest, NextResponse } from 'next/server';
import { getReportById, updateReport, deleteReport } from '@/lib/reports';

type RouteParams = {
  params: Promise<{ reportId: string }>;
};

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { reportId } = await context.params;
    const report = await getReportById(reportId);

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteParams) {
  try {
    const { reportId } = await context.params;
    const body = await request.json();

    const report = await updateReport(reportId, body);
    return NextResponse.json(report);
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { error: 'Failed to update report' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const { reportId } = await context.params;
    await deleteReport(reportId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json(
      { error: 'Failed to delete report' },
      { status: 500 }
    );
  }
}
