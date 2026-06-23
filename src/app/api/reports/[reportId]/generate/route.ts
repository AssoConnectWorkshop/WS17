import { NextRequest, NextResponse } from 'next/server';
import { getReportById, updateReport } from '@/lib/reports';

type RouteParams = {
  params: Promise<{ reportId: string }>;
};

export async function POST(request: NextRequest, context: RouteParams) {
  try {
    const { reportId } = await context.params;

    const report = await getReportById(reportId);
    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // TODO: Implement actual PDF generation using jsPDF + html2canvas
    // For now, generate a placeholder URL
    const pdfUrl = `https://assoconnect-ws17.vercel.app/reports/${reportId}/preview`;

    const updatedReport = await updateReport(reportId, {
      pdf_url: pdfUrl,
      status: 'completed',
    });

    return NextResponse.json({
      success: true,
      pdf_url: pdfUrl,
      report: updatedReport,
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
