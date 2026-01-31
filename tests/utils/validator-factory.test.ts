import { ValidatorRegistry, ValidatorMetadata } from '../../src/utils/validators/factory';
import { BaseValidator, ValidationResult } from '../../src/validators/base';

// Mock validator for testing
class MockValidator extends BaseValidator {
  async validate(): Promise<ValidationResult> {
    return this.getResult();
  }
}

describe('ValidatorRegistry', () => {
  // Clear registry before each test to ensure isolation
  beforeEach(() => {
    ValidatorRegistry.clear();
  });

  // Clean up after tests
  afterEach(() => {
    ValidatorRegistry.clear();
  });

  describe('register', () => {
    it('should register a validator successfully', () => {
      const metadata: ValidatorMetadata = {
        id: 'test-validator',
        name: 'Test Validator',
        description: 'A test validator',
        filePatterns: ['*.test'],
        enabled: true,
      };

      ValidatorRegistry.register(metadata, (options) => new MockValidator(options));

      expect(ValidatorRegistry.has('test-validator')).toBe(true);
      expect(ValidatorRegistry.count()).toBe(1);
    });

    it('should throw error when registering duplicate validator ID', () => {
      const metadata: ValidatorMetadata = {
        id: 'duplicate',
        name: 'Duplicate Validator',
        description: 'A duplicate validator',
        filePatterns: ['*.dup'],
        enabled: true,
      };

      ValidatorRegistry.register(metadata, (options) => new MockValidator(options));

      expect(() => {
        ValidatorRegistry.register(metadata, (options) => new MockValidator(options));
      }).toThrow('Validator with id "duplicate" is already registered');
    });

    it('should allow multiple different validators', () => {
      const metadata1: ValidatorMetadata = {
        id: 'validator-1',
        name: 'Validator 1',
        description: 'First validator',
        filePatterns: ['*.v1'],
        enabled: true,
      };

      const metadata2: ValidatorMetadata = {
        id: 'validator-2',
        name: 'Validator 2',
        description: 'Second validator',
        filePatterns: ['*.v2'],
        enabled: false,
      };

      ValidatorRegistry.register(metadata1, (options) => new MockValidator(options));
      ValidatorRegistry.register(metadata2, (options) => new MockValidator(options));

      expect(ValidatorRegistry.count()).toBe(2);
      expect(ValidatorRegistry.has('validator-1')).toBe(true);
      expect(ValidatorRegistry.has('validator-2')).toBe(true);
    });
  });

  describe('create', () => {
    beforeEach(() => {
      const metadata: ValidatorMetadata = {
        id: 'test-validator',
        name: 'Test Validator',
        description: 'A test validator',
        filePatterns: ['*.test'],
        enabled: true,
      };

      ValidatorRegistry.register(metadata, (options) => new MockValidator(options));
    });

    it('should create validator instance by ID', () => {
      const validator = ValidatorRegistry.create('test-validator');

      expect(validator).toBeInstanceOf(MockValidator);
    });

    it('should pass options to validator factory', () => {
      const options = { verbose: true, path: '/test/path' };
      const validator = ValidatorRegistry.create('test-validator', options);

      expect(validator).toBeInstanceOf(MockValidator);
      // Options are passed to the factory and stored in the validator
    });

    it('should throw error for non-existent validator ID', () => {
      expect(() => {
        ValidatorRegistry.create('non-existent');
      }).toThrow('Validator with id "non-existent" is not registered');
    });
  });

  describe('getAll', () => {
    beforeEach(() => {
      const metadata1: ValidatorMetadata = {
        id: 'validator-1',
        name: 'Validator 1',
        description: 'First validator',
        filePatterns: ['*.v1'],
        enabled: true,
      };

      const metadata2: ValidatorMetadata = {
        id: 'validator-2',
        name: 'Validator 2',
        description: 'Second validator',
        filePatterns: ['*.v2'],
        enabled: false,
      };

      ValidatorRegistry.register(metadata1, (options) => new MockValidator(options));
      ValidatorRegistry.register(metadata2, (options) => new MockValidator(options));
    });

    it('should return all registered validators', () => {
      const validators = ValidatorRegistry.getAll();

      expect(validators).toHaveLength(2);
      expect(validators.every((v) => v instanceof MockValidator)).toBe(true);
    });

    it('should pass options to all validators', () => {
      const options = { verbose: true };
      const validators = ValidatorRegistry.getAll(options);

      expect(validators).toHaveLength(2);
    });

    it('should return empty array when no validators registered', () => {
      ValidatorRegistry.clear();
      const validators = ValidatorRegistry.getAll();

      expect(validators).toHaveLength(0);
    });
  });

  describe('getEnabled', () => {
    beforeEach(() => {
      const metadata1: ValidatorMetadata = {
        id: 'enabled-validator',
        name: 'Enabled Validator',
        description: 'An enabled validator',
        filePatterns: ['*.enabled'],
        enabled: true,
      };

      const metadata2: ValidatorMetadata = {
        id: 'disabled-validator',
        name: 'Disabled Validator',
        description: 'A disabled validator',
        filePatterns: ['*.disabled'],
        enabled: false,
      };

      const metadata3: ValidatorMetadata = {
        id: 'another-enabled',
        name: 'Another Enabled',
        description: 'Another enabled validator',
        filePatterns: ['*.enabled2'],
        enabled: true,
      };

      ValidatorRegistry.register(metadata1, (options) => new MockValidator(options));
      ValidatorRegistry.register(metadata2, (options) => new MockValidator(options));
      ValidatorRegistry.register(metadata3, (options) => new MockValidator(options));
    });

    it('should return only enabled validators', () => {
      const validators = ValidatorRegistry.getEnabled();

      expect(validators).toHaveLength(2);
    });

    it('should exclude disabled validators', () => {
      const validators = ValidatorRegistry.getEnabled();
      const metadata = ValidatorRegistry.getAllMetadata();
      const enabledIds = metadata.filter((m) => m.enabled).map((m) => m.id);

      expect(validators).toHaveLength(enabledIds.length);
    });

    it('should return empty array when no enabled validators', () => {
      ValidatorRegistry.clear();

      const metadata: ValidatorMetadata = {
        id: 'disabled-only',
        name: 'Disabled Only',
        description: 'Only disabled validator',
        filePatterns: ['*.disabled'],
        enabled: false,
      };

      ValidatorRegistry.register(metadata, (options) => new MockValidator(options));

      const validators = ValidatorRegistry.getEnabled();
      expect(validators).toHaveLength(0);
    });
  });

  describe('getMetadata', () => {
    beforeEach(() => {
      const metadata: ValidatorMetadata = {
        id: 'test-validator',
        name: 'Test Validator',
        description: 'A test validator',
        filePatterns: ['*.test'],
        enabled: true,
      };

      ValidatorRegistry.register(metadata, (options) => new MockValidator(options));
    });

    it('should return metadata for registered validator', () => {
      const metadata = ValidatorRegistry.getMetadata('test-validator');

      expect(metadata).toBeDefined();
      expect(metadata?.id).toBe('test-validator');
      expect(metadata?.name).toBe('Test Validator');
      expect(metadata?.description).toBe('A test validator');
      expect(metadata?.filePatterns).toEqual(['*.test']);
      expect(metadata?.enabled).toBe(true);
    });

    it('should return undefined for non-existent validator', () => {
      const metadata = ValidatorRegistry.getMetadata('non-existent');

      expect(metadata).toBeUndefined();
    });
  });

  describe('getAllMetadata', () => {
    it('should return all validator metadata', () => {
      const metadata1: ValidatorMetadata = {
        id: 'validator-1',
        name: 'Validator 1',
        description: 'First validator',
        filePatterns: ['*.v1'],
        enabled: true,
      };

      const metadata2: ValidatorMetadata = {
        id: 'validator-2',
        name: 'Validator 2',
        description: 'Second validator',
        filePatterns: ['*.v2'],
        enabled: false,
      };

      ValidatorRegistry.register(metadata1, (options) => new MockValidator(options));
      ValidatorRegistry.register(metadata2, (options) => new MockValidator(options));

      const allMetadata = ValidatorRegistry.getAllMetadata();

      expect(allMetadata).toHaveLength(2);
      expect(allMetadata[0].id).toBe('validator-1');
      expect(allMetadata[1].id).toBe('validator-2');
    });

    it('should return empty array when no validators registered', () => {
      const allMetadata = ValidatorRegistry.getAllMetadata();

      expect(allMetadata).toHaveLength(0);
    });
  });

  describe('has', () => {
    beforeEach(() => {
      const metadata: ValidatorMetadata = {
        id: 'test-validator',
        name: 'Test Validator',
        description: 'A test validator',
        filePatterns: ['*.test'],
        enabled: true,
      };

      ValidatorRegistry.register(metadata, (options) => new MockValidator(options));
    });

    it('should return true for registered validator', () => {
      expect(ValidatorRegistry.has('test-validator')).toBe(true);
    });

    it('should return false for non-existent validator', () => {
      expect(ValidatorRegistry.has('non-existent')).toBe(false);
    });
  });

  describe('count', () => {
    it('should return 0 when no validators registered', () => {
      expect(ValidatorRegistry.count()).toBe(0);
    });

    it('should return correct count after registrations', () => {
      const metadata1: ValidatorMetadata = {
        id: 'validator-1',
        name: 'Validator 1',
        description: 'First validator',
        filePatterns: ['*.v1'],
        enabled: true,
      };

      const metadata2: ValidatorMetadata = {
        id: 'validator-2',
        name: 'Validator 2',
        description: 'Second validator',
        filePatterns: ['*.v2'],
        enabled: false,
      };

      ValidatorRegistry.register(metadata1, (options) => new MockValidator(options));
      expect(ValidatorRegistry.count()).toBe(1);

      ValidatorRegistry.register(metadata2, (options) => new MockValidator(options));
      expect(ValidatorRegistry.count()).toBe(2);
    });
  });

  describe('clear', () => {
    it('should clear all registered validators', () => {
      const metadata: ValidatorMetadata = {
        id: 'test-validator',
        name: 'Test Validator',
        description: 'A test validator',
        filePatterns: ['*.test'],
        enabled: true,
      };

      ValidatorRegistry.register(metadata, (options) => new MockValidator(options));
      expect(ValidatorRegistry.count()).toBe(1);

      ValidatorRegistry.clear();
      expect(ValidatorRegistry.count()).toBe(0);
      expect(ValidatorRegistry.has('test-validator')).toBe(false);
    });

    it('should allow re-registration after clear', () => {
      const metadata: ValidatorMetadata = {
        id: 'test-validator',
        name: 'Test Validator',
        description: 'A test validator',
        filePatterns: ['*.test'],
        enabled: true,
      };

      ValidatorRegistry.register(metadata, (options) => new MockValidator(options));
      ValidatorRegistry.clear();
      ValidatorRegistry.register(metadata, (options) => new MockValidator(options));

      expect(ValidatorRegistry.count()).toBe(1);
      expect(ValidatorRegistry.has('test-validator')).toBe(true);
    });
  });
});
