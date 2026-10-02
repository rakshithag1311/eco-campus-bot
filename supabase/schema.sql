-- ============================================================
-- Eco Campus Bot — Supabase Database Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. PROFILES ─────────────────────────────────────────────
-- Mirrors auth.users, stores display name and avatar.
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text,
  display_name  text,
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-create a profile row whenever a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at on profiles
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

-- RLS for profiles
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);


-- ── 2. CONVERSATIONS ────────────────────────────────────────
create table if not exists public.conversations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists conversations_updated_at on public.conversations;
create trigger conversations_updated_at
  before update on public.conversations
  for each row execute procedure public.update_updated_at();

create index if not exists conversations_user_id_idx on public.conversations(user_id);
create index if not exists conversations_updated_at_idx on public.conversations(updated_at desc);

-- RLS for conversations
alter table public.conversations enable row level security;

create policy "Users can manage own conversations"
  on public.conversations for all
  using (auth.uid() = user_id);


-- ── 3. MESSAGES ─────────────────────────────────────────────
create table if not exists public.messages (
  id                uuid primary key default gen_random_uuid(),
  conversation_id   uuid not null references public.conversations(id) on delete cascade,
  role              text not null check (role in ('user', 'assistant')),
  content           text not null,
  created_at        timestamptz not null default now()
);

create index if not exists messages_conversation_id_idx on public.messages(conversation_id);
create index if not exists messages_created_at_idx on public.messages(created_at asc);

-- RLS for messages: users can only access messages in their own conversations
alter table public.messages enable row level security;

create policy "Users can manage messages in own conversations"
  on public.messages for all
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  );


-- ── 4. WASTE CATEGORIES ─────────────────────────────────────
create table if not exists public.waste_categories (
  id           uuid primary key default gen_random_uuid(),
  name         text not null unique,
  description  text,
  color        text,
  icon         text
);

-- Seed the 6 core waste categories
insert into public.waste_categories (name, description, color, icon) values
  ('General Waste',  'Non-recyclable everyday waste',                            '#6b7280', 'Trash2'),
  ('Recyclable',     'Plastic, paper, glass, and metal items',                   '#3b82f6', 'Recycle'),
  ('Organic',        'Food scraps, plant material, and biodegradable waste',     '#16a34a', 'Leaf'),
  ('E-waste',        'Electronics, batteries, cables, and electrical equipment', '#f59e0b', 'BatteryCharging'),
  ('Hazardous',      'Chemicals, paints, medical waste, and toxic materials',    '#ef4444', 'AlertTriangle'),
  ('Textile',        'Clothing, fabric, and textile items',                      '#8b5cf6', 'Shirt')
on conflict (name) do nothing;

-- Public read-only
alter table public.waste_categories enable row level security;

create policy "Anyone can read waste categories"
  on public.waste_categories for select
  using (true);


-- ── 5. DISPOSAL POINTS ──────────────────────────────────────
create table if not exists public.disposal_points (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  location_description  text not null,
  building              text not null,
  floor                 text,
  accepts               text[] not null default '{}',
  is_active             boolean not null default true,
  created_at            timestamptz not null default now()
);

-- Seed with campus disposal points
insert into public.disposal_points (name, location_description, building, floor, accepts) values
  ('Library Recycling Bin B2',  'Near the main entrance, left side',    'Library Block',    'Ground Floor', array['Recyclable', 'E-waste']),
  ('Student Centre Bins',        'Next to the food court',              'Student Centre',   'Ground Floor', array['General Waste', 'Recyclable', 'Organic']),
  ('Cafeteria Green Bins',       'Inside the dining area',              'Cafeteria',        'Ground Floor', array['Organic', 'General Waste']),
  ('IT Department E-waste',      'Reception desk collection point',     'IT Department',    'First Floor',  array['E-waste']),
  ('Hostel A Recycling',         'Common room, ground floor',           'Hostel A',         'Ground Floor', array['Recyclable', 'General Waste']),
  ('Hostel B Recycling',         'Common room, ground floor',           'Hostel B',         'Ground Floor', array['Recyclable', 'General Waste']),
  ('Hostel C Recycling',         'Common room, ground floor',           'Hostel C',         'Ground Floor', array['Recyclable', 'General Waste']),
  ('Admin Office E-waste',       'Reception, submit to security desk',  'Main Admin Office','Ground Floor', array['E-waste']),
  ('Safety Office Hazardous',    'By appointment only',                 'Safety Office',    'Ground Floor', array['Hazardous']),
  ('Chemistry Dept Hazardous',   'Lab disposal bay',                    'Chemistry Dept',   'Ground Floor', array['Hazardous']),
  ('Textile Donation Box',       'Near Student Services counter',       'Student Centre',   'Ground Floor', array['Textile'])
on conflict do nothing;

-- Public read-only
alter table public.disposal_points enable row level security;

create policy "Anyone can read disposal points"
  on public.disposal_points for select
  using (true);


-- ── 6. ECO ACTIONS ──────────────────────────────────────────
create table if not exists public.eco_actions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  action_type  text not null,
  description  text,
  category_id  uuid references public.waste_categories(id),
  created_at   timestamptz not null default now()
);

create index if not exists eco_actions_user_id_idx on public.eco_actions(user_id);
create index if not exists eco_actions_created_at_idx on public.eco_actions(created_at desc);

-- RLS
alter table public.eco_actions enable row level security;

create policy "Users can manage own eco actions"
  on public.eco_actions for all
  using (auth.uid() = user_id);


