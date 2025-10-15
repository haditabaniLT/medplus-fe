/**
 * User plan types
 */
export type UserPlan = 'base' | 'pro';

/**
 * Quota limits by plan
 */
export const QUOTA_LIMITS = {
  base: {
    tasksPerMonth: 10,
    maxTaskLength: 4000,
    exportFormats: ['pdf'] as string[],
    features: {
      voiceInput: false,
      promptImprovement: false,
      richTextEditor: false,
      versionHistory: false,
      includeBrand: false,
      gammaExport: false,
    },
  },
  pro: {
    tasksPerMonth: 100,
    maxTaskLength: 10000,
    exportFormats: ['pdf', 'canva', 'gamma'] as string[],
    features: {
      voiceInput: true,
      promptImprovement: true,
      richTextEditor: true,
      versionHistory: true,
      includeBrand: true,
      gammaExport: true,
    },
  },
} as const;

/**
 * Check if user has reached their quota
 */
export const hasReachedQuota = (
  tasksUsed: number,
  userPlan: UserPlan
): boolean => {
  const limit = QUOTA_LIMITS[userPlan].tasksPerMonth;
  return tasksUsed >= limit;
};

/**
 * Calculate remaining quota
 */
export const getRemainingQuota = (
  tasksUsed: number,
  userPlan: UserPlan
): number => {
  const limit = QUOTA_LIMITS[userPlan].tasksPerMonth;
  return Math.max(0, limit - tasksUsed);
};

/**
 * Calculate quota usage percentage
 */
export const getQuotaPercentage = (
  tasksUsed: number,
  userPlan: UserPlan
): number => {
  const limit = QUOTA_LIMITS[userPlan].tasksPerMonth;
  return Math.min(100, (tasksUsed / limit) * 100);
};

/**
 * Check if user can perform an action based on plan
 */
export const canUseFeature = (
  feature: keyof typeof QUOTA_LIMITS.base.features,
  userPlan: UserPlan
): boolean => {
  return QUOTA_LIMITS[userPlan].features[feature];
};

/**
 * Check if export format is available for user's plan
 */
export const canExportAs = (
  format: string,
  userPlan: UserPlan
): boolean => {
  return QUOTA_LIMITS[userPlan].exportFormats.includes(format);
};

/**
 * Get max task length for user's plan
 */
export const getMaxTaskLength = (userPlan: UserPlan): number => {
  return QUOTA_LIMITS[userPlan].maxTaskLength;
};

/**
 * Check if task length is within limit
 */
export const isTaskLengthValid = (
  length: number,
  userPlan: UserPlan
): { valid: boolean; maxLength: number } => {
  const maxLength = getMaxTaskLength(userPlan);
  return {
    valid: length <= maxLength,
    maxLength,
  };
};

/**
 * Get quota warning message
 */
export const getQuotaWarning = (
  tasksUsed: number,
  userPlan: UserPlan
): string | null => {
  const remaining = getRemainingQuota(tasksUsed, userPlan);
  const percentage = getQuotaPercentage(tasksUsed, userPlan);
  
  if (remaining === 0) {
    return 'You have reached your monthly task limit. Upgrade to Pro to continue.';
  }
  
  if (percentage >= 90) {
    return `You have ${remaining} task${remaining !== 1 ? 's' : ''} remaining this month.`;
  }
  
  if (percentage >= 75) {
    return `You're approaching your monthly limit (${remaining} tasks remaining).`;
  }
  
  return null;
};

/**
 * Format quota display
 */
export const formatQuotaDisplay = (
  tasksUsed: number,
  userPlan: UserPlan
): string => {
  const limit = QUOTA_LIMITS[userPlan].tasksPerMonth;
  return `${tasksUsed}/${limit}`;
};
