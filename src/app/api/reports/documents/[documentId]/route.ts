import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { deleteDocument } from '@/lib/reports';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

type RouteParams = {
  params: Promise<{ documentId: string }>;
};

export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const { documentId } = await context.params;

    const { data: document, error: fetchError } = await supabase
      .from('report_documents')
      .select('storage_path')
      .eq('id', documentId)
      .single();

    if (fetchError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    await supabase.storage.from('reports').remove([document.storage_path]);

    await deleteDocument(documentId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
