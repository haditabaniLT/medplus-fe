import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TaskService, TaskFilters, TaskSortOptions } from '../../services/taskService';

// Simplified Task interface for Redux state
export interface Task {
  id: string;
  user_id: string;
  category: string;
  title: string;
  content: string;
  tags: string[];
  status: 'active' | 'archived' | 'deleted';
  type: 'generated' | 'custom';
  is_favorite: boolean;
  is_shared: boolean;
  shared_link: string | null;
  metadata: any; // Simplified to avoid deep type issues
  created_at: string;
  updated_at: string;
}

export interface TaskInsert {
  id?: string;
  user_id: string;
  category: string;
  title: string;
  content: string;
  tags?: string[];
  status?: 'active' | 'archived' | 'deleted';
  type?: 'generated' | 'custom';
  is_favorite?: boolean;
  is_shared?: boolean;
  shared_link?: string | null;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

export interface TaskUpdate {
  id?: string;
  user_id?: string;
  category?: string;
  title?: string;
  content?: string;
  tags?: string[];
  status?: 'active' | 'archived' | 'deleted';
  type?: 'generated' | 'custom';
  is_favorite?: boolean;
  is_shared?: boolean;
  shared_link?: string | null;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

export interface TaskStats {
  total: number;
  active: number;
  archived: number;
  deleted: number;
  favorites: number;
  generated: number;
  custom: number;
}

export interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  stats: TaskStats | null;
  filters: TaskFilters;
  sort: TaskSortOptions;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  loading: {
    tasks: boolean;
    currentTask: boolean;
    stats: boolean;
    saving: boolean;
    deleting: boolean;
  };
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  currentTask: null,
  stats: null,
  filters: {},
  sort: { field: 'created_at', order: 'desc' },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },
  loading: {
    tasks: false,
    currentTask: false,
    stats: false,
    saving: false,
    deleting: false,
  },
  error: null,
};

// Async thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params: { userId: string; filters?: TaskFilters; sort?: TaskSortOptions; page?: number; limit?: number }) => {
    const { userId, filters, sort, page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;
    
    const result = await TaskService.getUserTasks(userId, filters, sort, limit, offset);
    return { ...result, page, limit };
  }
);

