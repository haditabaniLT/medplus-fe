/**
 * File validation utilities
 */

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Allowed file types
 */
export const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/mp3'],
} as const;

/**
 * Max file sizes (in bytes)
 */
export const MAX_FILE_SIZES = {
  image: 5 * 1024 * 1024, // 5MB
  document: 10 * 1024 * 1024, // 10MB
  audio: 20 * 1024 * 1024, // 20MB
  default: 5 * 1024 * 1024, // 5MB
} as const;

/**
 * Validate file type
 */
export const validateFileType = (
  file: File,
  allowedTypes: string[]
): FileValidationResult => {
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed. Please upload: ${getAllowedExtensions(allowedTypes)}`,
    };
  }
  
  return { valid: true };
};

/**
 * Validate file size
 */
export const validateFileSize = (
  file: File,
  maxSize: number
): FileValidationResult => {
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${formatFileSize(maxSize)}. Please choose a smaller file.`,
    };
  }
  
  return { valid: true };
};

/**
 * Comprehensive file validation
 */
export const validateFile = (
  file: File,
  options: {
    allowedTypes?: string[];
    maxSize?: number;
  } = {}
): FileValidationResult => {
  const {
    allowedTypes = [...ALLOWED_FILE_TYPES.images, ...ALLOWED_FILE_TYPES.documents],
    maxSize = MAX_FILE_SIZES.default,
  } = options;
  
  // Validate type
  const typeValidation = validateFileType(file, allowedTypes);
  if (!typeValidation.valid) {
    return typeValidation;
  }
  
  // Validate size
  const sizeValidation = validateFileSize(file, maxSize);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }
  
  return { valid: true };
};

/**
 * Validate image file
 */
export const validateImageFile = (file: File): FileValidationResult => {
  return validateFile(file, {
    allowedTypes: [...ALLOWED_FILE_TYPES.images],
    maxSize: MAX_FILE_SIZES.image,
  });
};

/**
 * Validate document file
 */
export const validateDocumentFile = (file: File): FileValidationResult => {
  return validateFile(file, {
    allowedTypes: [...ALLOWED_FILE_TYPES.documents],
    maxSize: MAX_FILE_SIZES.document,
  });
};

/**
 * Validate audio file
 */
export const validateAudioFile = (file: File): FileValidationResult => {
  return validateFile(file, {
    allowedTypes: [...ALLOWED_FILE_TYPES.audio],
    maxSize: MAX_FILE_SIZES.audio,
  });
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Get file extension
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
};

/**
 * Get allowed extensions from MIME types
 */
const getAllowedExtensions = (mimeTypes: string[]): string => {
  const extensionMap: Record<string, string> = {
    'image/jpeg': '.jpg, .jpeg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'audio/mpeg': '.mp3',
    'audio/wav': '.wav',
  };
  
  const extensions = mimeTypes
    .map(type => extensionMap[type] || '')
    .filter(Boolean);
    
  return extensions.join(', ');
};

/**
 * Check if file is an image
 */
export const isImageFile = (file: File): boolean => {
  return ALLOWED_FILE_TYPES.images.includes(file.type as any);
};

/**
 * Check if file is a document
 */
export const isDocumentFile = (file: File): boolean => {
  return ALLOWED_FILE_TYPES.documents.includes(file.type as any);
};

/**
 * Check if file is audio
 */
export const isAudioFile = (file: File): boolean => {
  return ALLOWED_FILE_TYPES.audio.includes(file.type as any);
};
