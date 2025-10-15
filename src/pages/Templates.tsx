import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { addTemplate, updateTemplate, deleteTemplate } from '../store/slices/templatesSlice';
import { setActiveCategory } from '../store/slices/uiSlice';
import { Template } from '../types/template.types';
import { Sparkles, Plus, Search, Edit, Trash2, Lock, Play, RefreshCw } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
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
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import UpgradeModal from '../components/modals/UpgradeModal';

const Templates: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const user = useSelector((state: RootState) => state.session.user);
  const userPlan = user?.plan || 'BASE';
  const { templates, starterTemplates } = useSelector((state: RootState) => state.templates);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [optimizingTemplate, setOptimizingTemplate] = useState<Template | null>(null);
  
  const filterTemplates = (templateList: Template[]) => {
    if (!searchQuery.trim()) return templateList;
    
    const query = searchQuery.toLowerCase();
    return templateList.filter(
      t =>
        t.name.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query)) ||
        t.content.toLowerCase().includes(query)
    );
  };

  const handleApplyTemplate = (template: Template) => {
    if (template.isProOnly && userPlan === 'BASE') {
      setShowUpgradeModal(true);
      return;
    }

    // Set category in Redux state
    dispatch(setActiveCategory(template.category));
    
    // Navigate to dashboard with template data in state
    navigate('/dashboard', { 
      state: { 
        templateContent: template.content,
        templateTone: template.tone,
        templateLanguage: template.language,
      } 
    });
    
    toast({
      title: 'Template applied',
      description: 'Task generator has been populated with the template.',
    });
  };

  const handleEditTemplate = (template: Template) => {
    if (userPlan === 'BASE' && template.isStarter) {
      setShowUpgradeModal(true);
      return;
    }
    setEditingTemplate(template);
  };

  const handleSaveEdit = () => {
    if (!editingTemplate) return;

    dispatch(updateTemplate({
      id: editingTemplate.id,
      updates: {
        name: editingTemplate.name,
        tags: editingTemplate.tags,
        content: editingTemplate.content,
      },
    }));

    toast({
      title: 'Template updated',
      description: 'Your changes have been saved.',
    });

    setEditingTemplate(null);
  };

  const handleDeleteConfirm = () => {
    if (!deletingTemplate) return;

    dispatch(deleteTemplate(deletingTemplate.id));

    toast({
      title: 'Template deleted',
      description: 'The template has been removed from your library.',
    });

    setDeletingTemplate(null);
  };

  const handleOptimizeTemplate = (template: Template) => {
    if (userPlan === 'BASE') {
      setShowUpgradeModal(true);
      return;
    }
    setOptimizingTemplate(template);
  };

  const handleAcceptOptimization = () => {
    if (!optimizingTemplate) return;

    // Mock optimization: make the content shorter/clearer
    const optimizedContent = `[OPTIMIZED] ${optimizingTemplate.content.slice(0, 150)}...`;
    
    dispatch(updateTemplate({
      id: optimizingTemplate.id,
      updates: { content: optimizedContent },
    }));

    toast({
      title: 'Template optimized',
      description: 'Your template has been improved for better results.',
    });

    setOptimizingTemplate(null);
  };

  const renderTemplateCard = (template: Template, isStarter: boolean = false) => {
    const isProUser = userPlan === 'PRO';
    const isLocked = template.isProOnly && !isProUser;
    const canEdit = !isStarter || isProUser;

    return (
      <Card key={template.id} className={`${isLocked ? 'opacity-75' : ''}`}>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 text-base">
                {template.name}
                {isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                {template.category}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {template.tags.map((tag, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {template.content}
          </p>
          
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => handleApplyTemplate(template)}
              disabled={isLocked}
            >
              <Play className="h-3 w-3 mr-1" />
              Apply
            </Button>
            
            {canEdit && !isStarter && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditTemplate(template)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDeletingTemplate(template)}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleOptimizeTemplate(template)}
              disabled={isLocked}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Optimize
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const filteredMyTemplates = filterTemplates(templates);
  const filteredStarterTemplates = filterTemplates(starterTemplates);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Sparkles className="h-8 w-8" />
                Templates & Prompt Library
              </h1>
              <p className="text-muted-foreground mt-1">
                Save and reuse your best prompts
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates by name, tags, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="my-templates" className="space-y-6">
            <TabsList>
              <TabsTrigger value="my-templates">
                My Templates ({templates.length})
              </TabsTrigger>
              <TabsTrigger value="starter-templates">
                Starter Templates ({starterTemplates.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="my-templates" className="space-y-4">
              {filteredMyTemplates.length === 0 && !searchQuery && (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No templates yet</h3>
                    <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                      Save prompts from your Task Generator to reuse them later
                    </p>
                    <Button onClick={() => navigate('/dashboard')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Go to Task Generator
                    </Button>
                  </CardContent>
                </Card>
              )}

              {filteredMyTemplates.length === 0 && searchQuery && (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Search className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No results found</h3>
                    <p className="text-sm text-muted-foreground">
                      Try a different search term
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredMyTemplates.map(template => renderTemplateCard(template))}
              </div>
            </TabsContent>

            <TabsContent value="starter-templates" className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredStarterTemplates.map(template => renderTemplateCard(template, true))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Edit Template Modal */}
      <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Update your template name, tags, and content
            </DialogDescription>
          </DialogHeader>

          {editingTemplate && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input
                  value={editingTemplate.name}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, name: e.target.value })
                  }
                  placeholder="My Template"
                />
              </div>

              <div className="space-y-2">
                <Label>Tags (comma-separated)</Label>
                <Input
                  value={editingTemplate.tags.join(', ')}
                  onChange={(e) =>
                    setEditingTemplate({
                      ...editingTemplate,
                      tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean),
                    })
                  }
                  placeholder="tag1, tag2, tag3"
                />
              </div>

              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={editingTemplate.content}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, content: e.target.value })
                  }
                  placeholder="Template content..."
                  rows={6}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTemplate(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingTemplate} onOpenChange={() => setDeletingTemplate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingTemplate?.name}"? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Optimize Template Modal */}
      <Dialog open={!!optimizingTemplate} onOpenChange={() => setOptimizingTemplate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Optimize Template</DialogTitle>
            <DialogDescription>
              We've created a shorter, clearer version of your prompt
            </DialogDescription>
          </DialogHeader>

          {optimizingTemplate && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Original</Label>
                <div className="p-3 bg-muted rounded-lg text-sm">
                  {optimizingTemplate.content}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Optimized Version</Label>
                <div className="p-3 bg-primary/10 border border-primary rounded-lg text-sm">
                  [OPTIMIZED] {optimizingTemplate.content.slice(0, 150)}...
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOptimizingTemplate(null)}>
              Keep Original
            </Button>
            <Button onClick={handleAcceptOptimization}>Accept Optimization</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Modal */}
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </DashboardLayout>
  );
};

export default Templates;
