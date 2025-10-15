import React from 'react';
import { Eye, Download, MoreVertical, Copy, Pin, Trash2, PinOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../ui/badge';
import Button  from '../ui/AntButton';
import { Checkbox } from '../ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

interface Task {
  id: string;
  title: string;
  category: string;
  createdAt: Date;
  summary: string;
  isPinned: boolean;
}

interface TaskCardProps {
  task: Task;
  isSelected: boolean;
  onToggleSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onPin: () => void;
  onExport?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isSelected,
  onToggleSelect,
  onDelete,
  onDuplicate,
  onPin,
  onExport,
}) => {
  const navigate = useNavigate();

  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onExport) {
      onExport();
    }
  };

  const handleView = () => {
    navigate(`/tasks/${task.id}`);
  };

  return (
    <div
      className={cn(
        'relative border border-border rounded-lg p-4 transition-all hover:border-primary/50 hover:shadow-md',
        isSelected && 'border-primary bg-accent/50',
        task.isPinned && 'border-primary/30 bg-primary/5'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggleSelect}
          className="mt-1"
        />

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Title and Pin Badge */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <h3 className="font-semibold text-foreground hover:text-primary cursor-pointer line-clamp-1 flex-1" onClick={handleView}>
                {task.title}
              </h3>
              {task.isPinned && (
                <Badge variant="secondary" className="gap-1 shrink-0">
                  <Pin className="h-3 w-3" />
                  Pinned
                </Badge>
              )}
            </div>
          </div>

          {/* Category and Date */}
          <div className="flex items-center gap-3 text-sm">
            <Badge variant="outline">{task.category}</Badge>
            <span className="text-muted-foreground">
              {format(task.createdAt, 'MMM dd, yyyy • hh:mm a')}
            </span>
          </div>

          {/* Preview */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.summary}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleView}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>

            {/* Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="ml-auto">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onPin}>
                  {task.isPinned ? (
                    <>
                      <PinOff className="h-4 w-4 mr-2" />
                      Unpin
                    </>
                  ) : (
                    <>
                      <Pin className="h-4 w-4 mr-2" />
                      Pin
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
