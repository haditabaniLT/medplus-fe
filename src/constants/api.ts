/**
 * API Configuration Constants
 */

// Base URL for the API - you can update this later
export const API_BASE_URL = 'https://jurmnoxhssnemxdagecd.supabase.co/functions/v1/tasks-api';

// API Endpoints
export const API_ENDPOINTS = {
  TASKS: '/tasks',
  USAGE: '/usage',
} as const;

// Rate limiting
export const RATE_LIMIT = {
  REQUESTS_PER_MINUTE: 100,
} as const;
