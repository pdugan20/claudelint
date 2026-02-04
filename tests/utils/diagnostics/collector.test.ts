import { DiagnosticCollector, Diagnostic } from '../../../src/utils/diagnostics/collector';

describe('DiagnosticCollector', () => {
  let collector: DiagnosticCollector;

  beforeEach(() => {
    collector = new DiagnosticCollector();
  });

  describe('add()', () => {
    it('should add a diagnostic', () => {
      const diagnostic: Diagnostic = {
        message: 'Test message',
        source: 'TestSource',
        severity: 'warning',
      };

      collector.add(diagnostic);

      const all = collector.getAll();
      expect(all).toHaveLength(1);
      expect(all[0]).toEqual(diagnostic);
    });

    it('should add multiple diagnostics', () => {
      collector.add({
        message: 'First',
        source: 'Source1',
        severity: 'warning',
      });
      collector.add({
        message: 'Second',
        source: 'Source2',
        severity: 'error',
      });

      expect(collector.getAll()).toHaveLength(2);
    });

    it('should include optional code and context', () => {
      const diagnostic: Diagnostic = {
        message: 'Test',
        source: 'TestSource',
        severity: 'info',
        code: 'TEST_001',
        context: { key: 'value' },
      };

      collector.add(diagnostic);

      const all = collector.getAll();
      expect(all[0].code).toBe('TEST_001');
      expect(all[0].context).toEqual({ key: 'value' });
    });
  });

  describe('warn()', () => {
    it('should add a warning diagnostic', () => {
      collector.warn('Warning message', 'TestSource');

      const warnings = collector.getWarnings();
      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toMatchObject({
        message: 'Warning message',
        source: 'TestSource',
        severity: 'warning',
      });
    });

    it('should add warning with code', () => {
      collector.warn('Warning', 'TestSource', 'WARN_001');

      const warnings = collector.getWarnings();
      expect(warnings[0].code).toBe('WARN_001');
    });

    it('should add warning with context', () => {
      collector.warn('Warning', 'TestSource', 'WARN_001', { file: 'test.ts' });

      const warnings = collector.getWarnings();
      expect(warnings[0].context).toEqual({ file: 'test.ts' });
    });
  });

  describe('error()', () => {
    it('should add an error diagnostic', () => {
      collector.error('Error message', 'TestSource');

      const errors = collector.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        message: 'Error message',
        source: 'TestSource',
        severity: 'error',
      });
    });

    it('should add error with code', () => {
      collector.error('Error', 'TestSource', 'ERROR_001');

      const errors = collector.getErrors();
      expect(errors[0].code).toBe('ERROR_001');
    });
  });

  describe('info()', () => {
    it('should add an info diagnostic', () => {
      collector.info('Info message', 'TestSource');

      const info = collector.getInfo();
      expect(info).toHaveLength(1);
      expect(info[0]).toMatchObject({
        message: 'Info message',
        source: 'TestSource',
        severity: 'info',
      });
    });
  });

  describe('getAll()', () => {
    it('should return empty array when no diagnostics', () => {
      expect(collector.getAll()).toEqual([]);
    });

    it('should return all diagnostics', () => {
      collector.warn('Warning', 'Source1');
      collector.error('Error', 'Source2');
      collector.info('Info', 'Source3');

      const all = collector.getAll();
      expect(all).toHaveLength(3);
    });

    it('should return a copy to prevent mutation', () => {
      collector.warn('Warning', 'Source');

      const all1 = collector.getAll();
      const all2 = collector.getAll();

      expect(all1).not.toBe(all2); // Different array references
      expect(all1).toEqual(all2); // Same content
    });

    it('should not allow external mutation', () => {
      collector.warn('Warning', 'Source');

      const all = collector.getAll();
      all.push({
        message: 'Hacked',
        source: 'External',
        severity: 'error',
      });

      // Original collector should be unchanged
      expect(collector.getAll()).toHaveLength(1);
    });
  });

  describe('getWarnings()', () => {
    it('should return only warnings', () => {
      collector.warn('Warning 1', 'Source1');
      collector.error('Error 1', 'Source2');
      collector.warn('Warning 2', 'Source3');
      collector.info('Info 1', 'Source4');

      const warnings = collector.getWarnings();
      expect(warnings).toHaveLength(2);
      expect(warnings.every((d) => d.severity === 'warning')).toBe(true);
    });

    it('should return empty array when no warnings', () => {
      collector.error('Error', 'Source');
      expect(collector.getWarnings()).toEqual([]);
    });
  });

  describe('getErrors()', () => {
    it('should return only errors', () => {
      collector.warn('Warning 1', 'Source1');
      collector.error('Error 1', 'Source2');
      collector.error('Error 2', 'Source3');
      collector.info('Info 1', 'Source4');

      const errors = collector.getErrors();
      expect(errors).toHaveLength(2);
      expect(errors.every((d) => d.severity === 'error')).toBe(true);
    });

    it('should return empty array when no errors', () => {
      collector.warn('Warning', 'Source');
      expect(collector.getErrors()).toEqual([]);
    });
  });

  describe('getInfo()', () => {
    it('should return only info diagnostics', () => {
      collector.warn('Warning 1', 'Source1');
      collector.info('Info 1', 'Source2');
      collector.info('Info 2', 'Source3');
      collector.error('Error 1', 'Source4');

      const info = collector.getInfo();
      expect(info).toHaveLength(2);
      expect(info.every((d) => d.severity === 'info')).toBe(true);
    });

    it('should return empty array when no info', () => {
      collector.warn('Warning', 'Source');
      expect(collector.getInfo()).toEqual([]);
    });
  });

  describe('clear()', () => {
    it('should clear all diagnostics', () => {
      collector.warn('Warning', 'Source1');
      collector.error('Error', 'Source2');
      collector.info('Info', 'Source3');

      expect(collector.count()).toBe(3);

      collector.clear();

      expect(collector.count()).toBe(0);
      expect(collector.getAll()).toEqual([]);
    });

    it('should allow adding after clear', () => {
      collector.warn('First', 'Source');
      collector.clear();
      collector.warn('Second', 'Source');

      const warnings = collector.getWarnings();
      expect(warnings).toHaveLength(1);
      expect(warnings[0].message).toBe('Second');
    });
  });

  describe('hasWarnings()', () => {
    it('should return false when no warnings', () => {
      expect(collector.hasWarnings()).toBe(false);
    });

    it('should return true when warnings exist', () => {
      collector.warn('Warning', 'Source');
      expect(collector.hasWarnings()).toBe(true);
    });

    it('should return false when only errors exist', () => {
      collector.error('Error', 'Source');
      expect(collector.hasWarnings()).toBe(false);
    });
  });

  describe('hasErrors()', () => {
    it('should return false when no errors', () => {
      expect(collector.hasErrors()).toBe(false);
    });

    it('should return true when errors exist', () => {
      collector.error('Error', 'Source');
      expect(collector.hasErrors()).toBe(true);
    });

    it('should return false when only warnings exist', () => {
      collector.warn('Warning', 'Source');
      expect(collector.hasErrors()).toBe(false);
    });
  });

  describe('count()', () => {
    it('should return 0 initially', () => {
      expect(collector.count()).toBe(0);
    });

    it('should return total count of all diagnostics', () => {
      collector.warn('Warning', 'Source1');
      collector.error('Error', 'Source2');
      collector.info('Info', 'Source3');

      expect(collector.count()).toBe(3);
    });

    it('should update count after clear', () => {
      collector.warn('Warning', 'Source');
      expect(collector.count()).toBe(1);

      collector.clear();
      expect(collector.count()).toBe(0);
    });
  });

  describe('real-world scenarios', () => {
    it('should handle multiple components adding diagnostics', () => {
      // Simulate ConfigResolver adding warnings
      collector.warn('Invalid rule options', 'ConfigResolver', 'CONFIG_001');
      collector.warn('Missing rule ID', 'ConfigResolver', 'CONFIG_002');

      // Simulate WorkspaceDetector adding warnings
      collector.warn('Invalid workspace.yaml', 'WorkspaceDetector', 'WORKSPACE_001');

      // Simulate CacheManager adding warnings
      collector.warn('Cache write failed', 'CacheManager', 'CACHE_001');

      expect(collector.count()).toBe(4);
      expect(collector.getWarnings()).toHaveLength(4);

      const sources = collector.getAll().map((d) => d.source);
      expect(sources).toContain('ConfigResolver');
      expect(sources).toContain('WorkspaceDetector');
      expect(sources).toContain('CacheManager');
    });

    it('should support filtering by code', () => {
      collector.warn('Warning 1', 'Source', 'CODE_001');
      collector.warn('Warning 2', 'Source', 'CODE_002');
      collector.warn('Warning 3', 'Source', 'CODE_001');

      const all = collector.getAll();
      const code001 = all.filter((d) => d.code === 'CODE_001');

      expect(code001).toHaveLength(2);
    });

    it('should support grouping by source', () => {
      collector.warn('Warning 1', 'ConfigResolver');
      collector.warn('Warning 2', 'ConfigResolver');
      collector.warn('Warning 3', 'CacheManager');

      const all = collector.getAll();
      const bySource = all.reduce(
        (acc, d) => {
          if (!acc[d.source]) acc[d.source] = [];
          acc[d.source].push(d);
          return acc;
        },
        {} as Record<string, Diagnostic[]>
      );

      expect(bySource.ConfigResolver).toHaveLength(2);
      expect(bySource.CacheManager).toHaveLength(1);
    });
  });
});
