import { createClient } from '@supabase/supabase-js';
import type { Report, ReportDocument, ReportSection, ReportWithRelations } from './types';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration is missing. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  return createClient(supabaseUrl, supabaseKey);
}

export async function getReports(organizationId: string): Promise<Report[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getReportById(reportId: string): Promise<ReportWithRelations | null> {
  const supabase = getSupabaseClient();
  const { data: report, error: reportError } = await supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .single();

  if (reportError) throw reportError;
  if (!report) return null;

  const { data: documents, error: docsError } = await supabase
    .from('report_documents')
    .select('*')
    .eq('report_id', reportId);

  if (docsError) throw docsError;

  const { data: sections, error: sectionsError } = await supabase
    .from('report_sections')
    .select('*')
    .eq('report_id', reportId)
    .order('order', { ascending: true });

  if (sectionsError) throw sectionsError;

  return {
    ...report,
    documents: documents || [],
    sections: sections || [],
  };
}

export async function createReport(
  organizationId: string,
  data: {
    title: string;
    description?: string;
    period_from: string;
    period_to: string;
    template_type: 'annual' | 'activity' | 'membership';
    metadata?: Record<string, unknown>;
  }
): Promise<Report> {
  const supabase = getSupabaseClient();
  const { data: report, error } = await supabase
    .from('reports')
    .insert([
      {
        organization_id: organizationId,
        status: 'draft',
        ...data,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return report;
}

export async function updateReport(
  reportId: string,
  updates: Partial<Report>
): Promise<Report> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('reports')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', reportId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteReport(reportId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', reportId);

  if (error) throw error;
}

export async function addDocument(
  reportId: string,
  document: {
    filename: string;
    file_type: string;
    storage_path: string;
    file_size: number;
  }
): Promise<ReportDocument> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('report_documents')
    .insert([
      {
        report_id: reportId,
        ...document,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDocument(documentId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('report_documents')
    .delete()
    .eq('id', documentId);

  if (error) throw error;
}

export async function addSection(
  reportId: string,
  section: {
    section_type: string;
    content?: Record<string, unknown>;
    include_documents?: boolean;
    order: number;
  }
): Promise<ReportSection> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('report_sections')
    .insert([
      {
        report_id: reportId,
        ...section,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSection(
  sectionId: string,
  updates: Partial<ReportSection>
): Promise<ReportSection> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('report_sections')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sectionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSection(sectionId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('report_sections')
    .delete()
    .eq('id', sectionId);

  if (error) throw error;
}
