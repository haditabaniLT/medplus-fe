/**
 * Export-related types
 */

import { Task } from './task.types';
import { UserPlan } from '../utils/quotaHelpers';

export type ExportFormat = 'pdf' | 'canva' | 'gamma';

export interface ExportOptions {
  includeTitle: boolean;
  includeMetadata: boolean;
  includeBrand: boolean;
}

export interface PdfExportOptions extends ExportOptions {
  pageNumbers: boolean;
  paperSize: 'letter' | 'a4';
  margins: 'narrow' | 'normal' | 'wide';
}

export interface CanvaExportOptions extends ExportOptions {
  connected: boolean;
}

export interface GammaExportOptions extends ExportOptions {
  theme: 'modern' | 'minimal' | 'bold' | 'classic';
  logo: boolean;
  accentColor: string;
  ctaSlide: boolean;
  agendaSlide: boolean;
  connected: boolean;
}

export interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  userPlan: UserPlan;
}

export interface ExportState {
  isExporting: boolean;
  error: string | null;
  activeFormat: ExportFormat;
}

export interface ExportResult {
  success: boolean;
  url?: string;
  error?: string;
}
