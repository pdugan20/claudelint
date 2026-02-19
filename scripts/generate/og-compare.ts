/**
 * Compare OG Image Gradient Variants
 *
 * Renders sample OG cards with different background gradients for
 * side-by-side comparison. Edit the `variants` array to test new options.
 *
 * Usage: npx tsx scripts/generate/og-compare.ts
 * Output: comparison/  (gitignored)
 */

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { log } from '../util/logger';

const ROOT = join(__dirname, '../..');
const OUTPUT_DIR = join(ROOT, 'comparison');
const FONTS_DIR = join(__dirname, '../fonts');
const WEBSITE_DIR = join(ROOT, 'website');

// --- Fonts (subset — only Inter needed for OG cards) ---
const fonts = [
  { name: 'Inter', data: readFileSync(join(FONTS_DIR, 'Inter-Regular.ttf')), weight: 400 as const, style: 'normal' as const },
  { name: 'Inter', data: readFileSync(join(FONTS_DIR, 'Inter-SemiBold.ttf')), weight: 600 as const, style: 'normal' as const },
];

// --- Logo ---
const logoSvg = readFileSync(join(WEBSITE_DIR, 'public/logo.svg'), 'utf-8');
const logoDataUri = `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString('base64')}`;

// --- Satori VDOM helper ---
type VNode = { type: string; props: Record<string, any> };

function h(type: string, props: Record<string, any>, ...children: any[]): VNode {
  const flat = children.flat().filter((c) => c != null);
  return { type, props: { ...props, children: flat.length === 1 ? flat[0] : flat } };
}

// --- Sample pages to render for each variant ---

interface Sample {
  title: string;
  description: string;
  section: string;
  slug: string;
}

const samples: Sample[] = [
  {
    slug: 'home',
    title: 'The linter for Claude Code',
    description: 'Validate CLAUDE.md, skills, settings, hooks, MCP servers, and plugins',
    section: '',
  },
  {
    slug: 'rule',
    title: 'skill-body-long-code-block',
    description: 'Detects overly long code blocks in skill body that may waste context window',
    section: 'Rules \u00b7 Skills',
  },
];

// --- Gradient variants to compare ---
// Edit this array to add/change/remove options.

interface Variant {
  name: string;
  gradient: string;
}

const variants: Variant[] = [
  {
    name: '1-current',
    gradient: 'linear-gradient(225deg, #3a2418 0%, #261a12 40%, #1a1a19 100%)',
  },
  {
    name: '2-previous-warm',
    gradient: 'linear-gradient(225deg, #2a1c14 0%, #201812 40%, #1a1a19 100%)',
  },
  {
    name: '3-more-orange',
    gradient: 'linear-gradient(225deg, #3a2418 0%, #261a12 40%, #1a1a19 100%)',
  },
  {
    name: '4-warm-wide-spread',
    gradient: 'linear-gradient(225deg, #2e1e14 0%, #231810 50%, #181816 100%)',
  },
  {
    name: '5-terracotta-tint',
    gradient: 'linear-gradient(225deg, #2d1c12 0%, #1e1510 35%, #161614 100%)',
  },
  {
    name: '6-brand-stronger',
    gradient: 'linear-gradient(225deg, #332012 0%, #241810 40%, #1a1a19 100%)',
  },
];

// --- Card renderer (mirrors og-images.ts renderTemplate) ---

function renderCard(sample: Sample, gradient: string): VNode {
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
        backgroundImage: gradient,
      },
    },
    h(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: '20px' } },
      h('img', { src: logoDataUri, width: 72, height: 45 }),
      h('span', {
        style: { fontFamily: 'Inter', fontSize: '56px', fontWeight: 600, color: '#ffffff' },
      }, 'claudelint'),
    ),
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
      sample.section
        ? h('span', {
            style: { fontFamily: 'Inter', fontSize: '28px', fontWeight: 400, color: '#e08b6e', marginBottom: '8px' },
          }, sample.section)
        : null,
      h('span', {
        style: { fontFamily: 'Inter', fontSize: '72px', fontWeight: 600, color: '#ffffff', lineHeight: 1.1 },
      }, sample.title),
      sample.description
        ? h('span', {
            style: { fontFamily: 'Inter', fontSize: '30px', fontWeight: 400, color: '#a8a69d', lineHeight: 1.4, marginTop: '24px' },
          }, sample.description)
        : null,
    ),
  );
}

// --- Main ---

async function generate() {
  log.section('OG Gradient Comparison');
  mkdirSync(OUTPUT_DIR, { recursive: true });

  let count = 0;
  for (const variant of variants) {
    for (const sample of samples) {
      const filename = `${variant.name}--${sample.slug}.png`;
      const markup = renderCard(sample, variant.gradient);
      const svg = await satori(markup as any, { width: 1200, height: 630, fonts });
      const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
      writeFileSync(join(OUTPUT_DIR, filename), resvg.render().asPng());
      count++;
    }
    log.dim(`${variant.name}`);
  }

  log.bracket.success(`Generated ${count} images in comparison/`);
}

generate().catch((err) => {
  log.error(`Comparison generation failed: ${err}`);
  process.exit(1);
});
