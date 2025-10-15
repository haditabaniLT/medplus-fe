import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// =====================================================
// ENHANCED SUPABASE SERVICE LAYER
// =====================================================

// =====================================================
// USER MANAGEMENT SERVICES
// =====================================================

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  role: string;
  plan: string;
  onboarding: boolean;
  goals: any[];
  industry?: string;
  seniority?: string;
  brand_logo_url?: string;
  brand_primary_color?: string;
  brand_secondary_color?: string;
  brand_font?: string;
  preferences: {
    theme?: string;
    language?: string;
    timezone?: string;
    notifications?: {
      inApp?: boolean;
      email?: boolean;
    };
  };
  integrations: {
    canva?: boolean;
    gamma?: boolean;
  };
  usage: {
    tasks_generated?: number;
    export_count?: number;
  };
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  device_name?: string;
  ip_address?: string;
  location?: string;
  last_active: string;
  is_current: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body?: string;
  is_read: boolean;
  created_at: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  description?: string;
  features: string[];
  task_limit: number;
  export_limit: number;
  created_at: string;
}

// =====================================================
// USER PROFILE SERVICES
// =====================================================

export const userService = {
  // Get user profile with all related data
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  // Update user profile
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // Update user preferences
  async updatePreferences(userId: string, preferences: UserProfile['preferences']): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          preferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating preferences:', error);
      return false;
    }
  },

  // Update brand settings
  async updateBrandSettings(userId: string, brandSettings: {
    brand_logo_url?: string;
    brand_primary_color?: string;
    brand_secondary_color?: string;
    brand_font?: string;
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          ...brandSettings,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating brand settings:', error);
      return false;
    }
  },

  // Soft delete user account
  async softDeleteAccount(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('soft_delete_user', {
        user_id: userId
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error soft deleting account:', error);
      return false;
    }
  }
};

// =====================================================
// SESSION MANAGEMENT SERVICES
// =====================================================

export const sessionService = {
  // Create or update user session
  async upsertSession(
    userId: string,
    deviceName?: string,
    ipAddress?: string,
    location?: string
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('upsert_user_session', {
        p_user_id: userId,
        p_device_name: deviceName,
        p_ip_address: ipAddress,
        p_location: location
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error upserting session:', error);
      return null;
    }
  },

  // Get current session
  async getCurrentSession(userId: string): Promise<Session | null> {
    try {
      const { data, error } = await supabase.rpc('get_current_session', {
        p_user_id: userId
      });

      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  },

  // Get all user sessions
  async getUserSessions(userId: string): Promise<Session[]> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .order('last_active', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return [];
    }
  },

  // Terminate a specific session
  async terminateSession(sessionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ is_current: false })
        .eq('id', sessionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error terminating session:', error);
      return false;
    }
  }
};

// =====================================================
// NOTIFICATION SERVICES
// =====================================================

export const notificationService = {
  // Get user notifications
  async getNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  },

  // Get unread notifications count
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  },

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('mark_notification_read', {
        notification_id: notificationId
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('mark_all_notifications_read');

      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return 0;
    }
  },

  // Create notification
  async createNotification(userId: string, title: string, body?: string): Promise<Notification | null> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          body
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }
};

// =====================================================
// PLAN SERVICES
// =====================================================

export const planService = {
  // Get all available plans
  async getPlans(): Promise<Plan[]> {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('price', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting plans:', error);
      return [];
    }
  },

  // Get specific plan
  async getPlan(planName: string): Promise<Plan | null> {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('name', planName)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting plan:', error);
      return null;
    }
  },

  // Update user plan
  async updateUserPlan(userId: string, planName: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          plan: planName,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating user plan:', error);
      return false;
    }
  }
};

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

export const supabaseUtils = {
  // Check if user is authenticated and not deleted
  async isUserActive(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  },

  // Get user's email verification status
  async isEmailVerified(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('email_verified')
        .eq('id', userId)
        .single();

      return !error && data?.email_verified === true;
    } catch (error) {
      return false;
    }
  },

  // Update usage statistics
  async updateUsage(userId: string, usageUpdate: Partial<UserProfile['usage']>): Promise<boolean> {
    try {
      // First get current usage
      const { data: currentData, error: fetchError } = await supabase
        .from('users')
        .select('usage')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      const currentUsage = currentData?.usage || {};
      const updatedUsage = { ...currentUsage, ...usageUpdate };

      const { error } = await supabase
        .from('users')
        .update({
          usage: updatedUsage,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating usage:', error);
      return false;
    }
  }
};

// =====================================================
// REALTIME SUBSCRIPTIONS
// =====================================================

export const realtimeService = {
  // Subscribe to user profile changes
  subscribeToProfile(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('profile-changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${userId}`
      }, callback)
      .subscribe();
  },

  // Subscribe to notifications
  subscribeToNotifications(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  },

  // Subscribe to session changes
  subscribeToSessions(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('sessions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sessions',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  }
};

export default supabase;