import React from 'react';
import { Select } from 'antd';
import { DropdownProps } from '../../types';
import { cn } from '../../lib/utils';

const { Option } = Select;

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  label,
  className,
  ...props
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <Select
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          'w-full',
          '[&_.ant-select-selector]:bg-background [&_.ant-select-selector]:border-border',
          '[&_.ant-select-selector]:text-foreground',
          '[&_.ant-select-selection-placeholder]:text-muted-foreground',
          'hover:[&_.ant-select-selector]:border-primary',
          'transition-all duration-200'
        )}
        dropdownClassName="bg-popover border-border shadow-lg"
        {...props}
      >
        {options.map((option) => (
          <Option 
            key={option.value} 
            value={option.value} 
            disabled={option.disabled}
            className="text-popover-foreground hover:bg-accent"
          >
            {option.label}
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default Dropdown;