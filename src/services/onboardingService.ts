import { supabase } from '../supabase/supabaseClient';
import { message } from 'antd';

// =====================================================
// ONBOARDING SERVICE
// =====================================================

export interface OnboardingData {
  fullName: string;
  industry: string;
  seniority: string;
  goals: string[];
  brandLogoUrl?: string;
  brandPrimaryColor?: string;
  brandSecondaryColor?: string;
  brandFont?: string;
}

export class OnboardingService {
  // =====================================================
  // COMPLETE ONBOARDING
  // =====================================================

  /**
   * Complete the onboarding process and update user profile
   */
  static async completeOnboarding(userId: string, data: OnboardingData): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: data.fullName,
          industry: data.industry,
          seniority: data.seniority,
          goals: data.goals,
          brand_logo_url: data.brandLogoUrl,
          brand_primary_color: data.brandPrimaryColor,
          brand_secondary_color: data.brandSecondaryColor,
          brand_font: data.brandFont,
          onboarding: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      message.success('Welcome aboard! Your workspace is ready.');
      return true;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      message.error('Failed to save onboarding data. Please try again.');
      return false;
    }
  }

  // =====================================================
  // FETCH USER PROFILE
  // =====================================================

  /**
   * Fetch user profile data
   */
  static async fetchUserProfile(userId: string): Promise<any> {
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

  // =====================================================
  // CHECK ONBOARDING STATUS
  // =====================================================

  /**
   * Check if user has completed onboarding
   */
  static async checkOnboardingStatus(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('onboarding')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data?.onboarding === true;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }

  // =====================================================
  // UPLOAD BRAND LOGO
  // =====================================================

  /**
   * Upload brand logo to Supabase Storage
   */
  static async uploadBrandLogo(userId: string, file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-brand-${Date.now()}.${fileExt}`;
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

  // =====================================================
  // UPDATE ONBOARDING STEP
  // =====================================================

  /**
   * Update specific onboarding step data
   */
  static async updateOnboardingStep(userId: string, stepData: Partial<OnboardingData>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          ...stepData,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating onboarding step:', error);
      return false;
    }
  }

  // =====================================================
  // VALIDATION HELPERS
  // =====================================================

  /**
   * Validate onboarding data
   */
  static validateOnboardingData(data: Partial<OnboardingData>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.fullName?.trim()) {
      errors.push('Full name is required');
    }

    if (!data.industry?.trim()) {
      errors.push('Industry is required');
    }

    if (!data.seniority?.trim()) {
      errors.push('Seniority level is required');
    }

    if (!data.goals || data.goals.length === 0) {
      errors.push('At least one goal is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate onboarding step
   */
  static validateStep(step: number, data: Partial<OnboardingData>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    switch (step) {
      case 1: // Basic Info
        if (!data.fullName?.trim()) errors.push('Full name is required');
        if (!data.industry?.trim()) errors.push('Industry is required');
        if (!data.seniority?.trim()) errors.push('Seniority level is required');
        break;
      
      case 2: // Goals
        if (!data.goals || data.goals.length === 0) {
          errors.push('At least one goal is required');
        }
        break;
      
      case 3: // Brand Setup (optional)
        // No validation required for optional brand setup
        break;
      
      default:
        errors.push('Invalid step');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// =====================================================
// EXPORT CONVENIENCE FUNCTIONS
// =====================================================

export const completeOnboarding = OnboardingService.completeOnboarding;
export const fetchUserProfile = OnboardingService.fetchUserProfile;
export const checkOnboardingStatus = OnboardingService.checkOnboardingStatus;
export const uploadBrandLogo = OnboardingService.uploadBrandLogo;
export const updateOnboardingStep = OnboardingService.updateOnboardingStep;
export const validateOnboardingData = OnboardingService.validateOnboardingData;
export const validateStep = OnboardingService.validateStep;
