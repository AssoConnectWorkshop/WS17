import { NextRequest, NextResponse } from 'next/server';
import { updateSection, deleteSection } from '@/lib/reports';

type RouteParams = {
  params: Promise<{ sectionId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteParams) {
  try {
    const { sectionId } = await context.params;
    const body = await request.json();

    const section = await updateSection(sectionId, body);
    return NextResponse.json(section);
  } catch (error) {
    console.error('Error updating section:', error);
    return NextResponse.json(
      { error: 'Failed to update section' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const { sectionId } = await context.params;
    await deleteSection(sectionId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting section:', error);
    return NextResponse.json(
      { error: 'Failed to delete section' },
      { status: 500 }
    );
  }
}
