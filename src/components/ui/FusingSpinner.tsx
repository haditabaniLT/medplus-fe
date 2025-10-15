import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FusingSpinnerProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const FusingSpinner: React.FC<FusingSpinnerProps> = ({
  message = 'Fusing...',
  className,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="relative">
        {/* Outer glow ring */}
        <div
          className={cn(
            'absolute inset-0 rounded-full bg-teal/20 animate-pulse-glow',
            sizeClasses[size]
          )}
        />
        {/* Inner spinning icon */}
        <Loader2
          className={cn(
            'text-teal animate-spin',
            sizeClasses[size]
          )}
          strokeWidth={2.5}
        />
      </div>
      <p
        className={cn(
          'font-medium text-foreground animate-pulse',
          textSizeClasses[size]
        )}
      >
        {message}
      </p>
    </div>
  );
};

export default FusingSpinner;
