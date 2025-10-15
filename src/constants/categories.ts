/**
 * Central categories configuration
 * Used across the application for consistent categorization
 */

export const CATEGORIES = [
  "Decision Mastery",
  "Influence Builder",
  "Team Ignition",
  "Wealth Navigator",
  "Innovation Scout",
  "Mindset Recharge",
  "Network Catalyst",
  "Business Driver",
  "Meeting Matters",
  "Customer Central",
  "Play Time",
  "Other/Custom"
] as const;

export const DEFAULT_CATEGORY = "Decision Mastery";

// Free plan gets first 5 categories
export const FREE_CATEGORIES_COUNT = 5;

// Helper to check if a category is available for free users
export const isCategoryFree = (category: string): boolean => {
  const index = CATEGORIES.indexOf(category as any);
  return index >= 0 && index < FREE_CATEGORIES_COUNT;
};

// Helper to check if user can access a category
export const canAccessCategory = (category: string, userPlan: 'base' | 'pro'): boolean => {
  if (userPlan === 'pro') return true;
  return isCategoryFree(category);
};

// Helper to check if a string is a valid category
export const isValidCategory = (category: string): category is typeof CATEGORIES[number] => {
  return CATEGORIES.includes(category as any);
};

// Helper to get category display name
export const getCategoryDisplayName = (category: string): string => {
  return isValidCategory(category) ? category : DEFAULT_CATEGORY;
};
