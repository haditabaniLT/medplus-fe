# Architecture Guide

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── ui/            # Base UI components (shadcn)
│   ├── auth/          # Authentication components
│   ├── dashboard/     # Dashboard-specific components
│   ├── tasks/         # Task-related components
│   ├── export/        # Export functionality components
│   └── onboarding/    # Onboarding flow components
├── store/             # Redux state management
│   ├── api/           # RTK Query API definitions
│   └── slices/        # Redux slices
├── types/             # TypeScript type definitions
│   ├── index.ts       # Core types
│   ├── task.types.ts  # Task-related types
│   └── export.types.ts # Export-related types
├── utils/             # Helper utilities
│   ├── validation.ts      # Input validation helpers
│   ├── dateFormatter.ts   # Date/time formatting
│   ├── quotaHelpers.ts    # Quota and plan checks
│   └── fileValidation.ts  # File upload validation
├── pages/             # Route pages
└── constants/         # App constants

```

## Helper Utilities

### Validation (`src/utils/validation.ts`)

**Available Functions:**
- `validateEmail(email: string)` - Email format validation
- `isPasswordValid(password: string)` - Password complexity check
- `validateLength(value, min, max)` - Character length validation
- `validateCharacterCount(value, maxChars)` - Character counter with overflow detection
- `validateUsername(username)` - Username format validation
- `validateRequired(value, fieldName)` - Required field validation
- `validateUrl(url)` - URL format validation
- `validatePhone(phone)` - Phone number validation

**Example Usage:**
```typescript
import { validateEmail, validateLength } from '@/utils/validation';

// Email validation
const emailResult = validateEmail(userInput);
if (!emailResult) {
  showError('Invalid email format');
}

// Length validation
const lengthResult = validateLength(taskTitle, 3, 100);
if (!lengthResult.valid) {
  showError(lengthResult.error);
}
```

### Date Formatting (`src/utils/dateFormatter.ts`)

**Available Functions:**
- `formatRelativeDate(date)` - "2 hours ago", "yesterday"
- `formatSmartDate(date)` - Context-aware formatting
- `formatDateTime(date)` - Full date and time
- `formatDate(date)` - Date only
- `formatTime(date)` - Time only
- `formatDateForInput(date)` - YYYY-MM-DD format
- `formatDuration(start, end)` - Human-readable duration
- `isPastDate(date)` / `isFutureDate(date)` - Date comparisons

**Example Usage:**
```typescript
import { formatRelativeDate, formatSmartDate } from '@/utils/dateFormatter';

// Display task creation time
<span>{formatRelativeDate(task.createdAt)}</span>

// Smart date formatting
<time>{formatSmartDate(task.updatedAt)}</time>
```

### Quota Helpers (`src/utils/quotaHelpers.ts`)

**Available Functions:**
- `hasReachedQuota(tasksUsed, userPlan)` - Check if quota exceeded
- `getRemainingQuota(tasksUsed, userPlan)` - Get remaining tasks
- `getQuotaPercentage(tasksUsed, userPlan)` - Calculate usage %
- `canUseFeature(feature, userPlan)` - Check feature availability
- `canExportAs(format, userPlan)` - Check export format access
- `getMaxTaskLength(userPlan)` - Get character limit
- `getQuotaWarning(tasksUsed, userPlan)` - Get warning message
- `formatQuotaDisplay(tasksUsed, userPlan)` - Format "7/10" display

**Example Usage:**
```typescript
import { canUseFeature, hasReachedQuota } from '@/utils/quotaHelpers';

// Check feature access
if (!canUseFeature('richTextEditor', userPlan)) {
  showUpgradePrompt();
  return;
}

// Check quota before action
if (hasReachedQuota(tasksUsed, userPlan)) {
  toast.error('Monthly limit reached');
  return;
}
```

### File Validation (`src/utils/fileValidation.ts`)

**Available Functions:**
- `validateFile(file, options)` - General file validation
- `validateImageFile(file)` - Image-specific validation
- `validateDocumentFile(file)` - Document-specific validation
- `validateAudioFile(file)` - Audio-specific validation
- `formatFileSize(bytes)` - Human-readable file size
- `getFileExtension(filename)` - Extract file extension
- `isImageFile(file)` / `isDocumentFile(file)` / `isAudioFile(file)` - Type checks

**Example Usage:**
```typescript
import { validateImageFile, formatFileSize } from '@/utils/fileValidation';

const handleFileUpload = (file: File) => {
  const result = validateImageFile(file);
  
  if (!result.valid) {
    toast.error(result.error);
    return;
  }
  
  console.log(`Uploading ${formatFileSize(file.size)}`);
  // Proceed with upload
};
```

## Redux State Management

### Store Structure

```typescript
{
  session: SessionState,      // User authentication (persisted)
  theme: ThemeState,          // UI theme (persisted)
  onboarding: OnboardingState, // Onboarding flow (persisted)
  task: TaskState,            // Task management (not persisted)
  ui: UIState,                // UI state (not persisted)
  taskApi: ApiState           // RTK Query cache
}
```

### Redux Slices

#### Session Slice (`src/store/slices/sessionSlice.ts`)
Manages user authentication and session state.

**Actions:**
- `loginSuccess(user)` - Set authenticated user
- `logout()` - Clear session
- `extendSession()` - Extend session timeout
- `updateActivity()` - Track user activity

**Usage:**
```typescript
import { useDispatch } from 'react-redux';
import { loginSuccess, logout } from '@/store/slices/sessionSlice';

