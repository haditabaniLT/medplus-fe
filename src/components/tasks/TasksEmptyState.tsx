import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, Sparkles } from 'lucide-react';
import Button  from '../ui/AntButton';

const TasksEmptyState: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <FileQuestion className="h-12 w-12 text-primary" />
        </div>
        <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-primary animate-pulse" />
      </div>
      
      <h2 className="text-2xl font-bold text-foreground mb-2">
        No tasks yet
      </h2>
      
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Start by generating your first task. Our AI will help you break down your goals into actionable steps.
      </p>
      
      <Button
        onClick={() => navigate('/dashboard')}
        className="gap-2"
      >
        <Sparkles className="h-4 w-4" />
        Generate Your First Task
      </Button>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          💡 <span className="font-medium">Tip:</span> Use voice input or text to describe what you want to accomplish
        </p>
      </div>
    </div>
  );
};

export default TasksEmptyState;
