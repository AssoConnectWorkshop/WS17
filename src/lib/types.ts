export type ReportStatus = 'draft' | 'completed' | 'archived';
export type ReportTemplateType = 'annual' | 'activity' | 'membership';
export type ReportSectionType = 'summary' | 'members' | 'activities' | 'events' | 'financials' | 'custom';

export interface Report {
  id: string;
  organization_id: string;
  title: string;
  description?: string;
  period_from: string;
  period_to: string;
  status: ReportStatus;
  template_type: ReportTemplateType;
  metadata: Record<string, unknown>;
  pdf_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ReportDocument {
  id: string;
  report_id: string;
  filename: string;
  file_type: string;
  storage_path: string;
  file_size: number;
  uploaded_at: string;
}

export interface ReportSection {
  id: string;
  report_id: string;
  section_type: ReportSectionType;
  content: Record<string, unknown>;
  include_documents: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  type: 'person' | 'structure';
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  membershipDate?: string;
  customFields?: Record<string, unknown>;
}

export interface MembershipStats {
  total: number;
  active: number;
  new: number;
  inactive: number;
}

export interface ReportWithRelations extends Report {
  documents: ReportDocument[];
  sections: ReportSection[];
}
