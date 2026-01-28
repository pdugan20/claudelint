# Design System

Visual design and branding guidelines for claudelint documentation.

## Brand Identity

### Logo

**Primary Logo**: SVG wordmark with icon

- **Icon**: Terminal/checkmark combo
- **Wordmark**: "claudelint" in custom monospace font
- **Usage**: Navbar, hero section, social cards

**Favicon Sizes**:

- 16x16 (small tabs)
- 32x32 (standard)
- 180x180 (Apple touch icon)
- 512x512 (PWA icon)

### Color Palette

**Brand Colors**:

```css
:root {
  /* Primary - Claude Blue */
  --cl-c-brand: #2563eb;        /* Main brand color */
  --cl-c-brand-light: #3b82f6;  /* Hover state */
  --cl-c-brand-dark: #1d4ed8;   /* Active state */
  --cl-c-brand-soft: #dbeafe;   /* Background highlight */

  /* Accent - Success Green */
  --cl-c-accent: #10b981;       /* Success, check marks */
  --cl-c-accent-light: #34d399;
  --cl-c-accent-dark: #059669;

  /* Semantic Colors */
  --cl-c-error: #ef4444;        /* Errors, danger */
  --cl-c-warning: #f59e0b;      /* Warnings */
  --cl-c-info: #3b82f6;         /* Info messages */
  --cl-c-success: #10b981;      /* Success messages */

  /* Neutral Grays */
  --cl-c-bg: #ffffff;           /* Page background */
  --cl-c-bg-soft: #f9fafb;      /* Subtle background */
  --cl-c-bg-mute: #f3f4f6;      /* Muted background */

  --cl-c-text-1: #111827;       /* Primary text */
  --cl-c-text-2: #4b5563;       /* Secondary text */
  --cl-c-text-3: #9ca3af;       /* Tertiary text */

  --cl-c-border: #e5e7eb;       /* Borders */
  --cl-c-divider: #d1d5db;      /* Dividers */
}

/* Dark mode overrides */
.dark {
  --cl-c-bg: #0f172a;
  --cl-c-bg-soft: #1e293b;
  --cl-c-bg-mute: #334155;

  --cl-c-text-1: #f1f5f9;
  --cl-c-text-2: #cbd5e1;
  --cl-c-text-3: #64748b;

  --cl-c-border: #334155;
  --cl-c-divider: #475569;
}
```

**Rule Severity Colors**:

```css
:root {
  --severity-error: #dc2626;    /* Red */
  --severity-warning: #d97706;  /* Orange */
  --severity-info: #0284c7;     /* Blue */
}
```

### Typography

**Font Stack**:

```css
:root {
  /* Body text */
  --vp-font-family-base: 'Inter', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;

  /* Headings - same as body for consistency */
  --vp-font-family-heading: var(--vp-font-family-base);

  /* Code */
  --vp-font-family-mono: 'Fira Code', 'JetBrains Mono',
    'SF Mono', Monaco, Consolas, 'Courier New', monospace;
}
```

**Type Scale** (modular scale with 1.25 ratio):

```css
:root {
  --text-xs: 0.75rem;      /* 12px - captions */
  --text-sm: 0.875rem;     /* 14px - small text */
  --text-base: 1rem;       /* 16px - body */
  --text-lg: 1.125rem;     /* 18px - large body */
  --text-xl: 1.25rem;      /* 20px - h4 */
  --text-2xl: 1.5rem;      /* 24px - h3 */
  --text-3xl: 1.875rem;    /* 30px - h2 */
  --text-4xl: 2.25rem;     /* 36px - h1 */
  --text-5xl: 3rem;        /* 48px - hero */
}
```

**Line Heights**:

```css
:root {
  --leading-tight: 1.25;   /* Headings */
  --leading-normal: 1.6;   /* Body text */
  --leading-relaxed: 1.75; /* Long-form content */
  --leading-loose: 2;      /* Spaced content */
}
```

**Font Weights**:

- 400: Normal body text
- 500: Medium (subheadings, emphasis)
- 600: Semibold (headings)
- 700: Bold (strong emphasis)

---

## Layout System

### Grid & Spacing

**Container Widths**:

```css
:root {
  --content-width: 720px;     /* Main content */
  --container-width: 1440px;  /* Full width */
  --sidebar-width: 272px;     /* Sidebar */
}
```

**Spacing Scale** (base 4px):

```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
}
```

### Border Radius

