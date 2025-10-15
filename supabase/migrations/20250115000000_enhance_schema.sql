-- =====================================================
-- MePlus.ai Schema Enhancement Migration
-- =====================================================
-- Adds: Account management fields, enhanced preferences, 
--       foreign key constraints, and improved RLS
-- =====================================================

-- =====================================================
-- 1. ADD ACCOUNT MANAGEMENT FIELDS TO USERS TABLE
-- =====================================================

-- Add account management fields
alter table public.users 
add column if not exists is_deleted boolean default false,
add column if not exists email_verified boolean default false;

-- Add comment for documentation
comment on column public.users.is_deleted is 'Soft delete flag for account deletion tracking';
comment on column public.users.email_verified is 'Email verification status from Supabase Auth';

-- =====================================================
-- 2. ENHANCE PREFERENCES JSON STRUCTURE
-- =====================================================

-- Update existing preferences to include notification settings
-- This is handled in the application layer, but we ensure the structure is documented
comment on column public.users.preferences is 'User preferences including theme, language, timezone, and notifications: {"theme": "dark", "language": "en", "timezone": "Asia/Karachi", "notifications": {"inApp": true, "email": true}}';

-- =====================================================
-- 3. ADD FOREIGN KEY CONSTRAINT FOR PLANS
-- =====================================================

-- Add foreign key constraint from users.plan to plans.name
alter table public.users 
add constraint fk_user_plan 
foreign key (plan) references public.plans(name);

-- =====================================================
-- 4. ENHANCE SESSIONS TABLE (already exists but ensure completeness)
-- =====================================================

-- Ensure sessions table has all required fields (already exists in init schema)
-- Add indexes for better performance
create index if not exists idx_sessions_user_id_active on public.sessions(user_id, is_current);
create index if not exists idx_sessions_last_active on public.sessions(last_active);

-- =====================================================
-- 5. ADD PLANS TABLE RLS POLICIES
-- =====================================================

-- Enable RLS on plans table
alter table public.plans enable row level security;

-- Allow all authenticated users to read plans (for plan selection)
drop policy if exists "Anyone can view plans" on public.plans;
create policy "Anyone can view plans"
on public.plans
for select
using (auth.role() = 'authenticated');

-- Only service role can modify plans
drop policy if exists "Service role can modify plans" on public.plans;
create policy "Service role can modify plans"
on public.plans
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

-- =====================================================
-- 6. ENHANCE USERS TABLE RLS POLICIES
-- =====================================================

-- Add policy for soft delete (users can only see non-deleted accounts)
drop policy if exists "Users can view their own profile" on public.users;
create policy "Users can view their own profile"
on public.users
for select
using (auth.uid() = id and is_deleted = false);

-- Update policy to prevent updates to deleted accounts
drop policy if exists "Users can update their own profile" on public.users;
create policy "Users can update their own profile"
on public.users
for update
using (auth.uid() = id and is_deleted = false)
with check (auth.uid() = id and is_deleted = false);

-- =====================================================
-- 7. ADD FUNCTION FOR SOFT DELETE
-- =====================================================

-- Function to soft delete a user account
create or replace function public.soft_delete_user(user_id uuid)
returns boolean as $$
begin
  -- Check if user exists and is not already deleted
  if not exists (
    select 1 from public.users 
    where id = user_id and is_deleted = false
  ) then
    return false;
  end if;
  
  -- Soft delete the user
  update public.users 
  set is_deleted = true, updated_at = now()
  where id = user_id;
  
  -- Mark all sessions as inactive
  update public.sessions 
  set is_current = false, last_active = now()
  where user_id = user_id;
  
  return true;
end;
$$ language plpgsql security definer;

-- Grant execute permission to authenticated users
grant execute on function public.soft_delete_user(uuid) to authenticated;

-- =====================================================
-- 8. ADD FUNCTION FOR EMAIL VERIFICATION STATUS UPDATE
-- =====================================================

-- Function to update email verification status
create or replace function public.update_email_verification_status(user_id uuid, verified boolean)
returns boolean as $$
begin
  -- Check if user exists
  if not exists (
    select 1 from public.users 
    where id = user_id
  ) then
    return false;
  end if;
  
  -- Update email verification status
  update public.users 
  set email_verified = verified, updated_at = now()
  where id = user_id;
  
  return true;
end;
$$ language plpgsql security definer;

-- Grant execute permission to service role (for auth triggers)
grant execute on function public.update_email_verification_status(uuid, boolean) to service_role;

