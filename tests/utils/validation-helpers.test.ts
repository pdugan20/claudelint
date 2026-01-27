import { validateEnvironmentVariables } from '../../src/utils/validation-helpers';

describe('validation-helpers', () => {
  describe('validateEnvironmentVariables', () => {
    it('should pass for valid environment variables', () => {
      const env = {
        DATABASE_URL: 'postgres://localhost:5432/db',
        PORT: '3000',
        NODE_ENV: 'production',
      };

      const issues = validateEnvironmentVariables(env);
      expect(issues).toHaveLength(0);
    });

    it('should warn for lowercase environment variable names', () => {
      const env = {
        database_url: 'postgres://localhost:5432/db',
      };

      const issues = validateEnvironmentVariables(env);
      expect(issues).toHaveLength(1);
      expect(issues[0].message).toContain('should be uppercase with underscores');
      expect(issues[0].severity).toBe('warning');
    });

    it('should warn for mixed case environment variable names', () => {
      const env = {
        databaseUrl: 'postgres://localhost:5432/db',
      };

      const issues = validateEnvironmentVariables(env);
      expect(issues).toHaveLength(1);
      expect(issues[0].message).toContain('should be uppercase with underscores');
    });

    it('should warn for environment variables with invalid characters', () => {
      const env = {
        'DATABASE-URL': 'postgres://localhost:5432/db',
      };

      const issues = validateEnvironmentVariables(env);
      expect(issues).toHaveLength(1);
      expect(issues[0].message).toContain('should be uppercase with underscores');
    });

    it('should warn for empty values', () => {
      const env = {
        DATABASE_URL: '',
        API_KEY: '   ',
      };

      const issues = validateEnvironmentVariables(env);
      expect(issues).toHaveLength(2);
      expect(issues[0].message).toContain('Empty value');
      expect(issues[1].message).toContain('Empty value');
    });

    it('should warn for potential hardcoded secrets', () => {
      const env = {
        API_KEY: 'sk_live_1234567890abcdef',
        SECRET_TOKEN: 'super-secret-value',
        DATABASE_PASSWORD: 'mypassword123',
      };

      const issues = validateEnvironmentVariables(env);
      expect(issues).toHaveLength(3);
      expect(issues[0].message).toContain('Possible hardcoded secret');
      expect(issues[1].message).toContain('Possible hardcoded secret');
      expect(issues[2].message).toContain('Possible hardcoded secret');
    });

    it('should not warn for secrets using variable expansion', () => {
      const env = {
        API_KEY: '${SECRET_KEY}',
        DATABASE_PASSWORD: '${DB_PASS:-default}',
      };

      const issues = validateEnvironmentVariables(env);
      expect(issues).toHaveLength(0);
    });

    it('should not warn for short values that look like secrets', () => {
      const env = {
        API_KEY: 'dev',
        SECRET: 'test',
      };

      const issues = validateEnvironmentVariables(env);
      expect(issues).toHaveLength(0);
    });

    it('should handle multiple issues for single variable', () => {
      const env = {
        api_key: '',
      };

      const issues = validateEnvironmentVariables(env);
      expect(issues.length).toBeGreaterThanOrEqual(2); // lowercase name + empty value
      expect(issues.some((i) => i.message.includes('uppercase'))).toBe(true);
      expect(issues.some((i) => i.message.includes('Empty value'))).toBe(true);
    });

    it('should handle empty environment object', () => {
      const env = {};

      const issues = validateEnvironmentVariables(env);
      expect(issues).toHaveLength(0);
    });

    it('should check for all secret-related keywords', () => {
      const env = {
        MY_SECRET: 'longsecretvalue123',
        AUTH_TOKEN: 'longtokenvalue456',
        DB_PASSWORD: 'longpassword789',
        STRIPE_KEY: 'longkeyvalue012',
      };

      const issues = validateEnvironmentVariables(env);
      expect(issues).toHaveLength(4);
      expect(issues.every((i) => i.message.includes('Possible hardcoded secret'))).toBe(true);
    });
  });
});
