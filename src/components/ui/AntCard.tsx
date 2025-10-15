import React from 'react';
import { Card as AntCard } from 'antd';
import { CardProps } from '../../types';
import { cn } from '../../lib/utils';

const Card: React.FC<CardProps> = ({
  title,
  description,
  actions,
  bordered = true,
  hoverable = false,
  children,
  className,
  ...props
}) => {
  return (
    <AntCard
      title={title}
      extra={actions}
      bordered={bordered}
      hoverable={hoverable}
      className={cn(
        'bg-card text-card-foreground border-border shadow-md',
        'hover:shadow-lg transition-all duration-200',
        hoverable && 'hover:shadow-glow',
        className
      )}
      headStyle={{
        backgroundColor: 'hsl(var(--card))',
        borderBottom: '1px solid hsl(var(--border))',
        color: 'hsl(var(--card-foreground))',
      }}
      bodyStyle={{
        backgroundColor: 'hsl(var(--card))',
        color: 'hsl(var(--card-foreground))',
      }}
      {...props}
    >
      {description && (
        <p className="text-muted-foreground mb-4">{description}</p>
      )}
      {children}
    </AntCard>
  );
};

export default Card;