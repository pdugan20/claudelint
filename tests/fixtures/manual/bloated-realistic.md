# Project Instructions

This is a sample project for testing optimization workflows.

## General Coding Guidelines

Always write clean, maintainable code. Follow best practices and industry standards. Code should be readable, well-documented, and follow the DRY principle (Don't Repeat Yourself). Make sure to write tests for all new features. Use meaningful variable names and keep functions small and focused.

Remember to commit often and write good commit messages. Use version control effectively. Keep your code organized and modular. Avoid code duplication. Follow SOLID principles. Write self-documenting code. Add comments only when necessary to explain why, not what.

Always consider performance implications of your code. Optimize when necessary but don't prematurely optimize. Profile before optimizing. Use appropriate data structures and algorithms. Consider time and space complexity.

Security is important. Never commit secrets or API keys. Use environment variables for sensitive data. Sanitize user inputs. Validate all data. Be aware of common vulnerabilities like SQL injection, XSS, CSRF, etc.

Error handling is crucial. Always handle errors gracefully. Provide meaningful error messages. Log errors appropriately. Don't swallow exceptions silently.

## Code Style

Use consistent formatting throughout the codebase. Follow the style guide for the language you're using. Use a linter and formatter. Configure your editor to format on save.

For JavaScript/TypeScript:

- Use semicolons
- Use single quotes for strings
- 2 space indentation
- Trailing commas in multi-line objects/arrays
- Arrow functions for anonymous functions
- Async/await over promises when possible

For Python:

- Follow PEP 8
- 4 space indentation
- Use snake_case for variables and functions
- Use PascalCase for classes
- Type hints for function signatures

For CSS:

- Use kebab-case for class names
- Organize properties alphabetically
- Use shorthand properties when possible
- Avoid !important unless absolutely necessary

## Testing Guidelines

Write tests for all new features and bug fixes. Aim for high test coverage but focus on meaningful tests, not just coverage numbers.

Unit tests should:

- Test one thing at a time
- Be independent of each other
- Be fast
- Be deterministic (no flaky tests)
- Have clear assertions
- Use descriptive test names

Integration tests should:

- Test multiple components working together
- Use test databases or mock external services
- Clean up after themselves
- Be organized logically

End-to-end tests should:

- Test user workflows
- Use realistic data
- Be maintainable
- Run in CI/CD

Always run tests before committing. Fix failing tests immediately. Don't skip tests. Don't comment out failing tests.

## Git Workflow

Use feature branches for all new work. Never commit directly to main/master. Create a branch from the latest main for each feature or bug fix.

Branch naming conventions:

- feature/description-of-feature
- fix/description-of-bug
- refactor/description-of-refactor
- docs/description-of-docs-change

Commit messages should follow Conventional Commits format:

- feat: new feature
- fix: bug fix
- docs: documentation changes
- style: formatting changes
- refactor: code refactoring
- test: test changes
- chore: maintenance tasks

Write clear, descriptive commit messages. Use the imperative mood ("Add feature" not "Added feature"). Keep the subject line under 50 characters. Add a body if needed to explain why, not what.

Before pushing:

1. Run all tests
2. Run linters
3. Review your changes
4. Make sure you're on the right branch
5. Pull latest changes from main
6. Resolve any conflicts
7. Push to remote

Create pull requests for all changes. Fill out the PR template completely. Request reviews from appropriate team members. Address all review comments. Don't merge until approved.

## Code Review Guidelines

When reviewing code:

- Be respectful and constructive
- Focus on the code, not the person
- Suggest improvements, don't demand changes
- Explain why something should be changed
- Approve when ready, request changes when needed
- Don't let PRs sit too long

When receiving reviews:

- Don't take feedback personally
- Ask questions if you don't understand
- Explain your reasoning if you disagree
- Make requested changes promptly
- Thank reviewers for their time

## Project-Specific Configuration

This project uses TypeScript with strict mode enabled. All code must pass type checking.

### Build Commands

```bash
npm run build      # Build for production
npm run dev        # Run development server
npm run test       # Run test suite
npm run lint       # Run linters
npm run format     # Format code
```

### Environment Variables

Required environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `API_KEY` - Third-party API key
- `JWT_SECRET` - Secret for JWT signing
- `NODE_ENV` - Environment (development/production)

### Database Setup

We use PostgreSQL for data storage. Run migrations before starting:

```bash
npm run db:migrate
npm run db:seed    # Optional: seed with test data
```

## Architecture

This is a typical three-tier architecture:

- Frontend: React with TypeScript
- Backend: Node.js with Express
- Database: PostgreSQL

Follow separation of concerns. Keep business logic separate from presentation logic. Use dependency injection where appropriate.

## API Guidelines

All API endpoints should follow REST conventions. Use proper HTTP methods and status codes.

GET requests should be idempotent and have no side effects. POST requests create new resources. PUT requests update existing resources completely. PATCH requests partially update resources. DELETE requests remove resources.

Always validate request data. Return appropriate error responses. Include meaningful error messages. Use consistent response formats.

Authentication is required for protected endpoints. Use JWT tokens for authentication. Include tokens in Authorization header. Validate tokens on every request.

Rate limiting is enabled for all endpoints. Don't exceed rate limits. Handle 429 responses appropriately.

## Security Best Practices

Never store passwords in plain text. Always hash passwords with bcrypt or similar. Use strong password requirements. Implement account lockout after failed attempts.

Protect against common attacks:

- SQL Injection: Use parameterized queries
- XSS: Sanitize user inputs, escape output
- CSRF: Use CSRF tokens
- Clickjacking: Use X-Frame-Options header
- Man-in-the-middle: Use HTTPS only

Keep dependencies updated. Regularly check for security vulnerabilities. Use npm audit or similar tools. Update vulnerable packages promptly.

## Performance Optimization

Monitor application performance. Use appropriate caching strategies. Cache database queries when possible. Use Redis for session storage.

Optimize database queries:

- Use indexes appropriately
- Avoid N+1 queries
- Use EXPLAIN to analyze query plans
- Denormalize when necessary for read performance

Frontend performance:

- Minimize bundle size
- Use code splitting
- Lazy load components
- Optimize images
- Use CDN for static assets

## Deployment

We deploy to AWS using Docker containers. All deployments go through CI/CD pipeline.

Deployment process:

1. Push code to GitHub
2. CI runs tests and linters
3. Build Docker image
4. Push to container registry
5. Deploy to staging
6. Run smoke tests
7. Deploy to production

Never deploy on Fridays. Never deploy without testing in staging first. Always have a rollback plan.

## Monitoring and Logging

We use DataDog for monitoring and logging. All errors are logged with context. Set up alerts for critical errors.

Log levels:

- ERROR: Application errors that need immediate attention
- WARN: Warning conditions that should be investigated
- INFO: General informational messages
- DEBUG: Detailed information for debugging

Don't log sensitive information. Redact passwords, tokens, and PII from logs.

## Documentation

Keep documentation up to date. Document all public APIs. Include examples in documentation. Update README when project changes.

Use JSDoc for code documentation. Document complex algorithms. Explain non-obvious decisions. Link to relevant issues or discussions.

## General Best Practices

Write code for humans first, computers second. Code is read more than it's written. Optimize for readability and maintainability.

Keep functions small and focused. A function should do one thing well. If a function is too long, break it up. Use helper functions.

Avoid premature abstraction. Don't create abstractions until you have multiple concrete use cases. Three strikes rule: wait until you need something three times before abstracting.

Use meaningful names. Variable names should describe what they hold. Function names should describe what they do. Class names should describe what they represent.

Avoid magic numbers. Use named constants instead. Make your code self-documenting.

Handle edge cases. Think about what could go wrong. Write defensive code. Validate inputs. Check for null/undefined.

## Debugging Tips

When debugging:

1. Reproduce the issue consistently
2. Understand the expected behavior
3. Isolate the problem
4. Form hypotheses
5. Test hypotheses systematically
6. Fix the root cause, not the symptom
7. Add tests to prevent regression

Use debugger instead of console.log when possible. Learn your debugging tools. Use breakpoints effectively. Inspect variables and call stacks.

## Team Communication

We use Slack for daily communication. Keep work-related discussions in public channels. Use threads to keep conversations organized.

Stand-up meetings every morning at 9 AM. Share what you did yesterday, what you're doing today, and any blockers.

Sprint planning every two weeks. Retrospectives at the end of each sprint. Document action items and follow up.

## Onboarding Checklist

New team members should:

- [ ] Set up development environment
- [ ] Clone repository
- [ ] Install dependencies
- [ ] Set up environment variables
- [ ] Run tests to verify setup
- [ ] Read all documentation
- [ ] Deploy to local environment
- [ ] Make a small contribution
- [ ] Get added to Slack channels
- [ ] Get added to GitHub organization
- [ ] Get access to AWS console
- [ ] Get access to database
- [ ] Review codebase
- [ ] Pair with team member

## Additional Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

## Troubleshooting

### Common Issues

**Build fails with TypeScript errors:**

- Run `npm run type-check` to see all errors
- Check tsconfig.json settings
- Make sure you're using correct TypeScript version

**Tests fail randomly:**

- Check for race conditions
- Make sure tests clean up properly
- Check if tests depend on external state

**Database connection fails:**

- Verify DATABASE_URL is set correctly
- Check if database is running
- Verify credentials

**API returns 500 errors:**

- Check server logs
- Verify environment variables
- Check database connection
- Review recent changes

## Code Examples

### Example: Creating a new API endpoint

```typescript
// routes/users.ts
import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { createUserSchema } from '../schemas/user';

const router = Router();
const controller = new UserController();

router.post(
  '/users',
  authenticate,
  validate(createUserSchema),
  controller.create
);

export default router;
```

### Example: Writing a test

```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';
import { UserService } from '../services/UserService';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService();
  });

  it('should create a new user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'securePassword123',
    };

    const user = await service.create(userData);

    expect(user.email).toBe(userData.email);
    expect(user.id).toBeDefined();
  });
});
```

## Final Notes

This document should be treated as a living document. Update it as the project evolves. Suggest improvements via pull requests.

Remember: good code is code that's easy to change. Write code that future you will thank you for.

Happy coding!
