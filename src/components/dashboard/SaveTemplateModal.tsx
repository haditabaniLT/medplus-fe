import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Save, X } from 'lucide-react';
import { addTemplate } from '../../store/slices/templatesSlice';
import { Template } from '../../types/template.types';
import { TaskCategory } from '../../types/task.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import Button from '../ui/AntButton';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { useToast } from '@/hooks/use-toast';

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  category: TaskCategory;
  tone: 'neutral' | 'professional' | 'friendly' | 'concise';
  language: string;
}

const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({
  isOpen,
  onClose,
  content,
  category,
  tone,
  language,
}) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter a name for your template.',
        variant: 'destructive',
      });
      return;
    }

    const template: Template = {
      id: `template-${Date.now()}`,
      name: name.trim(),
      content,
      tags,
      category,
      tone,
      language,
      isStarter: false,
      isProOnly: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch(addTemplate(template));

    toast({
      title: 'Template saved',
      description: 'Your template has been saved to your library.',
    });

    // Reset and close
    setName('');
    setTags([]);
    setTagInput('');
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
          <DialogDescription>
            Give your template a name and add tags for easy searching
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name*</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My awesome template"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="template-tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag and press Enter"
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 bg-muted rounded-lg space-y-1">
            <p className="text-xs text-muted-foreground">Preview:</p>
            <p className="text-sm line-clamp-3">{content}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveTemplateModal;
