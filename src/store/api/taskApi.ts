import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  GetTasksQueryParams,
  GetTasksResponse,
  UsageResponse,
  TaskGenerationInput,
  TaskGenerationOutput
} from '../../types/task.types';
import { API_BASE_URL, API_ENDPOINTS } from '../../constants/api';
import { getSupabaseAccessToken, decodeJWT, getSupabaseTokenForAPI } from '../../utils/supabaseAuth';

/**
 * RTK Query API for task operations
 * Real API integration with authentication
 */
export const taskApi = createApi({
  reducerPath: 'taskApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: async (headers) => {
      // Get Supabase access token with validation and refresh
      const tokenData = await getSupabaseTokenForAPI();
      if (tokenData) {
        console.log("======[tokenData]=====", JSON.stringify(tokenData, null, 1))
        headers.set('authorization', `Bearer ${tokenData.token}`);
      } else {
        console.log('======[API AUTH]===== No Supabase token found');
      }
      headers.set('content-type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Task', 'Usage'],
  endpoints: (builder) => ({
    // Create a new task
    createTask: builder.mutation<Task, CreateTaskRequest>({
      query: (taskData) => ({
        url: API_ENDPOINTS.TASKS,
        method: 'POST',
        body: taskData,
      }),
      transformResponse: (response: { success: boolean; data: Task; message: string }) => {
        // Transform the API response to return just the task data
        return response.data;
      },
      transformErrorResponse: (response: any) => {
        // Handle API error responses
        console.error('API Error (createTask):', response);
        return response;
      },
      invalidatesTags: ['Task'],
    }),

    // Get all tasks with optional query parameters
    getTasks: builder.query<GetTasksResponse, GetTasksQueryParams | void>({
      query: (params) => {
        const queryParams = params || {};
        // Convert array parameters to comma-separated strings for URL
        const urlParams = new URLSearchParams();
        
        if (queryParams.category) urlParams.append('category', queryParams.category);
        if (queryParams.status) urlParams.append('status', queryParams.status);
        if (queryParams.limit) urlParams.append('limit', queryParams.limit.toString());
        if (queryParams.offset) urlParams.append('offset', queryParams.offset.toString());
        if (queryParams.search) urlParams.append('search', queryParams.search);
        if (queryParams.type) urlParams.append('type', queryParams.type);
        if (queryParams.is_favorite !== undefined) urlParams.append('is_favorite', queryParams.is_favorite.toString());
        if (queryParams.is_shared !== undefined) urlParams.append('is_shared', queryParams.is_shared.toString());
        if (queryParams.tags && queryParams.tags.length > 0) {
          urlParams.append('tags', queryParams.tags.join(','));
        }

        return {
          url: `${API_ENDPOINTS.TASKS}?${urlParams.toString()}`,
        };
      },
      transformResponse: (response: { success: boolean; data: Task[]; message: string }) => {
        // Transform the API response to match our expected format
        return {
          tasks: response.data || [],
          total: response.data?.length || 0,
          hasMore: false, // TODO: Implement proper hasMore logic based on pagination
        };
      },
      transformErrorResponse: (response: any) => {
        // Handle API error responses
        console.error('API Error:', response);
        return response;
      },
      providesTags: ['Task'],
    }),

    // Get single task by ID
    getTask: builder.query<Task, string>({
      query: (id) => ({
        url: `${API_ENDPOINTS.TASKS}/${id}`,
      }),
      transformResponse: (response: { success: boolean; data: Task; message: string }) => {
        // Transform the API response to return just the task data
        return response.data;
      },
      transformErrorResponse: (response: any) => {
        // Handle API error responses
        console.error('API Error (getTask):', response);
        return response;
      },
      providesTags: (result, error, id) => [{ type: 'Task', id }],
    }),

    // Update an existing task
    updateTask: builder.mutation<Task, { id: string; updates: UpdateTaskRequest }>({
      query: ({ id, updates }) => {
        console.log('updateTask - id:', id, 'updates:', updates);
        return {
          url: `${API_ENDPOINTS.TASKS}/${id}`,
          method: 'PUT',
          body: updates,
        };
      },
      transformResponse: (response: { success: boolean; data: Task; message: string }) => {
        // Transform the API response to return just the task data
        console.log('updateTask transformResponse - raw response:', response);
        return response.data;
      },
      transformErrorResponse: (response: any) => {
        // Handle API error responses
        console.error('API Error (updateTask):', response);
        return response;
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'Task', id }, 'Task'],
    }),

    // Delete a task
    deleteTask: builder.mutation<void, string>({
      query: (id) => {
        console.log('deleteTask - id:', id);
        return {
          url: `${API_ENDPOINTS.TASKS}/${id}`,
          method: 'DELETE',
        };
      },
      transformResponse: (response: { success: boolean; message: string }) => {
        // Transform the API response - delete operations typically return success status
        console.log('deleteTask transformResponse - raw response:', response);
        return undefined; // void return type
      },
      transformErrorResponse: (response: any) => {
        // Handle API error responses
        console.error('API Error (deleteTask):', response);
        return response;
      },
      invalidatesTags: ['Task'],
    }),

    // Get user's current usage and plan limits
    getUsage: builder.query<UsageResponse, void>({
      query: () => ({
        url: API_ENDPOINTS.USAGE,
      }),
      providesTags: ['Usage'],
    }),

    // Legacy: Generate task (for backward compatibility)
    generateTask: builder.mutation<TaskGenerationOutput, TaskGenerationInput>({
      queryFn: async (input) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock generation
        const output: TaskGenerationOutput = {
          title: `Generated: ${input.category} Task`,
          category: input.category,
          summary: input.text || input.voiceTranscript || 'Auto-generated task summary',
          steps: [
            'Review the requirements',
            'Create an action plan',
            'Execute the plan',
            'Review and optimize',
          ],
          metadata: {
            keywords: ['task', input.category.toLowerCase(), 'automated'],
            goals: ['Complete task efficiently', 'Ensure quality'],
          },
          content: `This is a generated task for ${input.category}. ${input.text || input.voiceTranscript || ''}`,
        };

        return { data: output };
      },
      invalidatesTags: ['Task'],
    }),

    // Legacy: Export task (for backward compatibility)
    exportTask: builder.mutation<{ url: string }, { taskId: string; format: string }>({
      queryFn: async ({ taskId, format }) => {
        // Simulate export delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        return {
          data: {
            url: `https://example.com/exports/${taskId}.${format}`
          }
        };
      },
    }),

    // Legacy: Suggest tasks (for backward compatibility)
    suggestTasks: builder.mutation<Array<{ title: string; priority: string; category: string }>, string>({
      queryFn: async (context) => {
        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
          data: [
            { title: 'Review analytics', priority: 'high', category: 'Analysis' },
            { title: 'Update documentation', priority: 'medium', category: 'Documentation' },
            { title: 'Schedule team meeting', priority: 'low', category: 'Planning' },
          ],
        };
      },
    }),
  }),
});

export const {
  // New API endpoints
  useCreateTaskMutation,
  useGetTasksQuery,
  useGetTaskQuery,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetUsageQuery,

  // Legacy endpoints (for backward compatibility)
  useGenerateTaskMutation,
  useExportTaskMutation,
  useSuggestTasksMutation,
} = taskApi;
