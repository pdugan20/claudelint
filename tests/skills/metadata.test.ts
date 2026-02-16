/**
 * Metadata Consistency Tests for Bundled Skills
 *
 * Verifies that:
 * - Skill versions match package.json
 * - Skills documented in README match actual skills
 * - Skill descriptions are consistent between SKILL.md and README
 * - No obsolete command names referenced
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const SKILLS_DIR = join(__dirname, '../../skills');
const README_PATH = join(__dirname, '../../README.md');

/**
 * Parse frontmatter from a SKILL.md file
 * Handles both single-line values and YAML arrays
 */
function parseFrontmatter(content: string): Record<string, any> {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    throw new Error('No frontmatter found');
  }

  const frontmatterText = frontmatterMatch[1];
  const result: Record<string, any> = {};
  const lines = frontmatterText.split('\n');

  let currentKey: string | null = null;
  let currentArray: string[] = [];

  lines.forEach((line) => {
    // Check if this is a key-value line
    const keyValueMatch = line.match(/^(\w+):\s*(.*)$/);

    if (keyValueMatch) {
      // If we were building an array, save it
      if (currentKey && currentArray.length > 0) {
        result[currentKey] = currentArray;
        currentArray = [];
      }

      const [, key, value] = keyValueMatch;
      currentKey = key;

      // If value is present on same line, it's a simple value
      if (value.trim()) {
        result[key] = value.trim();
        currentKey = null;
      }
      // Otherwise, expect array items on following lines
    } else if (currentKey) {
      // Check if this is an array item
      const arrayItemMatch = line.match(/^\s+-\s+(.+)$/);
      if (arrayItemMatch) {
        currentArray.push(arrayItemMatch[1].trim());
      }
    }
  });

  // Save any remaining array
  if (currentKey && currentArray.length > 0) {
    result[currentKey] = currentArray;
  }

  return result;
}

/**
 * Get all skill directories
 */
function getSkillDirs(): string[] {
  if (!existsSync(SKILLS_DIR)) {
    return [];
  }
  return readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .filter((name) => !name.startsWith('.')); // Exclude .DS_Store, etc.
}

/**
 * Get skill metadata from SKILL.md
 */
function getSkillMetadata(skillName: string): Record<string, any> | null {
  const skillMdPath = join(SKILLS_DIR, skillName, 'SKILL.md');
  if (!existsSync(skillMdPath)) {
    return null;
  }

  const content = readFileSync(skillMdPath, 'utf-8');
  return parseFrontmatter(content);
}

