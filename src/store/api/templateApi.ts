import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  Template,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  GetTemplatesQueryParams,
  GetTemplatesResponse
} from '../../types/template.types';
import { API_BASE_URL, API_ENDPOINTS } from '../../constants/api';
import { getSupabaseTokenForAPI } from '../../utils/supabaseAuth';

/**
 * RTK Query API for template operations
 * Real API integration with authentication
 */
export const templateApi = createApi({
  reducerPath: 'templateApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: async (headers) => {
      // Get Supabase access token with validation and refresh
      const tokenData = await getSupabaseTokenForAPI();
      if (tokenData) {
        headers.set('authorization', `Bearer ${tokenData.token}`);
      } else {
        console.log('======[TEMPLATE API AUTH]===== No Supabase token found');
      }
      headers.set('content-type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Template'],
  endpoints: (builder) => ({
    // Create a new template
    createTemplate: builder.mutation<Template, CreateTemplateRequest>({
      query: (templateData) => ({
        url: API_ENDPOINTS.TEMPLATES,
        method: 'POST',
        body: templateData,
      }),
      transformResponse: (response: { success: boolean; data: Template; message: string }) => {
        // Transform the API response to return just the template data
        console.log('createTemplate transformResponse - raw response:', response);
        return response.data;
      },
      transformErrorResponse: (response: any) => {
        // Handle API error responses
        console.error('API Error (createTemplate):', response);
        return response;
      },
      invalidatesTags: ['Template'],
    }),

    // Get all templates with optional query parameters
    getTemplates: builder.query<GetTemplatesResponse, GetTemplatesQueryParams | void>({
      query: (params) => {
        const queryParams = params || {};
        // Convert parameters to URL query string
        const urlParams = new URLSearchParams();
        
        // Basic filters
        if (queryParams.category) urlParams.append('category', queryParams.category);
        if (queryParams.search) urlParams.append('search', queryParams.search);
        
        // Boolean filters
        if (queryParams.isPublic !== undefined) urlParams.append('isPublic', queryParams.isPublic.toString());
        if (queryParams.isFavorite !== undefined) urlParams.append('isFavorite', queryParams.isFavorite.toString());
        
        // Sorting
        if (queryParams.sortBy) urlParams.append('sortBy', queryParams.sortBy);
        if (queryParams.sortOrder) urlParams.append('sortOrder', queryParams.sortOrder);
        
        // Pagination
        if (queryParams.limit) urlParams.append('limit', queryParams.limit.toString());
        if (queryParams.offset) urlParams.append('offset', queryParams.offset.toString());

        const queryString = urlParams.toString();
        const url = queryString ? `${API_ENDPOINTS.TEMPLATES}?${queryString}` : API_ENDPOINTS.TEMPLATES;
        
        return { url };
      },
      transformResponse: (response: { 
        success: boolean; 
        data: { 
          data: Template[]; 
          count: number; 
          pagination: { limit: number; offset: number; hasMore: boolean }; 
        }; 
        message: string 
      }) => {
        // Transform the API response to match our expected format
        console.log('getTemplates transformResponse - raw response:', response);
        console.log('getTemplates transformResponse - response.data:', response.data);
        console.log('getTemplates transformResponse - response.data.data:', response.data.data);
        console.log('getTemplates transformResponse - isArray:', Array.isArray(response.data.data));
        
        const templates = Array.isArray(response.data.data) ? response.data.data : [];
        return {
          templates,
          total: response.data.count || templates.length,
          hasMore: response.data.pagination?.hasMore || false,
        };
      },
      transformErrorResponse: (response: any) => {
        // Handle API error responses
        console.error('API Error (getTemplates):', response);
        return response;
      },
      providesTags: ['Template'],
    }),

    // Get single template by ID
    getTemplate: builder.query<Template, string>({
      query: (id) => ({
        url: `${API_ENDPOINTS.TEMPLATES}/${id}`,
      }),
      transformResponse: (response: { success: boolean; data: Template; message: string }) => {
        // Transform the API response to return just the template data
        console.log('getTemplate transformResponse - raw response:', response);
        return response.data;
      },
      transformErrorResponse: (response: any) => {
        // Handle API error responses
        console.error('API Error (getTemplate):', response);
        return response;
      },
      providesTags: (result, error, id) => [{ type: 'Template', id }],
    }),

    // Update an existing template
    updateTemplate: builder.mutation<Template, { id: string; updates: UpdateTemplateRequest }>({
      query: ({ id, updates }) => ({
        url: `${API_ENDPOINTS.TEMPLATES}/${id}`,
        method: 'PUT',
        body: updates,
      }),
      transformResponse: (response: { success: boolean; data: Template; message: string }) => {
        // Transform the API response to return just the template data
        console.log('updateTemplate transformResponse - raw response:', response);
        return response.data;
      },
      transformErrorResponse: (response: any) => {
        // Handle API error responses
        console.error('API Error (updateTemplate):', response);
        return response;
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'Template', id }, 'Template'],
    }),

    // Delete a template
    deleteTemplate: builder.mutation<void, string>({
      query: (id) => ({
        url: `${API_ENDPOINTS.TEMPLATES}/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: { success: boolean; message: string }) => {
        // Transform the API response - delete operations typically return success status
        console.log('deleteTemplate transformResponse - raw response:', response);
        return undefined; // void return type
      },
      transformErrorResponse: (response: any) => {
        // Handle API error responses
        console.error('API Error (deleteTemplate):', response);
        return response;
      },
      invalidatesTags: ['Template'],
    }),
  }),
});

export const {
  useCreateTemplateMutation,
  useGetTemplatesQuery,
  useGetTemplateQuery,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
} = templateApi;
