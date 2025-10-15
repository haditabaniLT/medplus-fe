# MePlus.ai Supabase Schema Documentation

## Overview
This document describes the enhanced Supabase database schema for the MePlus.ai project, including all tables, relationships, functions, and security policies.

## Database Schema

### Tables

#### 1. `public.users`
Main user profile table linked to Supabase Auth.

**Columns:**
- `id` (uuid, PK, FK to auth.users)
- `full_name` (text, required)
- `email` (text, unique, required)
- `avatar_url` (text, nullable)
- `bio` (text, nullable)
- `role` (text, default: 'User')
- `plan` (text, default: 'BASE', FK to plans.name)
- `onboarding` (boolean, default: false)
- `goals` (jsonb, default: [])
- `industry` (text, nullable)
- `seniority` (text, nullable)
- `brand_logo_url` (text, nullable) - User's brand logo URL
- `brand_primary_color` (text, nullable) - Primary brand color hex
- `brand_secondary_color` (text, nullable) - Secondary brand color hex
- `brand_font` (text, nullable) - Brand font family
- `preferences` (jsonb, default: {}) - User preferences
- `integrations` (jsonb, default: {}) - Third-party integrations
- `usage` (jsonb, default: {}) - Usage tracking
- `is_deleted` (boolean, default: false) - Soft delete flag
- `email_verified` (boolean, default: false) - Email verification status
- `created_at` (timestamptz, default: now())
- `updated_at` (timestamptz, default: now())

**Preferences JSON Structure:**
```json
{
  "theme": "dark",
  "language": "en",
  "timezone": "Asia/Karachi",
  "notifications": {
    "inApp": true,
    "email": true
  }
}
```

**Integrations JSON Structure:**
```json
{
  "canva": true,
  "gamma": false
}
```

**Usage JSON Structure:**
```json
{
  "tasks_generated": 10,
  "export_count": 2
}
```

#### 2. `public.sessions`
User session tracking for security and analytics.

**Columns:**
- `id` (uuid, PK)
- `user_id` (uuid, FK to auth.users)
- `device_name` (text, nullable)
- `ip_address` (text, nullable)
- `location` (text, nullable)
- `last_active` (timestamptz, default: now())
- `is_current` (boolean, default: false)

#### 3. `public.notifications`
In-app notifications for users.

**Columns:**
- `id` (uuid, PK)
- `user_id` (uuid, FK to auth.users)
- `title` (text, required)
- `body` (text, nullable)
- `is_read` (boolean, default: false)
- `created_at` (timestamptz, default: now())

#### 4. `public.plans`
Subscription plans available to users.

**Columns:**
- `id` (uuid, PK)
- `name` (text, unique, required)
- `price` (numeric(10,2), required)
- `description` (text, nullable)
- `features` (text[], required)
- `task_limit` (integer, required)
- `export_limit` (integer, required)
- `created_at` (timestamptz, default: now())

**Default Plans:**
- **BASE**: Free plan with limited features (100 tasks, 10 exports)
- **PRO**: Pro plan with all features (1000 tasks, 100 exports)

## Functions

### User Management
- `soft_delete_user(user_id uuid)` - Soft delete user account
- `update_email_verification_status(user_id uuid, verified boolean)` - Update email verification

### Session Management
- `upsert_user_session(p_user_id uuid, p_device_name text, p_ip_address text, p_location text)` - Create/update session
- `get_current_session(p_user_id uuid)` - Get user's current session

### Notification Management
- `mark_notification_read(notification_id uuid)` - Mark notification as read
- `mark_all_notifications_read()` - Mark all user notifications as read

## Triggers

### 1. `on_auth_user_created`
Automatically creates a user profile when a new auth user signs up.

### 2. `on_email_verification_change`
Updates email verification status when auth.users.email_confirmed_at changes.

### 3. `update_users_updated_at`
Automatically updates the updated_at timestamp on user profile changes.

## Row Level Security (RLS)

### Users Table
- Users can view their own non-deleted profile
- Users can update their own non-deleted profile
- Users can insert their own profile (via trigger)

### Sessions Table
- Users can view their own sessions
- Users can modify their own sessions

### Notifications Table
- Users can view their own notifications
- Users can insert notifications for themselves
- Users can update their own notifications

### Plans Table
- All authenticated users can view plans
- Only service role can modify plans

## Indexes

### Performance Indexes
- `idx_users_email` - Email lookup
- `idx_users_plan` - Plan filtering
- `idx_users_is_deleted` - Soft delete filtering
- `idx_users_email_verified` - Email verification filtering
- `idx_notifications_user_id` - User notifications
- `idx_notifications_user_read` - Read status filtering
- `idx_sessions_user_id` - User sessions
- `idx_sessions_user_id_active` - Active sessions
- `idx_sessions_last_active` - Session activity

## Migration Commands

### Apply Schema Migration
```bash
# Apply the enhancement migration
supabase db push

# Or apply specific migration
supabase migration up --include-all
```

### Generate TypeScript Types
```bash
# Generate types from current schema
supabase gen types typescript --project-id <your-project-id> > src/types/database.types.ts

# Or if using local development
supabase gen types typescript --local > src/types/database.types.ts
```

### Reset Database (Development Only)
```bash
# Reset local database
supabase db reset

# Reset with seed data
supabase db reset --with-seed
```

## Service Layer Integration

The enhanced Supabase client (`src/supabase/supabaseClient.ts`) provides:

### User Services
- Profile management (CRUD operations)
- Preferences management
- Brand settings management
- Account soft deletion

### Session Services
- Session creation/updates
- Current session retrieval
- Session termination
- User session history

### Notification Services
- Notification CRUD operations
- Read status management
- Unread count tracking
- Bulk operations

### Plan Services
- Plan retrieval
- User plan updates
- Plan feature access

### Utility Functions
- User activity checks
- Email verification status
- Usage tracking
- Realtime subscriptions

## Security Considerations

1. **RLS Policies**: All tables have appropriate RLS policies ensuring users can only access their own data
2. **Soft Deletes**: User accounts are soft-deleted to maintain data integrity
3. **Session Management**: Comprehensive session tracking for security
4. **Email Verification**: Automatic email verification status updates
5. **Foreign Key Constraints**: Proper referential integrity with plans table

## Usage Examples

### Creating a User Session
```typescript
import { sessionService } from '@/supabase/supabaseClient';

const sessionId = await sessionService.upsertSession(
  userId,
  'Chrome on MacOS',
  '192.168.1.1',
  'New York, NY'
);
```

### Updating User Preferences
```typescript
import { userService } from '@/supabase/supabaseClient';

await userService.updatePreferences(userId, {
  theme: 'dark',
  language: 'en',
  timezone: 'America/New_York',
  notifications: {
    inApp: true,
    email: false
  }
});
```

### Managing Notifications
```typescript
import { notificationService } from '@/supabase/supabaseClient';

// Get notifications
const notifications = await notificationService.getNotifications(userId);

// Mark as read
await notificationService.markAsRead(notificationId);

// Mark all as read
const updatedCount = await notificationService.markAllAsRead();
```

## Next Steps

1. Apply the migration to your Supabase project
2. Generate TypeScript types using the provided command
3. Update your frontend components to use the new service layer
4. Test all CRUD operations with the new schema
5. Implement realtime subscriptions for live updates
