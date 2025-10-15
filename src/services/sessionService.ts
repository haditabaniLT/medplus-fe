import { supabase } from '../supabase/supabaseClient';
import { Session } from '../types/database.types';
import { message } from 'antd';

// =====================================================
// SESSION SERVICE - Session Management
// =====================================================

export interface SessionInfo {
  id: string;
  user_id: string;
  device_name?: string;
  ip_address?: string;
  location?: string;
  last_active: string;
  is_current: boolean;
}

export class SessionService {
  // =====================================================
  // SESSION MANAGEMENT
  // =====================================================

  /**
   * Fetch all user sessions
   */
  static async fetchSessions(userId: string): Promise<SessionInfo[]> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .order('last_active', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching sessions:', error);
      message.error('Failed to fetch sessions');
      return [];
    }
  }

  /**
   * Get current active session
   */
  static async getCurrentSession(userId: string): Promise<SessionInfo | null> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_current', true)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching current session:', error);
      return null;
    }
  }

  /**
   * Create or update user session
   */
  static async upsertSession(
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
  }

  /**
   * Revoke a specific session
   */
  static async revokeSession(sessionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ is_current: false })
        .eq('id', sessionId);

      if (error) throw error;

      message.success('Session revoked');
      return true;
    } catch (error) {
      console.error('Error revoking session:', error);
      message.error('Failed to revoke session');
      return false;
    }
  }

  /**
   * Revoke all sessions for a user
   */
  static async revokeAllSessions(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ is_current: false })
        .eq('user_id', userId);

      if (error) throw error;

      message.success('All sessions revoked');
      return true;
    } catch (error) {
      console.error('Error revoking all sessions:', error);
      message.error('Failed to revoke all sessions');
      return false;
    }
  }

  /**
   * Delete a session completely
   */
  static async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      message.success('Session deleted');
      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      message.error('Failed to delete session');
      return false;
    }
  }

  /**
   * Update session activity
   */
  static async updateSessionActivity(sessionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ last_active: new Date().toISOString() })
        .eq('id', sessionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating session activity:', error);
      return false;
    }
  }

  /**
   * Get session count for user
   */
  static async getSessionCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_current', true);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting session count:', error);
      return 0;
    }
  }

  /**
   * Detect device information
   */
  static detectDeviceInfo(): { deviceName: string; location?: string } {
    const userAgent = navigator.userAgent;
    let deviceName = 'Unknown Device';

    if (userAgent.includes('Chrome')) {
      deviceName = 'Chrome Browser';
    } else if (userAgent.includes('Firefox')) {
      deviceName = 'Firefox Browser';
    } else if (userAgent.includes('Safari')) {
      deviceName = 'Safari Browser';
    } else if (userAgent.includes('Edge')) {
      deviceName = 'Edge Browser';
    }

    if (userAgent.includes('Windows')) {
      deviceName += ' on Windows';
    } else if (userAgent.includes('Mac')) {
      deviceName += ' on macOS';
    } else if (userAgent.includes('Linux')) {
      deviceName += ' on Linux';
    } else if (userAgent.includes('Android')) {
      deviceName += ' on Android';
    } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      deviceName += ' on iOS';
    }

    return { deviceName };
  }

  /**
   * Get user's IP address (simplified - in production, use a proper IP service)
   */
  static async getIPAddress(): Promise<string | null> {
    try {
      // This is a simplified approach. In production, you might want to use
      // a service like ipify.org or get the IP from your backend
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error getting IP address:', error);
      return null;
    }
  }

  /**
   * Get location from IP (simplified - in production, use a proper geolocation service)
   */
  static async getLocationFromIP(ip: string): Promise<string | null> {
    try {
      // This is a simplified approach. In production, you might want to use
      // a service like ipapi.co or MaxMind GeoIP
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await response.json();
      
      if (data.city && data.country) {
        return `${data.city}, ${data.country}`;
      }
      return null;
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }

  /**
   * Initialize session tracking for current user
   */
  static async initializeSessionTracking(userId: string): Promise<string | null> {
    try {
      const { deviceName } = this.detectDeviceInfo();
      const ipAddress = await this.getIPAddress();
      const location = ipAddress ? await this.getLocationFromIP(ipAddress) : null;

      return await this.upsertSession(userId, deviceName, ipAddress || undefined, location || undefined);
    } catch (error) {
      console.error('Error initializing session tracking:', error);
      return null;
    }
  }

  /**
   * Clean up old sessions (keep only last 10 sessions per user)
   */
  static async cleanupOldSessions(userId: string): Promise<boolean> {
    try {
      // Get all sessions for user, ordered by last_active
      const { data: sessions, error: fetchError } = await supabase
        .from('sessions')
        .select('id')
        .eq('user_id', userId)
        .order('last_active', { ascending: false });

      if (fetchError) throw fetchError;

      // Keep only the 10 most recent sessions
      if (sessions && sessions.length > 10) {
        const sessionsToDelete = sessions.slice(10);
        const sessionIds = sessionsToDelete.map(s => s.id);

        const { error: deleteError } = await supabase
          .from('sessions')
          .delete()
          .in('id', sessionIds);

        if (deleteError) throw deleteError;
      }

      return true;
    } catch (error) {
      console.error('Error cleaning up old sessions:', error);
      return false;
    }
  }
}

// =====================================================
// EXPORT CONVENIENCE FUNCTIONS
// =====================================================

export const fetchSessions = SessionService.fetchSessions;
export const getCurrentSession = SessionService.getCurrentSession;
export const upsertSession = SessionService.upsertSession;
export const revokeSession = SessionService.revokeSession;
export const revokeAllSessions = SessionService.revokeAllSessions;
export const deleteSession = SessionService.deleteSession;
export const updateSessionActivity = SessionService.updateSessionActivity;
export const getSessionCount = SessionService.getSessionCount;
export const initializeSessionTracking = SessionService.initializeSessionTracking;
export const cleanupOldSessions = SessionService.cleanupOldSessions;
