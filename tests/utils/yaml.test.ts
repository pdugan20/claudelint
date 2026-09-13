import { parseYaml, isValidYaml, stringifyYaml } from '../../src/utils/formats/yaml';

describe('YAML utilities', () => {
  describe('document compatibility', () => {
    it.each(['', ' ', '\n', '\ufeff'])('preserves empty streams: %j', (input) => {
      expect(parseYaml(input)).toBeUndefined();
    });

    it.each(['# comment', '---\n', '\t'])('preserves empty documents: %j', (input) => {
      expect(parseYaml(input)).toBeNull();
    });

    it('preserves merge keys and explicit overrides', () => {
      expect(parseYaml('base: &base {a: 1, b: 2}\ncopy: {<<: *base, b: 3}')).toEqual({
        base: { a: 1, b: 2 },
        copy: { a: 1, b: 3 },
      });
    });

    it('preserves scalar resolution without YAML 1.1 boolean coercion', () => {
      expect(parseYaml('[yes, on, true, 0123, 0b101, -0xF, +0o7, 2026-01-01]')).toEqual([
        'yes',
        'on',
        true,
        123,
        5,
        -15,
        7,
        new Date('2026-01-01'),
      ]);
    });

    it('preserves extended collection and binary representations', () => {
      expect(parseYaml('!!set {a: null, b: null}')).toEqual({ a: null, b: null });
      expect(parseYaml('!!omap [a: 1, b: 2]')).toEqual([{ a: 1 }, { b: 2 }]);
      expect(parseYaml('!!pairs [a: 1, a: 2]')).toEqual([
        ['a', 1],
        ['a', 2],
      ]);
      expect(parseYaml('!!binary SGVsbG8=')).toEqual(new Uint8Array([72, 101, 108, 108, 111]));
    });

    it('preserves mapping keys without mutating object prototypes', () => {
      const result = parseYaml<Record<string, unknown>>('__proto__: {polluted: true}');
      expect(Object.hasOwn(result, '__proto__')).toBe(true);
      expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
      expect(result['polluted']).toBeUndefined();
      expect(parseYaml('? [a, b]\n: c')).toEqual({ 'a,b': 'c' });
    });

    it.each(['a: 1\na: 2', '---\na: 1\n---\nb: 2', '!!set {a: 1}'])(
      'rejects invalid or multiple documents: %j',
      (input) => {
        expect(() => parseYaml(input)).toThrow('Failed to parse YAML');
        expect(isValidYaml(input)).toBe(false);
      }
    );
  });

  describe('parseYaml', () => {
    it('should parse valid YAML string', () => {
      const yamlString = `
name: test
version: 1.0.0
description: Test description
`;

      const result = parseYaml<{ name: string; version: string; description: string }>(yamlString);

      expect(result).toEqual({
        name: 'test',
        version: '1.0.0',
        description: 'Test description',
      });
    });

    it('should parse YAML arrays', () => {
      const yamlString = `
items:
  - item1
  - item2
  - item3
`;

      const result = parseYaml<{ items: string[] }>(yamlString);

      expect(result).toEqual({
        items: ['item1', 'item2', 'item3'],
      });
    });

    it('should parse nested YAML structures', () => {
      const yamlString = `
parent:
  child1:
    grandchild: value1
  child2:
    grandchild: value2
`;

      const result = parseYaml(yamlString);

      expect(result).toEqual({
        parent: {
          child1: {
            grandchild: 'value1',
          },
          child2: {
            grandchild: 'value2',
          },
        },
      });
    });

    it('should throw error for invalid YAML', () => {
      const invalidYaml = `
name: test
description: "unclosed string
version: 1.0.0
`;

      expect(() => parseYaml(invalidYaml)).toThrow('Failed to parse YAML');
    });

    it('should throw error for malformed YAML with bad anchor', () => {
      const malformedYaml = `
name: &anchor value
other: *badanchor
`;

      expect(() => parseYaml(malformedYaml)).toThrow('Failed to parse YAML');
    });
  });

  describe('isValidYaml', () => {
    it('should return true for valid YAML', () => {
      const validYaml = `
name: test
version: 1.0.0
`;

      expect(isValidYaml(validYaml)).toBe(true);
    });

    it('should return false for invalid YAML', () => {
      const invalidYaml = `
name: test
description: "unclosed string
`;

      expect(isValidYaml(invalidYaml)).toBe(false);
    });

    it('should return false for malformed YAML', () => {
      const malformedYaml = `
name: "unclosed string
`;

      expect(isValidYaml(malformedYaml)).toBe(false);
    });

    it('should return true for empty string', () => {
      expect(isValidYaml('')).toBe(true);
    });

    it('should return true for simple values', () => {
      expect(isValidYaml('true')).toBe(true);
      expect(isValidYaml('42')).toBe(true);
      expect(isValidYaml('"string"')).toBe(true);
    });
  });

  describe('stringifyYaml', () => {
    it('should stringify object to YAML', () => {
      const obj = {
        name: 'test',
        version: '1.0.0',
        description: 'Test description',
      };

      const yaml = stringifyYaml(obj);

      expect(yaml).toContain('name: test');
      expect(yaml).toContain('version: 1.0.0');
      expect(yaml).toContain('description: Test description');
    });

    it('should stringify arrays to YAML', () => {
      const obj = {
        items: ['item1', 'item2', 'item3'],
      };

      const yaml = stringifyYaml(obj);

      expect(yaml).toContain('items:');
      expect(yaml).toContain('- item1');
      expect(yaml).toContain('- item2');
      expect(yaml).toContain('- item3');
    });

    it('should stringify nested objects to YAML', () => {
      const obj = {
        parent: {
          child1: {
            value: 'test1',
          },
          child2: {
            value: 'test2',
          },
        },
      };

      const yaml = stringifyYaml(obj);

      expect(yaml).toContain('parent:');
      expect(yaml).toContain('child1:');
      expect(yaml).toContain('child2:');
      expect(yaml).toContain('value: test1');
      expect(yaml).toContain('value: test2');
    });

    it('should handle null and undefined values', () => {
      const obj = {
        nullValue: null,
        undefinedValue: undefined,
        normalValue: 'test',
      };

      const yaml = stringifyYaml(obj);

      expect(yaml).toContain('normalValue: test');
    });

    it('should handle boolean values', () => {
      const obj = {
        trueValue: true,
        falseValue: false,
      };

      const yaml = stringifyYaml(obj);

      expect(yaml).toContain('trueValue: true');
      expect(yaml).toContain('falseValue: false');
    });

    it('should handle numeric values', () => {
      const obj = {
        integer: 42,
        float: 3.14,
        negative: -10,
      };

      const yaml = stringifyYaml(obj);

      expect(yaml).toContain('integer: 42');
      expect(yaml).toContain('float: 3.14');
      expect(yaml).toContain('negative: -10');
    });
  });

  describe('Round-trip conversion', () => {
    it('should preserve data through parse and stringify', () => {
      const original = {
        name: 'test',
        version: '1.0.0',
        items: ['a', 'b', 'c'],
        nested: {
          value: 42,
        },
      };

      const yaml = stringifyYaml(original);
      const parsed = parseYaml(yaml);

      expect(parsed).toEqual(original);
    });
  });
});
