# React TypeScript Project Instructions

@import .claude/rules/react-patterns.md
@import .claude/rules/typescript-style.md
@import .claude/rules/testing.md

## Stack

- Frontend: React 18 with TypeScript
- Build Tool: Vite (configured but not included in fixture)
- Type Checking: TypeScript 5.3+ with strict mode
- Package Manager: npm

## File Structure

Organize code by feature:

```text
src/
├── App.tsx           # Main component
├── index.tsx         # Entry point
├── components/       # Shared components
├── hooks/            # Custom hooks
├── utils/            # Utility functions
├── types/            # TypeScript types
└── __tests__/        # Test files
```

## Build Commands

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run test        # Run test suite
npm run lint        # Run linters
npm run type-check  # TypeScript type checking
npm run format      # Format code with Prettier
```

## TypeScript Configuration

Using TypeScript 5.3+ with strict mode enabled. All code must pass type checking before committing.

tsconfig.json settings:

- strict: true (enables all strict checks)
- jsx: "react-jsx" (modern JSX transform)
- target: "ES2020"
- module: "ESNext"

Type checking:

- Run `npm run type-check` to see all type errors
- Fix all type errors before committing
- Never use @ts-ignore unless absolutely necessary

## Component Guidelines

All components live in src/. Main component is App.tsx. Entry point is index.tsx.

Component template:

```tsx
import React from 'react';

interface ComponentNameProps {
  title: string;
  onAction?: () => void;
}

export function ComponentName({ title, onAction }: ComponentNameProps) {
  return (
    <div>
      <h1>{title}</h1>
    </div>
  );
}
```

## State Management

Use React's built-in state management:

- useState for local state
- useContext for shared state
- Custom hooks for reusable stateful logic

Don't add Redux unless project grows significantly.

## Dependencies

Current dependencies:

- react: ^18.2.0
- react-dom: ^18.2.0
- @types/react: ^18.2.0
- @types/react-dom: ^18.2.0
- typescript: ^5.3.3

Keep dependencies up to date. Run `npm audit` regularly.

## Project-Specific Notes

This is a fixture project for testing claudelint optimization. The actual application is minimal (App.tsx and index.tsx only).

## Troubleshooting

**TypeScript errors on startup:**

- Run `npm install` to ensure all types are installed
- Check TypeScript version matches project
- Clear node_modules and reinstall if needed

**Component not rendering:**

- Check if exported correctly
- Verify import path
- Look for JavaScript errors in console

**Unexpected re-renders:**

- Use React DevTools Profiler
- Check for inline object creation in JSX
- Verify useCallback/useMemo dependencies
