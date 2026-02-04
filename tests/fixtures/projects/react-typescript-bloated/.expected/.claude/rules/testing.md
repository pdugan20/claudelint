# Testing Guidelines

## Component Testing

- Test user behavior, not implementation details
- Query by accessible roles and labels
- Avoid testing internal state
- Use user-event library for interactions
- Mock external dependencies
- Test loading, error, and success states

## Test Structure

- One describe block per component/function
- Group related tests with nested describe
- Use descriptive test names that read like sentences
- Arrange-Act-Assert pattern
- Keep tests focused and independent

## What to Test

- Rendering output
- User interactions
- Conditional rendering
- Props changes
- Accessibility
- Error boundaries

## What NOT to Test

- Third-party library code
- Implementation details
- Inline styles or CSS classes
- React internals

## Best Practices

- Tests should be deterministic (no flaky tests)
- Clean up after tests (cleanup function, afterEach)
- Use test-ids sparingly (prefer semantic queries)
- Mock API calls and external services
- Test error cases and edge cases
- Keep test data realistic but minimal

## Git Workflow

- Run all tests before committing
- Fix failing tests immediately
- Don't skip tests
- Don't comment out failing tests

## Branch Naming

- feature/description-of-feature
- fix/description-of-bug
- refactor/description-of-refactor
- docs/description-of-docs-change

## Commit Messages

Follow Conventional Commits:

- feat: new feature
- fix: bug fix
- docs: documentation changes
- style: formatting changes
- refactor: code refactoring
- test: test changes
- chore: maintenance tasks
