# React Patterns and Best Practices

## Component Structure

- Use functional components for all new components
- Prefer hooks over class components
- Keep components small and focused
- One component per file
- Use descriptive component names (PascalCase)

## Props and State

- Define props interfaces for all components
- Use TypeScript for prop validation
- Lift state up when needed
- Keep state as local as possible
- Use composition over prop drilling

## Hooks Guidelines

- Follow Rules of Hooks (only call at top level, only in function components)
- Use useState for local component state
- Use useEffect for side effects
- Use useMemo and useCallback for performance (but don't overuse)
- Create custom hooks for reusable stateful logic

## Component Patterns

- Use children prop for composition
- Use render props when appropriate
- Higher-Order Components (HOC) for cross-cutting concerns
- Context API for deeply nested prop passing
- Avoid inline function definitions in JSX

## Performance

- Memoize expensive calculations with useMemo
- Memoize callback functions with useCallback
- Use React.memo for component memoization
- Lazy load components with React.lazy and Suspense
- Split code at route level
- Keep state close to where it's used

## Error Handling

- Use Error Boundaries for component tree errors
- Catch errors in event handlers
- Show user-friendly error messages
- Log errors for debugging

## Accessibility

- Use semantic HTML elements (button, nav, main, etc.)
- Provide alt text for images
- Ensure keyboard navigation works
- Use ARIA attributes when needed (sparingly)
- Maintain focus management
- Ensure sufficient color contrast
