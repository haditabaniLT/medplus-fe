-- =====================================================
-- MePlus.ai Initial Database Schema
-- =====================================================
-- Includes: users, sessions, plans, notifications
-- =====================================================

-- =====================================================
-- EXTENSIONS
-- =====================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "moddatetime";

-- =====================================================
-- USERS TABLE
-- =====================================================
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text unique not null,
  avatar_url text,
  bio text,
  role text default 'User',
  plan text default 'BASE' check (plan in ('BASE', 'PRO')),
  onboarding boolean default false,
  goals jsonb default '[]'::jsonb,
  industry text,
  seniority text,
  brand_logo_url text,
  brand_primary_color text,
  brand_secondary_color text,
  brand_font text,
  preferences jsonb default '{}'::jsonb,        -- e.g. { theme: "dark", language: "en", timezone: "Asia/Karachi" }
  integrations jsonb default '{}'::jsonb,       -- e.g. { canva: true, gamma: false }
  usage jsonb default '{}'::jsonb,              -- e.g. { tasks_generated: 10, export_count: 2 }
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================================================
-- FUNCTION: handle_new_user()
-- Automatically creates a user row when new auth user signs up
-- =====================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, onboarding)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''), false);
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger AFTER the function definition
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- =====================================================
-- TRIGGER: Auto-update timestamps
-- =====================================================
drop trigger if exists update_users_updated_at on public.users;
create trigger update_users_updated_at
before update on public.users
for each row
execute procedure moddatetime(updated_at);

-- =====================================================
-- PLANS TABLE
-- =====================================================
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  price numeric(10,2) not null,
  description text,
  features text[],
  task_limit integer,
  export_limit integer,
  created_at timestamptz default now()
);

-- Seed initial plans (safe for reruns)
insert into public.plans (name, price, description, features, task_limit, export_limit)
values 
('BASE', 0, 'Free plan with limited features', 
  array[
    '5 task categories',
    'Basic personalization',
    'Limited integrations'
  ], 
  100, 10),
('PRO', 5, 'Pro plan with all 12 categories and unlimited access', 
  array[
    'All 12 task categories',
    'Full personalization',
    'Canva & Gamma integrations',
    'Priority support'
  ], 
  1000, 100)
on conflict (name) do nothing;

-- =====================================================
-- SESSIONS TABLE
-- =====================================================
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  device_name text,
  ip_address text,
  location text,
  last_active timestamptz default now(),
  is_current boolean default false
);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  body text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.sessions enable row level security;
alter table public.notifications enable row level security;

-- =====================================================
-- USERS POLICIES
-- =====================================================

-- Allow users to view their own profile
drop policy if exists "Users can view their own profile" on public.users;
create policy "Users can view their own profile"
on public.users
for select
using (auth.uid() = id);

-- Allow users to update their own profile
drop policy if exists "Users can update their own profile" on public.users;
create policy "Users can update their own profile"
on public.users
for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Allow automatic insert (via trigger)
drop policy if exists "Allow self insert on users" on public.users;
create policy "Allow self insert on users"
on public.users
for insert
with check (auth.uid() = id);

-- =====================================================
-- SESSIONS POLICIES
-- =====================================================
drop policy if exists "Users can view their own sessions" on public.sessions;
create policy "Users can view their own sessions"
on public.sessions
for select
using (auth.uid() = user_id);

drop policy if exists "Users can modify their own sessions" on public.sessions;
create policy "Users can modify their own sessions"
on public.sessions
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- =====================================================
-- NOTIFICATIONS POLICIES
-- =====================================================
drop policy if exists "Users can view their own notifications" on public.notifications;
create policy "Users can view their own notifications"
on public.notifications
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert notifications" on public.notifications;
create policy "Users can insert notifications"
on public.notifications
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own notifications" on public.notifications;
create policy "Users can update their own notifications"
on public.notifications
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- =====================================================
-- INDEXES (optional performance tuning)
-- =====================================================
create index if not exists idx_users_email on public.users(email);
create index if not exists idx_users_plan on public.users(plan);
create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_sessions_user_id on public.sessions(user_id);

-- =====================================================
-- END OF SCHEMA
-- =====================================================
