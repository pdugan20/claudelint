# React TypeScript Project Instructions

This is a React 18 application built with TypeScript for modern web development.

## Stack

- Frontend: React 18 with TypeScript
- Build Tool: Vite (configured but not included in fixture)
- Type Checking: TypeScript 5.3+ with strict mode
- Package Manager: npm

## General Coding Guidelines

Always write clean, maintainable code. Follow best practices and industry standards. Code should be readable, well-documented, and follow the DRY principle (Don't Repeat Yourself). Make sure to write tests for all new features. Use meaningful variable names and keep functions small and focused.

Remember to commit often and write good commit messages. Use version control effectively. Keep your code organized and modular. Avoid code duplication. Follow SOLID principles. Write self-documenting code. Add comments only when necessary to explain why, not what.

Always consider performance implications of your code. Optimize when necessary but don't prematurely optimize. Profile before optimizing. Use appropriate data structures and algorithms. Consider time and space complexity.

Security is important. Never commit secrets or API keys. Use environment variables for sensitive data. Sanitize user inputs. Validate all data. Be aware of common vulnerabilities like XSS, CSRF, etc.

Error handling is crucial. Always handle errors gracefully. Provide meaningful error messages. Log errors appropriately. Don't swallow exceptions silently.

## React Best Practices

Use functional components for all new components. Prefer hooks over class components. Understand component lifecycle and when to use useEffect.

Component structure:

- Keep components small and focused
- One component per file
- Use descriptive component names (PascalCase)
- Extract reusable logic into custom hooks

Props and state:

- Define props interfaces for all components
- Use TypeScript for prop validation
- Lift state up when needed
- Keep state as local as possible
- Use composition over prop drilling

Hooks guidelines:

- Follow Rules of Hooks (only call at top level, only in function components)
- Use useState for local component state
- Use useEffect for side effects
- Use useMemo and useCallback for performance optimization (but don't overuse)
- Create custom hooks for reusable stateful logic

Component patterns:

- Use children prop for composition
- Use render props when appropriate
- Higher-Order Components (HOC) for cross-cutting concerns
- Context API for deeply nested prop passing
- Avoid inline function definitions in JSX (causes re-renders)

Performance:

- Memoize expensive calculations with useMemo
- Memoize callback functions with useCallback
- Use React.memo for component memoization
- Lazy load components with React.lazy and Suspense
- Split code at route level
- Optimize re-renders by keeping state close to where it's used

## TypeScript Style Guide

Use strict mode always. Enable all strict type-checking options in tsconfig.json. Never use `any` - use `unknown` if type is truly unknown.

Type annotations:

- Use interfaces for object shapes
- Use type aliases for unions, intersections, and primitives
- Prefer interfaces over types for objects (better error messages)
- Always type function parameters
- Let TypeScript infer return types when obvious
- Explicitly type when return type is complex

Naming conventions:

- Interfaces: PascalCase (UserProfile, ApiResponse)
- Type aliases: PascalCase (UserId, Status)
- Props interfaces: ComponentNameProps (AppProps, ButtonProps)
- Enums: PascalCase, members UPPER_CASE
- Generic type parameters: T, K, V or descriptive names

Best practices:

- Use union types instead of enums when possible
- Prefer const assertions for literal types
- Use utility types (Partial, Required, Pick, Omit, etc.)
- Create custom utility types for complex scenarios
- Use branded types for nominal typing
- Prefer type guards over type assertions
- Use discriminated unions for state machines

React + TypeScript:

- Type all component props with interfaces
- Use React.FC sparingly (prefer explicit typing)
- Type hooks properly (useState<Type>, useRef<Type>)
- Type event handlers correctly (React.MouseEvent, React.ChangeEvent)
- Type children prop: React.ReactNode
- Use generics in custom hooks when appropriate

## File Structure

Organize code by feature, not by type:

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

Component file structure:

- Name file same as component (App.tsx exports App)
- Keep related files together
- Co-locate tests with components
- Use index.ts for cleaner imports

## Code Style

Use consistent formatting throughout the codebase. Use Prettier for automatic formatting. Configure your editor to format on save.

JavaScript/TypeScript conventions:

- Use semicolons
- Use single quotes for strings
- 2 space indentation
- Trailing commas in multi-line objects/arrays
- Arrow functions for anonymous functions
- Async/await over promises
- Template literals over string concatenation
- Optional chaining (?.) and nullish coalescing (??)
- Destructuring when it improves readability

Imports:

- Group imports: React, third-party, local
- Use absolute imports for cleaner paths
- Sort imports alphabetically within groups
- Use named exports over default exports

## Testing Guidelines

Write tests for all components and utilities. Use React Testing Library for component tests. Follow testing best practices.

Component testing:

- Test user behavior, not implementation details
- Query by accessible roles and labels
- Avoid testing internal state
- Use user-event library for interactions
- Mock external dependencies
- Test loading, error, and success states

Test structure:

- One describe block per component/function
- Group related tests with nested describe
- Use descriptive test names that read like sentences
- Arrange-Act-Assert pattern
- Keep tests focused and independent

What to test:

- Rendering output
- User interactions
- Conditional rendering
- Props changes
- Accessibility
- Error boundaries

What NOT to test:

- Third-party library code
- Implementation details
- Inline styles or CSS classes
- React internals

Testing best practices:

- Tests should be deterministic (no flaky tests)
- Clean up after tests (cleanup function, afterEach)
- Use test-ids sparingly (prefer semantic queries)
- Mock API calls and external services
- Test error cases and edge cases
- Keep test data realistic but minimal

## Git Workflow

Use feature branches for all new work. Never commit directly to main. Create a branch from the latest main for each feature or bug fix.

Branch naming:

- feature/description-of-feature
- fix/description-of-bug
- refactor/description-of-refactor
- docs/description-of-docs-change

Commit messages follow Conventional Commits:

- feat: new feature
- fix: bug fix
- docs: documentation changes
- style: formatting changes
- refactor: code refactoring
- test: test changes
- chore: maintenance tasks

Write clear, descriptive commit messages. Use imperative mood. Keep subject under 50 characters. Add body to explain why, not what.

Before pushing:

1. Run all tests
2. Run type check (npm run type-check)
3. Run linters
4. Review your changes
5. Pull latest changes from main
6. Resolve conflicts
7. Push to remote

Create pull requests for all changes. Fill out PR template. Request reviews. Address review comments. Don't merge until approved.

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
- esModuleInterop: true
- skipLibCheck: true

Type checking:

- Run `npm run type-check` to see all type errors
- Fix all type errors before committing
- Never use @ts-ignore unless absolutely necessary
- Document why if you must use @ts-ignore or @ts-expect-error

## Component Guidelines

All components live in src/. Main component is App.tsx. Entry point is index.tsx.

Creating new components:

1. Create new file in appropriate directory
2. Define props interface first
3. Implement component
4. Export as named export
5. Add tests

Component template:

```tsx
import React from 'react';

interface ComponentNameProps {
  // Define props here
  title: string;
  onAction?: () => void;
}

export function ComponentName({ title, onAction }: ComponentNameProps) {
  return (
    <div>
      <h1>{title}</h1>
      {/* Component JSX */}
    </div>
  );
}
```

## State Management

For this small project, use React's built-in state management:

- useState for local state
- useContext for shared state
- Custom hooks for reusable stateful logic

Don't add Redux or other state management unless project grows significantly.

State best practices:

- Keep state as close to where it's used as possible
- Lift state up only when necessary
- Use composition to avoid prop drilling
- Create custom hooks to share stateful logic
- Consider useReducer for complex state logic

## Error Handling

Handle errors gracefully throughout the application.

Component errors:

- Use Error Boundaries for component tree errors
- Catch errors in event handlers
- Show user-friendly error messages
- Log errors for debugging

Async operations:

- Always handle promise rejections
- Show loading and error states
- Provide retry mechanisms
- Never leave users in broken states

## Accessibility

Build accessible components. Use semantic HTML. Follow WCAG guidelines.

Accessibility checklist:

- Use semantic HTML elements (button, nav, main, etc.)
- Provide alt text for images
- Ensure keyboard navigation works
- Use ARIA attributes when needed (sparingly)
- Maintain focus management
- Test with screen readers
- Ensure sufficient color contrast
- Don't rely on color alone for information

## Performance Optimization

Optimize React applications for performance.

Common optimizations:

- Code splitting at route level
- Lazy load components not immediately visible
- Memoize expensive calculations
- Avoid unnecessary re-renders
- Optimize images (size, format, lazy loading)
- Use production builds for deployment
- Profile before optimizing
- Measure impact of optimizations

React-specific:

- Use React.memo for expensive components
- useMemo for expensive calculations
- useCallback for callback props
- Virtualize long lists
- Avoid inline object/array creation in JSX
- Keep component tree shallow
- Split large components

## Debugging

Tools and techniques for debugging React applications.

Debugging strategies:

1. Use React DevTools browser extension
2. Inspect component tree and props
3. Profile component renders
4. Use browser DevTools
5. Console.log strategically (but remove before committing)
6. Use debugger statements
7. Check React error messages carefully

Common issues:

- Missing key prop in lists
- Infinite re-render loops
- Stale closure in useEffect
- Missing dependency in useEffect array
- Direct state mutation
- Incorrect event handler binding

## Dependencies

Current dependencies:

- react: ^18.2.0
- react-dom: ^18.2.0
- @types/react: ^18.2.0
- @types/react-dom: ^18.2.0
- typescript: ^5.3.3

Keep dependencies up to date. Run `npm audit` regularly. Update vulnerable packages promptly. Review dependency changes before updating major versions.

## Project-Specific Notes

This is a fixture project for testing claudelint optimization. The actual application is minimal (App.tsx and index.tsx only).

Real projects would include:

- Routing (React Router)
- API calls (fetch/axios)
- State management (if needed)
- Form handling
- Authentication
- Testing setup
- Build configuration
- Deployment pipeline

## Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [React DevTools](https://react.dev/learn/react-developer-tools)

## Troubleshooting

Common issues and solutions:

**TypeScript errors on startup:**

- Run `npm install` to ensure all types are installed
- Check TypeScript version matches project
- Clear node_modules and reinstall if needed

**Component not rendering:**

- Check if exported correctly
- Verify import path
- Look for JavaScript errors in console
- Check React DevTools component tree

**Unexpected re-renders:**

- Use React DevTools Profiler
- Check for inline object creation in JSX
- Verify useCallback/useMemo dependencies
- Check if parent component re-renders unnecessarily

**Build failures:**

- Run type-check to see all errors
- Check for unused imports
- Verify all dependencies installed
- Check for circular dependencies
