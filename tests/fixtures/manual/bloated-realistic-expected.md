# Project Instructions

This is a sample project for testing optimization workflows.

@import .claude/rules/git-workflow.md
@import .claude/rules/testing-guidelines.md
@import .claude/rules/code-style.md

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

Authentication is required for protected endpoints. Use JWT tokens in Authorization header.

Rate limiting is enabled for all endpoints. Handle 429 responses appropriately.

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

Never deploy on Fridays without proper planning. Always test in staging first.

## Monitoring and Logging

We use DataDog for monitoring and logging. All errors are logged with context.

Log levels:

- ERROR: Application errors that need immediate attention
- WARN: Warning conditions that should be investigated
- INFO: General informational messages
- DEBUG: Detailed information for debugging

Don't log sensitive information. Redact passwords, tokens, and PII from logs.

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
