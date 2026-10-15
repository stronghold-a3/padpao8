-- PADPAO EV — Supabase schema for member accounts and members-only content.
-- Run in Supabase: SQL Editor → New query → paste → Run.

-- 1) Member profiles (one row per auth user) ------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  agency_name text,
  position    text,
  province    text,
  phone       text,
  lto_number  text,
  status      text not null default 'pending' check (status in ('pending','approved','suspended')),
  role        text not null default 'member'  check (role in ('member','officer','admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- helper: is the current user an approved member / an officer?
create or replace function public.is_approved_member() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid()
                 and (status = 'approved' or role in ('officer','admin')));
$$;
create or replace function public.is_officer() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role in ('officer','admin'));
$$;

drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles for select using (id = auth.uid() or public.is_officer());
drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles for update using (id = auth.uid() or public.is_officer());

-- Members cannot approve themselves: only officers may change status/role.
create or replace function public.guard_profile_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- auth.uid() is null for the SQL editor / service role, so admins can still approve from the dashboard.
  if (new.status is distinct from old.status or new.role is distinct from old.role)
     and auth.uid() is not null and not public.is_officer() then
    new.status := old.status; new.role := old.role;
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists profiles_guard on public.profiles;
create trigger profiles_guard before update on public.profiles for each row execute function public.guard_profile_update();

-- Create a profile automatically on sign-up (email, Google or Facebook).
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, agency_name, position, province, phone, lto_number)
  values (new.id, new.email,
          coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
          new.raw_user_meta_data->>'agency_name', new.raw_user_meta_data->>'position',
          new.raw_user_meta_data->>'province', new.raw_user_meta_data->>'phone',
          new.raw_user_meta_data->>'lto_number')
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- 2) Meetings (members only) ------------------------------------------------------
create table if not exists public.meetings (
  id             text primary key,
  title          text not null,
  meeting_date   timestamptz not null,
  venue          text,
  prepared_by    text,
  summary        text,
  minutes_status text not null default 'pending' check (minutes_status in ('pending','approved')),
  agenda         jsonb not null default '[]',
  resolutions    jsonb not null default '[]',
  action_items   jsonb not null default '[]',
  created_at     timestamptz not null default now()
);
alter table public.meetings enable row level security;

drop policy if exists "approved members read meetings" on public.meetings;
create policy "approved members read meetings" on public.meetings for select using (public.is_approved_member());
drop policy if exists "officers manage meetings" on public.meetings;
create policy "officers manage meetings" on public.meetings for all using (public.is_officer()) with check (public.is_officer());

-- 3) Seed: October 12, 2026 general meeting --------------------------------------
insert into public.meetings (id, title, meeting_date, venue, prepared_by, summary, agenda, action_items) values (
  '2026-10-12', 'General Membership Meeting', '2026-10-12 10:00:00+08', 'Dagami, Leyte', 'Antonie M. Silva, PRO',
  'Coordination for the upcoming PNP SOSIA visit, the local-first policy with Board Members and District Representatives, and joint action with RCSU 8 and DOLE 8 against non-compliant operators.',
  '[
    {"n":1,"title":"Opening & Prayer","lead":"President Ochea"},
    {"n":2,"title":"Roll Call & Confirmation of Quorum","lead":"Secretary"},
    {"n":3,"title":"Reading and Approval of Previous Minutes","lead":"Secretary"},
    {"n":4,"title":"President''s Report","lead":"Benedicto T. Ochea"},
    {"n":5,"title":"Coming of PNP SOSIA","key":true,"points":["Visit and coordination with PADPAO EV","Matters to be discussed with SOSIA"]},
    {"n":6,"title":"Consultative Meeting with Board Members & District Representatives","key":true,"points":["Drafting of a policy prioritizing local businesses first","Especially security agencies locally available"]},
    {"n":7,"title":"Compliance & Licensing Concerns","points":["Licensing requirements under RA 11917 (which replaced RA 5487)","SRA requirements"]},
    {"n":8,"title":"Membership Matters","points":["Applications, renewals, dues"]},
    {"n":9,"title":"Industry Issues & Concerns","lead":"Open Forum"},
    {"n":10,"title":"Collaboration with RCSU 8 and DOLE 8","lead":"Antonie Silva (PRO)","key":true,"points":["Formal letters to be sent to PNP RCSU 8 and DOLE Region 8","Joint effort to eliminate non-compliant players in the security industry","Effect on local economy: non-remittance of taxes to local revenue districts","Loss of livelihood for locally qualified individuals"]},
    {"n":11,"title":"Communications & Publicity","lead":"Antonie Silva (PRO)","points":["PADPAO EV Facebook page updates"]},
    {"n":12,"title":"Future Activities / Schedules"},
    {"n":13,"title":"Other Matters"},
    {"n":14,"title":"Adjournment"}
  ]'::jsonb,
  '[
    {"title":"Send formal letters to PNP RCSU 8 and DOLE Region 8","owner":"PRO","status":"open"},
    {"title":"Prepare matters for discussion during the PNP SOSIA visit","owner":"Officers","status":"open"},
    {"title":"Draft local-first policy for consultation with Board Members and District Representatives","owner":"Officers","status":"open"},
    {"title":"Post meeting updates on the PADPAO EV Facebook page","owner":"PRO","status":"open"}
  ]'::jsonb
) on conflict (id) do nothing;

-- 4) Approving members (run as needed) --------------------------------------------
-- Make the first officer (after they sign up):
--   update public.profiles set role = 'officer', status = 'approved' where email = 'officer@example.com';
-- Approve an applicant:
--   update public.profiles set status = 'approved' where email = 'member@example.com';
