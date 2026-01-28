import { PluginLoader, ValidatorPlugin } from '../../src/utils/plugin-loader';
import { ValidatorRegistry } from '../../src/utils/validator-factory';
import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';

describe('PluginLoader', () => {
  let testDir: string;
  let loader: PluginLoader;

  beforeEach(() => {
    // Create temp directory
    testDir = join(__dirname, '../__temp__', `test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });

    // Clear registry
    ValidatorRegistry.clear();

    // Create new loader
    loader = new PluginLoader();
  });

  afterEach(() => {
    // Clean up
    if (testDir) {
      rmSync(testDir, { recursive: true, force: true });
    }
    ValidatorRegistry.clear();
  });

  describe('Plugin Interface Validation', () => {
    it('should accept valid plugin', async () => {
      const validPlugin: ValidatorPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        register: jest.fn(),
      };

      // Create plugin file
      const pluginPath = join(testDir, 'test-plugin.js');
      writeFileSync(
        pluginPath,
        `
        module.exports = ${JSON.stringify({
          name: validPlugin.name,
          version: validPlugin.version,
        })};
        module.exports.register = function(registry) {
          registry.register(
            {
              id: 'test-validator',
              name: 'Test Validator',
              description: 'Test',
              filePatterns: ['**/*'],
              enabled: true,
            },
            () => ({})
          );
        };
      `
      );

      const result = await loader.loadPlugin(pluginPath);

      expect(result.success).toBe(true);
      expect(result.name).toBe('test-plugin');
    });

    it('should reject plugin without name', async () => {
      const pluginPath = join(testDir, 'invalid-plugin.js');
      writeFileSync(
        pluginPath,
        `
        module.exports = {
          version: '1.0.0',
          register: function() {}
        };
      `
      );

      const result = await loader.loadPlugin(pluginPath);

      expect(result.success).toBe(false);
      expect(result.error).toContain('ValidatorPlugin interface');
    });

    it('should reject plugin without version', async () => {
      const pluginPath = join(testDir, 'invalid-plugin.js');
      writeFileSync(
        pluginPath,
        `
        module.exports = {
          name: 'test',
          register: function() {}
        };
      `
      );

      const result = await loader.loadPlugin(pluginPath);

      expect(result.success).toBe(false);
      expect(result.error).toContain('ValidatorPlugin interface');
    });

    it('should reject plugin without register function', async () => {
      const pluginPath = join(testDir, 'invalid-plugin.js');
      writeFileSync(
        pluginPath,
        `
        module.exports = {
          name: 'test',
          version: '1.0.0'
        };
      `
      );

      const result = await loader.loadPlugin(pluginPath);

      expect(result.success).toBe(false);
      expect(result.error).toContain('ValidatorPlugin interface');
    });
  });

  describe('Plugin Loading', () => {
    it('should load plugin and register validator', async () => {
      const pluginPath = join(testDir, 'working-plugin.js');
      writeFileSync(
        pluginPath,
        `
        module.exports = {
          name: 'working-plugin',
          version: '1.0.0',
          register: function(registry) {
            registry.register(
              {
                id: 'custom-validator',
                name: 'Custom Validator',
                description: 'Custom test validator',
                filePatterns: ['**/*.custom'],
                enabled: true,
              },
              () => ({})
            );
          }
        };
      `
      );

      const result = await loader.loadPlugin(pluginPath);

      expect(result.success).toBe(true);
      expect(ValidatorRegistry.has('custom-validator')).toBe(true);
    });

    it('should not load same plugin twice', async () => {
      const pluginPath = join(testDir, 'once-plugin.js');
      writeFileSync(
        pluginPath,
        `
        module.exports = {
          name: 'once-plugin',
          version: '1.0.0',
          register: function() {}
        };
      `
      );

      await loader.loadPlugin(pluginPath);
      const result = await loader.loadPlugin(pluginPath);

      expect(result.success).toBe(true);
      expect(loader.getLoadedPlugins()).toHaveLength(1);
    });

    it('should handle plugin with syntax error', async () => {
      const pluginPath = join(testDir, 'syntax-error.js');
      writeFileSync(pluginPath, 'this is not valid javascript {{{');

      const result = await loader.loadPlugin(pluginPath);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle plugin that throws during registration', async () => {
      const pluginPath = join(testDir, 'error-plugin.js');
      writeFileSync(
        pluginPath,
        `
        module.exports = {
          name: 'error-plugin',
          version: '1.0.0',
          register: function() {
            throw new Error('Registration failed');
          }
        };
      `
      );

      const result = await loader.loadPlugin(pluginPath);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Registration failed');
    });
  });

  describe('Plugin Discovery', () => {
    it('should discover plugins in custom directory', async () => {
      const pluginsDir = join(testDir, 'plugins');
      mkdirSync(pluginsDir);

      writeFileSync(
        join(pluginsDir, 'plugin1.js'),
        `
        module.exports = {
          name: 'plugin1',
          version: '1.0.0',
          register: function() {}
        };
      `
      );

      loader = new PluginLoader({ pluginDirs: ['plugins'] });
      const results = await loader.loadPlugins(testDir);

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('plugin1');
    });

    it('should skip non-plugin files', async () => {
      const pluginsDir = join(testDir, 'plugins');
      mkdirSync(pluginsDir);

      writeFileSync(join(pluginsDir, 'README.md'), '# Not a plugin');
      writeFileSync(join(pluginsDir, 'data.json'), '{}');

      loader = new PluginLoader({ pluginDirs: ['plugins'] });
      const results = await loader.loadPlugins(testDir);

      expect(results).toHaveLength(0);
    });

    it('should handle missing plugin directory', async () => {
      loader = new PluginLoader({ pluginDirs: ['non-existent'] });
      const results = await loader.loadPlugins(testDir);

      expect(results).toHaveLength(0);
    });
  });

  describe('getLoadedPlugins', () => {
    it('should return empty array when no plugins loaded', () => {
      expect(loader.getLoadedPlugins()).toEqual([]);
    });

    it('should return list of loaded plugins', async () => {
      const plugin1Path = join(testDir, 'plugin1.js');
      const plugin2Path = join(testDir, 'plugin2.js');

      for (const path of [plugin1Path, plugin2Path]) {
        writeFileSync(
          path,
          `
          module.exports = {
            name: '${path}',
            version: '1.0.0',
            register: function() {}
          };
        `
        );
      }

      await loader.loadPlugin(plugin1Path);
      await loader.loadPlugin(plugin2Path);

      const loaded = loader.getLoadedPlugins();
      expect(loaded).toHaveLength(2);
      expect(loaded).toContain(plugin1Path);
      expect(loaded).toContain(plugin2Path);
    });
  });

  describe('clear', () => {
    it('should clear loaded plugins list', async () => {
      const pluginPath = join(testDir, 'plugin.js');
      writeFileSync(
        pluginPath,
        `
        module.exports = {
          name: 'plugin',
          version: '1.0.0',
          register: function() {}
        };
      `
      );

      await loader.loadPlugin(pluginPath);
      expect(loader.getLoadedPlugins()).toHaveLength(1);

      loader.clear();
      expect(loader.getLoadedPlugins()).toHaveLength(0);
    });
  });
});
