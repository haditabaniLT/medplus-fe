import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Save,
  X,
  Calendar,
  Tag,
  Loader2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Textarea } from '../components/ui/textarea';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Skeleton } from '../components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../components/ui/breadcrumb';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { useToast } from '../hooks/use-toast';
import { getSupabaseTokenForAPI } from '../utils/supabaseAuth';
import FormattedOutput from '../components/super-prompts/FormattedOutput';

interface SuperPrompt {
  id: string;
  user_id: string;
  generated_prompt: string;
  ai_model: string;
  questions: Record<string, string> | null;
  created_at: string;
  updated_at: string;
}

interface SuperPromptResponse {
  success: boolean;
  data?: SuperPrompt;
  message?: string;
  error?: string;
}

// Helper function to extract title from generated prompt
const extractTitle = (prompt: string): string => {
  if (!prompt) return 'Untitled Prompt';
  const firstSentence = prompt.split(/[.!?]\s/)[0];
  if (firstSentence && firstSentence.length <= 60) {
    return firstSentence;
  }
  return prompt.substring(0, 50).trim() + (prompt.length > 50 ? '...' : '');
};

// Helper function to extract category from questions
const extractCategory = (questions: Record<string, string> | null): string => {
  if (!questions) return 'Other/Custom';
  if (questions.goal && questions.risks) return 'Decision Mastery';
  if (questions.message && questions.audience) return 'Influence Builder';
  if (questions['team-goal'] || questions.mood) return 'Team Ignition';
  if (questions.emotion || questions.trigger) return 'Mindset Recharge';
  if (questions['networking-goal'] || questions.target) return 'Network Catalyst';
  if (questions['play-goal'] || questions.restorative) return 'Play Time';
  return 'Other/Custom';
};

const SuperPromptDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useSelector((state: RootState) => state.session);
  const [prompt, setPrompt] = useState<SuperPrompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch prompt by ID
  const fetchPrompt = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const tokenData = await getSupabaseTokenForAPI();
      
      if (!tokenData) {
        throw new Error('User not authenticated. Please log in again.');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('Supabase URL is not configured');
      }

      // Fetch all prompts and filter by ID (API doesn't have GET by ID endpoint)
      // Using a high limit to ensure we get the specific prompt
      const url = `${supabaseUrl}/functions/v1/tasks-api/super-prompt?limit=1000`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenData.token}`,
        },
      });

      const result: {
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
      } = await response.json();

      if (!response.ok || result.success === false) {
        if (response.status === 404) {
          throw new Error('Super prompt not found');
        }
        throw new Error(result.error || 'Failed to fetch super prompt');
      }

      // Find the prompt with matching ID from the response data
      const foundPrompt = result.data?.data?.find((p: SuperPrompt) => p.id === id);

      if (!foundPrompt) {
        throw new Error('Super prompt not found');
      }

      setPrompt(foundPrompt);
      setEditedPrompt(foundPrompt.generated_prompt);
    } catch (err: any) {
      console.error('Error fetching super prompt:', err);
      setError(err.message || 'An error occurred while fetching the prompt');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchPrompt();
    }
  }, [isAuthenticated, id]);

  const handleUpdate = async () => {
    if (!prompt || !editedPrompt.trim()) return;

    setIsUpdating(true);

    try {
      const tokenData = await getSupabaseTokenForAPI();
      
      if (!tokenData) {
        throw new Error('User not authenticated. Please log in again.');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('Supabase URL is not configured');
      }

      // PUT endpoint according to API documentation
      const url = `${supabaseUrl}/functions/v1/tasks-api/super-prompt/${id}`;

      // Build request body according to UpdateSuperPromptRequest interface
      const requestBody: {
        generated_prompt?: string;
        ai_model?: string;
        questions?: Record<string, string>;
      } = {
        generated_prompt: editedPrompt,
      };

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenData.token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const result: {
        success: boolean;
        data?: SuperPrompt;
        message?: string;
        error?: string;
      } = await response.json();

      if (!response.ok || result.success === false) {
        if (response.status === 404) {
          throw new Error('Super prompt not found');
        }
        if (response.status === 400) {
          throw new Error(result.error || 'Invalid request. Please check your input.');
        }
        throw new Error(result.error || 'Failed to update super prompt');
      }

      // Update local state with response data from API
      if (result.data) {
        setPrompt(result.data);
        setEditedPrompt(result.data.generated_prompt);
      } else {
        // Fallback: update with edited content if API doesn't return data
        setPrompt({ ...prompt, generated_prompt: editedPrompt, updated_at: new Date().toISOString() });
      }

      setEditMode(false);
      toast({
        title: 'Prompt updated',
        description: result.message || 'Your changes have been saved successfully.',
      });
    } catch (err: any) {
      console.error('Error updating super prompt:', err);
      toast({
        title: 'Update failed',
        description: err.message || 'Failed to update the prompt. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!prompt) return;

    setIsDeleting(true);

    try {
      const tokenData = await getSupabaseTokenForAPI();
      
      if (!tokenData) {
        throw new Error('User not authenticated. Please log in again.');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('Supabase URL is not configured');
      }

      // DELETE endpoint according to API documentation
      const url = `${supabaseUrl}/functions/v1/tasks-api/super-prompt/${id}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${tokenData.token}`,
        },
      });

      const result: {
        success: boolean;
        data?: {
          id: string;
        };
        message?: string;
        error?: string;
      } = await response.json();

      if (!response.ok || result.success === false) {
        if (response.status === 404) {
          throw new Error('Super prompt not found');
        }
        throw new Error(result.error || 'Failed to delete super prompt');
      }

      toast({
        title: 'Prompt deleted',
        description: result.message || 'The super prompt has been deleted successfully.',
      });

      // Navigate back to list page after successful deletion
      navigate('/super-prompts');
    } catch (err: any) {
      console.error('Error deleting super prompt:', err);
      toast({
        title: 'Delete failed',
        description: err.message || 'Failed to delete the prompt. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleCopy = async () => {
    if (!prompt) return;

    try {
      await navigator.clipboard.writeText(prompt.generated_prompt);
      setCopied(true);
      toast({
        title: 'Copied to clipboard',
        description: 'The prompt has been copied to your clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Copy failed',
        description: 'Failed to copy to clipboard. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCancelEdit = () => {
    if (prompt) {
      setEditedPrompt(prompt.generated_prompt);
    }
    setEditMode(false);
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !prompt) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-xl font-semibold mb-2">Super Prompt not found</h2>
            <p className="text-muted-foreground mb-4">
              {error || 'The super prompt you are looking for does not exist or you don\'t have permission to view it.'}
            </p>
            <Button onClick={() => navigate('/super-prompts')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Super Prompts
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const title = extractTitle(prompt.generated_prompt);
  const category = extractCategory(prompt.questions);
  const tone = prompt.questions?.tone || undefined;
  const audience = prompt.questions?.audience || undefined;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <button
                    onClick={() => navigate('/super-prompts')}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Super Prompts
                  </button>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/super-prompts')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
              {!editMode ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleUpdate}
                    disabled={isUpdating || !editedPrompt.trim()}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Metadata Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Category</p>
                  <Badge variant="secondary">{category}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm font-medium">
                    {new Date(prompt.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Updated</p>
                  <p className="text-sm font-medium">
                    {new Date(prompt.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">AI Model</p>
                  <Badge variant="outline" className="uppercase">
                    {prompt.ai_model}
                  </Badge>
                </div>
              </div>
              {tone && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Tone</p>
                    <Badge variant="outline">{tone}</Badge>
                  </div>
                </div>
              )}
              {audience && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Audience</p>
                    <p className="text-sm font-medium">{audience}</p>
                  </div>
                </div>
              )}
            </div>
            {prompt.questions && Object.keys(prompt.questions).length > 0 && (
              <>
                <Separator className="my-4" />
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Questions & Context</p>
                  <div className="space-y-2">
                    {Object.entries(prompt.questions).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="font-medium text-foreground capitalize">
                          {key.replace(/_/g, ' ')}:
                        </span>{' '}
                        <span className="text-muted-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Content Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Generated Prompt</CardTitle>
          </CardHeader>
          <CardContent>
            {editMode ? (
              <div className="space-y-4">
                <Textarea
                  value={editedPrompt}
                  onChange={(e) => setEditedPrompt(e.target.value)}
                  className="min-h-[400px] font-mono"
                  placeholder="Enter your prompt..."
                />
                <p className="text-xs text-muted-foreground">
                  {editedPrompt.length} characters
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <FormattedOutput
                  content={prompt.generated_prompt}
                  isLoading={false}
                  onRegenerate={() => {}}
                  onSave={() => {}}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the super prompt
              "{title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default SuperPromptDetail;

