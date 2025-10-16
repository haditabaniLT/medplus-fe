/**
 * Task-related types
 */

export interface Task {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  tags?: string[];
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'active' | 'archived' | 'deleted';
  type?: 'generated' | 'custom';
  is_shared?: boolean;
  shared_link?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TaskVersion {
  id: string;
  timestamp: string;
  label: string;
  content: string;
}

// API Request/Response Types
export interface CreateTaskRequest {
  category: string;
  title: string;
  content: string;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  tags?: string[];
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  type?: 'generated' | 'custom';
  is_shared?: boolean;
  shared_link?: string;
  metadata?: Record<string, any>;
}

export interface UpdateTaskRequest {
  title?: string;
  content?: string;
  category?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'active' | 'archived' | 'deleted';
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  tags?: string[];
  favorite?: boolean; // API uses 'favorite' instead of 'is_favorite'
}

export interface GetTasksQueryParams {
  category?: string;
  status?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  priority?: 'low' | 'medium' | 'high';
  isFavorite?: boolean;
  sortBy?: 'created_at' | 'updated_at' | 'title' | 'category' | 'priority' | 'due_date';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface GetTasksResponse {
  tasks: Task[];
  total: number;
  hasMore: boolean;
}

export interface UsageResponse {
  plan: string;
  usage: {
    tasks_generated: number;
    export_count: number;
  };
  limits: {
    tasks_generated: number;
    export_limit: number;
  };
}

// User Favorites Types
export interface UserFavorite {
  id: string;
  user_id: string;
  task_id: string;
  created_at: string;
  updated_at: string;
}

export interface TaskWithFavorite extends Task {
  is_favorited?: boolean;
}

// Legacy types for backward compatibility
export interface TaskGenerationInput {
  text?: string;
  voiceTranscript?: string;
  category: string;
  tone: 'neutral' | 'professional' | 'friendly' | 'concise';
  language: string;
  improvePrompt?: boolean;
}

export interface TaskGenerationOutput {
  title: string;
  category: string;
  summary: string;
  steps: string[];
  metadata: {
    keywords: string[];
    goals: string[];
  };
  content: string;
}

export interface TaskFilters {
  searchQuery: string;
  categories: string[];
  dateRange: {
    from?: Date;
    to?: Date;
  };
  sortBy: 'newest' | 'oldest' | 'category';
}

export interface TaskListState {
  tasks: Task[];
  filteredTasks: Task[];
  selectedTasks: Set<string>;
  isLoading: boolean;
  hasMore: boolean;
  page: number;
  filters: TaskFilters;
}

import { CATEGORIES } from '../constants/categories';

export type TaskCategory = typeof CATEGORIES[number];

export interface TaskCardProps {
  task: Task;
  isSelected: boolean;
  onToggleSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onPin: () => void;
  onExport?: () => void;
}
