import React from 'react';
import { Input } from 'antd';
import { TextInputProps } from '../../types';
import { cn } from '../../lib/utils';

const TextInput: React.FC<TextInputProps> = ({
  placeholder,
  value,
  onChange,
  type = 'text',
  disabled = false,
  error,
  label,
  required = false,
  icon,
  className,
  maxLength,
  onKeyPress,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <Input
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        type={type}
        disabled={disabled}
        status={error ? 'error' : undefined}
        prefix={icon}
        maxLength={maxLength}
        onKeyPress={onKeyPress}
        className={cn(
          'bg-background border-border text-foreground',
          'hover:border-primary focus:border-primary focus:shadow-glow',
          'transition-all duration-200',
          error && 'border-destructive'
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}
    </div>
  );
};

export default TextInput;