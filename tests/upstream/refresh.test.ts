import { normalize, parseIndex } from '../../scripts/upstream/refresh';

/**
 * Representative llms.txt content: a markdown bullet list of doc links in the real
 * format (`- [Title](https://code.claude.com/docs/en/<slug>.md): description`), padded
 * out past the 50-page floor so the "extracts slugs" test doesn't also have to fight
 * the guard test below.
 */
function buildLlmsTxt(slugs: string[]): string {
  const lines = slugs.map(
    (slug) => `- [${slug}](https://code.claude.com/docs/en/${slug}.md): Docs for ${slug}.`
  );
  return ['# Claude Code documentation', '', '## Docs', '', ...lines].join('\n');
}

const REPRESENTATIVE_SLUGS = [
  'overview',
  'quickstart',
  'common-workflows',
  'sub-agents',
  'output-styles',
  'hooks',
  'hooks-guide',
  'github-actions',
  'mcp',
  'troubleshooting',
  'third-party-integrations',
  'memory',
  'settings',
  'iam',
  'security',
  'monitoring-usage',
  'costs',
  'analytics',
  'legal-and-compliance',
  'network-config',
  'model-context-protocol',
  'plugins',
  'plugins-reference',
  'plugin-marketplaces',
  'plugin-dependencies',
  'skills',
  'agent-sdk-overview',
  'slash-commands',
  'cli-reference',
  'interactive-mode',
  'terminal-config',
  'devcontainer',
  'amazon-bedrock',
  'google-vertex-ai',
  'llm-gateway',
  'corporate-proxy',
  'sdk-overview',
  'sdk-typescript',
  'sdk-python',
  'sdk-headless',
  'sdk-permissions',
  'sdk-sessions',
  'sdk-streaming-vs-single-mode',
  'sdk-mcp',
  'sdk-custom-tools',
  'sdk-subagents',
  'sdk-slash-commands',
  'sdk-cost-tracking',
  'setup',
  'data-usage',
  'statuses-and-checkpoints',
  'checkpointing',
  'claude-code-on-the-web',
  'vs-code',
  'jetbrains',
];

describe('normalize', () => {
  it('strips the boilerplate documentation-index preamble', () => {
    const input = [
      '> ## Documentation Index',
      '> Fetch the complete documentation index at: https://code.claude.com/docs/llms.txt',
      '> Use this file to discover all available pages before exploring further.',
      '',
      '# Hooks',
    ].join('\n');
    expect(normalize(input)).toBe('# Hooks');
  });

  it('strips volatile theme attributes from code fences', () => {
    expect(normalize('```json theme={null}\n{}\n```')).toBe('```json\n{}\n```');
  });

  it('strips trailing whitespace and normalizes trailing newlines', () => {
    expect(normalize('# Title   \n\n\n')).toBe('# Title');
  });
});

describe('parseIndex', () => {
  it('extracts slugs from a representative llms.txt snippet', () => {
    const llmsTxt = buildLlmsTxt(REPRESENTATIVE_SLUGS);
    expect(parseIndex(llmsTxt)).toEqual([...REPRESENTATIVE_SLUGS].sort());
  });

  it('throws when the parsed page count collapses below the floor', () => {
    // The regression this guard exists to catch: llms.txt reshapes its URL format (or
    // the page list genuinely shrinks to near-nothing), the regex stops matching, and
    // parseIndex would otherwise silently return a near-empty list that overwrites
    // _index.json and permanently kills the [NEW PAGE] signal with no error.
    const reshaped = [
      '# Claude Code documentation',
      '',
      '- [Hooks](https://docs.claude.com/hooks): Docs for hooks.',
      '- [MCP](https://docs.claude.com/mcp): Docs for mcp.',
    ].join('\n');
    expect(() => parseIndex(reshaped)).toThrow(
      /parseIndex yielded 0 pages, expected >= 50/
    );
  });
});
