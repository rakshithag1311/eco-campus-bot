-- ============================================================
-- Eco Campus Bot — Eco Points & Rewards System Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. ECO POINTS TRANSACTIONS ───────────────────────────────
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

-- ── SECURITY & RLS FOR ECO POINTS ───────────────────────────
-- CRITICAL REQUIREMENT: Users cannot manually award themselves points from the client!
alter table public.eco_points enable row level security;

-- Users can read their own points history
drop policy if exists "Users can view own eco points" on public.eco_points;
create policy "Users can view own eco points"
  on public.eco_points for select
  using (auth.uid() = user_id);

-- Explicitly block users from inserting points directly via client API
-- Points can ONLY be awarded by server-side routes using service role / secure API.
drop policy if exists "Block client insert eco points" on public.eco_points;
create policy "Block client insert eco points"
  on public.eco_points for insert
  with check (false);

drop policy if exists "Block client update eco points" on public.eco_points;
create policy "Block client update eco points"
  on public.eco_points for update
  using (false);

drop policy if exists "Block client delete eco points" on public.eco_points;
create policy "Block client delete eco points"
  on public.eco_points for delete
  using (false);


-- ── 2. WASTE REPORTS ─────────────────────────────────────────
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

drop policy if exists "Users can view own waste reports" on public.waste_reports;
create policy "Users can view own waste reports"
  on public.waste_reports for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own waste reports" on public.waste_reports;
create policy "Users can insert own waste reports"
  on public.waste_reports for insert
  with check (auth.uid() = user_id);


-- ── 3. ECO CHALLENGES ────────────────────────────────────────
create table if not exists public.eco_challenges (
  id          text primary key,
  title       text not null,
  description text not null,
  points      integer not null default 20,
  icon        text not null default 'Sparkles',
  category    text not null default 'daily'
);

-- Seed initial campus challenges
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

drop policy if exists "Anyone can read eco challenges" on public.eco_challenges;
create policy "Anyone can read eco challenges"
  on public.eco_challenges for select
  using (true);


-- ── 4. USER CHALLENGE COMPLETIONS ────────────────────────────
create table if not exists public.user_challenge_completions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  challenge_id  text not null references public.eco_challenges(id) on delete cascade,
  completed_at  timestamptz not null default now()
);

create index if not exists user_challenge_completions_user_idx on public.user_challenge_completions(user_id, challenge_id);
create index if not exists user_challenge_completions_date_idx on public.user_challenge_completions(completed_at desc);

alter table public.user_challenge_completions enable row level security;

drop policy if exists "Users can view own completions" on public.user_challenge_completions;
create policy "Users can view own completions"
  on public.user_challenge_completions for select
  using (auth.uid() = user_id);

drop policy if exists "Block client direct insert completions" on public.user_challenge_completions;
create policy "Block client direct insert completions"
  on public.user_challenge_completions for insert
  with check (false);


-- ── 5. LEADERBOARD VIEW ──────────────────────────────────────
-- Computed view showing real user rankings and total points
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
