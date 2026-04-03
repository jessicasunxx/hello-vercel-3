-- Optional starter humor flavor (run in Supabase SQL Editor as postgres).
-- Bypasses RLS. Duplicate or rename in the prompt-chain UI after seeding.
-- Then open your staging app → flavor detail → pick a test image → Generate captions.

with f as (
  insert into public.humor_flavors (name, description)
  values (
    'Deadpan museum docent',
    'Plain description of the image, one dry-funny twist, then five very short captions.'
  )
  returning id
)
insert into public.humor_flavor_steps (flavor_id, position, title, prompt)
select
  id,
  0,
  'Describe the scene',
  'You are given an image. Describe it in clear, neutral language: who is there, where they are, key objects, and the overall mood. Do not joke yet.'
from f
union all
select
  id,
  1,
  'One absurd observation',
  'Using only the description above (treat it as ground truth), write one unexpected or understated funny observation about the situation. One or two sentences.'
from f
union all
select
  id,
  2,
  'Five captions',
  'From that observation, produce exactly five short, punchy captions for social media. Each caption must be 12 words or fewer. Put each caption on its own line.'
from f;
