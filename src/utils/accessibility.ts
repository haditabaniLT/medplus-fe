/**
 * Accessibility utility functions
 * Following WCAG AA standards
 */

/**
 * Generate unique IDs for ARIA labels
 */
export const generateAriaId = (prefix: string): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Announce message to screen readers
 * @param message - Message to announce
 * @param priority - 'polite' (default) or 'assertive'
 */
export const announceToScreenReader = (
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Check if element is keyboard focusable
 */
export const isKeyboardFocusable = (element: HTMLElement): boolean => {
  if (element.hasAttribute('disabled')) return false;
  if (element.hasAttribute('tabindex')) {
    const tabindex = parseInt(element.getAttribute('tabindex') || '0', 10);
    return tabindex >= 0;
  }
  
  const focusableElements = [
    'A',
    'BUTTON',
    'INPUT',
    'TEXTAREA',
    'SELECT',
    'DETAILS',
  ];
  
  return focusableElements.includes(element.tagName);
};

/**
 * Trap focus within an element (useful for modals)
 */
export const trapFocus = (element: HTMLElement): (() => void) => {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  element.addEventListener('keydown', handleTabKey);

  // Focus first element
  firstElement?.focus();

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
};

/**
 * Get color contrast ratio (WCAG)
 * @returns ratio between 1 and 21
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (color: string): number => {
    // Simplified luminance calculation
    // In production, use a proper color library
    const rgb = color.match(/\d+/g)?.map(Number) || [0, 0, 0];
    const [r, g, b] = rgb.map((val) => {
      const s = val / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Check if contrast meets WCAG AA standard
 * @param ratio - Contrast ratio from getContrastRatio
 * @param isLargeText - Text is 18pt+ or 14pt+ bold
 * @returns true if meets WCAG AA
 */
export const meetsWCAGAA = (ratio: number, isLargeText = false): boolean => {
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
};

/**
 * Handle keyboard navigation in a list
 * @param event - Keyboard event
 * @param currentIndex - Current focused index
 * @param itemCount - Total number of items
 * @param onSelect - Callback when item is selected (Enter/Space)
 * @returns New index to focus
 */
export const handleListKeyboard = (
  event: React.KeyboardEvent,
  currentIndex: number,
  itemCount: number,
  onSelect?: () => void
): number => {
  let newIndex = currentIndex;

  switch (event.key) {
    case 'ArrowDown':
    case 'Down':
      event.preventDefault();
      newIndex = (currentIndex + 1) % itemCount;
      break;
    case 'ArrowUp':
    case 'Up':
      event.preventDefault();
      newIndex = currentIndex === 0 ? itemCount - 1 : currentIndex - 1;
      break;
    case 'Home':
      event.preventDefault();
      newIndex = 0;
      break;
    case 'End':
      event.preventDefault();
      newIndex = itemCount - 1;
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      onSelect?.();
      break;
  }

  return newIndex;
};
