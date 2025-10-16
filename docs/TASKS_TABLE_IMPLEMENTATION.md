# Tasks Table Implementation

## Overview
This document describes the implementation of the `tasks` table in the MePlus.ai Supabase database, including the table schema, RLS policies, indexes, triggers, and TypeScript integration.

## Database Schema

### Table: `public.tasks`

```sql
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
```

### Column Descriptions

- **`id`**: Primary key, auto-generated UUID
- **`user_id`**: Foreign key to `auth.users(id)`, cascade delete
- **`category`**: Task category (e.g., "Decision Mastery", "Business Driver")
- **`title`**: Task title
- **`content`**: Task content/description
- **`tags`**: Array of custom tags for filtering
- **`status`**: Task status - `'active'`, `'archived'`, or `'deleted'`
- **`type`**: Task type - `'generated'` (by AI) or `'custom'` (user input)
- **`is_favorite`**: Whether the task is marked as favorite
- **`is_shared`**: Whether the task is shared publicly
- **`shared_link`**: Optional public sharing link
- **`metadata`**: Additional metadata (source, sentiment, etc.)
- **`created_at`**: Creation timestamp
- **`updated_at`**: Last update timestamp

## Indexes

### Performance Indexes

```sql
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
```

## Row Level Security (RLS)

### Policies

```sql
-- Enable RLS
alter table public.tasks enable row level security;

-- Users can view their own tasks
create policy "Users can view their own tasks"
on public.tasks for select
using (auth.uid() = user_id);

-- Users can insert their own tasks
create policy "Users can insert their own tasks"
on public.tasks for insert
with check (auth.uid() = user_id);

-- Users can update their own tasks
create policy "Users can update their own tasks"
on public.tasks for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Users can delete their own tasks
create policy "Users can delete their own tasks"
on public.tasks for delete
using (auth.uid() = user_id);
```

## Triggers

### Auto-update Timestamps

```sql
create trigger update_tasks_updated_at
before update on public.tasks
for each row
execute procedure moddatetime(updated_at);
```

### Usage Tracking

```sql
-- Function to update task usage counter
create or replace function public.update_task_usage()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update public.users set usage = jsonb_set(
      coalesce(usage, '{}'::jsonb),
      '{tasks_generated}',
      to_jsonb(coalesce((usage->>'tasks_generated')::int, 0) + 1)
    )
    where id = new.user_id;
  elsif (tg_op = 'DELETE') then
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

-- Trigger to update usage on task changes
create trigger on_task_change
after insert or delete on public.tasks
for each row
execute procedure public.update_task_usage();
```

## TypeScript Integration

### Database Types

The `src/types/database.types.ts` file includes complete TypeScript definitions for the tasks table:

```typescript
tasks: {
  Row: {
    id: string
    user_id: string
    category: string
    title: string
    content: string
    tags: string[]
    status: 'active' | 'archived' | 'deleted'
    type: 'generated' | 'custom'
    is_favorite: boolean
    is_shared: boolean
    shared_link: string | null
    metadata: Json
    created_at: string
    updated_at: string
  }
  Insert: { /* ... */ }
  Update: { /* ... */ }
  Relationships: [/* ... */]
}
```

### Service Layer

The `src/services/taskService.ts` provides a comprehensive API for task operations:

- **CRUD Operations**: `createTask`, `getTask`, `updateTask`, `deleteTask`
- **Filtering & Sorting**: `getUserTasks` with filters and sort options
- **Special Operations**: `toggleFavorite`, `archiveTask`, `restoreTask`
- **Analytics**: `getTaskStats`, `getRecentTasks`, `getFavoriteTasks`
- **Search**: `searchTasks`, `getTasksByCategory`

### Redux Integration

The `src/store/slices/taskSlice.ts` manages task state with:

- **State Management**: Tasks list, current task, filters, pagination
- **Async Thunks**: All service operations wrapped as Redux actions
- **Loading States**: Separate loading states for different operations
- **Error Handling**: Centralized error management

## Usage Examples

### Creating a Task

```typescript
import { useDispatch } from 'react-redux';
import { createTask } from '../store/slices/taskSlice';

const dispatch = useDispatch();

const newTask = await dispatch(createTask({
  userId: 'user-id',
  taskData: {
    category: 'Decision Mastery',
    title: 'Choose tech stack',
    content: 'Evaluate React vs Vue for the new project',
    tags: ['technology', 'decision'],
    type: 'generated'
  }
}));
```

### Fetching Tasks with Filters

```typescript
import { fetchTasks, setFilters } from '../store/slices/taskSlice';

// Set filters
dispatch(setFilters({
  category: 'Decision Mastery',
  status: 'active',
  is_favorite: true
}));

// Fetch tasks
dispatch(fetchTasks({
  userId: 'user-id',
  filters: { category: 'Decision Mastery' },
  sort: { field: 'created_at', order: 'desc' },
  page: 1,
  limit: 20
}));
```

### Task Operations

```typescript
// Toggle favorite
dispatch(toggleFavorite('task-id'));

// Archive task
dispatch(archiveTask('task-id'));

// Delete task (soft delete)
dispatch(deleteTask('task-id'));

// Get task statistics
dispatch(fetchTaskStats('user-id'));
```

## Migration File

The complete migration is available in:
`supabase/migrations/20250115000001_create_tasks_table.sql`

## Features Supported

✅ **Complete CRUD Operations**
✅ **Advanced Filtering** (category, status, type, favorites, tags)
✅ **Sorting** (by date, title, category)
✅ **Search** (title and content)
✅ **Pagination** (with configurable page size)
✅ **Soft Delete** (status-based deletion)
✅ **Favorites Management**
✅ **Archiving/Restoration**
✅ **Usage Tracking** (automatic counter updates)
✅ **Row Level Security** (user isolation)
✅ **Performance Optimized** (comprehensive indexing)
✅ **TypeScript Support** (full type safety)
✅ **Redux Integration** (state management)

## Next Steps

1. **Apply Migration**: Run the migration in your Supabase project
2. **Test Operations**: Verify all CRUD operations work correctly
3. **UI Integration**: Connect the Redux slice to your task management UI
4. **Performance Testing**: Test with large datasets to ensure indexes work
5. **Real-time Updates**: Consider adding Supabase real-time subscriptions for live updates

## Security Considerations

- **RLS Enabled**: All operations are secured by Row Level Security
- **User Isolation**: Users can only access their own tasks
- **Input Validation**: Consider adding server-side validation for task content
- **Rate Limiting**: Implement rate limiting for task creation to prevent abuse
- **Content Moderation**: Consider adding content moderation for shared tasks






