/**
 * Tests for json-helpers utilities
 */

import { safeParseJSON } from '../../src/utils/json-helpers';

describe('json-helpers', () => {
  describe('safeParseJSON', () => {
    it('should parse valid JSON object', () => {
      const json = '{"name": "test", "value": 42}';
      const result = safeParseJSON(json);

      expect(result).toEqual({ name: 'test', value: 42 });
    });

    it('should parse valid JSON array', () => {
      const json = '["one", "two", "three"]';
      const result = safeParseJSON(json);

      expect(result).toEqual(['one', 'two', 'three']);
    });

    it('should parse nested JSON', () => {
      const json = '{"servers": {"ts": {"command": "typescript-language-server"}}}';
      const result = safeParseJSON(json);

      expect(result).toEqual({
        servers: {
          ts: {
            command: 'typescript-language-server',
          },
        },
      });
    });

    it('should return null for invalid JSON', () => {
      const json = '{invalid json}';
      const result = safeParseJSON(json);

      expect(result).toBeNull();
    });

    it('should return null for malformed JSON', () => {
      const json = '{"name": "test",}'; // Trailing comma
      const result = safeParseJSON(json);

      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const json = '';
      const result = safeParseJSON(json);

      expect(result).toBeNull();
    });

    it('should return null for non-JSON string', () => {
      const json = 'just some text';
      const result = safeParseJSON(json);

      expect(result).toBeNull();
    });

    it('should parse JSON with null values', () => {
      const json = '{"value": null}';
      const result = safeParseJSON(json);

      expect(result).toEqual({ value: null });
    });

    it('should parse JSON with boolean values', () => {
      const json = '{"enabled": true, "disabled": false}';
      const result = safeParseJSON(json);

      expect(result).toEqual({ enabled: true, disabled: false });
    });

    it('should parse JSON with numbers', () => {
      const json = '{"int": 42, "float": 3.14, "negative": -10}';
      const result = safeParseJSON(json);

      expect(result).toEqual({ int: 42, float: 3.14, negative: -10 });
    });
  });
});
