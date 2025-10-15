// Core types for the application
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'user';
  plan: 'BASE' | 'PRO';
  isAuthenticated: boolean;
  onboarding: boolean;
}

export interface SignupFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  consent: boolean;
}

export interface PasswordRequirement {
  label: string;
  met: boolean;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  code: string;
  password: string;
  confirmPassword: string;
}

export interface SessionState {
  user: User | null;
  isAuthenticated: boolean;
  sessionExpiry: number | null;
  loginTime: number | null;
  showIdleModal: boolean;
  lastActivity: number | null;
}

export interface ThemeState {
  isDark: boolean;
}

export interface AppState {
  session: SessionState;
  theme: ThemeState;
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface TextInputProps extends BaseComponentProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number';
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  icon?: React.ReactNode;
  maxLength?: number;
  onKeyPress?: (e: React.KeyboardEvent) => void;
}

export interface DropdownProps extends BaseComponentProps {
  options: DropdownOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
}

export interface DropdownOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
}

export interface CardProps extends BaseComponentProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  bordered?: boolean;
  hoverable?: boolean;
}

// API Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// Layout Types
export interface LayoutProps extends BaseComponentProps {
  sidebar?: boolean;
  header?: boolean;
  footer?: boolean;
}

export type ResponsiveSize = 'mobile' | 'tablet' | 'desktop';

export interface ResponsiveProps {
  mobile?: any;
  tablet?: any;
  desktop?: any;
}

// Onboarding Types
export interface OnboardingState {
  currentStep: number;
  isCompleted: boolean;
  data: OnboardingData;
  hasUnsavedChanges: boolean;
  loading: boolean;
}

export interface OnboardingData {
  role?: string;
  goals: string[];
  customGoal?: string;
  bio?: string;
  industry?: string;
  seniority?: string;
  logo?: File | null;
  primaryColor?: string;
  secondaryColor?: string;
  font?: string;
  customFont?: string;
}

export interface OnboardingStepProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  canGoNext: boolean;
  currentStep: number;
  totalSteps: number;
}

// Re-export task and export types
export * from './task.types';
export * from './export.types';
