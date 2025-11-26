import React from 'react';
import { Info } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

interface LivePreviewProps {
  role: string;
  industry?: string;
  task: string;
  tone: string;
  audience: string;
  categoryName: string;
}

const LivePreview: React.FC<LivePreviewProps> = ({
  role,
  industry,
  task,
  tone,
  audience,
  categoryName,
}) => {
  const displayRole = role || 'professional';
  const displayIndustry = industry ? ` in ${industry}` : '';

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-foreground">Live Preview</h3>
        <div className="text-xs text-muted-foreground">Updates in real-time</div>
      </div>

      <div className="space-y-3 text-sm">
        {/* Role */}
        <div className="flex items-start gap-2">
          <span className="font-medium text-foreground min-w-[80px]">Role:</span>
          <div className="flex-1 flex items-start gap-2">
            <span className="text-muted-foreground">
              You are a <span className="text-foreground font-medium">{displayRole}</span>
              {displayIndustry}.
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help mt-0.5" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Your role from your profile</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Task */}
        <div className="flex items-start gap-2">
          <span className="font-medium text-foreground min-w-[80px]">Task:</span>
          <div className="flex-1 flex items-start gap-2">
            <span className="text-muted-foreground">
              {task ? (
                <>
                  Your task is to: <span className="text-foreground font-medium">{task}</span>
                </>
              ) : (
                <span className="italic">Enter a task to see preview...</span>
              )}
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help mt-0.5" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Task: defines what you want to accomplish</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Tone */}
        {tone && (
          <div className="flex items-start gap-2">
            <span className="font-medium text-foreground min-w-[80px]">Tone:</span>
            <div className="flex-1 flex items-start gap-2">
              <span className="text-muted-foreground">
                <span className="text-foreground font-medium">{tone}</span>
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help mt-0.5" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Tone: determines the style of language in your output</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )}

        {/* Audience */}
        {audience && (
          <div className="flex items-start gap-2">
            <span className="font-medium text-foreground min-w-[80px]">Audience:</span>
            <div className="flex-1 flex items-start gap-2">
              <span className="text-muted-foreground">
                <span className="text-foreground font-medium">{audience}</span>
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help mt-0.5" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Audience: who will receive or view this output</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )}

        {/* Category Context */}
        {categoryName && (
          <div className="flex items-start gap-2 pt-2 border-t border-border">
            <span className="font-medium text-foreground min-w-[80px]">Category:</span>
            <div className="flex-1">
              <span className="text-muted-foreground">
                <span className="text-foreground font-medium">{categoryName}</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LivePreview;