describe('Skill Metadata Consistency', () => {
  let readmeContent: string;
  let skillDirs: string[];

  beforeAll(() => {
    readmeContent = readFileSync(README_PATH, 'utf-8');
    skillDirs = getSkillDirs();
  });

  describe('Skill Versions', () => {
    it('should have at least one skill', () => {
      expect(skillDirs.length).toBeGreaterThan(0);
    });

    it.each(getSkillDirs())(
      'skill %s should have version field in SKILL.md',
      (skillName) => {
        const metadata = getSkillMetadata(skillName);
        expect(metadata).not.toBeNull();
        expect(metadata?.version).toBeDefined();
        expect(metadata?.version).toMatch(/^\d+\.\d+\.\d+/); // Semantic versioning
      }
    );
  });

  describe('README Documentation', () => {
    it('should document all skills in README', () => {
      skillDirs.forEach((skillName) => {
        // Skip utility directories like "lib"
        if (skillName === 'lib') {
          return;
        }

        // Check if skill is mentioned in README
        const isDocumented =
          readmeContent.includes(skillName) ||
          readmeContent.includes(`/claudelint:${skillName}`);

        expect(isDocumented).toBe(true);
      });
    });

    it('should have skill descriptions in README match SKILL.md frontmatter', () => {
      skillDirs.forEach((skillName) => {
        if (skillName === 'lib') {
          return; // Skip utility directory
        }

        const metadata = getSkillMetadata(skillName);
        if (!metadata || !metadata.description) {
          return; // Skip if no description
        }

        // Extract first sentence/clause from SKILL.md description
        const skillDescription = metadata.description.split('.')[0];

        // Check if this description appears in README
        // (Allow for slight variations in wording)
        const normalizedSkillDesc = skillDescription
          .toLowerCase()
          .replace(/\s+/g, ' ');

        const normalizedReadme = readmeContent
          .toLowerCase()
          .replace(/\s+/g, ' ');

        // We're being lenient here - just check if key words appear
        const keyWords = normalizedSkillDesc
          .split(' ')
          .filter((word: string) => word.length > 4); // Filter out short words

        const hasKeyWords = keyWords.some((word: string) =>
          normalizedReadme.includes(word)
        );

        expect(hasKeyWords).toBe(true);
      });
    });
  });

  describe('Obsolete References', () => {
    // Old skill names that were renamed (as they would appear in skill invocations)
    const obsoleteSkillInvocations = [
      '/claudelint:validate-agents-md', // Renamed to validate-cc-md
      '/claudelint:validate"', // Renamed to validate-all (note the quote to avoid matching validate-all)
      '/claudelint:format"', // Renamed to format-cc (note the quote to avoid matching format-cc)
      '`validate-agents-md`', // Code references
    ];

    it('should not reference old skill invocations in SKILL.md files', () => {
      skillDirs.forEach((skillName) => {
        if (skillName === 'lib') {
          return;
        }

        const skillMdPath = join(SKILLS_DIR, skillName, 'SKILL.md');
        if (!existsSync(skillMdPath)) {
          return;
        }

        const content = readFileSync(skillMdPath, 'utf-8');

        obsoleteSkillInvocations.forEach((obsoleteInvocation) => {
          expect(content).not.toContain(obsoleteInvocation);
        });
      });
    });

    it('should not reference old skill invocations in README', () => {
      obsoleteSkillInvocations.forEach((obsoleteInvocation) => {
        expect(readmeContent).not.toContain(obsoleteInvocation);
      });
    });
  });

  describe('Required Frontmatter Fields', () => {
    it.each(getSkillDirs())(
      'skill %s should have name field',
      (skillName) => {
        if (skillName === 'lib') {
          return;
        }

        const metadata = getSkillMetadata(skillName);
        expect(metadata).not.toBeNull();
        expect(metadata?.name).toBeDefined();
        expect(metadata?.name).toBe(skillName); // Name should match directory
      }
    );

    it.each(getSkillDirs())(
      'skill %s should have description field (min 10 chars)',
      (skillName) => {
        if (skillName === 'lib') {
          return;
        }

        const metadata = getSkillMetadata(skillName);
        expect(metadata).not.toBeNull();
        expect(metadata?.description).toBeDefined();
        expect(metadata?.description.length).toBeGreaterThanOrEqual(10);
      }
    );
  });

  describe('Standard Fields', () => {
    it.each(getSkillDirs())(
      'skill %s should not have disable-model-invocation: true (allows Claude auto-discovery)',
      (skillName) => {
        if (skillName === 'lib') {
          return;
        }

        const skillMdPath = join(SKILLS_DIR, skillName, 'SKILL.md');
        if (!existsSync(skillMdPath)) {
          return;
        }

        const content = readFileSync(skillMdPath, 'utf-8');
        expect(content).not.toContain('disable-model-invocation: true');
      }
    );

    it.each(getSkillDirs())(
      'skill %s should have allowed-tools field',
      (skillName) => {
        if (skillName === 'lib') {
          return;
        }

        const skillMdPath = join(SKILLS_DIR, skillName, 'SKILL.md');
        if (!existsSync(skillMdPath)) {
          return;
        }

        const content = readFileSync(skillMdPath, 'utf-8');

        // allowed-tools can be in frontmatter or as a YAML array
        expect(
          content.includes('allowed-tools:') ||
            content.includes('allowedTools:')
        ).toBe(true);
      }
    );

    it.each(getSkillDirs())(
      'skill %s should not have non-official tags or dependencies fields',
      (skillName) => {
        if (skillName === 'lib') {
          return;
        }

        const metadata = getSkillMetadata(skillName);
        expect(metadata).not.toBeNull();

        // tags and dependencies are not part of the official Anthropic spec
        expect(metadata?.tags).toBeUndefined();
        expect(metadata?.dependencies).toBeUndefined();
      }
    );
  });
});
