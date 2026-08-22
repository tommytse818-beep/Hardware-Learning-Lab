-- Public school enquiry storage. Apply after schema.sql.

create table if not exists public.school_enquiries (
  id bigint generated always as identity primary key,
  school_name text not null,
  contact_name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.school_enquiries enable row level security;
revoke all on table public.school_enquiries from anon, authenticated;
grant insert on table public.school_enquiries to service_role;