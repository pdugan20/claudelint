/**
 * OG Image Template Test Script
 *
 * Generates a single sample OG image for visual iteration.
 * Run: npx tsx scripts/test-og.ts
 * Output: /tmp/og-test.png (open to preview)
 */

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const fontsDir = join(__dirname, 'fonts');
const interRegular = readFileSync(join(fontsDir, 'Inter-Regular.ttf'));
const interSemiBold = readFileSync(join(fontsDir, 'Inter-SemiBold.ttf'));
const serifRegular = readFileSync(join(fontsDir, 'SourceSerif4-Regular.ttf'));
const serifSemiBold = readFileSync(join(fontsDir, 'SourceSerif4-SemiBold.ttf'));

// OG logo: same letter paths as the site logo but with white fills.
// Loaded from external SVG to avoid milestone-refs false positives on path data.
const ogLogoSvg = readFileSync(join(__dirname, 'assets', 'og-logo.svg'), 'utf-8');
const logoDataUri = `data:image/svg+xml;base64,${Buffer.from(ogLogoSvg).toString('base64')}`;


// --- Satori VDOM helpers ---
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

// --- TEMPLATE ---

interface OgData {
  title: string;
  description: string;
  section?: string;
}

function truncate(s: string, max: number) {
  return s.length > max ? s.slice(0, max - 1) + '...' : s;
}

function renderTemplate(data: OgData): VNode {
  return h(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '1200px',
        height: '630px',
        background: '#1a1a19',
        padding: '60px',
      },
    },

    // Header: CL badge + "Claudelint Docs"
    h(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        },
      },
      h('img', { src: logoDataUri, width: 60, height: 37 }),
      h(
        'span',
        {
          style: {
            fontFamily: 'Source Serif 4',
            fontSize: '36px',
            fontWeight: 600,
            color: '#e8e6dc',
          },
        },
        'Claudelint Docs',
      ),
    ),

    // Content area
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

      // Section breadcrumb
      data.section
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
            data.section,
          )
        : null,

      // Title
      h(
        'span',
        {
          style: {
            fontFamily: 'Source Serif 4',
            fontSize: '72px',
            fontWeight: 600,
            color: '#ffffff',
            lineHeight: 1.1,
          },
        },
        truncate(data.title, 60),
      ),

      // Description
      data.description
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
            truncate(data.description, 120),
          )
        : null,
    ),
  );
}

// --- Real data from /integrations/ci ---

const sample: OgData = {
  title: 'CI/CD Integration Guide',
  description:
    'Run claudelint in your CI pipeline to catch configuration issues before they reach production.',
  section: 'Integrations',
};

async function generate() {
  const markup = renderTemplate(sample);

  const svg = await satori(markup as any, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Inter',
        data: interRegular,
        weight: 400,
        style: 'normal' as const,
      },
      {
        name: 'Inter',
        data: interSemiBold,
        weight: 600,
        style: 'normal' as const,
      },
      {
        name: 'Source Serif 4',
        data: serifRegular,
        weight: 400,
        style: 'normal' as const,
      },
      {
        name: 'Source Serif 4',
        data: serifSemiBold,
        weight: 600,
        style: 'normal' as const,
      },
    ],
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
  });
  const png = resvg.render().asPng();

  const outPath = '/tmp/og-test.png';
  writeFileSync(outPath, png);
  process.stdout.write(`Written to ${outPath}\n`);
}

generate().catch((err) => {
  process.stderr.write(`Failed: ${err}\n`);
  process.exit(1);
});
