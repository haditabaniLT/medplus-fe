/**
 * Utility functions for Supabase authentication
 */

import { supabase } from '../supabase/supabaseClient';

/**
 * Get the current Supabase access token
 * @returns Promise<string | null> - The access token or null if not authenticated
 */
export const getSupabaseAccessToken = async (): Promise<string | null> => {
  try {
    console.log("========GETTING ACCESS TOKEN========")
    const sessionResponse = await supabase.auth.getSession();
    const { error, data } = sessionResponse;

    console.log("======[data]=====", JSON.stringify(data, null, 1))
    const session = data.session;

    if (error) {
      console.error('Error getting Supabase session:', error);
      return null;
    }

    if (!session?.access_token) {
      console.log('No active Supabase session found');
      return null;
    }

    // Debug: Log token details
    console.log('======[SUPABASE TOKEN DEBUG]=====');
    console.log('Token length:', session.access_token.length);
    console.log('Token starts with:', session.access_token.substring(0, 20) + '...');
    console.log('Token type:', typeof session.access_token);
    console.log('Session expires at:', new Date(session.expires_at * 1000));
    console.log('Current time:', new Date());
    console.log('Is expired:', session.expires_at * 1000 < Date.now());

    return session.access_token;
  } catch (error) {
    console.error('Error getting Supabase access token:', error);
    return null;
  }
};

/**
 * Get the current Supabase user
 * @returns Promise<any | null> - The user object or null if not authenticated
 */
export const getCurrentSupabaseUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Error getting Supabase user:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error getting Supabase user:', error);
    return null;
  }
};

/**
 * Check if user is authenticated with Supabase
 * @returns Promise<boolean> - True if authenticated, false otherwise
 */
export const isSupabaseAuthenticated = async (): Promise<boolean> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error checking Supabase authentication:', error);
      return false;
    }

    return !!session?.access_token;
  } catch (error) {
    console.error('Error checking Supabase authentication:', error);
    return false;
  }
};

/**
 * Decode JWT token to inspect its contents
 * @param token - The JWT token to decode
 * @returns Decoded token payload or null if invalid
 */
export const decodeJWT = (token: string) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format - expected 3 parts, got:', parts.length);
      return null;
    }

    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));

    console.log('======[JWT DECODE]=====');
    console.log('JWT Header:', JSON.parse(atob(parts[0])));
    console.log('JWT Payload:', decoded);
    console.log('JWT Signature:', parts[2].substring(0, 20) + '...');

    return decoded;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

/**
 * Get Supabase access token with additional validation
 * This function provides multiple token options for API compatibility
 */
export const getSupabaseTokenForAPI = async (): Promise<{ token: string; type: string } | null> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error getting Supabase session:', error);
      return null;
    }

    if (!session) {
      console.log('No active Supabase session found');
      return null;
    }

    // Check if token is expired
    const isExpired = session.expires_at * 1000 < Date.now();
    if (isExpired) {
      console.log('Supabase token is expired, attempting refresh...');

      // Try to refresh the session
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError || !refreshData.session) {
        console.error('Failed to refresh session:', refreshError);
        return null;
      }

      console.log('Session refreshed successfully');
      return {
        token: refreshData.session.access_token,
        type: 'refreshed'
      };
    }

    return {
      token: session.access_token,
      type: 'current'
    };
  } catch (error) {
    console.error('Error getting Supabase token for API:', error);
    return null;
  }
};
