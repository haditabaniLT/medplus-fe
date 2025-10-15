-- =====================================================
-- MePlus.ai Tasks Table Migration
-- =====================================================
-- Creates: tasks table with RLS, indexes, and usage tracking
-- =====================================================

-- =====================================================
-- TASKS TABLE
-- =====================================================

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category text not null,
  title text not null,
  content text not null,
  tags text[] default '{}',
  status text default 'active' check (status in ('active', 'archived', 'deleted')),
  type text default 'generated' check (type in ('generated', 'custom')),
  is_favorite boolean default false,
  is_shared boolean default false,
  shared_link text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User ID index for filtering by user
create index if not exists idx_tasks_user_id on public.tasks(user_id);

-- Category index for filtering by category
create index if not exists idx_tasks_category on public.tasks(category);

-- Created at index for sorting by date
create index if not exists idx_tasks_created_at on public.tasks(created_at);

-- Status index for filtering by status
create index if not exists idx_tasks_status on public.tasks(status);

-- Composite index for common queries (user + category + status)
create index if not exists idx_tasks_user_category_status on public.tasks(user_id, category, status);

-- Composite index for user + created_at (for sorting user tasks by date)
create index if not exists idx_tasks_user_created_at on public.tasks(user_id, created_at desc);

-- Index for favorites filtering
create index if not exists idx_tasks_is_favorite on public.tasks(user_id, is_favorite) where is_favorite = true;

-- Index for shared tasks
create index if not exists idx_tasks_is_shared on public.tasks(is_shared) where is_shared = true;

-- =====================================================
-- TRIGGER: Auto-update timestamps
-- =====================================================

drop trigger if exists update_tasks_updated_at on public.tasks;
create trigger update_tasks_updated_at
before update on public.tasks
for each row
execute procedure moddatetime(updated_at);

-- =====================================================
-- FUNCTION: Update task usage counter
-- =====================================================

create or replace function public.update_task_usage()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    -- Increment tasks_generated counter
    update public.users set usage = jsonb_set(
      coalesce(usage, '{}'::jsonb),
      '{tasks_generated}',
      to_jsonb(coalesce((usage->>'tasks_generated')::int, 0) + 1)
    )
    where id = new.user_id;
  elsif (tg_op = 'DELETE') then
    -- Decrement tasks_generated counter (minimum 0)
    update public.users set usage = jsonb_set(
      coalesce(usage, '{}'::jsonb),
      '{tasks_generated}',
      to_jsonb(greatest(coalesce((usage->>'tasks_generated')::int, 1) - 1, 0))
    )
    where id = old.user_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- =====================================================
-- TRIGGER: Update usage on task changes
-- =====================================================

drop trigger if exists on_task_change on public.tasks;
create trigger on_task_change
after insert or delete on public.tasks
for each row
execute procedure public.update_task_usage();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on tasks table
alter table public.tasks enable row level security;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Policy: Users can view their own tasks
drop policy if exists "Users can view their own tasks" on public.tasks;
create policy "Users can view their own tasks"
on public.tasks
for select
using (auth.uid() = user_id);

-- Policy: Users can insert their own tasks
drop policy if exists "Users can insert their own tasks" on public.tasks;
create policy "Users can insert their own tasks"
on public.tasks
for insert
with check (auth.uid() = user_id);

-- Policy: Users can update their own tasks
drop policy if exists "Users can update their own tasks" on public.tasks;
create policy "Users can update their own tasks"
on public.tasks
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Policy: Users can delete their own tasks
drop policy if exists "Users can delete their own tasks" on public.tasks;
create policy "Users can delete their own tasks"
on public.tasks
for delete
using (auth.uid() = user_id);

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

comment on table public.tasks is 'Stores all tasks generated or created by users';
comment on column public.tasks.user_id is 'Reference to the user who owns this task';
comment on column public.tasks.category is 'Task category (e.g., "Decision Mastery", "Business Driver")';
comment on column public.tasks.title is 'Task title';
comment on column public.tasks.content is 'Task content/description';
comment on column public.tasks.tags is 'Array of custom tags for filtering';
comment on column public.tasks.status is 'Task status: active, archived, or deleted';
comment on column public.tasks.type is 'Task type: generated by AI or custom user input';
comment on column public.tasks.is_favorite is 'Whether the task is marked as favorite';
comment on column public.tasks.is_shared is 'Whether the task is shared publicly';
comment on column public.tasks.shared_link is 'Optional public sharing link';
comment on column public.tasks.metadata is 'Additional metadata (source, sentiment, etc.)';

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Uncomment the following lines to insert sample data for testing
-- Note: Replace 'your-user-id-here' with an actual user ID from auth.users

/*
insert into public.tasks (user_id, category, title, content, tags, type) values
('your-user-id-here', 'Decision Mastery', 'Choose the right tech stack', 'Evaluate React vs Vue for the new project', array['technology', 'decision'], 'generated'),
('your-user-id-here', 'Business Driver', 'Increase user engagement', 'Implement gamification features to boost user retention', array['business', 'engagement'], 'custom'),
('your-user-id-here', 'Play Time', 'Team building activity', 'Organize a virtual escape room for the team', array['team', 'fun'], 'generated');
*/

-- =====================================================
-- END OF MIGRATION
-- =====================================================