export const fetchTask = createAsyncThunk(
  'tasks/fetchTask',
  async (taskId: string) => {
    const task = await TaskService.getTask(taskId);
    if (!task) {
      throw new Error('Task not found');
    }
    return task;
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (params: { userId: string; taskData: Omit<TaskInsert, 'user_id'> }) => {
    const { userId, taskData } = params;
    const task = await TaskService.createTask(userId, taskData);
    if (!task) {
      throw new Error('Failed to create task');
    }
    return task;
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async (params: { taskId: string; updates: TaskUpdate }) => {
    const { taskId, updates } = params;
    const task = await TaskService.updateTask(taskId, updates);
    if (!task) {
      throw new Error('Failed to update task');
    }
    return task;
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId: string) => {
    const success = await TaskService.deleteTask(taskId);
    if (!success) {
      throw new Error('Failed to delete task');
    }
    return taskId;
  }
);

export const permanentlyDeleteTask = createAsyncThunk(
  'tasks/permanentlyDeleteTask',
  async (taskId: string) => {
    const success = await TaskService.permanentlyDeleteTask(taskId);
    if (!success) {
      throw new Error('Failed to permanently delete task');
    }
    return taskId;
  }
);

export const toggleFavorite = createAsyncThunk(
  'tasks/toggleFavorite',
  async (taskId: string) => {
    const task = await TaskService.toggleFavorite(taskId);
    if (!task) {
      throw new Error('Failed to toggle favorite');
    }
    return task;
  }
);

export const archiveTask = createAsyncThunk(
  'tasks/archiveTask',
  async (taskId: string) => {
    const task = await TaskService.archiveTask(taskId);
    if (!task) {
      throw new Error('Failed to archive task');
    }
    return task;
  }
);

export const restoreTask = createAsyncThunk(
  'tasks/restoreTask',
  async (taskId: string) => {
    const task = await TaskService.restoreTask(taskId);
    if (!task) {
      throw new Error('Failed to restore task');
    }
    return task;
  }
);

export const fetchTaskStats = createAsyncThunk(
  'tasks/fetchTaskStats',
  async (userId: string) => {
    const stats = await TaskService.getTaskStats(userId);
    return stats;
  }
);

export const searchTasks = createAsyncThunk(
  'tasks/searchTasks',
  async (params: { userId: string; searchTerm: string }) => {
    const { userId, searchTerm } = params;
    const tasks = await TaskService.searchTasks(userId, searchTerm);
    return tasks;
  }
);

export const getRecentTasks = createAsyncThunk(
  'tasks/getRecentTasks',
  async (params: { userId: string; limit?: number }) => {
    const { userId, limit = 10 } = params;
    const tasks = await TaskService.getRecentTasks(userId, limit);
    return tasks;
  }
);

export const getFavoriteTasks = createAsyncThunk(
  'tasks/getFavoriteTasks',
  async (userId: string) => {
    const tasks = await TaskService.getFavoriteTasks(userId);
    return tasks;
  }
);

export const getTasksByCategory = createAsyncThunk(
  'tasks/getTasksByCategory',
  async (params: { userId: string; category: string }) => {
    const { userId, category } = params;
    const tasks = await TaskService.getTasksByCategory(userId, category);
    return tasks;
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    
    setFilters: (state, action: PayloadAction<TaskFilters>) => {
      state.filters = action.payload;
      state.pagination.page = 1; // Reset to first page when filters change
    },
    
    setSort: (state, action: PayloadAction<TaskSortOptions>) => {
      state.sort = action.payload;
    },
    
    setPagination: (state, action: PayloadAction<{ page: number; limit: number }>) => {
      state.pagination.page = action.payload.page;
      state.pagination.limit = action.payload.limit;
    },
    
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
    
    clearTasks: (state) => {
      state.tasks = [];
      state.pagination.total = 0;
      state.pagination.page = 1;
    },
    
    resetTaskState: (state) => {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading.tasks = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading.tasks = false;
        state.tasks = action.payload.tasks;
        state.pagination.total = action.payload.total;
        state.pagination.page = action.payload.page;
        state.pagination.limit = action.payload.limit;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading.tasks = false;
        state.error = action.payload as string;
      })
      
      // Fetch single task
      .addCase(fetchTask.pending, (state) => {
        state.loading.currentTask = true;
        state.error = null;
      })
      .addCase(fetchTask.fulfilled, (state, action) => {
        state.loading.currentTask = false;
        state.currentTask = action.payload;
      })
      .addCase(fetchTask.rejected, (state, action) => {
        state.loading.currentTask = false;
        state.error = action.payload as string;
      })
      
      // Create task
      .addCase(createTask.pending, (state) => {
        state.loading.saving = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading.saving = false;
        state.tasks.unshift(action.payload); // Add to beginning of list
        state.pagination.total += 1;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading.saving = false;
        state.error = action.payload as string;
      })
      
      // Update task
      .addCase(updateTask.pending, (state) => {
        state.loading.saving = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading.saving = false;
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?.id === action.payload.id) {
          state.currentTask = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading.saving = false;
        state.error = action.payload as string;
      })
      
      // Delete task
      .addCase(deleteTask.pending, (state) => {
        state.loading.deleting = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading.deleting = false;
        state.tasks = state.tasks.filter(task => task.id !== action.payload);
        state.pagination.total -= 1;
        if (state.currentTask?.id === action.payload) {
          state.currentTask = null;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading.deleting = false;
        state.error = action.payload as string;
      })
      
      // Permanently delete task
      .addCase(permanentlyDeleteTask.pending, (state) => {
        state.loading.deleting = true;
        state.error = null;
      })
      .addCase(permanentlyDeleteTask.fulfilled, (state, action) => {
        state.loading.deleting = false;
        state.tasks = state.tasks.filter(task => task.id !== action.payload);
        state.pagination.total -= 1;
        if (state.currentTask?.id === action.payload) {
          state.currentTask = null;
        }
      })
      .addCase(permanentlyDeleteTask.rejected, (state, action) => {
        state.loading.deleting = false;
        state.error = action.payload as string;
      })
      
      // Toggle favorite
      .addCase(toggleFavorite.pending, (state) => {
        state.loading.saving = true;
        state.error = null;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        state.loading.saving = false;
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?.id === action.payload.id) {
          state.currentTask = action.payload;
        }
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.loading.saving = false;
        state.error = action.payload as string;
      })
      
      // Archive task
      .addCase(archiveTask.pending, (state) => {
        state.loading.saving = true;
        state.error = null;
      })
      .addCase(archiveTask.fulfilled, (state, action) => {
        state.loading.saving = false;
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?.id === action.payload.id) {
          state.currentTask = action.payload;
        }
      })
      .addCase(archiveTask.rejected, (state, action) => {
        state.loading.saving = false;
        state.error = action.payload as string;
      })
      
      // Restore task
      .addCase(restoreTask.pending, (state) => {
        state.loading.saving = true;
        state.error = null;
      })
      .addCase(restoreTask.fulfilled, (state, action) => {
        state.loading.saving = false;
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?.id === action.payload.id) {
          state.currentTask = action.payload;
        }
      })
      .addCase(restoreTask.rejected, (state, action) => {
        state.loading.saving = false;
        state.error = action.payload as string;
      })
      
      // Fetch task stats
      .addCase(fetchTaskStats.pending, (state) => {
        state.loading.stats = true;
        state.error = null;
      })
      .addCase(fetchTaskStats.fulfilled, (state, action) => {
        state.loading.stats = false;
        state.stats = action.payload;
      })
      .addCase(fetchTaskStats.rejected, (state, action) => {
        state.loading.stats = false;
        state.error = action.payload as string;
      })
      
      // Search tasks
      .addCase(searchTasks.pending, (state) => {
        state.loading.tasks = true;
        state.error = null;
      })
      .addCase(searchTasks.fulfilled, (state, action) => {
        state.loading.tasks = false;
        state.tasks = action.payload;
        state.pagination.total = action.payload.length;
      })
      .addCase(searchTasks.rejected, (state, action) => {
        state.loading.tasks = false;
        state.error = action.payload as string;
      })
      
      // Get recent tasks
      .addCase(getRecentTasks.pending, (state) => {
        state.loading.tasks = true;
        state.error = null;
      })
      .addCase(getRecentTasks.fulfilled, (state, action) => {
        state.loading.tasks = false;
        state.tasks = action.payload;
        state.pagination.total = action.payload.length;
      })
      .addCase(getRecentTasks.rejected, (state, action) => {
        state.loading.tasks = false;
        state.error = action.payload as string;
      })
      
      // Get favorite tasks
      .addCase(getFavoriteTasks.pending, (state) => {
        state.loading.tasks = true;
        state.error = null;
      })
      .addCase(getFavoriteTasks.fulfilled, (state, action) => {
        state.loading.tasks = false;
        state.tasks = action.payload;
        state.pagination.total = action.payload.length;
      })
      .addCase(getFavoriteTasks.rejected, (state, action) => {
        state.loading.tasks = false;
        state.error = action.payload as string;
      })
      
      // Get tasks by category
      .addCase(getTasksByCategory.pending, (state) => {
        state.loading.tasks = true;
        state.error = null;
      })
      .addCase(getTasksByCategory.fulfilled, (state, action) => {
        state.loading.tasks = false;
        state.tasks = action.payload;
        state.pagination.total = action.payload.length;
      })
      .addCase(getTasksByCategory.rejected, (state, action) => {
        state.loading.tasks = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setFilters,
  setSort,
  setPagination,
  clearCurrentTask,
  clearTasks,
  resetTaskState,
} = taskSlice.actions;

export default taskSlice.reducer;