import {
  regex,
  minLength,
  maxLength,
  required,
  oneOf,
  minItems,
  maxItems,
  range,
  nonEmpty,
  typeOf,
  hasKeys,
  custom,
  pass,
  fail,
} from '../../src/composition/validators';
import { ValidationContext } from '../../src/composition/types';
import { BaseValidatorOptions } from '../../src/validators/base';

const mockContext: ValidationContext = {
  filePath: 'test.ts',
  line: 1,
  options: {} as BaseValidatorOptions,
};

describe('Composition Validators', () => {
  describe('regex', () => {
    it('should pass for matching pattern', async () => {
      const validator = regex(/^[a-z]+$/, 'Must be lowercase letters');
      const result = await validator('hello', mockContext);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for non-matching pattern', async () => {
      const validator = regex(/^[a-z]+$/, 'Must be lowercase letters');
      const result = await validator('Hello123', mockContext);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('Must be lowercase letters');
    });
  });

  describe('minLength', () => {
    it('should pass for string meeting minimum length', async () => {
      const validator = minLength(3);
      const result = await validator('hello', mockContext);
      expect(result.valid).toBe(true);
    });

    it('should fail for string below minimum length', async () => {
      const validator = minLength(10);
      const result = await validator('hi', mockContext);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('at least 10 characters');
    });
  });

  describe('maxLength', () => {
    it('should pass for string within maximum length', async () => {
      const validator = maxLength(10);
      const result = await validator('hello', mockContext);
      expect(result.valid).toBe(true);
    });

    it('should fail for string exceeding maximum length', async () => {
      const validator = maxLength(5);
      const result = await validator('toolongstring', mockContext);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('at most 5 characters');
    });
  });

  describe('required', () => {
    it('should pass for non-null value', async () => {
      const validator = required();
      const result = await validator('value', mockContext);
      expect(result.valid).toBe(true);
    });

    it('should fail for null', async () => {
      const validator = required();
      const result = await validator(null, mockContext);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toBe('Value is required');
    });

    it('should fail for undefined', async () => {
      const validator = required();
      const result = await validator(undefined, mockContext);
      expect(result.valid).toBe(false);
    });
  });

  describe('oneOf', () => {
    it('should pass for value in allowed list', async () => {
      const validator = oneOf(['a', 'b', 'c']);
      const result = await validator('b', mockContext);
      expect(result.valid).toBe(true);
    });

    it('should fail for value not in allowed list', async () => {
      const validator = oneOf(['a', 'b', 'c']);
      const result = await validator('d', mockContext);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('Must be one of');
    });
  });

  describe('minItems', () => {
    it('should pass for array meeting minimum items', async () => {
      const validator = minItems(2);
      const result = await validator([1, 2, 3], mockContext);
      expect(result.valid).toBe(true);
    });

    it('should fail for array below minimum items', async () => {
      const validator = minItems(5);
      const result = await validator([1, 2], mockContext);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('at least 5 items');
    });
  });

  describe('maxItems', () => {
    it('should pass for array within maximum items', async () => {
      const validator = maxItems(5);
      const result = await validator([1, 2], mockContext);
      expect(result.valid).toBe(true);
    });

    it('should fail for array exceeding maximum items', async () => {
      const validator = maxItems(2);
      const result = await validator([1, 2, 3, 4], mockContext);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('at most 2 items');
    });
  });

  describe('range', () => {
    it('should pass for number within range', async () => {
      const validator = range(1, 10);
      const result = await validator(5, mockContext);
      expect(result.valid).toBe(true);
    });

    it('should fail for number below range', async () => {
      const validator = range(5, 10);
      const result = await validator(3, mockContext);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('between 5 and 10');
    });

    it('should fail for number above range', async () => {
      const validator = range(5, 10);
      const result = await validator(15, mockContext);
      expect(result.valid).toBe(false);
    });
  });

  describe('nonEmpty', () => {
    it('should pass for non-empty string', async () => {
      const validator = nonEmpty();
      const result = await validator('hello', mockContext);
      expect(result.valid).toBe(true);
    });

    it('should fail for empty string', async () => {
      const validator = nonEmpty();
      const result = await validator('', mockContext);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toBe('Value must not be empty');
    });

    it('should fail for whitespace-only string', async () => {
      const validator = nonEmpty();
      const result = await validator('   ', mockContext);
      expect(result.valid).toBe(false);
    });
  });

  describe('typeOf', () => {
    it('should pass for matching type', async () => {
      const validator = typeOf('string');
      const result = await validator('hello', mockContext);
      expect(result.valid).toBe(true);
    });

    it('should fail for non-matching type', async () => {
      const validator = typeOf('string');
      const result = await validator(123, mockContext);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('Expected type string');
    });
  });

  describe('hasKeys', () => {
    it('should pass when object has all required keys', async () => {
      const validator = hasKeys(['name', 'age']);
      const result = await validator({ name: 'John', age: 30, extra: true }, mockContext);
      expect(result.valid).toBe(true);
    });

    it('should fail when object missing required keys', async () => {
      const validator = hasKeys(['name', 'age', 'email']);
      const result = await validator({ name: 'John' }, mockContext);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('Missing required keys');
    });
  });

  describe('custom', () => {
    it('should pass when custom function returns true', async () => {
      const validator = custom((n: number) => n > 0, 'Must be positive');
      const result = await validator(5, mockContext);
      expect(result.valid).toBe(true);
    });

    it('should fail when custom function returns false', async () => {
      const validator = custom((n: number) => n > 0, 'Must be positive');
      const result = await validator(-5, mockContext);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toBe('Must be positive');
    });
  });

  describe('pass', () => {
    it('should always pass', async () => {
      const validator = pass();
      const result = await validator('anything', mockContext);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('fail', () => {
    it('should always fail with message', async () => {
      const validator = fail('Always fails');
      const result = await validator('anything', mockContext);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toBe('Always fails');
    });
  });
});