-- =====================================================
-- 9. ADD TRIGGER FOR EMAIL VERIFICATION
-- =====================================================

-- Function to handle email verification updates
create or replace function public.handle_email_verification()
returns trigger as $$
begin
  -- Update email verification status when auth.users.email_confirmed_at changes
  if old.email_confirmed_at is null and new.email_confirmed_at is not null then
    perform public.update_email_verification_status(new.id, true);
  elsif old.email_confirmed_at is not null and new.email_confirmed_at is null then
    perform public.update_email_verification_status(new.id, false);
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for email verification
drop trigger if exists on_email_verification_change on auth.users;
create trigger on_email_verification_change
after update on auth.users
for each row 
when (old.email_confirmed_at is distinct from new.email_confirmed_at)
execute procedure public.handle_email_verification();

-- =====================================================
-- 10. ADD SESSION MANAGEMENT FUNCTIONS
-- =====================================================

-- Function to create or update user session
create or replace function public.upsert_user_session(
  p_user_id uuid,
  p_device_name text default null,
  p_ip_address text default null,
  p_location text default null
)
returns uuid as $$
declare
  session_id uuid;
begin
  -- Mark all existing sessions as inactive
  update public.sessions 
  set is_current = false, last_active = now()
  where user_id = p_user_id;
  
  -- Create new session
  insert into public.sessions (user_id, device_name, ip_address, location, is_current, last_active)
  values (p_user_id, p_device_name, p_ip_address, p_location, true, now())
  returning id into session_id;
  
  return session_id;
end;
$$ language plpgsql security definer;

-- Grant execute permission to authenticated users
grant execute on function public.upsert_user_session(uuid, text, text, text) to authenticated;

-- Function to get user's current session
create or replace function public.get_current_session(p_user_id uuid)
returns table (
  id uuid,
  device_name text,
  ip_address text,
  location text,
  last_active timestamptz
) as $$
begin
  return query
  select s.id, s.device_name, s.ip_address, s.location, s.last_active
  from public.sessions s
  where s.user_id = p_user_id and s.is_current = true;
end;
$$ language plpgsql security definer;

-- Grant execute permission to authenticated users
grant execute on function public.get_current_session(uuid) to authenticated;

-- =====================================================
-- 11. ADD NOTIFICATION MANAGEMENT FUNCTIONS
-- =====================================================

-- Function to mark notification as read
create or replace function public.mark_notification_read(notification_id uuid)
returns boolean as $$
begin
  update public.notifications 
  set is_read = true
  where id = notification_id and user_id = auth.uid();
  
  return found;
end;
$$ language plpgsql security definer;

-- Grant execute permission to authenticated users
grant execute on function public.mark_notification_read(uuid) to authenticated;

-- Function to mark all notifications as read for a user
create or replace function public.mark_all_notifications_read()
returns integer as $$
declare
  updated_count integer;
begin
  update public.notifications 
  set is_read = true
  where user_id = auth.uid() and is_read = false;
  
  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$ language plpgsql security definer;

-- Grant execute permission to authenticated users
grant execute on function public.mark_all_notifications_read() to authenticated;

-- =====================================================
-- 12. ADD PERFORMANCE INDEXES
-- =====================================================

-- Add indexes for better query performance
create index if not exists idx_users_is_deleted on public.users(is_deleted);
create index if not exists idx_users_email_verified on public.users(email_verified);
create index if not exists idx_users_plan_name on public.users(plan);
create index if not exists idx_notifications_user_read on public.notifications(user_id, is_read);
create index if not exists idx_notifications_created_at on public.notifications(created_at);

-- =====================================================
-- 13. ADD COMMENTS FOR DOCUMENTATION
-- =====================================================

-- Add comprehensive comments for all tables and important columns
comment on table public.users is 'User profiles linked to auth.users with preferences, branding, and account management';
comment on table public.sessions is 'User session tracking for security and analytics';
comment on table public.notifications is 'In-app notifications for users';
comment on table public.plans is 'Subscription plans available to users';

comment on column public.users.brand_logo_url is 'URL to user uploaded brand logo';
comment on column public.users.brand_primary_color is 'Primary brand color hex code';
comment on column public.users.brand_secondary_color is 'Secondary brand color hex code';
comment on column public.users.brand_font is 'Brand font family name';
comment on column public.users.integrations is 'Third-party service integrations: {"canva": true, "gamma": false}';
comment on column public.users.usage is 'Usage tracking: {"tasks_generated": 10, "export_count": 2}';

-- =====================================================
-- END OF ENHANCEMENT MIGRATION
-- =====================================================