```css
:root {
  --radius-sm: 0.25rem;   /* 4px - small elements */
  --radius-md: 0.5rem;    /* 8px - cards, buttons */
  --radius-lg: 0.75rem;   /* 12px - large containers */
  --radius-xl: 1rem;      /* 16px - modal, hero */
  --radius-full: 9999px;  /* Pills, badges */
}
```

### Shadows

```css
:root {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
}

.dark {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.5);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.6);
}
```

---

## Components

### Buttons

**Primary Button**:

```vue
<button class="vp-button vp-button-brand">
  Get Started
</button>
```

```css
.vp-button-brand {
  background: var(--cl-c-brand);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  transition: all 0.2s ease;
}

.vp-button-brand:hover {
  background: var(--cl-c-brand-light);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
```

**Secondary Button**:

```css
.vp-button-alt {
  background: transparent;
  color: var(--cl-c-brand);
  border: 1px solid var(--cl-c-border);
  /* ... same padding/radius */
}

.vp-button-alt:hover {
  border-color: var(--cl-c-brand);
  background: var(--cl-c-brand-soft);
}
```

### Badges

**Severity Badges**:

```vue
<span class="badge badge-error">Error</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-info">Info</span>
```

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-error {
  background: rgba(220, 38, 38, 0.1);
  color: var(--severity-error);
}

.badge-warning {
  background: rgba(217, 119, 6, 0.1);
  color: var(--severity-warning);
}

.badge-info {
  background: rgba(2, 132, 199, 0.1);
  color: var(--severity-info);
}
```

**Fixable Badge**:

```vue
<span class="badge badge-fixable">
  <span class="icon"></span>
  Auto-fixable
</span>
```

### Cards

**Rule Card**:

```vue
<div class="rule-card">
  <div class="rule-card-header">
    <h3>size-error</h3>
    <span class="badge badge-error">Error</span>
  </div>
  <p class="rule-card-description">
    CLAUDE.md file exceeds 10MB context window limit
  </p>
  <div class="rule-card-footer">
    <span class="rule-card-category">CLAUDE.md</span>
    <a href="/rules/claude-md/size-error">Learn more →</a>
  </div>
</div>
```

```css
.rule-card {
  background: var(--cl-c-bg-soft);
  border: 1px solid var(--cl-c-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  transition: all 0.2s ease;
}

.rule-card:hover {
  border-color: var(--cl-c-brand);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.rule-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.rule-card h3 {
  font-family: var(--vp-font-family-mono);
  font-size: var(--text-lg);
  margin: 0;
}

.rule-card-description {
  color: var(--cl-c-text-2);
  margin-bottom: var(--space-4);
  line-height: var(--leading-normal);
}

.rule-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-sm);
}

.rule-card-category {
  color: var(--cl-c-text-3);
}
```

### Custom Containers

VitePress built-in containers styled:

```markdown
::: tip
Pro tip: Use `claudelint init` for interactive setup.
:::
```

```css
.custom-block.tip {
  border-color: var(--cl-c-accent);
  background: rgba(16, 185, 129, 0.05);
}

.custom-block.warning {
  border-color: var(--severity-warning);
  background: rgba(217, 119, 6, 0.05);
}

