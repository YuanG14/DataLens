-- Phase 5: generic dataset storage, alongside (not replacing) student_records.
--
-- student_records is a fixed table: 11 hardcoded mental-health columns. To
-- eventually support arbitrary CSVs (Student Performance, Lifestyle, ...)
-- without a new table per dataset shape, we split "what columns exist" from
-- "what's in each row":
--
--   datasets         one row per uploaded dataset
--   dataset_columns  one row per column DEFINITION (name, detected type, order)
--   dataset_rows     one row per CSV row, values stored as JSONB
--
-- This phase only creates the schema. Nothing in the app writes to these
-- tables yet — wiring the CSV importer to use them is a later phase.

create table if not exists public.datasets (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  description text,
  source_filename text,
  created_at timestamptz not null default now()
);

create index if not exists datasets_user_id_idx on public.datasets (user_id);

alter table public.datasets enable row level security;

create policy "Users can view their own datasets"
  on public.datasets for select
  using (auth.uid() = user_id);

create policy "Users can insert their own datasets"
  on public.datasets for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own datasets"
  on public.datasets for update
  using (auth.uid() = user_id);

create policy "Users can delete their own datasets"
  on public.datasets for delete
  using (auth.uid() = user_id);


-- dataset_columns: the schema of a dataset, decided at import time
-- (Phase 6). column_type mirrors exactly what Phase 6 needs to detect.
create table if not exists public.dataset_columns (
  id bigint generated always as identity primary key,
  dataset_id bigint not null references public.datasets (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  display_name text,
  column_type text not null check (column_type in ('numeric', 'categorical', 'boolean', 'date', 'text')),
  position integer not null,
  created_at timestamptz not null default now(),
  unique (dataset_id, name)
);

create index if not exists dataset_columns_dataset_id_idx on public.dataset_columns (dataset_id);

alter table public.dataset_columns enable row level security;

create policy "Users can view their own dataset columns"
  on public.dataset_columns for select
  using (auth.uid() = user_id);

-- INSERT/UPDATE also confirm the referenced dataset actually belongs to the
-- same user — user_id alone would let someone attach a column definition to
-- a dataset_id they don't own (they still couldn't read that dataset back,
-- but they could pollute its column list).
create policy "Users can insert columns into their own datasets"
  on public.dataset_columns for insert
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.datasets d where d.id = dataset_id and d.user_id = auth.uid())
  );

create policy "Users can update their own dataset columns"
  on public.dataset_columns for update
  using (
    auth.uid() = user_id
    and exists (select 1 from public.datasets d where d.id = dataset_id and d.user_id = auth.uid())
  );

create policy "Users can delete their own dataset columns"
  on public.dataset_columns for delete
  using (auth.uid() = user_id);


-- dataset_rows: the actual data. `data` holds one CSV row as JSONB, keyed by
-- column name (matching dataset_columns.name) — this is what lets one table
-- shape hold datasets with completely different columns.
create table if not exists public.dataset_rows (
  id bigint generated always as identity primary key,
  dataset_id bigint not null references public.datasets (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  row_index integer not null,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists dataset_rows_dataset_id_idx on public.dataset_rows (dataset_id);
-- Supports future filtering/analytics queries directly against JSONB values
-- (Phase 7) without a full table scan.
create index if not exists dataset_rows_data_gin_idx on public.dataset_rows using gin (data);

alter table public.dataset_rows enable row level security;

create policy "Users can view their own dataset rows"
  on public.dataset_rows for select
  using (auth.uid() = user_id);

create policy "Users can insert rows into their own datasets"
  on public.dataset_rows for insert
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.datasets d where d.id = dataset_id and d.user_id = auth.uid())
  );

create policy "Users can update their own dataset rows"
  on public.dataset_rows for update
  using (
    auth.uid() = user_id
    and exists (select 1 from public.datasets d where d.id = dataset_id and d.user_id = auth.uid())
  );

create policy "Users can delete their own dataset rows"
  on public.dataset_rows for delete
  using (auth.uid() = user_id);
