import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { dirname, join } from 'path';
import { Rule, RuleIssue } from '../../src/types/rule';
import { thirdPerson } from '../../src/schemas/refinements';
import { rule as componentPaths } from '../../src/rules/plugin/plugin-missing-component-paths';
import { rule as plugin } from '../../src/rules/plugin/plugin-missing-file';
import { rule as sections } from '../../src/rules/claude-md/claude-md-content-too-many-sections';
import { rule as links } from '../../src/rules/skills/skill-referenced-file-not-found';
import { rule as unlinked } from '../../src/rules/skills/skill-reference-not-linked';
import { rule as fileReferences } from '../../src/rules/claude-md/claude-md-file-reference-invalid';
import { ClaudeLint } from '../../src/api/claudelint';
import { loadConfigWithExtends } from '../../src/utils/config/extends';
import { ConfigResolver } from '../../src/utils/config/resolver';

describe('reported issue regressions', () => {
  let root: string;
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'claudelint-issues-'));
  });
  afterEach(() => rmSync(root, { recursive: true, force: true }));
  function write(file: string, content = ''): string {
    const path = join(root, file);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
    return path;
  }
  async function run(rule: Rule, file: string, content: string): Promise<RuleIssue[]> {
    const issues: RuleIssue[] = [];
    await rule.validate({
      filePath: join(root, file),
      fileContent: content,
      options: {},
      report: (i) => issues.push(i),
    });
    return issues;
  }

  it.each(['.claude-plugin/plugin.json', 'plugin.json'])(
    'resolves all component paths from %s',
    async (file) => {
      const paths = {
        skills: './skills',
        agents: './agents/review.md',
        commands: './commands/run.md',
        hooks: './hooks.json',
        mcpServers: './mcp.json',
        lspServers: './lsp.json',
        outputStyles: './styles/brief.md',
      };
      for (const path of Object.values(paths))
        write(path === './skills' ? 'skills/probe/SKILL.md' : path);
      expect(await run(plugin, file, JSON.stringify(paths))).toEqual([]);
      rmSync(join(root, 'agents/review.md'));
      expect(await run(plugin, file, JSON.stringify(paths))).toEqual([
        expect.objectContaining({ message: 'Referenced agent path not found: ./agents/review.md' }),
      ]);
    }
  );

  it('checks command-map paths and ignores inline entries in mixed component arrays', async () => {
    write('commands/run.md');
    write('hooks.json');
    write('mcp.json');
    write('lsp.json');
    const manifest = JSON.stringify({
      name: 'probe',
      commands: { run: { source: 'commands/run.md' }, inline: { content: 'Hello' } },
      hooks: ['./hooks.json', { SessionStart: [] }],
      mcpServers: ['./mcp.json', { local: { command: 'server' } }, 'https://example.com/mcp.json'],
      lspServers: [
        './lsp.json',
        { local: { command: 'server', extensionToLanguage: { '.ts': 'typescript' } } },
      ],
      skills: '.',
    });
    expect(await run(plugin, '.claude-plugin/plugin.json', manifest)).toEqual([]);
    expect(await run(componentPaths, '.claude-plugin/plugin.json', manifest)).toEqual([
      expect.objectContaining({ message: 'commands path missing "./" prefix: "commands/run.md"' }),
    ]);
  });

  it('treats non-semver plugin versions as a configurable advisory', async () => {
    const content = JSON.stringify({ name: 'probe', version: 'release-2026' });
    const linter = new ClaudeLint({
      cwd: root,
      config: { rules: { 'plugin-description-required': 'off' } },
    });
    const [result] = await linter.lintText(content, { filePath: '.claude-plugin/plugin.json' });
    expect(result.errorCount).toBe(0);
    expect(result.messages).toContainEqual(
      expect.objectContaining({ ruleId: 'plugin-invalid-version', severity: 'warning' })
    );
  });

  it.each([
    'Braþi writes documentation.',
    'Forseþi checks fairness.',
    'e\u0301i writes documentation.',
    'Éyou writes documentation.',
  ])('accepts Unicode words: %s', (value) => {
    expect(thirdPerson().check(value)).toBe(true);
  });
  it.each(['I write documentation.', 'Deploys; you can run it.', '“I deploy” is first person.'])(
    'retains pronoun detection: %s',
    (value) => {
      expect(thirdPerson().check(value)).toBe(false);
    }
  );

  it.each(['```', '~~~', '````', '~~~~'])(
    'ignores examples inside %s fences and checks following prose',
    async (fence) => {
      const content =
        '# Real\n' +
        fence +
        'markdown\n' +
        (fence.length > 3 ? '```\n' : '') +
        '# Example\n'.repeat(45) +
        '[missing](references/example.md)\n`references/example.md`\n' +
        fence +
        '\n';
      expect(await run(sections, 'CLAUDE.md', content)).toEqual([]);
      expect(await run(links, 'skills/probe/SKILL.md', content)).toEqual([]);
      expect(await run(unlinked, 'skills/probe/SKILL.md', content)).toEqual([]);
      expect(
        await run(links, 'skills/probe/SKILL.md', content + '[real](references/missing.md)')
      ).toHaveLength(1);
      expect(await run(sections, 'CLAUDE.md', content + '# Real\n'.repeat(41))).toHaveLength(1);
    }
  );

  it('preserves code-span link labels and fixes only the unlinked occurrence', async () => {
    write('skills/probe/references/a.md');
    const content =
      '```md\n`references/example.md`\n```\r\nRead [`references/a.md`](references/a.md), then (`references/b.md`).';
    expect(await run(links, 'skills/probe/SKILL.md', content)).toEqual([]);
    const issues = await run(unlinked, 'skills/probe/SKILL.md', content);
    expect(issues).toHaveLength(1);
    const fix = issues[0].autoFix!;
    expect(content.slice(...fix.range)).toBe('`references/b.md`');
    const fixed = content.slice(0, fix.range[0]) + fix.text + content.slice(fix.range[1]);
    expect(fixed).toContain('[`references/a.md`](references/a.md)');
    expect(await run(unlinked, 'skills/probe/SKILL.md', fixed)).toEqual([]);
  });

  it('measures virtual UTF-8 content instead of reading on-disk file metadata', async () => {
    const linter = new ClaudeLint({
      cwd: root,
      config: { rules: { 'claude-md-size': { severity: 'warn', options: { maxSize: 10 } } } },
    });
    const [virtual] = await linter.lintText('é'.repeat(5), { filePath: 'CLAUDE.md' });
    expect(virtual.messages.some((message) => message.message.includes('Validator failed'))).toBe(
      false
    );
    expect(virtual.messages).toContainEqual(
      expect.objectContaining({
        ruleId: 'claude-md-size',
        message: expect.stringContaining('(10 bytes)'),
      })
    );
    write('CLAUDE.md', 'x'.repeat(100));
    const [unsaved] = await linter.lintText('small', { filePath: 'CLAUDE.md' });
    expect(unsaved.messages.filter((message) => message.ruleId === 'claude-md-size')).toEqual([]);
  });

  it('keeps route tokens intact while retaining missing relative-file diagnostics', async () => {
    const content =
      'Routes: `/api-docs/openapi.json`, `/v1/users.json`. Files: `src/missing.ts`.\n';
    expect(await run(fileReferences, 'CLAUDE.md', content)).toEqual([
      expect.objectContaining({
        message: 'File reference "src/missing.ts" does not exist',
        line: 1,
      }),
    ]);
  });

  it.each(['**/*.md', '.claude/skills/probe/SKILL.md', '**/probe/**'])(
    'applies %s identically through API inspection and validation',
    async (pattern) => {
      const content =
        '---\nname: probe\ndescription: I write documentation.\n---\n\n## Usage\n\nWrites documentation for the project.';
      const file = write('.claude/skills/probe/SKILL.md', content);
      const config = {
        overrides: [{ files: [pattern], rules: { 'skill-description': 'off' as const } }],
      };
      const linter = new ClaudeLint({ cwd: root, config });
      expect((await linter.calculateConfigForFile(file)).rules!['skill-description']).toBe('off');
      const [result] = await linter.lintText(content, { filePath: file });
      expect(result.messages.filter((i) => i.ruleId === 'skill-description')).toEqual([]);
      const [other] = await linter.lintText(content, {
        filePath: join(root, '.claude/skills/other/SKILL.md'),
      });
      if (pattern !== '**/*.md')
        expect(other.messages.some((i) => i.ruleId === 'skill-description')).toBe(true);
    }
  );

  it('resolves inherited patterns relative to the consuming configuration with last override winning', () => {
    write(
      'base.json',
      JSON.stringify({
        overrides: [{ files: ['.claude/**/*.md'], rules: { 'skill-description': 'off' } }],
      })
    );
    const configPath = write(
      'project/.claudelintrc.json',
      JSON.stringify({
        extends: '../base.json',
        overrides: [
          { files: ['.claude/**/strict/SKILL.md'], rules: { 'skill-description': 'error' } },
        ],
      })
    );
    const config = loadConfigWithExtends(configPath);
    const resolver = new ConfigResolver(config);
    expect(
      resolver.getRuleSeverity(
        'skill-description',
        join(root, 'project/.claude/skills/probe/SKILL.md')
      )
    ).toBe('off');
    expect(
      resolver.getRuleSeverity(
        'skill-description',
        join(root, 'project/.claude/skills/strict/SKILL.md')
      )
    ).toBe('error');
    expect(JSON.stringify(config)).not.toContain(root);
  });
});
