create table if not exists public.members (
  id text primary key,
  name text not null,
  grade text not null,
  part1 text not null default '',
  part2 text not null default '',
  is_admin boolean not null default false
);

alter table public.members add column if not exists is_advisor boolean not null default false;

create table if not exists public.member_grade_promotions (
  school_year integer primary key,
  promoted_at timestamptz not null default now()
);

create or replace function public.promote_members_for_school_year(p_school_year integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed_year integer;
  promoted_count integer;
begin
  insert into public.member_grade_promotions (school_year)
  values (p_school_year)
  on conflict (school_year) do nothing
  returning school_year into claimed_year;

  if claimed_year is null then
    return 0;
  end if;

  update public.members
  set grade = case grade
    when '1年' then '2年'
    when '2年' then '3年'
    when '3年' then '卒業'
    else grade
  end
  where is_advisor = false
    and grade in ('1年', '2年', '3年');

  get diagnostics promoted_count = row_count;
  return promoted_count;
end;
$$;

revoke all on function public.promote_members_for_school_year(integer) from public, anon, authenticated;
grant execute on function public.promote_members_for_school_year(integer) to service_role;

create table if not exists public.club_events (
  id text primary key,
  date text not null,
  start_time text not null default '',
  end_time text not null default '',
  title text not null,
  detail text not null default '',
  type text not null default 'practice'
);

alter table public.club_events add column if not exists start_time text not null default '';
alter table public.club_events add column if not exists end_time text not null default '';

create table if not exists public.practice_items (
  id text primary key,
  start text not null,
  end text not null,
  title text not null,
  note text not null default ''
);

create table if not exists public.announcements (
  id text primary key,
  date text not null,
  title text not null,
  body text not null,
  pinned boolean not null default false
);

create table if not exists public.lost_items (
  id text primary key,
  title text not null,
  image text not null default '',
  place text not null default '',
  date text not null
);

create table if not exists public.scores (
  id text primary key,
  title text not null,
  composer text not null default '',
  drive_url text not null default '',
  audio_url text not null default '',
  youtube_url text not null default ''
);

create table if not exists public.diary_entries (
  id text primary key,
  date text not null,
  author text not null,
  title text not null,
  body text not null
);

create table if not exists public.absence_reports (
  id text primary key,
  member_name text not null,
  date text not null,
  reason text not null,
  note text not null default ''
);

create table if not exists public.supply_requests (
  id text primary key,
  member_name text not null,
  kind text not null default 'purchase',
  item text not null,
  reason text not null default '',
  date text not null
);

create table if not exists public.lost_reports (
  id text primary key,
  member_name text not null,
  description text not null,
  image text not null default '',
  place text not null,
  date text not null
);

alter table public.lost_reports add column if not exists image text not null default '';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'lost-report-images',
  'lost-report-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'music-files',
  'music-files',
  true,
  52428800,
  array['audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/aac', 'audio/flac', 'audio/webm']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view lost report images" on storage.objects;
create policy "Public can view lost report images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'lost-report-images');

drop policy if exists "Public can upload lost report images" on storage.objects;
create policy "Public can upload lost report images"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'lost-report-images');

drop policy if exists "Public can view music files" on storage.objects;
create policy "Public can view music files"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'music-files');

drop policy if exists "Public can upload music files" on storage.objects;
create policy "Public can upload music files"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'music-files');
