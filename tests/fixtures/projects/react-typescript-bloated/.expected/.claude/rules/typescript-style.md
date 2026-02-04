# TypeScript Style Guide

## General Rules

- Use strict mode always
- Enable all strict type-checking options in tsconfig.json
- Never use `any` - use `unknown` if type is truly unknown

## Type Annotations

- Use interfaces for object shapes
- Use type aliases for unions, intersections, and primitives
- Prefer interfaces over types for objects (better error messages)
- Always type function parameters
- Let TypeScript infer return types when obvious
- Explicitly type when return type is complex

## Naming Conventions

- Interfaces: PascalCase (UserProfile, ApiResponse)
- Type aliases: PascalCase (UserId, Status)
- Props interfaces: ComponentNameProps (AppProps, ButtonProps)
- Enums: PascalCase, members UPPER_CASE
- Generic type parameters: T, K, V or descriptive names

## Best Practices

- Use union types instead of enums when possible
- Prefer const assertions for literal types
- Use utility types (Partial, Required, Pick, Omit, etc.)
- Create custom utility types for complex scenarios
- Use branded types for nominal typing
- Prefer type guards over type assertions
- Use discriminated unions for state machines

## React + TypeScript

- Type all component props with interfaces
- Use React.FC sparingly (prefer explicit typing)
- Type hooks properly (useState<Type>, useRef<Type>)
- Type event handlers correctly (React.MouseEvent, React.ChangeEvent)
- Type children prop: React.ReactNode
- Use generics in custom hooks when appropriate

## Code Style

- Use semicolons
- Use single quotes for strings
- 2 space indentation
- Trailing commas in multi-line objects/arrays
- Arrow functions for anonymous functions
- Async/await over promises
- Template literals over string concatenation
- Optional chaining (?.) and nullish coalescing (??)
- Destructuring when it improves readability

## Imports

- Group imports: React, third-party, local
- Use absolute imports for cleaner paths
- Sort imports alphabetically within groups
- Use named exports over default exports
