import { TaskCategory } from './task.types';

export interface Template {
  id: string;
  name: string;
  content: string;
  tags: string[];
  category: TaskCategory;
  tone: 'neutral' | 'professional' | 'friendly' | 'concise';
  language: string;
  isStarter: boolean;
  isProOnly: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateFormData {
  name: string;
  tags: string[];
}
