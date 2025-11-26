import React from 'react';
import { cn } from '../../lib/utils';
import {
  GraduationCap,
  Megaphone,
  Users as UsersIcon,
  Heart,
  TrendingUp,
  Palette as PaletteIcon,
  Briefcase,
  Calendar,
  User,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../ui/button';

interface SuperPromptCardProps {
  id: string;
  title: string;
  category: string;
  task: string;
  tone?: string;
  audience?: string;
  createdAt: string;
  onClick?: () => void;
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Decision Mastery': GraduationCap,
  'Influence Builder': Megaphone,
  'Team Ignition': UsersIcon,
  'Mindset Recharge': Heart,
  'Network Catalyst': TrendingUp,
  'Play Time': PaletteIcon,
  'Other/Custom': Briefcase,
};

const SuperPromptCard: React.FC<SuperPromptCardProps> = ({
  id,
  title,
  category,
  task,
  tone,
  audience,
  createdAt,
  onClick,
}) => {
  const Icon = categoryIcons[category] || Briefcase;
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      className={cn(
        'bg-card border border-border rounded-lg p-6 hover:shadow-md transition-all cursor-pointer',
        'hover:border-primary/50'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <span className="text-xs text-muted-foreground">{category}</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{task}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {tone && (
          <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
            Tone: {tone}
          </span>
        )}
        {audience && (
          <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground flex items-center gap-1">
            <User className="h-3 w-3" />
            {audience}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{formattedDate}</span>
        </div>
        <Button variant="ghost" size="sm" className="h-8">
          View
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default SuperPromptCard;



