/**
 * AGENTS.md edge cases (#276), each beside the nearest ordinary case.
 * Rules: https://code.claude.com/docs/en/memory#when-claude-code-reads-agents-md
 */
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { setupTestDir } from '../helpers/test-utils';
import { findClaudeMdFiles } from '../../src/utils/filesystem/files';
import { WATCH_TRIGGERS } from '../../src/utils/filesystem/patterns';
import { ClaudeMdValidator } from '../../src/validators/claude-md';
import { ClaudeLint } from '../../src/api/claudelint';

const many = (n: number) => Array.from({ length: n }, (_, i) => `## S${i}\n\ntext\n`).join('\n');
const watchIds = (p: string) =>
  Object.entries(WATCH_TRIGGERS)
    .filter(([, pats]) => pats.some((s) => p.endsWith(s)))
    .map(([id]) => id);

describe('AGENTS.md edge cases (#276)', () => {
  const { getTestDir } = setupTestDir();
  const rel = (files: string[]) => files.map((f) => f.replace(getTestDir() + '/', '')).sort();

  // only a CLAUDE.md file counts, not a directory with that name
  it('AGENTS.md found when nothing named CLAUDE.md exists', async () => {
    await mkdir(join(getTestDir(), 'docs'), { recursive: true });
    await writeFile(join(getTestDir(), 'AGENTS.md'), '# A');
    expect(rel(await findClaudeMdFiles(getTestDir()))).toEqual(['AGENTS.md']);
  });
  it('AGENTS.md still found when CLAUDE.md is a directory, not a file', async () => {
    await mkdir(join(getTestDir(), 'CLAUDE.md'), { recursive: true });
    await writeFile(join(getTestDir(), 'AGENTS.md'), '# A');
    expect(rel(await findClaudeMdFiles(getTestDir()))).toEqual(['AGENTS.md']);
  });

  // per docs, a subdirectory AGENTS.md loads when THAT subdirectory has
  // no CLAUDE.md of its own; an intermediate packages/api/CLAUDE.md is not "above the working dir"
  it('packages/api/src/AGENTS.md found when no CLAUDE.md anywhere', async () => {
    const d = join(getTestDir(), 'packages', 'api', 'src');
    await mkdir(d, { recursive: true });
    await writeFile(join(d, 'AGENTS.md'), '# A');
    expect(rel(await findClaudeMdFiles(getTestDir()))).toEqual(['packages/api/src/AGENTS.md']);
  });
  it('packages/api/src/AGENTS.md found when only packages/api has a CLAUDE.md', async () => {
    const d = join(getTestDir(), 'packages', 'api', 'src');
    await mkdir(d, { recursive: true });
    await writeFile(join(getTestDir(), 'packages', 'api', 'CLAUDE.md'), '# C');
    await writeFile(join(d, 'AGENTS.md'), '# A');
    expect(rel(await findClaudeMdFiles(getTestDir()))).toEqual([
      'packages/api/CLAUDE.md',
      'packages/api/src/AGENTS.md',
    ]);
  });

  // a CLAUDE.md above the working directory counts too
  it('package AGENTS.md skipped when CLAUDE.md is at the base root', async () => {
    const pkg = join(getTestDir(), 'packages', 'api');
    await mkdir(pkg, { recursive: true });
    await writeFile(join(getTestDir(), 'CLAUDE.md'), '# C');
    await writeFile(join(pkg, 'AGENTS.md'), '# A');
    expect(rel(await findClaudeMdFiles(getTestDir()))).toEqual(['CLAUDE.md']);
  });
  it('package AGENTS.md skipped when linting the package and CLAUDE.md is above it', async () => {
    const pkg = join(getTestDir(), 'packages', 'api');
    await mkdir(pkg, { recursive: true });
    await writeFile(join(getTestDir(), 'CLAUDE.md'), '# C');
    await writeFile(join(pkg, 'AGENTS.md'), '# A');
    expect(await findClaudeMdFiles(pkg)).toEqual([]);
  });

  // content rules apply to AGENTS.md as to CLAUDE.md
  const sectionRule = async (name: string) => {
    const fp = join(getTestDir(), name);
    await writeFile(fp, many(45));
    const r = await new ClaudeMdValidator({ path: fp }).validate();
    return [...r.errors, ...r.warnings].map((e) => e.ruleId);
  };
  it('CLAUDE.md with 45 sections reports too-many-sections', async () => {
    expect(await sectionRule('CLAUDE.md')).toContain('claude-md-content-too-many-sections');
  });
  it('AGENTS.md with 45 sections reports too-many-sections', async () => {
    expect(await sectionRule('AGENTS.md')).toContain('claude-md-content-too-many-sections');
  });

  // an explicit AGENTS.md path reaches the claude-md validator
  const lintIds = async (name: string) => {
    const r = await new ClaudeLint({ cwd: getTestDir() }).lintText('# X\n\nSee @missing.md\n', {
      filePath: name,
    });
    return r[0].messages.map((m) => m.ruleId);
  };
  it('lintText CLAUDE.md reports import-missing', async () => {
    expect(await lintIds('CLAUDE.md')).toContain('claude-md-import-missing');
  });
  it('lintText AGENTS.md reports import-missing', async () => {
    expect(await lintIds('AGENTS.md')).toContain('claude-md-import-missing');
  });

  // watch mode
  it('editing CLAUDE.md re-runs claude-md in watch', () => {
    expect(watchIds('/p/CLAUDE.md')).toContain('claude-md');
  });
  it('editing AGENTS.md re-runs claude-md in watch', () => {
    expect(watchIds('/p/AGENTS.md')).toContain('claude-md');
  });
});
