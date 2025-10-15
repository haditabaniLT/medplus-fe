import { PASSWORD_REQUIREMENTS, EMAIL_REGEX } from '../constants/auth';
import { PasswordRequirement } from '../types';

// Email validation
export const validateEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email.trim());
};

// Password validation
export const validatePassword = (password: string): PasswordRequirement[] => {
  return PASSWORD_REQUIREMENTS.map(req => ({
    label: req.label,
    met: req.regex.test(password),
  }));
};

export const isPasswordValid = (password: string): boolean => {
  return PASSWORD_REQUIREMENTS.every(req => req.regex.test(password));
};

export const validateConfirmPassword = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword && password.length > 0;
};

// Input length validation
export const validateLength = (
  value: string,
  minLength: number,
  maxLength: number
): { valid: boolean; error?: string } => {
  const trimmed = value.trim();
  
  if (trimmed.length < minLength) {
    return {
      valid: false,
      error: `Must be at least ${minLength} characters`,
    };
  }
  
  if (trimmed.length > maxLength) {
    return {
      valid: false,
      error: `Must be no more than ${maxLength} characters`,
    };
  }
  
  return { valid: true };
};

// Character count validation
export const validateCharacterCount = (
  value: string,
  maxChars: number
): { valid: boolean; remaining: number; exceeds: boolean } => {
  const length = value.length;
  const remaining = maxChars - length;
  
  return {
    valid: length <= maxChars,
    remaining: Math.max(0, remaining),
    exceeds: length > maxChars,
  };
};

// Username validation
export const validateUsername = (username: string): { valid: boolean; error?: string } => {
  const trimmed = username.trim();
  
  if (trimmed.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }
  
  if (trimmed.length > 20) {
    return { valid: false, error: 'Username must be no more than 20 characters' };
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return { valid: false, error: 'Username can only contain letters, numbers, hyphens, and underscores' };
  }
  
  return { valid: true };
};

// Generic required field validation
export const validateRequired = (value: string, fieldName: string): { valid: boolean; error?: string } => {
  if (!value || value.trim().length === 0) {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true };
};

// URL validation
export const validateUrl = (url: string): { valid: boolean; error?: string } => {
  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, error: 'Please enter a valid URL' };
  }
};

// Phone number validation (basic)
export const validatePhone = (phone: string): { valid: boolean; error?: string } => {
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  
  if (!phoneRegex.test(phone.trim())) {
    return { valid: false, error: 'Please enter a valid phone number' };
  }
  
  return { valid: true };
};
