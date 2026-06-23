-- Create reports table
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null,
  title text not null,
  description text,
  period_from date not null,
  period_to date not null,
  status text not null default 'draft' check (status in ('draft', 'completed', 'archived')),
  template_type text not null default 'activity' check (template_type in ('annual', 'activity', 'membership')),
  metadata jsonb default '{}',
  pdf_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create report_documents table
create table if not exists report_documents (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports(id) on delete cascade,
  filename text not null,
  file_type text not null,
  storage_path text not null,
  file_size bigint not null,
  uploaded_at timestamptz not null default now()
);

-- Create report_sections table
create table if not exists report_sections (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports(id) on delete cascade,
  section_type text not null check (section_type in ('summary', 'members', 'activities', 'events', 'financials', 'custom')),
  content jsonb default '{}',
  include_documents boolean default false,
  "order" integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table reports enable row level security;
alter table report_documents enable row level security;
alter table report_sections enable row level security;

-- Policies for reports (public read for now, can be restricted later)
create policy "Public read access on reports"
  on reports
  for select
  using (true);

create policy "Authenticated create reports"
  on reports
  for insert
  with check (true);

create policy "Authenticated update reports"
  on reports
  for update
  using (true);

-- Policies for report_documents
create policy "Public read access on documents"
  on report_documents
  for select
  using (true);

create policy "Authenticated create documents"
  on report_documents
  for insert
  with check (true);

-- Policies for report_sections
create policy "Public read access on sections"
  on report_sections
  for select
  using (true);

create policy "Authenticated create sections"
  on report_sections
  for insert
  with check (true);

create policy "Authenticated update sections"
  on report_sections
  for update
  using (true);

-- Create indexes for performance
create index if not exists idx_reports_organization_id on reports(organization_id);
create index if not exists idx_reports_status on reports(status);
create index if not exists idx_report_documents_report_id on report_documents(report_id);
create index if not exists idx_report_sections_report_id on report_sections(report_id);
