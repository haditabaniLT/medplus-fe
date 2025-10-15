# MePlusAI Look & Feel Implementation Guide

This document describes how the Look & Feel guidelines from the Overall MePlusAI Web Application document have been implemented.

## Theme & Colors

### Navy & Teal Color Scheme
- **Navy Background**: `#0B1D3A` → `hsl(211, 74%, 13%)`
- **Teal Accent**: `#1ABC9C` → `hsl(168, 76%, 42%)`

### Dark Mode (Default)
Dark mode is the default theme. Users can toggle to light mode in Settings → Preferences.

**Implementation**:
- `src/index.css`: CSS variables defined for both `:root` (light) and `.dark` (dark mode)
- `tailwind.config.ts`: Theme tokens accessible via Tailwind utilities
- All colors use HSL format for consistency

### Color Usage
- **Backgrounds**: Navy (`--background`)
- **Text**: High-contrast white/light gray (`--foreground`)
- **Accent**: Teal for hover states, buttons, highlights, icons (`--accent`, `--primary`)
- **Interactive Elements**: Teal hover glow effect

## Typography

### Fonts
- **Headlines**: Montserrat (32px, bold)
  - Loaded via Google Fonts
  - Applied to all `h1-h6` elements
  - Tailwind utility: `font-headline`

- **Body & Inputs**: Inter (16px)
  - Loaded via Google Fonts
  - Applied to body text
  - Tailwind utility: `font-sans`

### Implementation
```tsx
// Headlines
<h1 className="text-headline">Decision Mastery</h1>

// Body text (automatically applied via base styles)
<p className="text-body">Task description...</p>
```

## Visuals & Animations

### Glow Hover Effect
All interactive elements have a teal glow on hover.

**Implementation**:
```tsx
// Add to any interactive element
<button className="hover-glow">Click me</button>
<div className="hover-glow-strong">Strong glow</div>
```

### Fade-in/out Animations
Generated content (tasks, templates, notifications) fade in smoothly.

**Implementation**:
```tsx
<div className="animate-fade-in">Generated task</div>
```

### Confetti Animation
Confetti triggers on milestones (task generation, onboarding complete, Pro features).

**Implementation**:
```tsx
import Confetti from '@/components/ui/Confetti';
import { useConfetti } from '@/hooks/useConfetti';

function Component() {
  const { triggerConfetti, confettiActive } = useConfetti();
  
  return (
    <>
      <Confetti trigger={confettiActive} />
      <button onClick={triggerConfetti}>Generate Task</button>
    </>
  );
}
```

### Fusing Spinner
Custom loading spinner with teal glow during task generation.

**Implementation**:
```tsx
import FusingSpinner from '@/components/ui/FusingSpinner';

<FusingSpinner message="Fusing your task..." size="lg" />
```

### Icon System
All icons use Lucide React with teal color.

**Implementation**:
```tsx
import { Sparkles } from 'lucide-react';

<Sparkles className="w-5 h-5 text-teal" />
```

## Emotional Wow

### Milestones & Badges
User achievements are celebrated with badges.

**Implementation**:
```tsx
import MilestoneBadge from '@/components/ui/MilestoneBadge';

<MilestoneBadge type="onboarding" showAnimation />
<MilestoneBadge type="streak" count={7} />
<MilestoneBadge type="ten_tasks" />
```

**Available milestones**:
- `onboarding` - Completed onboarding
- `first_task` - Generated first task
- `ten_tasks` - Generated 10 tasks
- `first_pro` - Upgraded to Pro
- `streak` - Daily usage streak

## Accessibility

### WCAG AA Compliance
All text meets WCAG AA contrast requirements:
- Navy background (#0B1D3A) with white text
- Teal accent (#1ABC9C) with white text

### Focus Rings
All interactive elements have visible teal focus rings.

**Implementation**:
Automatically applied via CSS base styles:
```css
*:focus-visible {
  @apply outline-none ring-2 ring-accent ring-offset-2 ring-offset-background;
}
```

### ARIA Labels
All interactive elements have appropriate ARIA labels.

**Example**:
```tsx
<button
  aria-label="Generate new task"
  onClick={handleGenerate}
>
  <Sparkles className="w-5 h-5" />
</button>
```

### Keyboard Navigation
All interactive elements are keyboard navigable.

**Utilities**:
```tsx
import { handleListKeyboard } from '@/utils/accessibility';

// In your component
const handleKeyDown = (e: React.KeyboardEvent) => {
  const newIndex = handleListKeyboard(
    e,
    currentIndex,
    items.length,
    () => onSelect(items[currentIndex])
  );
  setCurrentIndex(newIndex);
};
```

### Screen Reader Support
```tsx
import { announceToScreenReader } from '@/utils/accessibility';

// Announce important events
announceToScreenReader('Task generated successfully', 'polite');
announceToScreenReader('Error: Please try again', 'assertive');
```

### Reduced Motion
Respects `prefers-reduced-motion` setting.

**Implementation**:
```tsx
import { useReducedMotion } from '@/hooks/useReducedMotion';

function Component() {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <div className={!prefersReducedMotion ? 'animate-fade-in' : ''}>
      Content
    </div>
  );
}
```

## Performance

### Lazy Loading
Non-critical components are lazy loaded.

**Example**:
```tsx
import { lazy, Suspense } from 'react';
import FusingSpinner from '@/components/ui/FusingSpinner';

const ExportModal = lazy(() => import('@/components/export/ExportModal'));
const UpgradeModal = lazy(() => import('@/components/modals/UpgradeModal'));

function Component() {
  return (
    <Suspense fallback={<FusingSpinner />}>
      <ExportModal />
      <UpgradeModal />
    </Suspense>
  );
}
```

### Optimized Assets
- SVG icons from Lucide (tree-shaken)
- Google Fonts loaded with `display=swap`
- Images use lazy loading attribute

## Testing

See `docs/TESTING.md` for comprehensive testing strategy covering:
- E2E tests for all flows
- Visual regression testing
- Accessibility testing
- Performance testing

## Usage Examples

### Complete Interactive Card
```tsx
<Card className="hover-glow interactive">
  <CardHeader>
    <h2 className="text-headline">Decision Mastery</h2>
  </CardHeader>
  <CardContent className="text-body">
    Generate tasks for better decision making.
  </CardContent>
  <CardFooter>
    <Button className="w-full">
      <Sparkles className="w-4 h-4 mr-2" />
      Generate
    </Button>
  </CardFooter>
</Card>
```

### Accessible Form
```tsx
<form onSubmit={handleSubmit}>
  <Label htmlFor="task-input">
    Describe your task
  </Label>
  <Textarea
    id="task-input"
    aria-describedby="task-help"
    placeholder="What do you need help with?"
  />
  <p id="task-help" className="text-sm text-muted-foreground">
    Be specific about your goals and context.
  </p>
  <Button type="submit" aria-label="Generate task">
    Generate
  </Button>
</form>
```

## Design Tokens Quick Reference

### Colors
- `bg-navy` - Navy background
- `bg-teal` - Teal accent
- `text-foreground` - Primary text
- `text-muted-foreground` - Secondary text

### Animations
- `animate-fade-in` - Fade in content
- `animate-scale-in` - Scale in content
- `animate-pulse-glow` - Pulsing glow effect
- `hover-glow` - Hover glow effect

### Typography
- `font-headline` - Montserrat headlines
- `font-sans` - Inter body text
- `text-headline` - 32px bold headline
- `text-body` - 16px body text

### Shadows
- `shadow-glow` - Teal glow shadow
- `shadow-glow-strong` - Strong teal glow
