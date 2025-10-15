import React from 'react';
import { Button as AntButton } from 'antd';
import { ButtonProps } from '../../types';
import { cn } from '../../lib/utils';

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  icon,
  children,
  className,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-primary !text-white border-0 hover:!text-teal hover:opacity-90 shadow-glow';
      case 'secondary':
        return 'bg-secondary text-secondary-foreground border-border hover:bg-accent';
      case 'outline':
        return 'bg-transparent text-foreground border-border hover:bg-accent hover:!text-teal';
      case 'ghost':
        return 'bg-transparent text-foreground border-0 hover:bg-accent hover:!text-teal';
      case 'danger':
        return 'bg-destructive text-destructive-foreground border-0 hover:opacity-90';
      default:
        return 'bg-gradient-primary !text-white border-0 hover:!text-teal hover:opacity-90 shadow-glow';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-8 px-3 text-sm';
      case 'lg':
        return 'h-12 px-8 text-lg';
      case 'md':
      default:
        return 'h-10 px-6 text-base';
    }
  };

  return (
    <AntButton
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      htmlType={type}
      icon={icon}
      className={cn(
        'font-medium rounded-lg transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        getVariantClasses(),
        getSizeClasses(),
        className
      )}
      {...props}
    >
      {children}
    </AntButton>
  );
};

export default Button;