import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { addDocument } from '@/lib/reports';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration is missing.');
  }

  return createClient(supabaseUrl, supabaseKey);
}

const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/gif', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const reportId = formData.get('reportId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!reportId) {
      return NextResponse.json(
        { error: 'reportId is required' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed. Allowed types: PDF, PNG, JPEG, GIF, DOCX' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const filename = file.name.replace(/[^a-z0-9.-]/gi, '_').toLowerCase();
    const storagePath = `reports/${reportId}/${Date.now()}-${filename}`;

    const supabase = getSupabaseClient();
    const { error: uploadError } = await supabase.storage
      .from('reports')
      .upload(storagePath, buffer, {
        contentType: file.type,
      });

    if (uploadError) {
      throw uploadError;
    }

    const document = await addDocument(reportId, {
      filename: file.name,
      file_type: file.type,
      storage_path: storagePath,
      file_size: file.size,
    });

    const { data: publicUrl } = supabase.storage
      .from('reports')
      .getPublicUrl(storagePath);

    return NextResponse.json(
      {
        success: true,
        document: {
          ...document,
          url: publicUrl.publicUrl,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
