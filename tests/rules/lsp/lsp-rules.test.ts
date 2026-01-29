/**
 * Tests for LSP rules
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule as serverNameTooShortRule } from '../../../src/rules/lsp/lsp-server-name-too-short';
import { rule as commandNotInPathRule } from '../../../src/rules/lsp/lsp-command-not-in-path';
import { rule as invalidTransportRule } from '../../../src/rules/lsp/lsp-invalid-transport';
import { rule as configFileNotJsonRule } from '../../../src/rules/lsp/lsp-config-file-not-json';
import { rule as configFileRelativePathRule } from '../../../src/rules/lsp/lsp-config-file-relative-path';
import { rule as extensionMissingDotRule } from '../../../src/rules/lsp/lsp-extension-missing-dot';
import { rule as languageIdEmptyRule } from '../../../src/rules/lsp/lsp-language-id-empty';
import { rule as languageIdNotLowercaseRule } from '../../../src/rules/lsp/lsp-language-id-not-lowercase';

const ruleTester = new ClaudeLintRuleTester();

describe('lsp-server-name-too-short', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('lsp-server-name-too-short', serverNameTooShortRule, {
      valid: [
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            servers: {
              'typescript-language-server': {
                command: 'typescript-language-server',
              },
            },
          }),
        },
        {
          filePath: '.claude/lsp.json',
          options: { minLength: 5 },
          content: JSON.stringify({
            servers: {
              'ts-ls': {
                command: 'ts-ls',
              },
            },
          }),
        },
        {
          filePath: 'other.json',
          content: JSON.stringify({
            servers: { a: { command: 'test' } },
          }),
        },
      ],
      invalid: [
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            servers: {
              a: {
                command: 'test',
              },
            },
          }),
          errors: [{ message: 'server name "a" is too short' }],
        },
        {
          filePath: '.claude/lsp.json',
          options: { minLength: 10 },
          content: JSON.stringify({
            servers: {
              'short': {
                command: 'test',
              },
            },
          }),
          errors: [{ message: 'minimum: 10' }],
        },
      ],
    });
  });
});

describe('lsp-command-not-in-path', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('lsp-command-not-in-path', commandNotInPathRule, {
      valid: [
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            servers: {
              'ts-server': {
                command: '/usr/local/bin/typescript-language-server',
              },
            },
          }),
        },
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            servers: {
              'ts-server': {
                command: './bin/typescript-language-server',
              },
            },
          }),
        },
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            servers: {
              'ts-server': {
                configFile: './lsp-config.json',
              },
            },
          }),
        },
      ],
      invalid: [
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            servers: {
              'ts-server': {
                command: 'typescript-language-server --stdio',
              },
            },
          }),
          errors: [{ message: 'should be in PATH or use absolute path' }],
        },
      ],
    });
  });
});

describe('lsp-invalid-transport', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('lsp-invalid-transport', invalidTransportRule, {
      valid: [
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            servers: {
              'ts-server': {
                command: 'test',
                transport: 'stdio',
              },
            },
          }),
        },
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            servers: {
              'ts-server': {
                command: 'test',
                transport: 'socket',
              },
            },
          }),
        },
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            servers: {
              'ts-server': {
                command: 'test',
              },
            },
          }),
        },
      ],
      invalid: [
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            servers: {
              'ts-server': {
                command: 'test',
                transport: 'http',
              },
            },
          }),
          errors: [{ message: 'Invalid transport type "http"' }],
        },
      ],
    });
  });
});

describe('lsp-config-file-not-json', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('lsp-config-file-not-json', configFileNotJsonRule, {
      valid: [
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            servers: {
              'ts-server': {
                configFile: './config.json',
              },
            },
          }),
        },
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            servers: {
              'ts-server': {
                configFile: '/absolute/path/config.json',
              },
            },
          }),
        },
      ],
      invalid: [
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            servers: {
              'ts-server': {
                configFile: './config.yaml',
              },
            },
          }),
          errors: [{ message: 'should be a JSON file' }],
        },
      ],
    });
  });
});

describe('lsp-config-file-relative-path', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('lsp-config-file-relative-path', configFileRelativePathRule, {
      valid: [
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            servers: {
              'ts-server': {
                configFile: './config.json',
              },
            },
          }),
        },
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            servers: {
              'ts-server': {
                configFile: '/absolute/path/config.json',
              },
            },
          }),
        },
      ],
      invalid: [
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            servers: {
              'ts-server': {
                configFile: 'config.json',
              },
            },
          }),
          errors: [{ message: 'uses relative path' }],
        },
      ],
    });
  });
});

describe('lsp-extension-missing-dot', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('lsp-extension-missing-dot', extensionMissingDotRule, {
      valid: [
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            servers: {},
            extensionMapping: {
              '.ts': 'typescript',
              '.js': 'javascript',
            },
          }),
        },
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            servers: {},
          }),
        },
      ],
      invalid: [
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            servers: {},
            extensionMapping: {
              ts: 'typescript',
            },
          }),
          errors: [{ message: 'Extension "ts" must start with a dot' }],
        },
      ],
    });
  });
});

describe('lsp-language-id-empty', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('lsp-language-id-empty', languageIdEmptyRule, {
      valid: [
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            servers: {},
            extensionMapping: {
              '.ts': 'typescript',
            },
          }),
        },
      ],
      invalid: [
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            servers: {},
            extensionMapping: {
              '.ts': '',
            },
          }),
          errors: [{ message: 'Language ID for extension ".ts" cannot be empty' }],
        },
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            servers: {},
            extensionMapping: {
              '.ts': '   ',
            },
          }),
          errors: [{ message: 'Language ID for extension ".ts" cannot be empty' }],
        },
      ],
    });
  });
});

describe('lsp-language-id-not-lowercase', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('lsp-language-id-not-lowercase', languageIdNotLowercaseRule, {
      valid: [
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            servers: {},
            extensionMapping: {
              '.ts': 'typescript',
              '.js': 'javascript',
            },
          }),
        },
      ],
      invalid: [
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            servers: {},
            extensionMapping: {
              '.ts': 'TypeScript',
            },
          }),
          errors: [{ message: 'Language ID "TypeScript" for extension ".ts" should be lowercase' }],
        },
      ],
    });
  });
});
