/**
 * Tests for workspace detection functionality
 */

import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { detectWorkspace, findWorkspaceRoot } from '../../src/utils/workspace/detector';

describe('detectWorkspace', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'claudelint-workspace-test-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe('pnpm workspaces', () => {
    it('detects pnpm-workspace.yaml', async () => {
      // Create pnpm-workspace.yaml
      writeFileSync(
        join(tempDir, 'pnpm-workspace.yaml'),
        'packages:\n  - "packages/*"\n'
      );

      // Create package directories
      mkdirSync(join(tempDir, 'packages'));
      mkdirSync(join(tempDir, 'packages', 'app-1'));
      mkdirSync(join(tempDir, 'packages', 'app-2'));

      // Create pnpm-lock.yaml to identify package manager
      writeFileSync(join(tempDir, 'pnpm-lock.yaml'), '');

      const workspace = await detectWorkspace(tempDir);

      expect(workspace).not.toBeNull();
      expect(workspace?.packageManager).toBe('pnpm');
      expect(workspace?.root).toBe(tempDir);
      expect(workspace?.packages).toHaveLength(2);
      expect(workspace?.packages).toContain(join(tempDir, 'packages', 'app-1'));
      expect(workspace?.packages).toContain(join(tempDir, 'packages', 'app-2'));
    });

    it('handles malformed pnpm-workspace.yaml gracefully', async () => {
      // Create invalid YAML
      writeFileSync(join(tempDir, 'pnpm-workspace.yaml'), 'invalid: yaml: content:');

      const workspace = await detectWorkspace(tempDir);

      // Should return null instead of throwing
      expect(workspace).toBeNull();
    });

    it('handles missing packages field', async () => {
      // Create YAML without packages field
      writeFileSync(join(tempDir, 'pnpm-workspace.yaml'), 'foo: bar\n');

      const workspace = await detectWorkspace(tempDir);

      expect(workspace).toBeNull();
    });
  });

  describe('npm workspaces', () => {
    it('detects npm workspaces (array format)', async () => {
      // Create package.json with workspaces array
      writeFileSync(
        join(tempDir, 'package.json'),
        JSON.stringify({
          name: 'monorepo',
          workspaces: ['packages/*'],
        })
      );

      // Create package directories
      mkdirSync(join(tempDir, 'packages'));
      mkdirSync(join(tempDir, 'packages', 'lib-1'));
      mkdirSync(join(tempDir, 'packages', 'lib-2'));

      const workspace = await detectWorkspace(tempDir);

      expect(workspace).not.toBeNull();
      expect(workspace?.packageManager).toBe('npm');
      expect(workspace?.root).toBe(tempDir);
      expect(workspace?.packages).toHaveLength(2);
      expect(workspace?.packages).toContain(join(tempDir, 'packages', 'lib-1'));
      expect(workspace?.packages).toContain(join(tempDir, 'packages', 'lib-2'));
    });

    it('detects Yarn workspaces (object format)', async () => {
      // Create package.json with workspaces object
      writeFileSync(
        join(tempDir, 'package.json'),
        JSON.stringify({
          name: 'monorepo',
          workspaces: {
            packages: ['apps/*', 'libs/*'],
          },
        })
      );

      // Create package directories
      mkdirSync(join(tempDir, 'apps'));
      mkdirSync(join(tempDir, 'apps', 'web'));
      mkdirSync(join(tempDir, 'libs'));
      mkdirSync(join(tempDir, 'libs', 'shared'));

      // Create yarn.lock to identify package manager
      writeFileSync(join(tempDir, 'yarn.lock'), '');

      const workspace = await detectWorkspace(tempDir);

      expect(workspace).not.toBeNull();
      expect(workspace?.packageManager).toBe('yarn');
      expect(workspace?.root).toBe(tempDir);
      expect(workspace?.packages).toHaveLength(2);
      expect(workspace?.packages).toContain(join(tempDir, 'apps', 'web'));
      expect(workspace?.packages).toContain(join(tempDir, 'libs', 'shared'));
    });

    it('handles malformed package.json gracefully', async () => {
      // Create invalid JSON
      writeFileSync(join(tempDir, 'package.json'), '{ invalid json }');

      const workspace = await detectWorkspace(tempDir);

      expect(workspace).toBeNull();
    });

    it('handles invalid workspaces format', async () => {
      // Create package.json with invalid workspaces
      writeFileSync(
        join(tempDir, 'package.json'),
        JSON.stringify({
          name: 'monorepo',
          workspaces: 'invalid',
        })
      );

      const workspace = await detectWorkspace(tempDir);

      expect(workspace).toBeNull();
    });
  });

  describe('package manager detection', () => {
    it('detects pnpm from pnpm-lock.yaml', async () => {
      writeFileSync(
        join(tempDir, 'pnpm-workspace.yaml'),
        'packages:\n  - "packages/*"\n'
      );
      writeFileSync(join(tempDir, 'pnpm-lock.yaml'), '');
      mkdirSync(join(tempDir, 'packages'));
      mkdirSync(join(tempDir, 'packages', 'app'));

      const workspace = await detectWorkspace(tempDir);

      expect(workspace?.packageManager).toBe('pnpm');
    });

    it('detects yarn from yarn.lock', async () => {
      writeFileSync(
        join(tempDir, 'package.json'),
        JSON.stringify({
          workspaces: ['packages/*'],
        })
      );
      writeFileSync(join(tempDir, 'yarn.lock'), '');
      mkdirSync(join(tempDir, 'packages'));
      mkdirSync(join(tempDir, 'packages', 'app'));

      const workspace = await detectWorkspace(tempDir);

      expect(workspace?.packageManager).toBe('yarn');
    });

    it('defaults to npm when no lock file', async () => {
      writeFileSync(
        join(tempDir, 'package.json'),
        JSON.stringify({
          workspaces: ['packages/*'],
        })
      );
      mkdirSync(join(tempDir, 'packages'));
      mkdirSync(join(tempDir, 'packages', 'app'));

      const workspace = await detectWorkspace(tempDir);

      expect(workspace?.packageManager).toBe('npm');
    });
  });

  describe('glob pattern expansion', () => {
    it('expands multiple glob patterns', async () => {
      writeFileSync(
        join(tempDir, 'pnpm-workspace.yaml'),
        'packages:\n  - "apps/*"\n  - "libs/*"\n'
      );

      mkdirSync(join(tempDir, 'apps'));
      mkdirSync(join(tempDir, 'apps', 'web'));
      mkdirSync(join(tempDir, 'apps', 'api'));
      mkdirSync(join(tempDir, 'libs'));
      mkdirSync(join(tempDir, 'libs', 'shared'));

      const workspace = await detectWorkspace(tempDir);

      expect(workspace?.packages).toHaveLength(3);
      expect(workspace?.packages).toContain(join(tempDir, 'apps', 'web'));
      expect(workspace?.packages).toContain(join(tempDir, 'apps', 'api'));
      expect(workspace?.packages).toContain(join(tempDir, 'libs', 'shared'));
    });

    it('deduplicates overlapping patterns', async () => {
      writeFileSync(
        join(tempDir, 'pnpm-workspace.yaml'),
        'packages:\n  - "packages/*"\n  - "packages/app"\n'
      );

      mkdirSync(join(tempDir, 'packages'));
      mkdirSync(join(tempDir, 'packages', 'app'));

      const workspace = await detectWorkspace(tempDir);

      // Should only have one entry for packages/app
      expect(workspace?.packages).toHaveLength(1);
      expect(workspace?.packages).toContain(join(tempDir, 'packages', 'app'));
    });

    it('ignores node_modules and .git directories', async () => {
      writeFileSync(
        join(tempDir, 'pnpm-workspace.yaml'),
        'packages:\n  - "**"\n'
      );

      mkdirSync(join(tempDir, 'packages'));
      mkdirSync(join(tempDir, 'packages', 'app'));
      mkdirSync(join(tempDir, 'node_modules'));
      mkdirSync(join(tempDir, '.git'));

      const workspace = await detectWorkspace(tempDir);

      // Should not include node_modules or .git
      expect(workspace?.packages).not.toContain(join(tempDir, 'node_modules'));
      expect(workspace?.packages).not.toContain(join(tempDir, '.git'));
    });

    it('filters out files (only directories)', async () => {
      writeFileSync(
        join(tempDir, 'pnpm-workspace.yaml'),
        'packages:\n  - "packages/*"\n'
      );

      mkdirSync(join(tempDir, 'packages'));
      mkdirSync(join(tempDir, 'packages', 'app'));
      writeFileSync(join(tempDir, 'packages', 'README.md'), '# Test');

      const workspace = await detectWorkspace(tempDir);

      // Should only include directories
      expect(workspace?.packages).toHaveLength(1);
      expect(workspace?.packages).toContain(join(tempDir, 'packages', 'app'));
    });
  });

  describe('no workspace', () => {
    it('returns null when no workspace found', async () => {
      const workspace = await detectWorkspace(tempDir);

      expect(workspace).toBeNull();
    });

    it('returns null for empty directory', async () => {
      const workspace = await detectWorkspace(tempDir);

      expect(workspace).toBeNull();
    });

    it('returns null when package.json has no workspaces field', async () => {
      writeFileSync(
        join(tempDir, 'package.json'),
        JSON.stringify({
          name: 'regular-package',
          version: '1.0.0',
        })
      );

      const workspace = await detectWorkspace(tempDir);

      expect(workspace).toBeNull();
    });
  });

  describe('findWorkspaceRoot', () => {
    it('finds root from nested package directory', async () => {
      // Create workspace structure
      writeFileSync(
        join(tempDir, 'pnpm-workspace.yaml'),
        'packages:\n  - "packages/*"\n'
      );
      mkdirSync(join(tempDir, 'packages'));
      mkdirSync(join(tempDir, 'packages', 'app-1'));

      // Start from nested directory
      const root = await findWorkspaceRoot(join(tempDir, 'packages', 'app-1'));

      expect(root).toBe(tempDir);
    });

    it('finds root from workspace root itself', async () => {
      writeFileSync(
        join(tempDir, 'pnpm-workspace.yaml'),
        'packages:\n  - "packages/*"\n'
      );

      const root = await findWorkspaceRoot(tempDir);

      expect(root).toBe(tempDir);
    });

    it('returns null when not in workspace', async () => {
      // No workspace config files
      const root = await findWorkspaceRoot(tempDir);

      expect(root).toBeNull();
    });

    it('works with npm workspaces', async () => {
      writeFileSync(
        join(tempDir, 'package.json'),
        JSON.stringify({
          workspaces: ['packages/*'],
        })
      );
      mkdirSync(join(tempDir, 'packages'));
      mkdirSync(join(tempDir, 'packages', 'lib-1'));

      const root = await findWorkspaceRoot(join(tempDir, 'packages', 'lib-1'));

      expect(root).toBe(tempDir);
    });

    it('works with Yarn workspaces', async () => {
      writeFileSync(
        join(tempDir, 'package.json'),
        JSON.stringify({
          workspaces: {
            packages: ['apps/*'],
          },
        })
      );
      mkdirSync(join(tempDir, 'apps'));
      mkdirSync(join(tempDir, 'apps', 'web'));

      const root = await findWorkspaceRoot(join(tempDir, 'apps', 'web'));

      expect(root).toBe(tempDir);
    });

    it('stops at file system root', async () => {
      // This should walk up to root and return null
      const root = await findWorkspaceRoot(tempDir);

      expect(root).toBeNull();
    });

    it('handles deeply nested directories', async () => {
      writeFileSync(
        join(tempDir, 'pnpm-workspace.yaml'),
        'packages:\n  - "packages/*"\n'
      );
      mkdirSync(join(tempDir, 'packages'));
      mkdirSync(join(tempDir, 'packages', 'app-1'));
      mkdirSync(join(tempDir, 'packages', 'app-1', 'src'));
      mkdirSync(join(tempDir, 'packages', 'app-1', 'src', 'components'));

      const root = await findWorkspaceRoot(
        join(tempDir, 'packages', 'app-1', 'src', 'components')
      );

      expect(root).toBe(tempDir);
    });
  });

  describe('auto-detect workspace root', () => {
    it('auto-detects root when enabled', async () => {
      // Create workspace
      writeFileSync(
        join(tempDir, 'pnpm-workspace.yaml'),
        'packages:\n  - "packages/*"\n'
      );
      mkdirSync(join(tempDir, 'packages'));
      mkdirSync(join(tempDir, 'packages', 'app-1'));

      // Detect from nested directory with auto-detect enabled
      const workspace = await detectWorkspace(
        join(tempDir, 'packages', 'app-1'),
        true
      );

      expect(workspace).not.toBeNull();
      expect(workspace?.root).toBe(tempDir);
      expect(workspace?.packageManager).toBe('pnpm');
    });

    it('does not auto-detect when disabled', async () => {
      // Create workspace
      writeFileSync(
        join(tempDir, 'pnpm-workspace.yaml'),
        'packages:\n  - "packages/*"\n'
      );
      mkdirSync(join(tempDir, 'packages'));
      mkdirSync(join(tempDir, 'packages', 'app-1'));

      // Detect from nested directory without auto-detect
      const workspace = await detectWorkspace(
        join(tempDir, 'packages', 'app-1'),
        false
      );

      // Should not find workspace (nested dir has no config)
      expect(workspace).toBeNull();
    });

    it('returns null when no workspace in tree', async () => {
      // No workspace config anywhere
      mkdirSync(join(tempDir, 'some-dir'));

      const workspace = await detectWorkspace(join(tempDir, 'some-dir'), true);

      expect(workspace).toBeNull();
    });

    it('works with npm workspaces from nested dir', async () => {
      writeFileSync(
        join(tempDir, 'package.json'),
        JSON.stringify({
          workspaces: ['packages/*'],
        })
      );
      mkdirSync(join(tempDir, 'packages'));
      mkdirSync(join(tempDir, 'packages', 'lib-1'));

      const workspace = await detectWorkspace(
        join(tempDir, 'packages', 'lib-1'),
        true
      );

      expect(workspace).not.toBeNull();
      expect(workspace?.root).toBe(tempDir);
      expect(workspace?.packageManager).toBe('npm');
    });
  });
});
