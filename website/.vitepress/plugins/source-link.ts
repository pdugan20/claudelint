/**
 * VitePress markdown-it plugin: auto-link source paths to GitHub.
 *
 * Converts backtick-wrapped source paths like `src/utils/cache.ts`
 * into clickable links pointing at the file on GitHub. Authors write
 * plain inline code; the plugin handles linking at build time.
 */

import type MarkdownIt from 'markdown-it';
import type Token from 'markdown-it/lib/token.mjs';

const REPO_BASE = 'https://github.com/pdugan20/claudelint';

const SOURCE_PREFIXES = [
  'src/',
  'scripts/',
  'tests/',
  'schemas/',
  'bin/',
  'presets/',
  'skills/',
  'website/',
];

/**
 * True when the code content looks like a real source path
 * (starts with a known prefix, no template placeholders or globs).
 */
function isSourcePath(content: string): boolean {
  if (!SOURCE_PREFIXES.some((p) => content.startsWith(p))) return false;
  if (/[{}<>*]/.test(content)) return false;
  return true;
}

/**
 * Pick `/blob/main/` for files and `/tree/main/` for directories.
 * A path is treated as a directory when its last segment has no extension.
 */
function githubUrl(path: string): string {
  const clean = path.replace(/\/+$/, '');
  const lastSegment = clean.split('/').pop() || '';
  const isDirectory = !lastSegment.includes('.');
  const kind = isDirectory ? 'tree' : 'blob';
  return `${REPO_BASE}/${kind}/main/${clean}`;
}

export function sourceLinkPlugin(md: MarkdownIt): void {
  md.core.ruler.push('source-link', (state) => {
    for (const blockToken of state.tokens) {
      if (blockToken.type !== 'inline' || !blockToken.children) continue;

      const children = blockToken.children;
      let insideLink = 0;

      for (let i = 0; i < children.length; i++) {
        const tok = children[i];

        if (tok.type === 'link_open') {
          insideLink++;
          continue;
        }
        if (tok.type === 'link_close') {
          insideLink--;
          continue;
        }

        if (tok.type !== 'code_inline' || insideLink > 0) continue;
        if (!isSourcePath(tok.content)) continue;

        const linkOpen = new state.Token('link_open', 'a', 1);
        linkOpen.attrSet('href', githubUrl(tok.content));
        linkOpen.attrSet('target', '_blank');
        linkOpen.attrSet('rel', 'noreferrer');

        const linkClose = new state.Token('link_close', 'a', -1);

        blockToken.children = (md.utils as any).arrayReplaceAt(
          children,
          i,
          [linkOpen, tok, linkClose]
        );

        // Skip past the two tokens we just inserted
        i += 2;
      }
    }
  });
}
