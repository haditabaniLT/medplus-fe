import React from 'react';
import { Award, CheckCircle, Sparkles, Trophy, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from './badge';

interface MilestoneBadgeProps {
  type: 'onboarding' | 'first_task' | 'ten_tasks' | 'first_pro' | 'streak';
  count?: number;
  className?: string;
  showAnimation?: boolean;
}

const milestoneConfig = {
  onboarding: {
    icon: CheckCircle,
    label: 'Onboarded',
    color: 'bg-success/20 text-success border-success/30',
  },
  first_task: {
    icon: Sparkles,
    label: 'First Task',
    color: 'bg-teal/20 text-teal border-teal/30',
  },
  ten_tasks: {
    icon: Trophy,
    label: '10 Tasks',
    color: 'bg-warning/20 text-warning border-warning/30',
  },
  first_pro: {
    icon: Zap,
    label: 'Pro User',
    color: 'bg-primary/20 text-primary border-primary/30',
  },
  streak: {
    icon: Award,
    label: 'Day Streak',
    color: 'bg-info/20 text-info border-info/30',
  },
};

const MilestoneBadge: React.FC<MilestoneBadgeProps> = ({
  type,
  count,
  className,
  showAnimation = false,
}) => {
  const config = milestoneConfig[type];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        'flex items-center gap-1.5 px-3 py-1 border',
        config.color,
        showAnimation && 'animate-scale-in hover-glow',
        className
      )}
      role="status"
      aria-label={`Milestone: ${config.label}${count ? ` ${count}` : ''}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="text-xs font-semibold">
        {count !== undefined && type === 'streak' ? `${count} ` : ''}
        {config.label}
      </span>
    </Badge>
  );
};

export default MilestoneBadge;
