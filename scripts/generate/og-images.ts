/**
 * Generate OG Images for Every Documentation Page
 *
 * Iterates all VitePress markdown pages, extracts metadata (title,
 * description, section), and renders 1200x630 OG images via satori + resvg.
 *
 * Features:
 * - Content-hash caching (skips unchanged pages)
 * - Section breadcrumb from file path
 * - Rule pages use rule ID as title, meta.description as description
 * - Homepage gets a branded generic card
 *
 * Usage: npx tsx scripts/generate/og-images.ts
 *        npm run generate:og
 *
 * Output: website/public/og/{slug}.png
 */

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, relative } from 'path';
import { createHash } from 'crypto';
import { globSync } from 'glob';
import { log } from '../util/logger';

// --- Paths ---
const ROOT = join(__dirname, '../..');
const WEBSITE_DIR = join(ROOT, 'website');
const OUTPUT_DIR = join(WEBSITE_DIR, 'public/og');
const CACHE_DIR = join(ROOT, '.og-cache');
const FONTS_DIR = join(__dirname, '../fonts');

// --- Fonts ---
const interRegular = readFileSync(join(FONTS_DIR, 'Inter-Regular.ttf'));
const interSemiBold = readFileSync(join(FONTS_DIR, 'Inter-SemiBold.ttf'));
const serifRegular = readFileSync(join(FONTS_DIR, 'SourceSerif4-Regular.ttf'));
const serifSemiBold = readFileSync(join(FONTS_DIR, 'SourceSerif4-SemiBold.ttf'));

const fonts = [
  { name: 'Inter', data: interRegular, weight: 400 as const, style: 'normal' as const },
  { name: 'Inter', data: interSemiBold, weight: 600 as const, style: 'normal' as const },
  { name: 'Source Serif 4', data: serifRegular, weight: 400 as const, style: 'normal' as const },
  { name: 'Source Serif 4', data: serifSemiBold, weight: 600 as const, style: 'normal' as const },
];

// --- Logo ---
const logoSvg = readFileSync(join(WEBSITE_DIR, 'public/logo.svg'), 'utf-8');
const logoDataUri = `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString('base64')}`;

// --- Template version (bump to invalidate all cached images) ---
const TEMPLATE_VERSION = 3;

// --- Satori VDOM helper ---
type VNode = { type: string; props: Record<string, any> };

function h(type: string, props: Record<string, any>, ...children: any[]): VNode {
  const flatChildren = children
    .flat()
    .filter((c) => c != null)
    .map((c) => (typeof c === 'string' ? c : c));
  return {
    type,
    props: {
      ...props,
      children: flatChildren.length === 1 ? flatChildren[0] : flatChildren,
    },
  };
}

// --- Page metadata extraction ---

interface PageMeta {
  slug: string;
  title: string;
  description: string;
  section: string;
}

const SECTION_MAP: Record<string, string> = {
  guide: 'Guide',
  validators: 'Validators',
  rules: 'Rules',
  integrations: 'Integrations',
  api: 'API',
  development: 'Development',
};

const CATEGORY_DISPLAY: Record<string, string> = {
  'agents': 'Agents',
  'claude-md': 'CLAUDE.md',
  'commands': 'Commands',
  'hooks': 'Hooks',
  'lsp': 'LSP',
  'mcp': 'MCP',
  'output-styles': 'Output Styles',
  'plugin': 'Plugin',
  'settings': 'Settings',
  'skills': 'Skills',
};

function extractFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();
    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    fm[key] = value;
  }
  return fm;
}

function extractH1(content: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : '';
}

function filePathToSlug(relPath: string): string {
  return relPath
    .replace(/\.md$/, '')
    .replace(/\/index$/, '')
    .replace(/\//g, '-') || 'index';
}

// Separator between "Rules" and category name
const SECTION_SEP = ' \u00b7 '; // · (middle dot)

function getSection(relPath: string): string {
  const parts = relPath.split('/');
  if (parts.length < 2) return '';

  const topDir = parts[0];
  const base = SECTION_MAP[topDir] || '';

  // For rule pages, add the category: "Rules › Skills"
  if (topDir === 'rules' && parts.length === 3) {
    const category = parts[1];
    const categoryName = CATEGORY_DISPLAY[category] || category;
    return `Rules${SECTION_SEP}${categoryName}`;
  }

  return base;
}

function getPageMeta(filePath: string): PageMeta | null {
  const relPath = relative(WEBSITE_DIR, filePath);

  // Skip non-page files
  if (relPath === 'CLAUDE.md') return null;

  const content = readFileSync(filePath, 'utf-8');
  const fm = extractFrontmatter(content);
  const h1 = extractH1(content);

  const slug = filePathToSlug(relPath);
  const section = getSection(relPath);

  // Homepage
  if (relPath === 'index.md') {
    return {
      slug: 'index',
      title: 'The linter for Claude Code',
      description: fm.description || '',
      section: '',
    };
  }

  // 404
  if (relPath === '404.md') {
    return null; // Skip OG for 404
  }

  const title = h1 || fm.title || slug;
  const description = fm.description || '';

  return { slug, title, description, section };
}

// --- Rendering ---

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + '...' : s;
}