-- ── 7. CAMPUS STATS ─────────────────────────────────────────
create table if not exists public.campus_stats (
  id          uuid primary key default gen_random_uuid(),
  stat_key    text not null unique,
  value       numeric not null default 0,
  label       text not null,
  suffix      text not null default '',
  trend       text not null default '+0%',
  bar         integer not null default 0 check (bar between 0 and 100),
  updated_at  timestamptz not null default now()
);

-- Seed with initial stats (these grow as users interact)
insert into public.campus_stats (stat_key, value, label, suffix, trend, bar) values
  ('recycled_kg',      125,  'Recycled',           ' kg', '+12%', 78),
  ('ewaste_kg',         24,  'E-waste collected',  ' kg', '+8%',  42),
  ('paper_kg',          80,  'Paper recycled',     ' kg', '+15%', 64),
  ('eco_actions',     1240,  'Eco actions',        '',    '+21%', 90)
on conflict (stat_key) do nothing;

-- Anyone can read stats, only service role can write
alter table public.campus_stats enable row level security;

create policy "Anyone can read campus stats"
  on public.campus_stats for select
  using (true);


-- ── 8. ECO POINTS & REWARDS ───────────────────────────────────
create table if not exists public.eco_points (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  action_type  text not null check (action_type in ('waste_classification', 'snap_and_sort', 'report_waste', 'eco_challenge')),
  points       integer not null check (points > 0),
  description  text not null,
  metadata     jsonb default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists eco_points_user_id_idx on public.eco_points(user_id);
create index if not exists eco_points_created_at_idx on public.eco_points(created_at desc);

-- RLS: users can only read their points; cannot insert manually
alter table public.eco_points enable row level security;

create policy "Users can view own eco points"
  on public.eco_points for select
  using (auth.uid() = user_id);

create policy "Block client insert eco points"
  on public.eco_points for insert
  with check (false);

create policy "Block client update eco points"
  on public.eco_points for update
  using (false);

create policy "Block client delete eco points"
  on public.eco_points for delete
  using (false);

-- Waste reports
create table if not exists public.waste_reports (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  title         text not null,
  location_name text not null,
  issue_type    text not null check (issue_type in ('overflowing_bin', 'damaged_bin', 'litter_hotspot', 'hazardous_waste', 'other')),
  description   text,
  status        text not null default 'reported' check (status in ('reported', 'in_progress', 'resolved')),
  created_at    timestamptz not null default now()
);

create index if not exists waste_reports_user_id_idx on public.waste_reports(user_id);
create index if not exists waste_reports_created_at_idx on public.waste_reports(created_at desc);

alter table public.waste_reports enable row level security;

create policy "Users can view own waste reports"
  on public.waste_reports for select
  using (auth.uid() = user_id);

create policy "Users can insert own waste reports"
  on public.waste_reports for insert
  with check (auth.uid() = user_id);

-- Eco Challenges
create table if not exists public.eco_challenges (
  id          text primary key,
  title       text not null,
  description text not null,
  points      integer not null default 20,
  icon        text not null default 'Sparkles',
  category    text not null default 'daily'
);

insert into public.eco_challenges (id, title, description, points, icon, category) values
  ('reusable_bottle', 'Reusable Cup & Bottle Hero', 'Use a refillable water bottle or reusable coffee mug today', 20, 'CupSoda', 'daily'),
  ('cafeteria_sort', 'Cafeteria Compost Master', 'Sort food waste and biodegradable containers into green bins', 20, 'Utensils', 'daily'),
  ('bin_scout', 'Campus E-waste Scout', 'Locate the library e-waste bin and responsibly drop off used batteries or cables', 20, 'BatteryCharging', 'daily'),
  ('power_down', 'Campus Energy Saver', 'Turn off idle lights, projectors, or fans when leaving an empty lecture hall or lab', 20, 'Zap', 'daily')
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  points = excluded.points;

alter table public.eco_challenges enable row level security;
create policy "Anyone can read eco challenges" on public.eco_challenges for select using (true);

create table if not exists public.user_challenge_completions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  challenge_id  text not null references public.eco_challenges(id) on delete cascade,
  completed_at  timestamptz not null default now()
);

create index if not exists user_challenge_completions_user_idx on public.user_challenge_completions(user_id, challenge_id);
create index if not exists user_challenge_completions_date_idx on public.user_challenge_completions(completed_at desc);

alter table public.user_challenge_completions enable row level security;
create policy "Users can view own completions" on public.user_challenge_completions for select using (auth.uid() = user_id);
create policy "Block client direct insert completions" on public.user_challenge_completions for insert with check (false);

-- Campus Leaderboard view
create or replace view public.campus_leaderboard as
select
  p.id as user_id,
  coalesce(p.display_name, split_part(p.email, '@', 1), 'Campus Eco Hero') as display_name,
  p.avatar_url,
  coalesce(sum(ep.points), 0)::integer as total_points,
  count(ep.id)::integer as total_actions,
  max(ep.created_at) as last_active_at
from public.profiles p
left join public.eco_points ep on ep.user_id = p.id
group by p.id, p.display_name, p.email, p.avatar_url
order by total_points desc, p.created_at asc;

grant select on public.campus_leaderboard to anon, authenticated;

-- ── DONE ─────────────────────────────────────────────────────
-- After running this script:
-- 1. Go to Supabase Dashboard → Authentication → Providers
--    → Enable Google OAuth (add Client ID + Secret from Google Cloud Console)
-- 2. Add your site URL to: Authentication → URL Configuration → Site URL
-- 3. Add http://localhost:3000/auth/callback to Redirect URLs
-- ─────────────────────────────────────────────────────────────

