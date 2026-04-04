# React UI/UX Design Mastery — 2026 Best Practices

> Complete guide to building world-class React interfaces based on patterns from the best developer tools and SaaS products of 2026.

---

## Table of Contents

1. [Design System Architecture](#1-design-system-architecture)
2. [Component Patterns](#2-component-patterns)
3. [Animation & Micro-Interactions](#3-animation--micro-interactions)
4. [Accessibility (a11y)](#4-accessibility-a11y)
5. [Performance Optimization](#5-performance-optimization)
6. [Responsive Design](#6-responsive-design)
7. [State Management for UI](#7-state-management-for-ui)
8. [Dark/Light Theme System](#8-darklight-theme-system)
9. [Form UX Patterns](#9-form-ux-patterns)
10. [Loading States & Feedback](#10-loading-states--feedback)

---

## 1. Design System Architecture

### Token Hierarchy

```css
/* Level 1: Raw values (never used directly) */
--blue-500: #3b82f6;
--spacing-4: 16px;

/* Level 2: Semantic tokens (use these in components) */
--color-primary: var(--blue-500);
--color-border: var(--gray-200);
--spacing-md: var(--spacing-4);

/* Level 3: Component tokens (override for specific components) */
--button-bg: var(--color-primary);
--button-radius: var(--radius-md);
```

### Essential Token Categories

```css
:root {
  /* Colors */
  --color-primary: #6366f1;
  --color-primary-hover: #4f46e5;
  --color-primary-active: #4338ca;
  --color-primary-muted: rgba(99, 102, 241, 0.1);
  
  /* Typography */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  
  /* Spacing (4px base unit) */
  --sp-1: 4px;
  --sp-2: 8px;
  --sp-3: 12px;
  --sp-4: 16px;
  --sp-5: 20px;
  --sp-6: 24px;
  --sp-8: 32px;
  --sp-10: 40px;
  --sp-12: 48px;
  --sp-16: 64px;
  --sp-20: 80px;
  
  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  --shadow-glow: 0 0 20px rgba(99, 102, 241, 0.3);
  
  /* Transitions */
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
  
  /* Z-Index Scale */
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-overlay: 300;
  --z-modal: 400;
  --z-toast: 500;
  --z-tooltip: 600;
}
```

### Best Practices

- **Never use raw color values in components** — always use semantic tokens
- **Use 4px grid system** for consistent spacing
- **Define hover/active states** for every interactive color
- **Use CSS custom properties** for theme switching
- **Document every token** with comments explaining its purpose

---

## 2. Component Patterns

### The Compound Component Pattern

```jsx
// Usage:
// <Select>
//   <Select.Trigger placeholder="Choose..." />
//   <Select.List>
//     <Select.Item value="1">Option 1</Select.Item>
//     <Select.Item value="2">Option 2</Select.Item>
//   </Select.List>
// </Select>

function Select({ children, value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <SelectContext.Provider value={{ value, onChange, open, setOpen }}>
      <div className="select-root">{children}</div>
    </SelectContext.Provider>
  );
}

Select.Trigger = function SelectTrigger({ placeholder }) {
  const { open, setOpen } = useSelectContext();
  return (
    <button 
      onClick={() => setOpen(!open)}
      className="select-trigger"
      aria-expanded={open}
    >
      {placeholder}
    </button>
  );
};

Select.Item = function SelectItem({ value, children }) {
  const { value: selectedValue, onChange, setOpen } = useSelectContext();
  return (
    <div
      role="option"
      aria-selected={value === selectedValue}
      onClick={() => { onChange(value); setOpen(false); }}
      className="select-item"
    >
      {children}
    </div>
  );
};
```

### The Render Props Pattern

```jsx
function MouseTracker({ children }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMove = (e) => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);
  
  return children(position);
}

// Usage:
<MouseTracker>
  {({ x, y }) => <div>Mouse at: {x}, {y}</div>}
</MouseTracker>
```

### The Headless Component Pattern

```jsx
// No styling — just behavior
function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  return {
    on,
    toggle: () => setOn(v => !v),
    setOn,
    getButtonProps: () => ({
      onClick: () => setOn(v => !v),
      'aria-pressed': on,
    }),
  };
}

// Usage with any styling:
function Toggle() {
  const { on, getButtonProps } = useToggle();
  return (
    <button {...getButtonProps()} className={on ? 'on' : 'off'}>
      {on ? 'ON' : 'OFF'}
    </button>
  );
}
```

### Component Best Practices

1. **Single responsibility** — each component does one thing well
2. **Composition over configuration** — prefer `<Card><Card.Header /></Card>` over `<Card showHeader title="..." />`
3. **Forward refs** — always use `React.forwardRef` for primitive components
4. **Display names** — set `Component.displayName` for debugging
5. **Prop validation** — use TypeScript or PropTypes
6. **Default props** — provide sensible defaults
7. **Spread props carefully** — only pass through relevant HTML attributes

---

## 3. Animation & Micro-Interactions

### Framer Motion Patterns

#### Staggered List Entrance

```jsx
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
};

function StaggeredList({ items }) {
  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {items.map((item) => (
        <motion.div key={item.id} variants={item}>
          {item.content}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

#### Page Transitions

```jsx
function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

#### Hover Micro-Interactions

```jsx
function HoverCard({ children }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

#### Shared Layout Transitions

```jsx
function ExpandableCard({ expanded, onClick }) {
  return (
    <motion.div
      layout
      onClick={onClick}
      style={{ borderRadius: 12 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {expanded ? <FullContent /> : <Preview />}
    </motion.div>
  );
}
```

### CSS Animation Patterns

#### Subtle Pulse for Loading

```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.loading-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

#### Skeleton Shimmer

```css
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.skeleton {
  background: var(--bg-card);
  position: relative;
  overflow: hidden;
}

.skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
  animation: shimmer 1.5s infinite;
}
```

#### Gradient Flow

```css
@keyframes gradient-flow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.gradient-text {
  background: linear-gradient(90deg, #6366f1, #8b5cf6, #6366f1);
  background-size: 200% 200%;
  animation: gradient-flow 3s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Animation Best Practices

1. **Duration**: 150ms for micro-interactions, 300ms for page transitions
2. **Easing**: Use `cubic-bezier(0.16, 1, 0.3, 1)` for natural motion
3. **Stagger**: 50-100ms between items in lists
4. **Respect `prefers-reduced-motion`**:
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after {
       animation-duration: 0.01ms !important;
       transition-duration: 0.01ms !important;
     }
   }
   ```
5. **Animate transform and opacity only** — avoid animating layout properties
6. **Use `will-change` sparingly** — only for elements that animate frequently
7. **Provide visual feedback** for every user action (hover, click, focus)

---

## 4. Accessibility (a11y)

### Essential ARIA Patterns

```jsx
// Modal
function Modal({ isOpen, onClose, children }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="modal-overlay"
    >
      <h2 id="modal-title">Title</h2>
      {children}
      <button onClick={onClose} aria-label="Close modal">✕</button>
    </div>
  );
}

// Tabs
function Tabs({ tabs }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div role="tablist">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={i === active}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => setActive(i)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, i) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={i !== active}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
```

### Focus Management

```jsx
// Trap focus in modal
function useFocusTrap(ref, isActive) {
  useEffect(() => {
    if (!isActive || !ref.current) return;
    
    const focusable = ref.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    
    first?.focus();
    
    const handleTab = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    
    ref.current.addEventListener('keydown', handleTab);
    return () => ref.current?.removeEventListener('keydown', handleTab);
  }, [isActive, ref]);
}
```

### Keyboard Navigation

```jsx
// List with arrow key navigation
function KeyboardList({ items, onSelect }) {
  const [index, setIndex] = useState(0);
  
  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setIndex(i => Math.min(i + 1, items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        onSelect(items[index]);
        break;
    }
  };
  
  return (
    <div role="listbox" onKeyDown={handleKeyDown}>
      {items.map((item, i) => (
        <div
          key={item.id}
          role="option"
          aria-selected={i === index}
          tabIndex={i === index ? 0 : -1}
          className={i === index ? 'selected' : ''}
          onClick={() => onSelect(item)}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
}
```

### Accessibility Checklist

- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible (use `:focus-visible`)
- [ ] Color contrast meets WCAG AA (4.5:1 for text, 3:1 for large text)
- [ ] Images have `alt` text
- [ ] Forms have labels (visible or `aria-label`)
- [ ] Error messages are announced to screen readers (`aria-live`)
- [ ] Skip navigation link for keyboard users
- [ ] No content that flashes more than 3 times per second

---

## 5. Performance Optimization

### React Performance Patterns

```jsx
// Memoize expensive components
const ExpensiveChart = React.memo(function ExpensiveChart({ data }) {
  return <canvas>{/* ... */}</canvas>;
});

// Memoize callbacks
function Parent() {
  const [count, setCount] = useState(0);
  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []);
  
  return <Child onClick={handleClick} />;
}

// Memoize values
function Component({ items }) {
  const sorted = useMemo(() => 
    [...items].sort((a, b) => a.priority - b.priority),
    [items]
  );
  
  return <List items={sorted} />;
}
```

### Code Splitting

```jsx
// Route-level splitting
const Settings = React.lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}

// Component-level splitting
const HeavyEditor = React.lazy(() => import('./HeavyEditor'));

function Page() {
  const [showEditor, setShowEditor] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShowEditor(true)}>Open Editor</button>
      {showEditor && (
        <Suspense fallback={<Skeleton />}>
          <HeavyEditor />
        </Suspense>
      )}
    </div>
  );
}
```

### Image Optimization

```jsx
// Lazy loading with placeholder
function OptimizedImage({ src, alt, width, height }) {
  const [loaded, setLoaded] = useState(false);
  
  return (
    <div className="image-container" style={{ aspectRatio: `${width}/${height}` }}>
      {!loaded && <div className="skeleton" />}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={loaded ? 'visible' : 'hidden'}
      />
    </div>
  );
}
```

### Performance Checklist

- [ ] Use `React.memo` for components that render often with same props
- [ ] Use `useCallback` for functions passed as props
- [ ] Use `useMemo` for expensive calculations
- [ ] Code split routes and heavy components
- [ ] Lazy load images and below-fold content
- [ ] Use `content-visibility: auto` for long lists
- [ ] Virtualize long lists (react-window, react-virtualized)
- [ ] Minimize re-renders with proper state placement
- [ ] Use CSS `contain` property for isolated components

---

## 6. Responsive Design

### Mobile-First Breakpoints

```css
/* Default: mobile (320px+) */
.container { padding: 16px; }

/* Tablet (768px+) */
@media (min-width: 768px) {
  .container { padding: 24px; }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .container { padding: 32px; max-width: 1200px; margin: 0 auto; }
}

/* Large desktop (1440px+) */
@media (min-width: 1440px) {
  .container { max-width: 1400px; }
}
```

### Touch-Friendly Targets

```css
/* Minimum 44x44px touch targets */
@media (max-width: 768px) {
  button, [role="button"], input[type="submit"] {
    min-height: 44px;
    min-width: 44px;
    padding: 12px 16px;
  }
  
  /* Increase font size for readability */
  input, select, textarea {
    font-size: 16px; /* Prevents zoom on iOS */
  }
}
```

### Responsive Grid Patterns

```css
/* Auto-fill grid */
.grid-auto {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

/* Responsive without media queries */
.grid-responsive {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
  gap: 24px;
}
```

---

## 7. State Management for UI

### Zustand for Global UI State

```jsx
import { create } from 'zustand';

const useUIStore = create((set) => ({
  // Theme
  theme: 'dark',
  setTheme: (theme) => set({ theme }),
  
  // Sidebar
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  
  // Toast notifications
  toasts: [],
  addToast: (toast) => set((s) => ({ 
    toasts: [...s.toasts, { id: Date.now(), ...toast }] 
  })),
  removeToast: (id) => set((s) => ({ 
    toasts: s.toasts.filter(t => t.id !== id) 
  })),
  
  // Modal
  modal: null,
  openModal: (modal) => set({ modal }),
  closeModal: () => set({ modal: null }),
}));
```

### Local State Patterns

```jsx
// Custom hook for form state
function useForm(initialValues) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const handleChange = (name, value) => {
    setValues(v => ({ ...v, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: undefined }));
  };
  
  const handleBlur = (name) => {
    setTouched(t => ({ ...t, [name]: true }));
  };
  
  return { values, errors, touched, handleChange, handleBlur, setErrors };
}
```

---

## 8. Dark/Light Theme System

### CSS Theme Tokens

```css
:root, [data-theme="dark"] {
  --bg-primary: #0a0a0f;
  --bg-secondary: #12121a;
  --bg-tertiary: #1a1a2e;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --border-color: rgba(255, 255, 255, 0.08);
  --shadow-color: rgba(0, 0, 0, 0.3);
}

[data-theme="light"] {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #64748b;
  --border-color: rgba(0, 0, 0, 0.08);
  --shadow-color: rgba(0, 0, 0, 0.1);
}
```

### Theme Toggle Component

```jsx
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="theme-toggle"
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

// Persist theme preference
function useTheme() {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  return { theme, setTheme };
}
```

---

## 9. Form UX Patterns

### Inline Validation

```jsx
function FormField({ label, error, touched, children, required }) {
  return (
    <div className="form-field">
      <label className="form-label">
        {label}
        {required && <span className="required" aria-hidden="true">*</span>}
      </label>
      {children}
      {touched && error && (
        <p role="alert" className="form-error" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}
```

### Auto-Save Pattern

```jsx
function useAutoSave(data, delay = 1000) {
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(async () => {
      setSaving(true);
      try {
        await saveToServer(data);
        setSaving(false);
      } catch (err) {
        setSaving(false);
        showError('Failed to save');
      }
    }, delay);
    
    return () => clearTimeout(timer);
  }, [data, delay]);
  
  return { saving };
}
```

### Form Best Practices

1. **Validate on blur** — show errors when user leaves a field
2. **Validate on change** — clear errors as user fixes them
3. **Disable submit while saving** — prevent double submissions
4. **Show loading states** — spinner on submit button
5. **Preserve form data** — don't lose data on navigation
6. **Keyboard shortcuts** — Ctrl+S to save, Escape to cancel
7. **Clear error messages** — explain what's wrong and how to fix it

---

## 10. Loading States & Feedback

### Skeleton Screens

```jsx
function CardSkeleton() {
  return (
    <div className="card-skeleton">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-text" />
      <div className="skeleton skeleton-text skeleton-short" />
    </div>
  );
}
```

### Toast Notifications

```jsx
function useToast() {
  const { addToast } = useUIStore();
  
  return {
    success: (message) => addToast({ type: 'success', message, duration: 3000 }),
    error: (message) => addToast({ type: 'error', message, duration: 5000 }),
    info: (message) => addToast({ type: 'info', message, duration: 3000 }),
    warning: (message) => addToast({ type: 'warning', message, duration: 4000 }),
  };
}
```

### Optimistic Updates

```jsx
function useOptimisticMutation(mutationFn, onSuccess, onError) {
  return async (optimisticData) => {
    // Show optimistic update immediately
    onSuccess(optimisticData);
    
    try {
      await mutationFn(optimisticData);
    } catch (error) {
      // Rollback on error
      onError(error);
    }
  };
}
```

### Loading State Checklist

- [ ] Show skeleton screens for content loading
- [ ] Show spinner for actions (submit, delete, etc.)
- [ ] Disable interactive elements during loading
- [ ] Show progress for long operations
- [ ] Provide cancel option for cancellable operations
- [ ] Show success/error feedback after actions
- [ ] Use optimistic updates for better perceived performance

---

## Quick Reference: Best Libraries 2026

| Category | Library | Why |
|----------|---------|-----|
| **UI Components** | shadcn/ui | Copy-paste, fully customizable, accessible |
| **Animations** | Framer Motion | Production-ready, layout animations |
| **Icons** | lucide-react | Clean, consistent, tree-shakeable |
| **State** | Zustand | Simple, fast, no boilerplate |
| **Forms** | React Hook Form | Performant, validated, accessible |
| **Tables** | TanStack Table | Headless, flexible, virtualized |
| **Charts** | Recharts | Composable, customizable |
| **Dates** | date-fns | Tree-shakeable, functional |
| **HTTP** | TanStack Query | Caching, retries, optimistic updates |
| **Routing** | React Router v6 | Standard, well-maintained |

---

## Golden Rules

1. **Consistency over creativity** — use the same patterns everywhere
2. **Feedback for every action** — users should always know what's happening
3. **Fast is a feature** — optimize performance from day one
4. **Accessible by default** — build a11y in, don't bolt it on
5. **Mobile-first** — design for small screens first
6. **Design tokens** — never hardcode values in components
7. **Composition** — build small, composable components
8. **Test on real devices** — not just browser dev tools
9. **Measure, don't guess** — use Lighthouse, Web Vitals, user analytics
10. **Document everything** — future you will thank present you