function renderTemplate(page: PageMeta): VNode {
  return h(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '1200px',
        height: '630px',
        padding: '60px',
        paddingRight: '120px',
        backgroundImage: 'linear-gradient(225deg, #3a2418 0%, #261a12 40%, #1a1a19 100%)',
      },
    },
    // Header: logo + site name
    h(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: '20px' } },
      h('img', { src: logoDataUri, width: 72, height: 45 }),
      h(
        'span',
        {
          style: {
            fontFamily: 'Inter',
            fontSize: '56px',
            fontWeight: 600,
            color: '#ffffff',
          },
        },
        'claudelint',
      ),
    ),
    // Content: section, title, description — anchored to bottom
    h(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'flex-end',
          paddingBottom: '30px',
        },
      },
      page.section
        ? h(
            'span',
            {
              style: {
                fontFamily: 'Inter',
                fontSize: '28px',
                fontWeight: 400,
                color: '#e08b6e',
                marginBottom: '8px',
              },
            },
            page.section,
          )
        : null,
      h(
        'span',
        {
          style: {
            fontFamily: 'Inter',
            fontSize: '72px',
            fontWeight: 600,
            color: '#ffffff',
            lineHeight: 1.1,
          },
        },
        truncate(page.title, 60),
      ),
      page.description
        ? h(
            'span',
            {
              style: {
                fontFamily: 'Inter',
                fontSize: '30px',
                fontWeight: 400,
                color: '#a8a69d',
                lineHeight: 1.4,
                marginTop: '24px',
                overflow: 'hidden',
                maxHeight: '84px',
              },
            },
            truncate(page.description, 120),
          )
        : null,
    ),
  );
}

// --- Caching ---

function contentHash(page: PageMeta): string {
  const data = JSON.stringify({ ...page, templateVersion: TEMPLATE_VERSION });
  return createHash('sha256').update(data).digest('hex').slice(0, 16);
}

function getCachedHash(slug: string): string | null {
  const hashFile = join(CACHE_DIR, `${slug}.hash`);
  if (!existsSync(hashFile)) return null;
  return readFileSync(hashFile, 'utf-8').trim();
}

function setCachedHash(slug: string, hash: string): void {
  writeFileSync(join(CACHE_DIR, `${slug}.hash`), hash);
}

// --- Main ---

async function generate(): Promise<void> {
  log.section('Generating OG Images');

  // Ensure output directories exist
  mkdirSync(OUTPUT_DIR, { recursive: true });
  mkdirSync(CACHE_DIR, { recursive: true });

  // Find all markdown pages
  const mdFiles = globSync('**/*.md', {
    cwd: WEBSITE_DIR,
    absolute: true,
    ignore: ['**/node_modules/**'],
  });

  log.info(`Found ${mdFiles.length} markdown files`);

  let generated = 0;
  let skipped = 0;
  let cached = 0;

  for (const filePath of mdFiles) {
    const page = getPageMeta(filePath);
    if (!page) {
      skipped++;
      continue;
    }

    // Check cache
    const hash = contentHash(page);
    const prevHash = getCachedHash(page.slug);
    const outPath = join(OUTPUT_DIR, `${page.slug}.png`);

    if (prevHash === hash && existsSync(outPath)) {
      cached++;
      continue;
    }

    // Render
    const markup = renderTemplate(page);
    const svg = await satori(markup as any, { width: 1200, height: 630, fonts });
    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
    const png = resvg.render().asPng();

    writeFileSync(outPath, png);
    setCachedHash(page.slug, hash);
    generated++;
  }

  log.info(`Generated: ${generated}, Cached: ${cached}, Skipped: ${skipped}`);

  // Also generate the static fallback og-image.png
  const fallback: PageMeta = {
    slug: '_fallback',
    title: 'The linter for Claude Code',
    description: 'Validate CLAUDE.md, skills, settings, hooks, MCP servers, and plugins',
    section: '',
  };
  const fallbackMarkup = renderTemplate(fallback);
  const fallbackSvg = await satori(fallbackMarkup as any, { width: 1200, height: 630, fonts });
  const fallbackResvg = new Resvg(fallbackSvg, { fitTo: { mode: 'width', value: 1200 } });
  const fallbackPng = fallbackResvg.render().asPng();
  writeFileSync(join(WEBSITE_DIR, 'public/og-image.png'), fallbackPng);
  log.pass('Static fallback og-image.png generated');

  log.bracket.success(`OG image generation complete (${generated + cached} pages)`);
}

generate().catch((err) => {
  log.error(`OG image generation failed: ${err}`);
  process.exit(1);
});
