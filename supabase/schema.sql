-- Humor prompt-chain tables + RLS for matrix/super admins only.
-- Run in Supabase SQL editor after your course `profiles` table exists.

create extension if not exists "pgcrypto";

create table if not exists public.humor_flavors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.humor_flavor_steps (
  id uuid primary key default gen_random_uuid(),
  flavor_id uuid not null references public.humor_flavors (id) on delete cascade,
  position int not null,
  title text,
  prompt text not null,
  created_at timestamptz not null default now(),
  constraint humor_flavor_steps_position_positive check (position >= 0),
  constraint humor_flavor_steps_unique_pos unique (flavor_id, position)
);

create table if not exists public.humor_caption_runs (
  id uuid primary key default gen_random_uuid(),
  flavor_id uuid references public.humor_flavors (id) on delete set null,
  image_url text not null,
  request_payload jsonb,
  response_payload jsonb,
  captions_text text,
  error text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists humor_flavor_steps_flavor_id_idx
  on public.humor_flavor_steps (flavor_id);

create index if not exists humor_caption_runs_flavor_id_idx
  on public.humor_caption_runs (flavor_id);

alter table public.humor_flavors enable row level security;
alter table public.humor_flavor_steps enable row level security;
alter table public.humor_caption_runs enable row level security;

-- Admins only (matches assignment: is_superadmin OR is_matrix_admin)

create policy "humor_flavors_select_admin"
  on public.humor_flavors for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (p.is_superadmin is true or p.is_matrix_admin is true)
    )
  );

create policy "humor_flavors_insert_admin"
  on public.humor_flavors for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (p.is_superadmin is true or p.is_matrix_admin is true)
    )
  );

create policy "humor_flavors_update_admin"
  on public.humor_flavors for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (p.is_superadmin is true or p.is_matrix_admin is true)
    )
  );

create policy "humor_flavors_delete_admin"
  on public.humor_flavors for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (p.is_superadmin is true or p.is_matrix_admin is true)
    )
  );

create policy "humor_flavor_steps_all_admin"
  on public.humor_flavor_steps for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (p.is_superadmin is true or p.is_matrix_admin is true)
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (p.is_superadmin is true or p.is_matrix_admin is true)
    )
  );

create policy "humor_caption_runs_all_admin"
  on public.humor_caption_runs for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (p.is_superadmin is true or p.is_matrix_admin is true)
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (p.is_superadmin is true or p.is_matrix_admin is true)
    )
  );
