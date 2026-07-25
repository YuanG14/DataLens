-- Phase 5: replace in-memory mock/CSV data with a real Postgres table.
--
-- Each row belongs to exactly one Supabase Auth user (user_id). Row Level
-- Security is enabled so Postgres itself refuses to return, insert, update,
-- or delete a row that doesn't belong to the currently authenticated user
-- — this holds even if there's a bug in the frontend, since it's enforced
-- by the database, not by application code.

create table if not exists public.student_records (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,

  age integer not null,
  gender text not null check (gender in ('male', 'female')),
  platform_usage text not null check (platform_usage in ('Instagram', 'TikTok', 'Both')),
  daily_social_media_hours numeric not null,
  sleep_hours numeric not null,
  screen_time_before_sleep numeric not null,
  academic_performance numeric not null,
  stress_level numeric not null,
  anxiety_level numeric not null,
  addiction_level numeric not null,
  depression_label smallint not null check (depression_label in (0, 1)),

  created_at timestamptz not null default now()
);

-- Every query filters by user_id (via RLS) or will soon (via app queries),
-- so this index keeps both fast as the table grows.
create index if not exists student_records_user_id_idx
  on public.student_records (user_id);

alter table public.student_records enable row level security;

create policy "Users can view their own records"
  on public.student_records for select
  using (auth.uid() = user_id);

create policy "Users can insert their own records"
  on public.student_records for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own records"
  on public.student_records for update
  using (auth.uid() = user_id);

create policy "Users can delete their own records"
  on public.student_records for delete
  using (auth.uid() = user_id);
