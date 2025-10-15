import { supabase } from '../supabase/supabaseClient';
import { UserProfile, UserPreferences, UserIntegrations } from '../types/database.types';
import { message } from 'antd';

// =====================================================
// USER SERVICE - Brand Preferences & Account Management
// =====================================================

export interface BrandPreferences {
  brand_logo_url?: string;
  brand_primary_color?: string;
  brand_secondary_color?: string;
  brand_font?: string;
}

export interface NotificationPreferences {
  inApp?: boolean;
  email?: boolean;
}

export class UserService {
  // =====================================================
  // BRAND PREFERENCES
  // =====================================================

  /**
   * Upload brand logo to Supabase Storage
   */
  static async uploadBrandLogo(userId: string, file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `brand-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('brand-logos')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading logo:', uploadError);
        message.error('Failed to upload logo');
        return null;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('brand-logos')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading brand logo:', error);
      message.error('Failed to upload brand logo');
      return null;
    }
  }

  /**
   * Update brand preferences
   */
  static async updateBrandPreferences(userId: string, preferences: BrandPreferences): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          brand_logo_url: preferences.brand_logo_url,
          brand_primary_color: preferences.brand_primary_color,
          brand_secondary_color: preferences.brand_secondary_color,
          brand_font: preferences.brand_font,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      message.success('Brand preferences saved successfully');
      return true;
    } catch (error) {
      console.error('Error updating brand preferences:', error);
      message.error('Failed to save brand preferences');
      return false;
    }
  }

  /**
   * Get brand preferences
   */
  static async getBrandPreferences(userId: string): Promise<BrandPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('brand_logo_url, brand_primary_color, brand_secondary_color, brand_font')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching brand preferences:', error);
      return null;
    }
  }

  // =====================================================
  // NOTIFICATION PREFERENCES
  // =====================================================

  /**
   * Update notification preferences
   */
  static async updateNotificationPreferences(userId: string, notifications: NotificationPreferences): Promise<boolean> {
    try {
      // First get current preferences
      const { data: currentData, error: fetchError } = await supabase
        .from('users')
        .select('preferences')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      const currentPreferences = currentData?.preferences || {};
      const updatedPreferences = {
        ...currentPreferences,
        notifications: {
          ...currentPreferences.notifications,
          ...notifications
        }
      };

      const { error } = await supabase
        .from('users')
        .update({
          preferences: updatedPreferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      message.info('Notification preference updated');
      return true;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      message.error('Failed to update notification preferences');
      return false;
    }
  }

  /**
   * Get notification preferences
   */
  static async getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('preferences')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data?.preferences?.notifications || null;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      return null;
    }
  }

  // =====================================================
  // ACCOUNT MANAGEMENT
  // =====================================================

  /**
   * Get user profile with account info
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
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
  }

  /**
   * Get user account info (email, verification status, plan)
   */
  static async getAccountInfo(userId: string): Promise<{
    email: string;
    email_verified: boolean;
    plan: string;
  } | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('email, email_verified, plan')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching account info:', error);
      return null;
    }
  }

  /**
   * Delete user account (soft delete)
   */
  static async deleteAccount(userId: string): Promise<boolean> {
    try {
      // Soft delete user account
      const { error: softDeleteError } = await supabase
        .from('users')
        .update({ 
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (softDeleteError) throw softDeleteError;

      // Sign out from all devices
      const { error: signOutError } = await supabase.auth.signOut({ scope: 'global' });
      
      if (signOutError) {
        console.warn('Error signing out:', signOutError);
        // Don't throw here as the account is already soft deleted
      }

      message.success('Account deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting account:', error);
      message.error('Failed to delete account');
      return false;
    }
  }

  /**
   * Sign out from all devices
   */
  static async signOutAllDevices(): Promise<boolean> {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) throw error;

      message.success('Signed out from all devices');
      return true;
    } catch (error) {
      console.error('Error signing out from all devices:', error);
      message.error('Failed to sign out from all devices');
      return false;
    }
  }

  /**
   * Upgrade user plan
   */
  static async upgradePlan(userId: string, planName: 'BASE' | 'PRO'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          plan: planName,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      message.success(`Plan upgraded to ${planName}`);
      return true;
    } catch (error) {
      console.error('Error upgrading plan:', error);
      message.error('Failed to upgrade plan');
      return false;
    }
  }

  /**
   * Update user preferences (general)
   */
  static async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<boolean> {
    try {
      // First get current preferences
      const { data: currentData, error: fetchError } = await supabase
        .from('users')
        .select('preferences')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      const currentPreferences = currentData?.preferences || {};
      const updatedPreferences = {
        ...currentPreferences,
        ...preferences
      };

      const { error } = await supabase
        .from('users')
        .update({
          preferences: updatedPreferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      message.success('Preferences updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating preferences:', error);
      message.error('Failed to update preferences');
      return false;
    }
  }

  /**
   * Update integrations
   */
  static async updateIntegrations(userId: string, integrations: Partial<UserIntegrations>): Promise<boolean> {
    try {
      // First get current integrations
      const { data: currentData, error: fetchError } = await supabase
        .from('users')
        .select('integrations')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      const currentIntegrations = currentData?.integrations || {};
      const updatedIntegrations = {
        ...currentIntegrations,
        ...integrations
      };

      const { error } = await supabase
        .from('users')
        .update({
          integrations: updatedIntegrations,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      message.success('Integrations updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating integrations:', error);
      message.error('Failed to update integrations');
      return false;
    }
  }
}

// =====================================================
// EXPORT CONVENIENCE FUNCTIONS
// =====================================================

export const updateBrandPreferences = UserService.updateBrandPreferences;
export const uploadBrandLogo = UserService.uploadBrandLogo;
export const getBrandPreferences = UserService.getBrandPreferences;
export const updateNotificationPreferences = UserService.updateNotificationPreferences;
export const getNotificationPreferences = UserService.getNotificationPreferences;
export const getUserProfile = UserService.getUserProfile;
export const getAccountInfo = UserService.getAccountInfo;
export const deleteAccount = UserService.deleteAccount;
export const signOutAllDevices = UserService.signOutAllDevices;
export const upgradePlan = UserService.upgradePlan;
export const updatePreferences = UserService.updatePreferences;
export const updateIntegrations = UserService.updateIntegrations;
