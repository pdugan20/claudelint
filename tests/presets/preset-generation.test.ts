/**
 * Tests for preset JSON generation
 *
 * Verifies that the generated preset files contain the correct rules
 * based on registry metadata.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// Import rule registration (side-effect: populates registry)
import '../../src/rules/index';
import { RuleRegistry } from '../../src/utils/rules/registry';

const PRESETS_DIR = join(__dirname, '../../presets');

describe('preset generation', () => {
  let recommendedPreset: { rules: Record<string, string> };
  let allPreset: { rules: Record<string, string> };

  beforeAll(() => {
    recommendedPreset = JSON.parse(readFileSync(join(PRESETS_DIR, 'recommended.json'), 'utf-8'));
    allPreset = JSON.parse(readFileSync(join(PRESETS_DIR, 'all.json'), 'utf-8'));
  });

  describe('recommended.json', () => {
    it('contains only rules with docs.recommended === true', () => {
      const rules = RuleRegistry.getAllRules();
      const expectedRecommended = rules
        .filter((r) => r.meta.docs?.recommended === true)
        .map((r) => r.meta.id)
        .sort();

      const actualRecommended = Object.keys(recommendedPreset.rules).sort();

      expect(actualRecommended).toEqual(expectedRecommended);
    });

    it('uses source severity for each rule', () => {
      const rules = RuleRegistry.getAllRules();

      for (const [ruleId, severity] of Object.entries(recommendedPreset.rules)) {
        const rule = rules.find((r) => r.meta.id === ruleId);
        expect(rule).toBeDefined();
        expect(severity).toBe(rule!.meta.severity);
      }
    });

    it('does not include rules without docs.recommended', () => {
      const rules = RuleRegistry.getAllRules();
      const notRecommended = rules
        .filter((r) => !r.meta.docs?.recommended)
        .map((r) => r.meta.id);

      for (const ruleId of notRecommended) {
        expect(recommendedPreset.rules).not.toHaveProperty(ruleId);
      }
    });

    it('has a rules object at top level', () => {
      expect(recommendedPreset).toHaveProperty('rules');
      expect(typeof recommendedPreset.rules).toBe('object');
    });
  });

  describe('all.json', () => {
    it('contains every registered rule', () => {
      const registeredIds = RuleRegistry.getAllRules()
        .map((r) => r.meta.id)
        .sort();

      const presetIds = Object.keys(allPreset.rules).sort();

      expect(presetIds).toEqual(registeredIds);
    });

    it('uses source severity for each rule', () => {
      const rules = RuleRegistry.getAllRules();

      for (const [ruleId, severity] of Object.entries(allPreset.rules)) {
        const rule = rules.find((r) => r.meta.id === ruleId);
        expect(rule).toBeDefined();
        expect(severity).toBe(rule!.meta.severity);
      }
    });

    it('has more rules than recommended', () => {
      const allCount = Object.keys(allPreset.rules).length;
      const recommendedCount = Object.keys(recommendedPreset.rules).length;

      expect(allCount).toBeGreaterThan(recommendedCount);
    });
  });

  describe('snapshot stability', () => {
    it('recommended.json matches snapshot', () => {
      expect(Object.keys(recommendedPreset.rules).sort()).toMatchSnapshot();
    });

    it('all.json matches snapshot', () => {
      expect(Object.keys(allPreset.rules).sort()).toMatchSnapshot();
    });
  });
});
