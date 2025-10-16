/**
 * Template-related types
 */

export interface Template {
  id: string;
  user_id: string;
  title: string;
  category: string;
  content: string;
  tags?: string[];
  is_public?: boolean;
  is_favorite?: boolean;
  created_at: string;
  updated_at: string;
}

// API Request/Response Types
export interface CreateTemplateRequest {
  title: string;
  category: string;
  content: string;
  tags?: string[];
  is_public?: boolean;
  is_favorite?: boolean;
}

export interface UpdateTemplateRequest {
  title?: string;
  category?: string;
  content?: string;
  tags?: string[];
  is_public?: boolean;
  is_favorite?: boolean;
}

export interface GetTemplatesQueryParams {
  category?: string;
  isPublic?: boolean;
  isFavorite?: boolean;
  search?: string;
  sortBy?: 'created_at' | 'updated_at' | 'title' | 'category';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface GetTemplatesResponse {
  templates: Template[];
  total: number;
  hasMore: boolean;
}