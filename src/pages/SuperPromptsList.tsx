import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Plus, Filter, Search, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import SuperPromptCard from '../components/super-prompts/SuperPromptCard';
import { cn } from '../lib/utils';
import { getSupabaseTokenForAPI } from '../utils/supabaseAuth';

interface SuperPrompt {
  id: string;
  user_id: string;
  generated_prompt: string;
  ai_model: string;
  questions: Record<string, string> | null;
  created_at: string;
  updated_at: string;
}

interface GetSuperPromptsResponse {
  success: boolean;
  data?: {
    data: SuperPrompt[];
    count: number;
    pagination: {
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
  message?: string;
  error?: string;
}

interface GetSuperPromptsParams {
  ai_model?: 'openai' | 'claude' | 'gemini' | 'grok';
  search?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

const categories = [
  'All Categories',
  'Decision Mastery',
  'Influence Builder',
  'Team Ignition',
  'Mindset Recharge',
  'Network Catalyst',
  'Play Time',
  'Other/Custom',
];

// Note: Category filtering is done client-side since the API doesn't return context
// This map could be used in the future if the API adds category filtering support
// const categoryIdMap: Record<string, string> = {
//   'Decision Mastery': 'decision-mastery',
//   'Influence Builder': 'influence-builder',
//   'Team Ignition': 'team-ignition',
//   'Mindset Recharge': 'mindset-recharge',
//   'Network Catalyst': 'network-catalyst',
//   'Play Time': 'play-time',
//   'Other/Custom': 'other-custom',
// };

// Helper function to extract title from generated prompt (first sentence or first 50 chars)
const extractTitle = (prompt: string): string => {
  if (!prompt) return 'Untitled Prompt';
  
  // Try to extract first sentence
  const firstSentence = prompt.split(/[.!?]\s/)[0];
  if (firstSentence && firstSentence.length <= 60) {
    return firstSentence;
  }
  
  // Otherwise, take first 50 chars and add ellipsis
  return prompt.substring(0, 50).trim() + (prompt.length > 50 ? '...' : '');
};

// Helper function to extract category from questions or use default
const extractCategory = (questions: Record<string, string> | null): string => {
  // Try to infer category from questions structure
  // This is a fallback since the API doesn't return context
  if (!questions) return 'Other/Custom';
  
  // Check for category-specific question keys
  if (questions.goal && questions.risks) return 'Decision Mastery';
  if (questions.message && questions.audience) return 'Influence Builder';
  if (questions['team-goal'] || questions.mood) return 'Team Ignition';
  if (questions.emotion || questions.trigger) return 'Mindset Recharge';
  if (questions['networking-goal'] || questions.target) return 'Network Catalyst';
  if (questions['play-goal'] || questions.restorative) return 'Play Time';
  
  return 'Other/Custom';
};

const SuperPromptsList: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.session);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [prompts, setPrompts] = useState<SuperPrompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState<{
    limit: number;
    offset: number;
    hasMore: boolean;
  } | null>(null);

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch super prompts from API
  const fetchSuperPrompts = async (params?: GetSuperPromptsParams) => {
    setLoading(true);
    setError(null);

    try {
      const tokenData = await getSupabaseTokenForAPI();
      
      if (!tokenData) {
        throw new Error('User not authenticated. Please log in again.');
      }

      // Build query string
      const queryParams = new URLSearchParams();
      if (params?.ai_model) queryParams.append('ai_model', params.ai_model);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
      if (params?.toDate) queryParams.append('toDate', params.toDate);
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());

      const queryString = queryParams.toString();
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('Supabase URL is not configured');
      }

      const url = `${supabaseUrl}/functions/v1/tasks-api/super-prompt${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenData.token}`,
        },
      });

      const result: GetSuperPromptsResponse = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.error || 'Failed to fetch super prompts');
      }

      if (!result.data) {
        throw new Error('Invalid response format from API');
      }

      setPrompts(result.data.data);
      setTotalCount(result.data.count);
      setPagination(result.data.pagination);
    } catch (err: any) {
      console.error('Error fetching super prompts:', err);
      setError(err.message || 'An error occurred while fetching prompts');
      setPrompts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch prompts on mount and when filters change
  useEffect(() => {
    if (!isAuthenticated) return;

    const params: GetSuperPromptsParams = {
      search: searchQuery || undefined,
      sortBy: 'created_at',
      sortOrder: 'desc',
      limit: 50, // Load more prompts initially
      offset: 0,
    };

    fetchSuperPrompts(params);
  }, [isAuthenticated, searchQuery]); // Removed selectedCategory from deps - we'll filter client-side since API doesn't support category filtering

  // Filter prompts by category (client-side since API doesn't return context)
  const filteredPrompts = prompts.filter((prompt) => {
    if (selectedCategory === 'All Categories') return true;
    
    const inferredCategory = extractCategory(prompt.questions);
    return inferredCategory === selectedCategory;
  });

  const handleCreateNew = () => {
    navigate('/super-prompts/create');
  };

  const handleCardClick = (id: string) => {
    navigate(`/super-prompts/${id}`);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Super Prompts</h1>
              <p className="text-muted-foreground">
                Manage and view all your created super prompts
              </p>
            </div>
            <Button onClick={handleCreateNew} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Super Prompt
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Results Count */}
          {!loading && (
            <div className="mb-4 text-sm text-muted-foreground">
              {filteredPrompts.length} {filteredPrompts.length === 1 ? 'prompt' : 'prompts'} found
              {totalCount > filteredPrompts.length && ` (${totalCount} total)`}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading prompts...</span>
            </div>
          )}

          {/* Prompts Grid */}
          {!loading && filteredPrompts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPrompts.map((prompt) => {
                const title = extractTitle(prompt.generated_prompt);
                const category = extractCategory(prompt.questions);
                
                // Extract tone and audience from questions if available
                const tone = prompt.questions?.tone || undefined;
                const audience = prompt.questions?.audience || undefined;
                
                return (
                  <SuperPromptCard
                    key={prompt.id}
                    id={prompt.id}
                    title={title}
                    category={category}
                    task={prompt.generated_prompt}
                    tone={tone}
                    audience={audience}
                    createdAt={prompt.created_at}
                    onClick={() => handleCardClick(prompt.id)}
                  />
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredPrompts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                {searchQuery || selectedCategory !== 'All Categories' ? (
                  <>
                    <p className="text-lg font-medium mb-2">No prompts found</p>
                    <p className="text-sm">
                      Try adjusting your search or filter criteria
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-medium mb-2">No super prompts yet</p>
                    <p className="text-sm mb-4">
                      Create your first super prompt to get started
                    </p>
                    <Button onClick={handleCreateNew} variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Prompt
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SuperPromptsList;



