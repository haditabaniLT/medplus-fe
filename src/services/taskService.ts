import { supabase } from '../supabase/supabaseClient';
import { Database } from '../types/database.types';

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

export interface TaskFilters {
  category?: string;
  status?: 'active' | 'archived' | 'deleted';
  type?: 'generated' | 'custom';
  is_favorite?: boolean;
  is_shared?: boolean;
  tags?: string[];
  search?: string;
}

export interface TaskSortOptions {
  field: 'created_at' | 'updated_at' | 'title' | 'category';
  order: 'asc' | 'desc';
}

export class TaskService {
  /**
   * Create a new task
   */
  static async createTask(userId: string, taskData: Omit<TaskInsert, 'user_id'>): Promise<Task | null> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  /**
   * Get tasks for a user with filtering and sorting
   */
  static async getUserTasks(
    userId: string,
    filters: TaskFilters = {},
    sort: TaskSortOptions = { field: 'created_at', order: 'desc' },
    limit?: number,
    offset?: number
  ): Promise<{ tasks: Task[]; total: number }> {
    try {
      let query = supabase
        .from('tasks')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.is_favorite !== undefined) {
        query = query.eq('is_favorite', filters.is_favorite);
      }
      if (filters.is_shared !== undefined) {
        query = query.eq('is_shared', filters.is_shared);
      }
      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }

      // Apply sorting
      query = query.order(sort.field, { ascending: sort.order === 'asc' });

      // Apply pagination
      if (limit) {
        query = query.limit(limit);
      }
      if (offset) {
        query = query.range(offset, offset + (limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      return { tasks: data || [], total: count || 0 };
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      throw error;
    }
  }

  /**
   * Get a single task by ID
   */
  static async getTask(taskId: string): Promise<Task | null> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  }

  /**
   * Update a task
   */
  static async updateTask(taskId: string, updates: TaskUpdate): Promise<Task | null> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  /**
   * Delete a task (soft delete by setting status to 'deleted')
   */
  static async deleteTask(taskId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'deleted',
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  /**
   * Permanently delete a task from database
   */
  static async permanentlyDeleteTask(taskId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error permanently deleting task:', error);
      throw error;
    }
  }

  /**
   * Toggle favorite status of a task
   */
  static async toggleFavorite(taskId: string): Promise<Task | null> {
    try {
      // First get the current task to toggle the favorite status
      const task = await this.getTask(taskId);
      if (!task) throw new Error('Task not found');

      const { data, error } = await supabase
        .from('tasks')
        .update({ 
          is_favorite: !task.is_favorite,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }

  /**
   * Archive a task
   */
  static async archiveTask(taskId: string): Promise<Task | null> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ 
          status: 'archived',
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error archiving task:', error);
      throw error;
    }
  }

  /**
   * Restore a task from archived/deleted status
   */
  static async restoreTask(taskId: string): Promise<Task | null> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ 
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error restoring task:', error);
      throw error;
    }
  }

  /**
   * Get task statistics for a user
   */
  static async getTaskStats(userId: string): Promise<{
    total: number;
    active: number;
    archived: number;
    deleted: number;
    favorites: number;
    generated: number;
    custom: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('status, type, is_favorite')
        .eq('user_id', userId);

      if (error) throw error;

      const stats = {
        total: data.length,
        active: data.filter(t => t.status === 'active').length,
        archived: data.filter(t => t.status === 'archived').length,
        deleted: data.filter(t => t.status === 'deleted').length,
        favorites: data.filter(t => t.is_favorite).length,
        generated: data.filter(t => t.type === 'generated').length,
        custom: data.filter(t => t.type === 'custom').length,
      };

      return stats;
    } catch (error) {
      console.error('Error fetching task stats:', error);
      throw error;
    }
  }

  /**
   * Get tasks by category
   */
  static async getTasksByCategory(userId: string, category: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('category', category)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tasks by category:', error);
      throw error;
    }
  }

  /**
   * Search tasks by title or content
   */
  static async searchTasks(userId: string, searchTerm: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching tasks:', error);
      throw error;
    }
  }

  /**
   * Get recent tasks for a user
   */
  static async getRecentTasks(userId: string, limit: number = 10): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recent tasks:', error);
      throw error;
    }
  }

  /**
   * Get favorite tasks for a user
   */
  static async getFavoriteTasks(userId: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('is_favorite', true)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching favorite tasks:', error);
      throw error;
    }
  }
}
