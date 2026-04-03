-- Humor prompt-chain tables + RLS for matrix/super admins only.
-- Safe to re-run: drops and recreates everything.
-- Run in Supabase SQL editor after your course `profiles` table exists.

-- 1. Nuke old tables (CASCADE removes dependent policies, indexes, FKs)
DROP TABLE IF EXISTS public.humor_caption_runs CASCADE;
DROP TABLE IF EXISTS public.humor_flavor_steps CASCADE;
DROP TABLE IF EXISTS public.humor_flavors CASCADE;

-- 2. Create tables fresh
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE public.humor_flavors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.humor_flavor_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flavor_id uuid NOT NULL REFERENCES public.humor_flavors (id) ON DELETE CASCADE,
  position int NOT NULL,
  title text,
  prompt text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT humor_flavor_steps_position_positive CHECK (position >= 0),
  CONSTRAINT humor_flavor_steps_unique_pos UNIQUE (flavor_id, position)
);

CREATE TABLE public.humor_caption_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flavor_id uuid REFERENCES public.humor_flavors (id) ON DELETE SET NULL,
  image_url text NOT NULL,
  request_payload jsonb,
  response_payload jsonb,
  captions_text text,
  error text,
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Indexes
CREATE INDEX humor_flavor_steps_flavor_id_idx ON public.humor_flavor_steps (flavor_id);
CREATE INDEX humor_caption_runs_flavor_id_idx ON public.humor_caption_runs (flavor_id);

-- 4. Enable RLS
ALTER TABLE public.humor_flavors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.humor_flavor_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.humor_caption_runs ENABLE ROW LEVEL SECURITY;

-- 5. RLS policies (admins only: is_superadmin OR is_matrix_admin)
CREATE POLICY "humor_flavors_select_admin"
  ON public.humor_flavors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.is_superadmin IS TRUE OR p.is_matrix_admin IS TRUE)
    )
  );

CREATE POLICY "humor_flavors_insert_admin"
  ON public.humor_flavors FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.is_superadmin IS TRUE OR p.is_matrix_admin IS TRUE)
    )
  );

CREATE POLICY "humor_flavors_update_admin"
  ON public.humor_flavors FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.is_superadmin IS TRUE OR p.is_matrix_admin IS TRUE)
    )
  );

CREATE POLICY "humor_flavors_delete_admin"
  ON public.humor_flavors FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.is_superadmin IS TRUE OR p.is_matrix_admin IS TRUE)
    )
  );

CREATE POLICY "humor_flavor_steps_all_admin"
  ON public.humor_flavor_steps FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.is_superadmin IS TRUE OR p.is_matrix_admin IS TRUE)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.is_superadmin IS TRUE OR p.is_matrix_admin IS TRUE)
    )
  );

CREATE POLICY "humor_caption_runs_all_admin"
  ON public.humor_caption_runs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.is_superadmin IS TRUE OR p.is_matrix_admin IS TRUE)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.is_superadmin IS TRUE OR p.is_matrix_admin IS TRUE)
    )
  );
