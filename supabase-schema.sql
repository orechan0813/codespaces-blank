create table if not exists public.members (
  id text primary key,
  name text not null,
  grade text not null,
  part1 text not null default '',
  part2 text not null default '',
  is_admin boolean not null default false
);

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

create table if not exists public.music_scores (
  id text primary key,
  title text not null,
  composer text not null default '',
  drive_link text not null default '',
  youtube_url text not null default '',
  audio_direct_url text not null default '',
  duration text not null default '',
  has_audio boolean not null default false
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

create table if not exists public.lost_reports (
  id text primary key,
  member_name text not null,
  description text not null,
  place text not null,
  date text not null
);