.custom-block.danger {
  border-color: var(--severity-error);
  background: rgba(220, 38, 38, 0.05);
}
```

### Code Blocks

```css
.vp-code-group {
  border: 1px solid var(--cl-c-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.vp-code-group-tabs {
  background: var(--cl-c-bg-soft);
  border-bottom: 1px solid var(--cl-c-border);
  padding: 0;
}

.vp-code-group-tab {
  padding: 0.75rem 1rem;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--cl-c-text-2);
}

.vp-code-group-tab.active {
  color: var(--cl-c-brand);
  border-bottom: 2px solid var(--cl-c-brand);
}

/* Copy button */
.vp-code-copy-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.vp-code-block:hover .vp-code-copy-btn {
  opacity: 1;
}
```

---

## Page Layouts

### Homepage Layout

```vue
<template>
  <div class="home-layout">
    <!-- Hero -->
    <section class="hero">
      <div class="container">
        <h1 class="hero-title">claudelint</h1>
        <p class="hero-tagline">
          Comprehensive linter for Claude Code projects
        </p>
        <div class="hero-actions">
          <a href="/guide/getting-started" class="vp-button vp-button-brand">
            Get Started
          </a>
          <a href="https://github.com/pdugan20/claudelint" class="vp-button vp-button-alt">
            View on GitHub
          </a>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="features">
      <div class="container">
        <FeatureGrid :features="features" />
      </div>
    </section>

    <!-- Quick Start -->
    <section class="quick-start">
      <div class="container">
        <h2>Quick Start</h2>
        <CodeTabs :tabs="installTabs" />
      </div>
    </section>
  </div>
</template>
```

### Documentation Page Layout

```text
┌─────────────────────────────────────────┐
│ Navbar (fixed top)                      │
├─────────┬───────────────────┬───────────┤
│         │                   │           │
│ Sidebar │  Content Area     │  Outline  │
│ (left)  │                   │  (right)  │
│         │  - Breadcrumbs    │           │
│         │  - Title          │  - TOC    │
│         │  - Content        │  - Links  │
│         │  - Prev/Next      │           │
│         │  - Edit Link      │           │
│         │                   │           │
├─────────┴───────────────────┴───────────┤
│ Footer                                  │
└─────────────────────────────────────────┘
```

---

## Responsive Design

### Breakpoints

```css
:root {
  --bp-mobile: 640px;   /* sm */
  --bp-tablet: 768px;   /* md */
  --bp-desktop: 1024px; /* lg */
  --bp-wide: 1280px;    /* xl */
}
```

### Mobile Adjustments

```css
@media (max-width: 768px) {
  /* Hide sidebar by default, show via hamburger */
  .VPSidebar {
    transform: translateX(-100%);
    transition: transform 0.3s;
  }

  .VPSidebar.open {
    transform: translateX(0);
  }

  /* Stack hero buttons vertically */
  .hero-actions {
    flex-direction: column;
    gap: var(--space-3);
  }

  /* Reduce hero text size */
  .hero-title {
    font-size: var(--text-3xl);
  }

  /* Single column feature grid */
  .feature-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## Iconography

### Icon System

**Icons Used**:

- Home: 
- Guide: 
- Validators: ✓
- Rules: 
- Examples: 
- Error: 
- Warning: 
- Info: 
- Success: 
- Fix: 
- Fast: 
- Plugin: 

**Custom SVG Icons** (for navbar/social):

```vue
<!-- GitHub Icon -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
</svg>

<!-- npm Icon -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
  <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z"/>
</svg>
```

---

## Dark Mode

### Toggle Implementation

VitePress has built-in dark mode. Custom theme overrides:

```css
.dark {
  /* Backgrounds */
  --vp-c-bg: #0f172a;
  --vp-c-bg-soft: #1e293b;
  --vp-c-bg-mute: #334155;

  /* Text */
  --vp-c-text-1: #f1f5f9;
  --vp-c-text-2: #cbd5e1;
  --vp-c-text-3: #64748b;

  /* Brand colors remain the same */
  /* Semantic colors slightly adjusted for dark bg */
  --cl-c-error: #f87171;
  --cl-c-warning: #fbbf24;
}
```

### Image Variants

Provide light/dark variants for diagrams:

```markdown
<picture>
  <source srcset="/diagram-dark.svg" media="(prefers-color-scheme: dark)">
  <img src="/diagram-light.svg" alt="Architecture diagram">
</picture>
```

---

## Accessibility

### Focus States

```css
*:focus-visible {
  outline: 2px solid var(--cl-c-brand);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

.dark *:focus-visible {
  outline-color: var(--cl-c-brand-light);
}
```

### Skip Link

```html
<a href="#main-content" class="skip-link">
  Skip to main content
</a>
```

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--cl-c-brand);
  color: white;
  padding: 0.5rem 1rem;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

### ARIA Labels

```vue
<!-- Icon buttons -->
<button aria-label="Toggle dark mode">
  <span class="sr-only">Toggle dark mode</span>
  <IconMoon />
</button>

<!-- Screen reader only text -->
<style>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
```

---

## Assets Checklist

- [ ] Logo SVG (light theme)
- [ ] Logo SVG (dark theme)
- [ ] Favicon ICO (16x16, 32x32)
- [ ] Apple Touch Icon (180x180)
- [ ] OG Image (1200x630)
- [ ] Twitter Card Image (1200x600)
- [ ] PWA Icons (192x192, 512x512)
- [ ] Architecture diagrams (light/dark variants)
- [ ] Screenshot examples (for homepage)

---

## Design Inspiration

**Similar Documentation Sites**:

- Vite: <https://vitejs.dev>
- Vitest: <https://vitest.dev>
- Vue: <https://vuejs.org>
- Pinia: <https://pinia.vuejs.org>
- Astro: <https://astro.build>

**Design Principles**:

1. **Clarity**: Information is easy to find and understand
2. **Speed**: Fast load times, instant navigation
3. **Beauty**: Clean, modern aesthetic
4. **Accessibility**: Works for everyone
5. **Consistency**: Unified design language throughout
