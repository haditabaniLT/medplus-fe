import React, { useState, useEffect, useCallback } from 'react';
import ExportModal from '../components/export/ExportModal';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CATEGORIES } from '../constants/categories';
import DashboardLayout from '../components/layout/DashboardLayout';
import { 
  ArrowLeft, 
  Download, 
  Trash2, 
  Copy, 
  Calendar,
  Tag,
  FileText,
  Globe,
  MessageSquare,
  Clock,
  History,
  AlertCircle,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Code,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { ScrollArea } from '../components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/ui/tooltip';
import { useGetTaskQuery } from '../store/api/taskApi';
import { Task } from '../types/task.types';

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.session);
  const userPlan = (user?.plan?.toLowerCase() || 'base') as 'base' | 'pro';
  
  // Fetch task using the API
  const { 
    data: task, 
    isLoading, 
    error,
    refetch 
  } = useGetTaskQuery(id!, {
    skip: !id
  });

  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConflictBanner, setShowConflictBanner] = useState(false);
  const [versions] = useState([
    { id: 'v3', timestamp: '2024-01-15T14:20:00', label: 'Current version' },
    { id: 'v2', timestamp: '2024-01-15T12:10:00', label: 'Added SEO optimization' },
    { id: 'v1', timestamp: '2024-01-15T10:30:00', label: 'Initial draft' },
  ]);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Initialize edited content when task loads
  useEffect(() => {
    if (task) {
      setEditedContent(task.content);
    }
  }, [task]);

  // Handle task not found
  useEffect(() => {
    if (error && !isLoading) {
      toast({
        title: 'Task not found',
        description: 'The task you are looking for does not exist.',
        variant: 'destructive',
      });
      navigate('/tasks');
    }
  }, [error, isLoading, navigate, toast]);

  // Autosave functionality (every 5s after idle)
  useEffect(() => {
    if (!hasUnsavedChanges || !editMode) return;
    
    const timer = setTimeout(() => {
      handleSave();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [editedContent, hasUnsavedChanges, editMode]);

  // Mock concurrent edit detection
  useEffect(() => {
    // Simulate detecting concurrent edit (mock)
    const checkConcurrentEdit = setTimeout(() => {
      if (Math.random() < 0.1 && editMode) { // 10% chance for demo
        setShowConflictBanner(true);
      }
    }, 15000);
    
    return () => clearTimeout(checkConcurrentEdit);
  }, [editMode]);

  const handleSave = useCallback(() => {
    // Mock save functionality
    setLastSaved(new Date());
    setHasUnsavedChanges(false);
    toast({
      title: 'Changes saved',
      description: 'Your edits have been saved successfully.',
    });
  }, [toast]);

  const handleContentChange = (value: string) => {
    setEditedContent(value);
    setHasUnsavedChanges(true);
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const handleDelete = () => {
    toast({
      title: 'Task deleted',
      description: 'The task has been deleted successfully.',
    });
    navigate('/tasks');
  };

  const handleDuplicate = () => {
    toast({
      title: 'Task duplicated',
      description: 'A copy of this task has been created.',
    });
  };

  const toggleEditMode = () => {
    if (userPlan === 'base') {
      toast({
        title: 'Upgrade required',
        description: 'Rich text editing is available on Pro plan.',
        variant: 'destructive',
      });
      return;
    }
    setEditMode(!editMode);
  };

  const applyFormatting = (format: string) => {
    if (userPlan === 'base') {
      toast({
        title: 'Upgrade to Pro',
        description: 'Text formatting is available on Pro plan.',
        variant: 'destructive',
      });
      return;
    }

    // Get the current selection (simplified - in real app would use proper rich text editor)
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editedContent.substring(start, end) || 'text';
    let formattedText = '';

    // Apply formatting based on type
    switch (format) {
      case 'heading':
        formattedText = `## ${selectedText}`;
        break;
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'bullet':
        formattedText = `\n- ${selectedText}`;
        break;
      case 'numbered':
        formattedText = `\n1. ${selectedText}`;
        break;
      case 'callout':
        formattedText = `\n> ⚠️ ${selectedText}`;
        break;
      case 'code':
        formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
        break;
      default:
        formattedText = selectedText;
    }

    // Replace the selected text with formatted text
    const newContent = 
      editedContent.substring(0, start) + 
      formattedText + 
      editedContent.substring(end);
    
    setEditedContent(newContent);
    setHasUnsavedChanges(true);

    // Set focus back to textarea and update selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + formattedText.length);
    }, 0);
  };

  const restoreVersion = (versionId: string) => {
    if (userPlan === 'base') {
      toast({
        title: 'Upgrade required',
        description: 'Version history is available on Pro plan.',
        variant: 'destructive',
      });
      return;
    }
    setSelectedVersion(versionId);
    toast({
      title: 'Version restored',
      description: 'The selected version has been restored.',
    });
  };

  const handleReloadLatest = () => {
    setShowConflictBanner(false);
    toast({
      title: 'Reloaded',
      description: 'Latest version has been loaded.',
    });
  };

  const handleKeepMine = () => {
    setShowConflictBanner(false);
    toast({
      title: 'Kept your version',
      description: 'Your changes have been preserved.',
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <ScrollArea className="h-full">
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <div>
                        <Skeleton className="h-3 w-16 mb-1" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DashboardLayout>
    );
  }

  if (error || !task) {
    return (
      <DashboardLayout>
        <ScrollArea className="h-full">
          <div className="p-6">
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h2 className="text-xl font-semibold mb-2">Task not found</h2>
              <p className="text-muted-foreground mb-4">
                The task you are looking for does not exist or you don't have permission to view it.
              </p>
              <Button onClick={() => navigate('/tasks')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tasks
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6">
          {/* Conflict Banner */}
          {showConflictBanner && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>This task was edited in another tab. What would you like to do?</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleReloadLatest}>
                    Reload latest
                  </Button>
                  <Button size="sm" onClick={handleKeepMine}>
                    Keep mine
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Header */}
          <div className="space-y-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/tasks">Tasks</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{task.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <h1 className="text-3xl font-bold tracking-tight">{task.title}</h1>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/tasks')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleExport}>Export as PDF</DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExport}>Export to Canva</DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExport}>Export to Gamma</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" size="sm" onClick={handleDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </Button>
                <Button variant="outline" size="sm" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
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
                    <Badge variant="secondary">{task.category}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-sm font-medium">{new Date(task.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Updated</p>
                    <p className="text-sm font-medium">{new Date(task.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Word Count</p>
                    <p className="text-sm font-medium">{task.content.split(' ').length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Language</p>
                    <p className="text-sm font-medium">English</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Tone</p>
                    <Badge variant="outline">neutral</Badge>
                  </div>
                </div>
              </div>
              <Separator className="my-4" />
              <div>
                <p className="text-xs text-muted-foreground mb-2">Status</p>
                <Badge variant={task.status === 'active' ? 'default' : 'secondary'}>
                  {task.status}
                </Badge>
              </div>
              {task.tags && task.tags.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {task.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Content Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Content</CardTitle>
              <div className="flex items-center gap-2">
                {lastSaved && (
                  <span className="text-xs text-muted-foreground">
                    Last saved: {lastSaved.toLocaleTimeString()}
                  </span>
                )}
                {hasUnsavedChanges && (
                  <Badge variant="outline" className="text-xs">Unsaved changes</Badge>
                )}
                {editMode && (
                  <Button variant="default" size="sm" onClick={handleSave} disabled={!hasUnsavedChanges}>
                    Save Changes
                  </Button>
                )}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                      <History className="h-4 w-4 mr-2" />
                      Version History
                      {userPlan === 'base' && <Badge variant="secondary" className="ml-2 text-[10px]">Pro</Badge>}
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Version History</SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="h-full mt-4">
                      {userPlan === 'base' ? (
                        <div className="text-center py-8">
                          <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                          <p className="text-sm text-muted-foreground mb-4">
                            Version history is available on Pro plan
                          </p>
                          <Button className="bg-gradient-primary">
                            <Zap className="h-4 w-4 mr-2" />
                            Upgrade to Pro
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {versions.map((version) => (
                            <Card key={version.id} className="p-4 cursor-pointer hover:bg-accent">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-sm font-medium">{version.label}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(version.timestamp).toLocaleString()}
                                  </p>
                                </div>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => restoreVersion(version.id)}
                                >
                                  Restore
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </SheetContent>
                </Sheet>
                <Button variant="outline" size="sm" onClick={toggleEditMode}>
                  {editMode ? 'View Mode' : 'Edit Mode'}
                  {userPlan === 'base' && <Badge variant="secondary" className="ml-2 text-[10px]">Pro</Badge>}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Rich Text Toolbar (Pro only) */}
              {editMode && (
                <div className="relative">
                  <div className="flex items-center gap-1 p-2 bg-muted rounded-md border">
                    <TooltipProvider>
                      {[
                        { icon: Heading2, label: 'Heading', format: 'heading' },
                        { icon: Bold, label: 'Bold', format: 'bold' },
                        { icon: Italic, label: 'Italic', format: 'italic' },
                        { icon: List, label: 'Bullet List', format: 'bullet' },
                        { icon: ListOrdered, label: 'Numbered List', format: 'numbered' },
                        { icon: AlertTriangle, label: 'Callout', format: 'callout' },
                        { icon: Code, label: 'Code Block', format: 'code' },
                      ].map(({ icon: Icon, label, format }) => (
                        <Tooltip key={format}>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => applyFormatting(format)}
                              disabled={userPlan === 'base'}
                            >
                              <Icon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{label}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </TooltipProvider>
                  </div>
                  {userPlan === 'base' && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-md">
                      <div className="text-center">
                        <p className="text-sm font-medium mb-2">Upgrade to unlock editing</p>
                        <Button size="sm" className="bg-gradient-primary">
                          <Zap className="h-3.5 w-3.5 mr-2" />
                          Upgrade to Pro
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Content Display/Edit */}
              {editMode ? (
                <Textarea
                  id="content-editor"
                  value={editedContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="min-h-[300px] font-mono"
                  disabled={userPlan === 'base'}
                />
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Content</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{task.content}</p>
                  </div>
                  {task.metadata && Object.keys(task.metadata).length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Metadata</h3>
                        <pre className="text-sm text-muted-foreground bg-muted p-3 rounded-md overflow-auto">
                          {JSON.stringify(task.metadata, null, 2)}
                        </pre>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* Export Modal */}
      {task && (
        <ExportModal
          open={showExportModal}
          onOpenChange={setShowExportModal}
          task={{
            id: task.id,
            title: task.title,
            category: task.category,
            summary: task.content.substring(0, 200) + '...',
            steps: [],
            content: task.content,
            createdAt: task.created_at,
            updatedAt: task.updated_at,
            wordCount: task.content.split(' ').length,
            sourceLanguage: 'English',
            tone: 'neutral',
          }}
          userPlan={userPlan}
        />
      )}
    </DashboardLayout>
  );
};

export default TaskDetail;
