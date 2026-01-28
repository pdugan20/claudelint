import {
  compose,
  optional,
  conditional,
  all,
  any,
  arrayOf,
  objectOf,
  map,
} from '../../src/composition/operators';
import { required, minLength, maxLength, regex, oneOf } from '../../src/composition/validators';
import { success, error } from '../../src/composition/helpers';
import { ValidationContext } from '../../src/composition/types';
import { BaseValidatorOptions } from '../../src/validators/base';

const mockContext: ValidationContext = {
  filePath: 'test.ts',
  line: 1,
  options: {} as BaseValidatorOptions,
};

describe('Composition Operators', () => {
  describe('compose', () => {
    it('should pass when all validators pass', async () => {
      const validator = compose(required(), minLength(3), maxLength(10));
      const result = await validator('hello', mockContext);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail on first validator failure', async () => {
      const validator = compose(required(), minLength(10), maxLength(20));
      const result = await validator('hi', mockContext);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('at least 10 characters');
    });

    it('should accumulate warnings from passing validators', async () => {
      const warnValidator = () => ({
        valid: true,
        errors: [],
        warnings: [{ message: 'Warning', severity: 'warning' as const }],
      });

      const validator = compose(
        () => warnValidator(),
        () => warnValidator()
      );

      const result = await validator('test', mockContext);
      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(2);
    });

    it('should stop at first error and not run subsequent validators', async () => {
      const mockValidator3 = jest.fn(() => success());

      const validator = compose(
        required(),
        minLength(10), // This will fail
        mockValidator3
      );

      await validator('hi', mockContext);
      expect(mockValidator3).not.toHaveBeenCalled();
    });
  });

  describe('optional', () => {
    it('should pass when value is null', async () => {
      const validator = optional(minLength(5));
      const result = await validator(null, mockContext);
      expect(result.valid).toBe(true);
    });

    it('should pass when value is undefined', async () => {
      const validator = optional(minLength(5));
      const result = await validator(undefined, mockContext);
      expect(result.valid).toBe(true);
    });

    it('should apply validator when value is present', async () => {
      const validator = optional(minLength(5));
      const result = await validator('hi', mockContext);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('at least 5 characters');
    });

    it('should pass when value is present and valid', async () => {
      const validator = optional(minLength(3));
      const result = await validator('hello', mockContext);
      expect(result.valid).toBe(true);
    });
  });

  describe('conditional', () => {
    it('should apply validator when predicate is true', async () => {
      const validator = conditional(
        (value: string) => value.startsWith('test'),
        minLength(10)
      );

      const result = await validator('test', mockContext);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('at least 10 characters');
    });

    it('should skip validator when predicate is false', async () => {
      const validator = conditional(
        (value: string) => value.startsWith('test'),
        minLength(10)
      );

      const result = await validator('hello', mockContext);
      expect(result.valid).toBe(true);
    });

    it('should have access to context in predicate', async () => {
      const validator = conditional(
        (_, context) => context.filePath?.endsWith('.test.ts') || false,
        minLength(10)
      );

      const result = await validator('hi', { ...mockContext, filePath: 'foo.test.ts' });
      expect(result.valid).toBe(false);
    });
  });

  describe('all', () => {
    it('should pass when all validators pass', async () => {
      const validator = all(minLength(3), maxLength(10), regex(/^[a-z]+$/, 'Lowercase only'));

      const result = await validator('hello', mockContext);
      expect(result.valid).toBe(true);
    });

    it('should accumulate all errors when multiple validators fail', async () => {
      const validator = all(minLength(10), maxLength(5), regex(/^[0-9]+$/, 'Numbers only'));

      const result = await validator('hello', mockContext);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
    });

    it('should accumulate warnings from all validators', async () => {
      const warnValidator1 = () => ({
        valid: true,
        errors: [],
        warnings: [{ message: 'Warning 1', severity: 'warning' as const }],
      });

      const warnValidator2 = () => ({
        valid: true,
        errors: [],
        warnings: [{ message: 'Warning 2', severity: 'warning' as const }],
      });

      const validator = all(warnValidator1, warnValidator2);
      const result = await validator('test', mockContext);

      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(2);
    });
  });

  describe('any', () => {
    it('should pass when at least one validator passes', async () => {
      const validator = any(minLength(100), maxLength(10), regex(/^[a-z]+$/, 'Lowercase'));

      const result = await validator('hello', mockContext);
      expect(result.valid).toBe(true);
    });

    it('should fail when all validators fail', async () => {
      const validator = any(minLength(100), regex(/^[0-9]+$/, 'Numbers'));

      const result = await validator('hello', mockContext);
      expect(result.valid).toBe(false);
    });
  });

  describe('arrayOf', () => {
    it('should pass when all array items pass validator', async () => {
      const validator = arrayOf(oneOf(['a', 'b', 'c']));
      const result = await validator(['a', 'b', 'c'], mockContext);
      expect(result.valid).toBe(true);
    });

    it('should fail when any array item fails validator', async () => {
      const validator = arrayOf(oneOf(['a', 'b', 'c']));
      const result = await validator(['a', 'x', 'c'], mockContext);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    it('should accumulate errors from multiple failing items', async () => {
      const validator = arrayOf(oneOf(['a', 'b']));
      const result = await validator(['a', 'x', 'y', 'b'], mockContext);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
    });

    it('should pass for empty array', async () => {
      const validator = arrayOf(minLength(5));
      const result = await validator([], mockContext);
      expect(result.valid).toBe(true);
    });
  });

  describe('objectOf', () => {
    it('should pass when all object values pass validator', async () => {
      const validator = objectOf(minLength(3));
      const result = await validator({ a: 'hello', b: 'world' }, mockContext);
      expect(result.valid).toBe(true);
    });

    it('should fail when any object value fails validator', async () => {
      const validator = objectOf(minLength(5));
      const result = await validator({ a: 'hello', b: 'hi' }, mockContext);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    it('should pass for empty object', async () => {
      const validator = objectOf(minLength(5));
      const result = await validator({}, mockContext);
      expect(result.valid).toBe(true);
    });
  });

  describe('map', () => {
    it('should transform value before validation', async () => {
      const validator = map(
        (str: string) => str.toUpperCase(),
        regex(/^[A-Z]+$/, 'Must be uppercase')
      );

      const result = await validator('hello', mockContext);
      expect(result.valid).toBe(true);
    });

    it('should fail when transformed value fails validation', async () => {
      const validator = map(
        (str: string) => str.length,
        (length, context) => {
          if (length < 5) {
            return error('Too short', context);
          }
          return success();
        }
      );

      const result = await validator('hi', mockContext);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toBe('Too short');
    });
  });

  describe('complex composition', () => {
    it('should handle nested composition', async () => {
      const validateName = compose(
        required(),
        minLength(3),
        maxLength(64),
        regex(/^[a-z0-9-]+$/, 'Must be lowercase with hyphens')
      );

      const validator = compose(required(), validateName);

      const result = await validator('my-skill-name', mockContext);
      expect(result.valid).toBe(true);
    });

    it('should combine multiple operators', async () => {
      const validateSkills = all(
        arrayOf(
          compose(minLength(3), regex(/^[a-z-]+$/, 'Lowercase and hyphens'))
        ),
        (values, context) => {
          if (values.length === 0) {
            return error('At least one skill required', context);
          }
          return success();
        }
      );

      const result = await validateSkills(['skill-one', 'skill-two'], mockContext);
      expect(result.valid).toBe(true);
    });
  });
});