dispatch(loginSuccess(userData));
dispatch(logout());
```

#### Task Slice (`src/store/slices/taskSlice.ts`)
Manages task data and operations.

**Actions:**
- `setTasks(tasks)` - Replace all tasks
- `addTask(task)` - Add new task
- `updateTask({ id, updates })` - Update existing task
- `deleteTask(id)` - Remove task
- `toggleTaskSelection(id)` - Toggle task selection
- `setFilters(filters)` - Update filters
- `togglePinTask(id)` - Pin/unpin task

**Usage:**
```typescript
import { useDispatch, useSelector } from 'react-redux';
import { addTask, deleteTask } from '@/store/slices/taskSlice';

const tasks = useSelector(state => state.task.tasks);
dispatch(addTask(newTask));
dispatch(deleteTask(taskId));
```

#### UI Slice (`src/store/slices/uiSlice.ts`)
Manages UI state like modals and notifications.

**Actions:**
- `toggleSidebar()` / `setSidebarOpen(boolean)`
- `showExportModal()` / `hideExportModal()`
- `showUpgradeModal()` / `hideUpgradeModal()`
- `addNotification(notification)` - Add toast notification
- `removeNotification(id)` - Remove notification

**Usage:**
```typescript
import { useDispatch } from 'react-redux';
import { showExportModal, addNotification } from '@/store/slices/uiSlice';

dispatch(showExportModal());
dispatch(addNotification({
  type: 'success',
  title: 'Success',
  message: 'Task created!',
}));
```

### RTK Query API (`src/store/api/taskApi.ts`)

Mock API for task operations using RTK Query.

**Available Hooks:**
- `useGenerateTaskMutation()` - Generate task from input
- `useGetTasksQuery()` - Fetch all tasks
- `useGetTaskQuery(id)` - Fetch single task
- `useExportTaskMutation()` - Export task
- `useSuggestTasksMutation()` - Get task suggestions

**Usage:**
```typescript
import { useGenerateTaskMutation } from '@/store/api/taskApi';

const [generateTask, { isLoading, error }] = useGenerateTaskMutation();

const handleGenerate = async () => {
  const result = await generateTask({
    text: inputText,
    category: selectedCategory,
    tone: 'professional',
    language: 'English',
  });
  
  if (result.data) {
    // Handle success
  }
};
```

## Type Definitions

### Core Types (`src/types/index.ts`)
- `User` - User account data
- `SessionState` - Authentication state
- `ThemeState` - UI theme state
- Component prop types (ButtonProps, CardProps, etc.)

### Task Types (`src/types/task.types.ts`)
- `Task` - Task data structure
- `TaskGenerationInput` - Task generation request
- `TaskGenerationOutput` - Task generation response
- `TaskFilters` - Task filtering options
- `TaskCategory` - Task category enum

### Export Types (`src/types/export.types.ts`)
- `ExportFormat` - Export format enum
- `PdfExportOptions` - PDF export configuration
- `CanvaExportOptions` - Canva export configuration
- `GammaExportOptions` - Gamma export configuration

## Best Practices

### 1. Always Use Helper Functions
```typescript
// ❌ Don't duplicate validation logic
if (email.includes('@') && email.includes('.')) { ... }

// ✅ Use validation helpers
import { validateEmail } from '@/utils/validation';
if (validateEmail(email)) { ... }
```

### 2. Use Typed Props
```typescript
// ❌ Don't use inline types
const MyComponent = ({ title, onClick }: { title: string; onClick: () => void }) => ...

// ✅ Import from types
import { ButtonProps } from '@/types';
const MyComponent = (props: ButtonProps) => ...
```

### 3. Use Redux Slices for Shared State
```typescript
// ❌ Don't use local state for app-wide data
const [tasks, setTasks] = useState([]);

// ✅ Use Redux for shared state
import { useSelector } from 'react-redux';
const tasks = useSelector(state => state.task.tasks);
```

### 4. Use RTK Query for API Calls
```typescript
// ❌ Don't use fetch directly with loading states
const [loading, setLoading] = useState(false);
const generateTask = async () => {
  setLoading(true);
  const response = await fetch(...);
  setLoading(false);
};

// ✅ Use RTK Query hooks
const [generateTask, { isLoading }] = useGenerateTaskMutation();
```

### 5. Format Dates Consistently
```typescript
// ❌ Don't use inconsistent date formatting
<span>{new Date(task.createdAt).toLocaleDateString()}</span>

// ✅ Use date formatting helpers
import { formatSmartDate } from '@/utils/dateFormatter';
<span>{formatSmartDate(task.createdAt)}</span>
```

### 6. Check Quotas Before Actions
```typescript
// ❌ Don't let users exceed quotas
const handleCreateTask = () => {
  createTask(taskData);
};

// ✅ Check quotas first
import { hasReachedQuota } from '@/utils/quotaHelpers';
const handleCreateTask = () => {
  if (hasReachedQuota(tasksUsed, userPlan)) {
    showUpgradePrompt();
    return;
  }
  createTask(taskData);
};
```

## Testing Guidelines

### Testing Helpers
```typescript
import { validateEmail, formatFileSize } from '@/utils/validation';

describe('Validation helpers', () => {
  it('should validate email correctly', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('invalid')).toBe(false);
  });
});
```

### Testing Redux Slices
```typescript
import taskReducer, { addTask } from '@/store/slices/taskSlice';

describe('Task slice', () => {
  it('should add task', () => {
    const state = taskReducer(undefined, addTask(mockTask));
    expect(state.tasks).toHaveLength(1);
  });
});
```
