import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { dirname, join } from 'path';
import { checkGitHubActionsSecurity } from '../../scripts/check/github-actions-security-policy';

const CHECKOUT_SHA = '3d3c42e5aac5ba805825da76410c181273ba90b1';
const REUSABLE_SHA = '0123456789abcdef0123456789abcdef01234567';
const REVIEW_ACTION_SHA = '89abcdef0123456789abcdef0123456789abcdef';
const DOCKER_DIGEST = 'a'.repeat(64);

const WORKFLOW_PERMISSIONS: Record<string, string> = {
  'labeler.yml': 'pull-requests: write',
  'pr-lint.yml': 'pull-requests: read',
  'pr-size.yml': 'pull-requests: write',
  'stale.yml': 'issues: write\n  pull-requests: write',
  'welcome.yml': 'issues: write\n  pull-requests: write',
};

function write(root: string, path: string, content: string): void {
  const absolutePath = join(root, path);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, content);
}

function checkoutStep(persistCredentials = 'false'): string {
  return `      - uses: actions/checkout@${CHECKOUT_SHA} # v7.0.1
        with:
          persist-credentials: ${persistCredentials}`;
}

function workflowWithTopPermissions(permissions: string, steps = '      - run: echo safe'): string {
  return `name: Fixture
on: push
permissions:
  ${permissions}
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
${steps}
`;
}

function baseDependabot(): string {
  return `version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    ignore:
      - dependency-name: "*"
        update-types: [version-update:semver-major]
    groups:
      dev-dependencies:
        dependency-type: development
        update-types: [minor, patch]
      production-dependencies:
        dependency-type: production
        update-types: [minor, patch]
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
      timezone: America/Los_Angeles
    cooldown:
      default-days: 14
    groups:
      github-actions:
        patterns: ["*"]
        update-types: [minor, patch]
`;
}

function writeBaseRepository(root: string): void {
  write(
    root,
    '.github/workflows/ci.yml',
    workflowWithTopPermissions('contents: read', checkoutStep())
  );

  for (const [filename, permissions] of Object.entries(WORKFLOW_PERMISSIONS)) {
    write(root, `.github/workflows/${filename}`, workflowWithTopPermissions(permissions));
  }

  write(
    root,
    '.github/workflows/publish.yml',
    `name: Release
on: push
jobs:
  publish:
    permissions:
      contents: read
      id-token: write
    runs-on: ubuntu-latest
    steps:
${checkoutStep()}
  github-release:
    permissions:
      contents: write
    runs-on: ubuntu-latest
    steps:
      - run: echo release
`
  );

  write(
    root,
    '.github/workflows/upstream-watch.yml',
    workflowWithTopPermissions('contents: read\n  issues: write', checkoutStep())
  );

  write(root, '.github/dependabot.yml', baseDependabot());
  write(root, 'package.json', JSON.stringify({ scripts: {} }, null, 2));
  write(
    root,
    'scripts/check/github-actions-provenance.json',
    JSON.stringify(
      {
        'actions/checkout': { version: 'v7.0.1', sha: CHECKOUT_SHA },
      },
      null,
      2
    )
  );
}

function replace(root: string, path: string, from: string, to: string): void {
  const absolutePath = join(root, path);
  const source = readFileSync(absolutePath, 'utf8');
  expect(source).toContain(from);
  writeFileSync(absolutePath, source.replace(from, to));
}

function messages(root: string): string {
  return checkGitHubActionsSecurity(root).join('\n');
}

function addCiRun(root: string, command: string): void {
  const indentedCommand = command
    .split('\n')
    .map((line) => `          ${line}`)
    .join('\n');
  replace(
    root,
    '.github/workflows/ci.yml',
    checkoutStep(),
    `${checkoutStep()}\n      - run: |\n${indentedCommand}`
  );
}

function replaceCiCheckoutWithUses(root: string, uses: string): void {
  replace(root, '.github/workflows/ci.yml', checkoutStep(), `      - uses: ${uses}`);
}

function compositeAction(steps: string): string {
  return `name: Fixture composite action
runs:
  using: composite
  steps:
${steps}
`;
}

describe('GitHub Actions security policy', () => {
  let root: string;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'claudelint-actions-policy-'));
    writeBaseRepository(root);
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it('accepts the classified least-privilege baseline', () => {
    expect(checkGitHubActionsSecurity(root)).toEqual([]);
  });

  describe('checkout credentials', () => {
    test.each(['ci.yml', 'publish.yml', 'upstream-watch.yml'])(
      'requires persist-credentials false in %s',
      (filename) => {
        replace(
          root,
          `.github/workflows/${filename}`,
          'persist-credentials: false',
          'persist-credentials: true'
        );

        expect(messages(root)).toContain('persist-credentials must be false');
      }
    );
  });

  describe('parsed action references', () => {
    test.each([
      {
        name: 'multiword release comment',
        uses: `actions/checkout@${CHECKOUT_SHA} # v7.0.1 trusted release`,
      },
      { name: 'quoted mutable ref', uses: '"actions/checkout@v7" # v7.0.1' },
      { name: 'expression ref', uses: 'actions/checkout@${{ github.ref }} # v7.0.1' },
      { name: 'mutable Docker tag', uses: 'docker://alpine:3.20' },
    ])('rejects $name', ({ uses }) => {
      replace(root, '.github/workflows/ci.yml', `actions/checkout@${CHECKOUT_SHA} # v7.0.1`, uses);

      expect(checkGitHubActionsSecurity(root).length).toBeGreaterThan(0);
    });

    test.each([
      {
        name: 'digest-pinned Docker action',
        uses: `docker://alpine@sha256:${DOCKER_DIGEST}`,
        manifest: {},
      },
      {
        name: 'quoted immutable action',
        uses: `"actions/checkout@${CHECKOUT_SHA}" # v7.0.1`,
        manifest: { 'actions/checkout': { version: 'v7.0.1', sha: CHECKOUT_SHA } },
      },
    ])('accepts $name', ({ uses, manifest }) => {
      replace(root, '.github/workflows/ci.yml', `actions/checkout@${CHECKOUT_SHA} # v7.0.1`, uses);
      replace(root, '.github/workflows/publish.yml', checkoutStep(), '      - run: echo publish');
      replace(
        root,
        '.github/workflows/upstream-watch.yml',
        checkoutStep(),
        '      - run: echo upstream'
      );
      write(
        root,
        'scripts/check/github-actions-provenance.json',
        JSON.stringify(manifest, null, 2)
      );

      expect(checkGitHubActionsSecurity(root)).toEqual([]);
    });

    it('accepts and recursively inspects a safe local composite action', () => {
      replaceCiCheckoutWithUses(root, './.github/actions/build');
      write(
        root,
        '.github/actions/build/action.yml',
        compositeAction(
          `    - uses: actions/checkout@${CHECKOUT_SHA} # v7.0.1
      with:
        persist-credentials: false
    - run: echo safe
      shell: bash`
        )
      );

      expect(checkGitHubActionsSecurity(root)).toEqual([]);
    });

    test.each([
      ['missing manifest', './.github/actions/missing'],
      ['repository escape', './../outside-action'],
    ])('rejects a local action with %s', (_name, uses) => {
      replaceCiCheckoutWithUses(root, uses);

      expect(messages(root)).toContain('local action');
    });

    it('rejects a local action with ambiguous action.yml and action.yaml manifests', () => {
      replaceCiCheckoutWithUses(root, './.github/actions/ambiguous');
      write(root, '.github/actions/ambiguous/action.yml', compositeAction('    - run: echo one'));
      write(root, '.github/actions/ambiguous/action.yaml', compositeAction('    - run: echo two'));

      expect(messages(root)).toContain('exactly one action.yml or action.yaml');
    });

    test.each([
      [
        'Node action',
        `name: Node action
runs:
  using: node20
  main: dist/main.js
  pre: dist/pre.js
  post: dist/post.js
`,
      ],
      [
        'Docker action',
        `name: Docker action
runs:
  using: docker
  image: Dockerfile
`,
      ],
    ])('rejects a non-composite local %s fail closed', (_name, manifest) => {
      replaceCiCheckoutWithUses(root, './.github/actions/non-composite');
      write(root, '.github/actions/non-composite/action.yml', manifest);

      expect(messages(root)).toContain('non-composite local actions are not allowed');
    });

    it('rejects a local action directory symlink that resolves outside the repository', () => {
      const outsideRoot = mkdtempSync(join(tmpdir(), 'claudelint-outside-action-'));
      try {
        write(outsideRoot, 'action.yml', compositeAction('    - run: echo outside'));
        mkdirSync(join(root, '.github/actions'), { recursive: true });
        symlinkSync(outsideRoot, join(root, '.github/actions/linked'), 'dir');
        replaceCiCheckoutWithUses(root, './.github/actions/linked');

        expect(messages(root)).toContain('resolves outside the repository');
      } finally {
        rmSync(outsideRoot, { recursive: true, force: true });
      }
    });

    it('rejects checkout credential persistence inside a local composite action', () => {
      replaceCiCheckoutWithUses(root, './.github/actions/build');
      write(
        root,
        '.github/actions/build/action.yml',
        compositeAction(
          `    - uses: actions/checkout@${CHECKOUT_SHA} # v7.0.1
      with:
        persist-credentials: true`
        )
      );

      expect(messages(root)).toContain('persist-credentials must be false');
    });

    it('rejects merge commands inside a local composite action', () => {
      replaceCiCheckoutWithUses(root, './.github/actions/release');
      write(
        root,
        '.github/actions/release/action.yml',
        compositeAction('    - run: gh pr merge 1 --squash\n      shell: bash')
      );

      expect(messages(root)).toContain('.github/actions/release/action.yml');
    });

    it('detects cycles between local composite actions', () => {
      replaceCiCheckoutWithUses(root, './.github/actions/one');
      write(
        root,
        '.github/actions/one/action.yml',
        compositeAction('    - uses: ./.github/actions/two')
      );
      write(
        root,
        '.github/actions/two/action.yml',
        compositeAction('    - uses: ./.github/actions/one')
      );

      expect(messages(root)).toContain('local action cycle');
    });

    it('does not treat uses-like text inside a run block as an action reference', () => {
      addCiRun(
        root,
        `cat <<'EOF'
uses: untrusted/example@main # v1.2.3
EOF`
      );

      expect(checkGitHubActionsSecurity(root)).toEqual([]);
    });

    test.each(['|-2', '|2-'])('accepts the YAML block scalar indicator order %s', (indicator) => {
      replace(
        root,
        '.github/workflows/ci.yml',
        checkoutStep(),
        `${checkoutStep()}\n      - run: ${indicator}\n          cat <<'EOF'\n          uses: example/unsafe@main # v1.2.3\n          EOF`
      );

      expect(checkGitHubActionsSecurity(root)).toEqual([]);
    });

    it('checks job-level reusable workflow references from parsed YAML', () => {
      write(
        root,
        '.github/workflows/ci.yml',
        `name: CI
on: push
permissions:
  contents: read
jobs:
  reuse:
    uses: acme/platform/.github/workflows/build.yml@main # v1.2.3
`
      );

      expect(messages(root)).toContain('not pinned to a 40-character commit');
    });

    it('accepts an immutable reusable workflow recorded in provenance', () => {
      write(
        root,
        '.github/workflows/ci.yml',
        `name: CI
on: push
permissions:
  contents: read
jobs:
  reuse:
    uses: acme/platform/.github/workflows/build.yml@${REUSABLE_SHA} # v1.2.3
`
      );
      replace(root, '.github/workflows/publish.yml', checkoutStep(), '      - run: echo publish');
      replace(
        root,
        '.github/workflows/upstream-watch.yml',
        checkoutStep(),
        '      - run: echo upstream'
      );
      write(
        root,
        'scripts/check/github-actions-provenance.json',
        JSON.stringify(
          {
            'acme/platform/.github/workflows/build.yml': {
              version: 'v1.2.3',
              sha: REUSABLE_SHA,
            },
          },
          null,
          2
        )
      );

      expect(checkGitHubActionsSecurity(root)).toEqual([]);
    });

    it('rejects a release comment that disagrees with provenance', () => {
      replace(root, '.github/workflows/ci.yml', '# v7.0.1', '# v7.0.0');

      expect(messages(root)).toContain('does not match provenance');
    });
  });

  describe('merge and approval mutations', () => {
    test.each([
      ['Octokit merge', 'github.rest.pulls.merge({ owner, repo, pull_number: 1 })'],
      ['Octokit approval', "github.rest.pulls.createReview({ event: 'APPROVE' })"],
      ['gh merge', 'gh pr merge 1 --squash'],
      ['gh approval', 'gh pr review 1 --approve'],
      ['REST merge', 'gh api --method PUT repos/acme/repo/pulls/1/merge'],
      [
        'REST approval',
        `curl -X POST https://api.github.com/repos/acme/repo/pulls/1/reviews -d '{"event":"APPROVE"}'`,
      ],
      ['GraphQL merge', 'mutation { mergePullRequest(input: $input) { clientMutationId } }'],
      [
        'GraphQL auto-merge',
        'mutation { enablePullRequestAutoMerge(input: $input) { clientMutationId } }',
      ],
      [
        'GraphQL approval',
        'mutation { addPullRequestReview(input: {event: APPROVE}) { clientMutationId } }',
      ],
    ])('rejects %s', (_name, command) => {
      addCiRun(root, command);

      expect(messages(root)).toContain('forbidden');
    });

    it('does not reject a read-only generic gh api call', () => {
      addCiRun(root, 'gh api repos/acme/repo/issues');

      expect(checkGitHubActionsSecurity(root)).toEqual([]);
    });

    test.each(['acme/auto-approve', 'acme/approve-pull-request', 'acme/pull-request-approve'])(
      'rejects the otherwise valid approval action %s',
      (actionId) => {
        replaceCiCheckoutWithUses(root, `${actionId}@${REVIEW_ACTION_SHA} # v1.2.3`);
        write(
          root,
          'scripts/check/github-actions-provenance.json',
          JSON.stringify(
            {
              'actions/checkout': { version: 'v7.0.1', sha: CHECKOUT_SHA },
              [actionId]: { version: 'v1.2.3', sha: REVIEW_ACTION_SHA },
            },
            null,
            2
          )
        );

        expect(messages(root)).toContain('forbidden approval action');
      }
    );

    test.each([
      [
        'expression-based REST merge route',
        'gh api --method PUT "repos/${{ github.repository }}/pulls/${{ github.event.pull_request.number }}/merge"',
      ],
      [
        'expression-based REST approval route',
        'gh api --method POST "repos/${{ github.repository }}/pulls/${{ github.event.pull_request.number }}/reviews" -f event=APPROVE',
      ],
    ])('rejects %s', (_name, command) => {
      addCiRun(root, command);

      expect(messages(root)).toContain('forbidden');
    });

    it('ignores forbidden-call text in ordinary JavaScript comments', () => {
      write(
        root,
        'scripts/safe.ts',
        `// github.rest.pulls.merge({ pull_number: 1 })
// github.rest.pulls.merge({ pull_number: 1 })
/*
octokit.rest.pulls.createReview({ event: 'APPROVE' })
*/
console.log('safe');
`
      );
      write(
        root,
        'package.json',
        JSON.stringify({ scripts: { safe: 'tsx scripts/safe.ts' } }, null, 2)
      );
      addCiRun(root, 'npm run safe');

      expect(checkGitHubActionsSecurity(root)).toEqual([]);
    });

    test.each([
      ['character-class slashes', 'const slash = /[//]/;'],
      ['comment-like block text', 'const block = /[/*]/;'],
    ])('does not let a valid regex literal with %s hide a later forbidden call', (_name, regex) => {
      write(
        root,
        'scripts/dangerous-regex.ts',
        `${regex} github.rest.pulls.merge({ pull_number: 1 });\n`
      );
      write(
        root,
        'package.json',
        JSON.stringify({ scripts: { danger: 'tsx scripts/dangerous-regex.ts' } }, null, 2)
      );
      addCiRun(root, 'npm run danger');

      expect(messages(root)).toContain('scripts/dangerous-regex.ts');
    });

    it('scans a directly invoked repository-owned script', () => {
      write(root, '.github/scripts/merge.sh', '#!/bin/bash\ngh pr merge 1 --squash\n');
      addCiRun(root, 'bash .github/scripts/merge.sh');

      expect(messages(root)).toContain('.github/scripts/merge.sh');
    });

    it('does not treat repository paths in delegated-script comments as invocations', () => {
      write(
        root,
        '.github/scripts/safe.sh',
        '#!/bin/bash\n# Migration note: scripts/removed-manual-check.sh no longer exists.\necho safe\n'
      );
      addCiRun(root, 'bash .github/scripts/safe.sh');

      expect(checkGitHubActionsSecurity(root)).toEqual([]);
    });

    it('recursively scans a repository-owned script actually invoked by a delegated script', () => {
      write(root, '.github/scripts/outer.sh', '#!/bin/bash\nbash .github/scripts/inner.sh\n');
      write(root, '.github/scripts/inner.sh', '#!/bin/bash\ngh pr merge 1 --squash\n');
      addCiRun(root, 'bash .github/scripts/outer.sh');

      expect(messages(root)).toContain('.github/scripts/inner.sh');
    });

    it('resolves and scans a repository-owned script invoked through npm', () => {
      write(root, 'scripts/dangerous.ts', 'github.rest.pulls.merge({ pull_number: 1 });\n');
      write(
        root,
        'package.json',
        JSON.stringify({ scripts: { dangerous: 'tsx scripts/dangerous.ts' } }, null, 2)
      );
      addCiRun(root, 'npm run dangerous');

      expect(messages(root)).toContain('scripts/dangerous.ts');
    });

    test.each([
      ['npm', 'npm run dangerous', 'dangerous'],
      ['npm lifecycle shorthand', 'npm test', 'test'],
      ['yarn run', 'yarn run dangerous', 'dangerous'],
      ['yarn shorthand', 'yarn dangerous', 'dangerous'],
      ['pnpm', 'pnpm run dangerous', 'dangerous'],
    ])('follows a reachable package script invoked with %s', (_name, invocation, scriptName) => {
      write(root, 'scripts/dangerous.ts', 'github.rest.pulls.merge({ pull_number: 1 });\n');
      write(
        root,
        'package.json',
        JSON.stringify({ scripts: { [scriptName]: 'tsx scripts/dangerous.ts' } }, null, 2)
      );
      addCiRun(root, invocation);

      expect(messages(root)).toContain('scripts/dangerous.ts');
    });

    it('follows child package scripts only after their parent is reachable', () => {
      write(root, 'scripts/dangerous.ts', 'github.rest.pulls.merge({ pull_number: 1 });\n');
      write(
        root,
        'package.json',
        JSON.stringify(
          { scripts: { parent: 'npm run child', child: 'tsx scripts/dangerous.ts' } },
          null,
          2
        )
      );
      addCiRun(root, 'npm run parent');

      expect(messages(root)).toContain('scripts/dangerous.ts');
    });

    it('does not scan an unreferenced manual-only package script', () => {
      write(root, 'scripts/manual-merge.ts', 'github.rest.pulls.merge({ pull_number: 1 });\n');
      write(
        root,
        'package.json',
        JSON.stringify({ scripts: { 'manual:merge': 'tsx scripts/manual-merge.ts' } }, null, 2)
      );

      expect(checkGitHubActionsSecurity(root)).toEqual([]);
    });

    test.each([
      ['dot source', '. scripts/dangerous.sh'],
      ['source builtin', 'source scripts/dangerous.sh'],
      ['interpreter flags', 'bash -e scripts/dangerous.sh'],
      ['working-directory change', 'cd scripts && ./dangerous.sh'],
    ])('follows a script invoked via %s', (_name, invocation) => {
      write(root, 'scripts/dangerous.sh', '#!/bin/bash\ngh pr merge 1 --squash\n');
      addCiRun(root, invocation);

      expect(messages(root)).toContain('scripts/dangerous.sh');
    });

    it('follows a nested shell command passed through bash -c', () => {
      write(root, 'scripts/dangerous.sh', '#!/bin/bash\ngh pr merge 1 --squash\n');
      addCiRun(root, "bash -c 'bash scripts/dangerous.sh'");

      expect(messages(root)).toContain('scripts/dangerous.sh');
    });

    test.each([
      ['Node', 'node dangerous.js', 'dangerous.js'],
      ['bash', 'bash dangerous.sh', 'dangerous.sh'],
    ])('treats a root-relative %s entrypoint as repository owned', (_name, invocation, path) => {
      write(root, path, 'gh pr merge 1 --squash\n');
      addCiRun(root, invocation);

      expect(messages(root)).toContain(path);
    });

    it('applies the working directory selected by env -C', () => {
      write(root, 'scripts/dangerous.js', 'github.rest.pulls.merge({ pull_number: 1 });\n');
      addCiRun(root, '/usr/bin/env -C scripts node dangerous.js');

      expect(messages(root)).toContain('scripts/dangerous.js');
    });

    test.each([
      ['short option', 'bash -O extglob dangerous.sh'],
      ['long option', 'bash --rcfile dangerous.sh -c "echo safe"'],
    ])('does not mistake a shell operand-bearing %s for the entrypoint', (_name, invocation) => {
      write(root, 'dangerous.sh', '#!/bin/bash\ngh pr merge 1 --squash\n');
      addCiRun(root, invocation);

      expect(messages(root)).toContain('dangerous.sh');
    });

    test.each([
      ['quoted separator', "echo 'safe; ./missing.sh'"],
      ['escaped separator', 'echo safe\\; ./missing.sh'],
      ['multiline quoted value', "printf '%s' 'safe\n./missing.sh'"],
    ])('does not split a %s into a delegated command', (_name, invocation) => {
      addCiRun(root, invocation);

      expect(checkGitHubActionsSecurity(root)).toEqual([]);
    });

    it('fails closed on ambiguous unterminated shell syntax', () => {
      addCiRun(root, "echo 'unterminated");

      expect(messages(root)).toContain('cannot parse shell command');
    });

    test.each([
      ['spaced redirect', '> /dev/null scripts/dangerous.sh'],
      ['attached redirect', '>/dev/null scripts/dangerous.sh'],
      ['spaced fd redirect', '2> /dev/null scripts/dangerous.sh'],
      ['attached fd redirect', '2>/dev/null scripts/dangerous.sh'],
      ['spaced stdout and stderr redirect', '&> /dev/null scripts/dangerous.sh'],
    ])('follows a repository entrypoint after a leading %s', (_name, invocation) => {
      write(root, 'scripts/dangerous.sh', '#!/bin/bash\ngh pr merge 1 --squash\n');
      addCiRun(root, invocation);

      expect(messages(root)).toContain('scripts/dangerous.sh');
    });

    it('fails closed on an ambiguous leading redirection', () => {
      write(root, 'scripts/safe.sh', '#!/bin/bash\necho safe\n');
      addCiRun(root, '2>& scripts/safe.sh');

      expect(messages(root)).toContain('cannot parse shell redirection');
    });

    test.each(['&&', '||', '|'])('fails closed on a dangling %s separator', (separator) => {
      addCiRun(root, `echo safe ${separator}`);

      expect(messages(root)).toContain('cannot parse shell command with a dangling separator');
    });

    it('fails closed when command substitution can produce an entrypoint', () => {
      write(root, 'scripts/dangerous.sh', '#!/bin/bash\ngh pr merge 1 --squash\n');
      addCiRun(root, '$(printf scripts/dangerous.sh)');

      expect(messages(root)).toContain('cannot parse shell command substitution');
    });

    it('fails closed when a preamble precedes a command-substituted entrypoint', () => {
      write(root, 'scripts/dangerous.sh', '#!/bin/bash\ngh pr merge 1 --squash\n');
      addCiRun(root, 'SAFE=value > /dev/null $(printf scripts/dangerous.sh)');

      expect(messages(root)).toContain('cannot parse shell command substitution');
    });

    it('accepts assignment-valued command substitutions in delegated shell scripts', () => {
      write(
        root,
        'scripts/safe.sh',
        '#!/bin/bash\nskill_name=$(basename "$(dirname "$skill_md")")\ncommands=$(grep safe input | sort -u)\nmatches=$(grep "safe\\)(" scripts/ || true)\n'
      );
      addCiRun(root, 'bash scripts/safe.sh');

      expect(checkGitHubActionsSecurity(root)).toEqual([]);
    });

    test.each([
      ['direct entrypoint', 'SAFE=$(scripts/dangerous.sh)'],
      ['interpreter entrypoint', 'SAFE=$(bash scripts/dangerous.sh)'],
      ['pipelined entrypoint', 'SAFE=$(scripts/dangerous.sh | cat)'],
    ])('follows a repository executable in an assignment-valued %s substitution', (_name, line) => {
      write(root, 'scripts/dangerous.sh', '#!/bin/bash\ngh pr merge 1 --squash\n');
      write(root, 'scripts/outer.sh', `#!/bin/bash\n${line}\n`);
      addCiRun(root, 'bash scripts/outer.sh');

      expect(messages(root)).toContain('scripts/dangerous.sh');
    });

    it('does not exempt a dangerous substitution after a static directory variable is reassigned', () => {
      write(root, 'scripts/dangerous.sh', '#!/bin/bash\ngh pr merge 1 --squash\n');
      write(
        root,
        'scripts/outer.sh',
        '#!/bin/bash\nPROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"\nPROJECT_ROOT=$(scripts/dangerous.sh)\n'
      );
      addCiRun(root, 'bash scripts/outer.sh');

      expect(messages(root)).toContain('scripts/dangerous.sh');
    });

    it('does not close a command substitution on a parenthesis inside a comment', () => {
      write(root, 'scripts/dangerous.sh', '#!/bin/bash\ngh pr merge 1 --squash\n');
      write(
        root,
        'scripts/outer.sh',
        '#!/bin/bash\nSAFE=$(echo safe # ) ignored\nscripts/dangerous.sh)\n'
      );
      addCiRun(root, 'bash scripts/outer.sh');

      expect(messages(root)).toContain('scripts/dangerous.sh');
    });

    it('does not lose an entrypoint after a command-substituted redirection operand', () => {
      write(root, 'scripts/dangerous.sh', '#!/bin/bash\ngh pr merge 1 --squash\n');
      addCiRun(root, '> $(printf /dev/null) scripts/dangerous.sh');

      const violations = messages(root);
      expect(violations).toContain('cannot parse shell command substitution');
      expect(violations).toContain('scripts/dangerous.sh');
    });

    test.each([
      ['embedded command name', 'b$(printf ash) scripts/dangerous.sh'],
      ['embedded command path', '/bin/$(printf bash) scripts/dangerous.sh'],
    ])('fails closed on a substitution in an %s', (_name, invocation) => {
      write(root, 'scripts/dangerous.sh', '#!/bin/bash\necho safe\n');
      addCiRun(root, invocation);

      expect(messages(root)).toContain('cannot parse shell command substitution');
    });

    test.each([
      ['attached operand', '{output}>/dev/null scripts/dangerous.sh'],
      ['spaced operand', '{output}> /dev/null scripts/dangerous.sh'],
    ])('follows an entrypoint after a named-fd redirect with an %s', (_name, invocation) => {
      write(root, 'scripts/dangerous.sh', '#!/bin/bash\ngh pr merge 1 --squash\n');
      addCiRun(root, invocation);

      expect(messages(root)).toContain('scripts/dangerous.sh');
    });

    test.each([
      ['dollar-parenthesis', 'echo safe $(printf'],
      ['backtick', 'echo safe `printf'],
    ])('fails closed on an unterminated %s substitution', (_name, invocation) => {
      addCiRun(root, invocation);

      expect(messages(root)).toContain('cannot parse shell command substitution');
    });

    test.each([';', ';;'])('fails closed on a leading %s separator', (separator) => {
      addCiRun(root, `${separator} echo safe`);

      expect(messages(root)).toContain('cannot parse shell command with a dangling separator');
    });

    it('follows flagged child executables from a delegated script', () => {
      write(root, 'scripts/outer.sh', '#!/bin/bash\nbash -eu scripts/inner.sh\n');
      write(root, 'scripts/inner.sh', '#!/bin/bash\ngh pr merge 1 --squash\n');
      addCiRun(root, 'bash scripts/outer.sh');

      expect(messages(root)).toContain('scripts/inner.sh');
    });

    test.each([
      ['npm global option', 'npm --silent run dangerous'],
      ['pnpm global option', 'pnpm --silent run dangerous'],
      ['yarn global option', 'yarn --silent run dangerous'],
      ['npm operand option', 'npm --prefix . run dangerous'],
      ['pnpm operand option', 'pnpm --dir . run dangerous'],
      ['yarn operand option', 'yarn --cwd . run dangerous'],
    ])('follows package scripts behind %s', (_name, invocation) => {
      write(root, 'scripts/dangerous.ts', 'github.rest.pulls.merge({ pull_number: 1 });\n');
      write(
        root,
        'package.json',
        JSON.stringify({ scripts: { dangerous: 'tsx scripts/dangerous.ts' } }, null, 2)
      );
      addCiRun(root, invocation);

      expect(messages(root)).toContain('scripts/dangerous.ts');
    });

    test.each([
      ['npm ci', 'npm ci', 'prepare'],
      ['npm install', 'npm install', 'preinstall'],
      ['npm add', 'npm add fixture-package', 'install'],
      ['pnpm install', 'pnpm install', 'postinstall'],
      ['pnpm add', 'pnpm add fixture-package', 'prepare'],
      ['yarn install', 'yarn install', 'preinstall'],
      ['yarn add', 'yarn add fixture-package', 'postinstall'],
    ])(
      'follows a root lifecycle script reached only through %s',
      (_name, invocation, lifecycle) => {
        write(root, 'scripts/dangerous.sh', '#!/bin/bash\ngh pr merge 1 --squash\n');
        write(
          root,
          'package.json',
          JSON.stringify({ scripts: { [lifecycle]: 'bash scripts/dangerous.sh' } }, null, 2)
        );
        addCiRun(root, invocation);

        expect(messages(root)).toContain('scripts/dangerous.sh');
      }
    );

    it('accepts the real repository npm ci prepare shape when its delegated script is safe', () => {
      write(root, 'scripts/util/setup-hooks.sh', '#!/bin/bash\necho safe\n');
      write(
        root,
        'package.json',
        JSON.stringify(
          { scripts: { prepare: 'bash scripts/util/setup-hooks.sh || true' } },
          null,
          2
        )
      );
      addCiRun(root, 'npm ci');

      expect(checkGitHubActionsSecurity(root)).toEqual([]);
    });

    test.each([
      ['npm ci operand', 'npm ci unexpected'],
      ['pnpm add without a package', 'pnpm add'],
      ['yarn add without a package', 'yarn add'],
    ])('fails closed on an ambiguous %s invocation', (_name, invocation) => {
      addCiRun(root, invocation);

      expect(messages(root)).toContain('cannot resolve package-manager install invocation');
    });

    it('follows install lifecycle scripts when ignore-scripts is explicitly false', () => {
      write(root, 'scripts/dangerous.sh', '#!/bin/bash\ngh pr merge 1 --squash\n');
      write(
        root,
        'package.json',
        JSON.stringify({ scripts: { prepare: 'bash scripts/dangerous.sh' } }, null, 2)
      );
      addCiRun(root, 'npm ci --ignore-scripts=false');

      expect(messages(root)).toContain('scripts/dangerous.sh');
    });

    test.each(['npm', 'pnpm', 'yarn'])(
      'follows %s install lifecycle scripts with a separated false ignore-scripts value',
      (manager) => {
        write(root, 'scripts/dangerous.sh', '#!/bin/bash\ngh pr merge 1 --squash\n');
        write(
          root,
          'package.json',
          JSON.stringify({ scripts: { prepare: 'bash scripts/dangerous.sh' } }, null, 2)
        );
        addCiRun(root, `${manager} install --ignore-scripts false`);

        expect(messages(root)).toContain('scripts/dangerous.sh');
      }
    );

    test.each(['npm', 'pnpm', 'yarn'])(
      'skips %s install lifecycle scripts with a separated true ignore-scripts value',
      (manager) => {
        write(root, 'scripts/dangerous.sh', '#!/bin/bash\ngh pr merge 1 --squash\n');
        write(
          root,
          'package.json',
          JSON.stringify({ scripts: { prepare: 'bash scripts/dangerous.sh' } }, null, 2)
        );
        addCiRun(root, `${manager} install --ignore-scripts true`);

        expect(checkGitHubActionsSecurity(root)).toEqual([]);
      }
    );

    test.each(['yarn', 'yarn --silent'])(
      'treats bare %s as install lifecycle reachability',
      (invocation) => {
        write(root, 'scripts/dangerous.sh', '#!/bin/bash\ngh pr merge 1 --squash\n');
        write(
          root,
          'package.json',
          JSON.stringify({ scripts: { prepare: 'bash scripts/dangerous.sh' } }, null, 2)
        );
        addCiRun(root, invocation);

        expect(messages(root)).toContain('scripts/dangerous.sh');
      }
    );

    test.each(['i', 'in', 'ins', 'inst', 'insta', 'instal', 'isnt', 'isnta', 'isntal', 'isntall'])(
      'normalizes the npm %s install alias',
      (alias) => {
        write(root, 'scripts/dangerous.sh', '#!/bin/bash\ngh pr merge 1 --squash\n');
        write(
          root,
          'package.json',
          JSON.stringify({ scripts: { prepare: 'bash scripts/dangerous.sh' } }, null, 2)
        );
        addCiRun(root, `npm ${alias}`);

        expect(messages(root)).toContain('scripts/dangerous.sh');
      }
    );

    it('fails closed on an unmodeled npm install abbreviation', () => {
      addCiRun(root, 'npm insall');

      expect(messages(root)).toContain('cannot resolve package-manager install invocation');
    });

    test.each([
      ['explicit local package operand', 'npm install ./packages/fixture'],
      ['bare local package operand', 'npm install packages/fixture'],
      ['npm workspace operand', 'npm install --workspace packages/fixture'],
      ['pnpm filter operand', 'pnpm install --filter ./packages/fixture'],
    ])('fails closed rather than scanning root scripts for a %s', (_name, invocation) => {
      write(root, 'packages/fixture/package.json', JSON.stringify({ scripts: {} }, null, 2));
      addCiRun(root, invocation);

      expect(messages(root)).toContain('cannot resolve package-manager install invocation');
    });

    test.each([
      ['npm ci', 'npm ci'],
      ['npm install', 'npm install'],
    ])('follows the prepublish lifecycle reached by %s', (_name, invocation) => {
      write(root, 'scripts/dangerous.sh', '#!/bin/bash\ngh pr merge 1 --squash\n');
      write(
        root,
        'package.json',
        JSON.stringify({ scripts: { prepublish: 'bash scripts/dangerous.sh' } }, null, 2)
      );
      addCiRun(root, invocation);

      expect(messages(root)).toContain('scripts/dangerous.sh');
    });

    test.each([
      ['prepublishOnly', 'npm publish --provenance --access public', 'prepublishOnly'],
      ['prepack', 'npm publish', 'prepack'],
      ['prepare', 'npm publish', 'prepare'],
      ['postpack', 'npm publish', 'postpack'],
      ['publish', 'npm publish', 'publish'],
      ['postpublish', 'npm publish', 'postpublish'],
      ['npm pack', 'npm pack', 'prepack'],
      ['pnpm publish', 'pnpm publish', 'prepublishOnly'],
      ['yarn publish', 'yarn publish', 'prepublishOnly'],
    ])(
      'follows the %s lifecycle reached by a package publication command',
      (_name, invocation, lifecycle) => {
        write(root, 'scripts/dangerous.sh', '#!/bin/bash\ngh pr merge 1 --squash\n');
        write(
          root,
          'package.json',
          JSON.stringify({ scripts: { [lifecycle]: 'bash scripts/dangerous.sh' } }, null, 2)
        );
        addCiRun(root, invocation);

        expect(messages(root)).toContain('scripts/dangerous.sh');
      }
    );

    test.each([
      [
        'separate require operand and main',
        'node --require scripts/safe-hook.js scripts/dangerous.js',
      ],
      ['inline require operand', 'node --require=scripts/dangerous.js scripts/safe-main.js'],
      ['env launcher', '/usr/bin/env node scripts/dangerous.js'],
    ])('resolves every executable operand for %s', (_name, invocation) => {
      write(root, 'scripts/safe-hook.js', 'console.log("safe hook");\n');
      write(root, 'scripts/safe-main.js', 'console.log("safe main");\n');
      write(root, 'scripts/dangerous.js', 'github.rest.pulls.merge({ pull_number: 1 });\n');
      addCiRun(root, invocation);

      expect(messages(root)).toContain('scripts/dangerous.js');
    });

    it('fails closed for an unsupported interpreter option', () => {
      write(root, 'scripts/safe.js', 'console.log("safe");\n');
      addCiRun(root, 'node --mystery-option scripts/safe.js');

      expect(messages(root)).toContain('cannot resolve interpreter option');
    });

    test.each([
      ['static import', "import './dangerous.js';"],
      ['re-export', "export { danger } from './dangerous.js';"],
      ['literal require', "require('./dangerous.js');"],
      ['literal dynamic import', "import('./dangerous.js');"],
    ])('follows a repository-relative JavaScript dependency from a %s', (_name, statement) => {
      write(root, 'scripts/entry.js', `${statement}\nconsole.log('entry');\n`);
      write(
        root,
        'scripts/dangerous.js',
        'export const danger = github.rest.pulls.merge({ pull_number: 1 });\n'
      );
      addCiRun(root, 'node scripts/entry.js');

      expect(messages(root)).toContain('scripts/dangerous.js');
    });

    test.each([
      ['extensionless file', './dangerous', 'scripts/dangerous.ts'],
      ['directory index', './dangerous', 'scripts/dangerous/index.ts'],
    ])('resolves a repository-relative %s dependency', (_name, specifier, dependencyPath) => {
      write(root, 'scripts/entry.ts', `import '${specifier}';\n`);
      write(root, dependencyPath, 'github.rest.pulls.merge({ pull_number: 1 });\n');
      addCiRun(root, 'tsx scripts/entry.ts');

      expect(messages(root)).toContain(dependencyPath);
    });

    it('cycle-protects recursive repository-relative dependencies', () => {
      write(root, 'scripts/entry.ts', "import './cycle-a';\n");
      write(
        root,
        'scripts/cycle-a.ts',
        "import './entry';\ngithub.rest.pulls.merge({ pull_number: 1 });\n"
      );
      addCiRun(root, 'tsx scripts/entry.ts');

      expect(messages(root)).toContain('scripts/cycle-a.ts');
    });

    it('fails closed on an unresolved repository-relative dependency', () => {
      write(root, 'scripts/entry.ts', "import './missing';\n");
      addCiRun(root, 'tsx scripts/entry.ts');

      expect(messages(root)).toContain('cannot resolve repository-relative dependency: ./missing');
    });

    it('fails closed when a repository-relative dependency escapes the repository', () => {
      write(root, 'scripts/entry.ts', "import '../../outside.js';\n");
      addCiRun(root, 'tsx scripts/entry.ts');

      expect(messages(root)).toContain('dependency resolves outside the repository');
    });

    test.each([
      ['.ts', "type Marker = string;\nimport './dangerous.js';"],
      ['.tsx', "const marker = <div />;\nimport './dangerous.js';"],
      ['.mts', "type Marker = string;\nimport './dangerous.js';"],
      ['.cts', "type Marker = string;\nrequire('./dangerous.js');"],
      ['.js', "import './dangerous.js';"],
      ['.jsx', "const marker = <div />;\nimport './dangerous.js';"],
      ['.mjs', "import './dangerous.js';"],
      ['.cjs', "require('./dangerous.js');"],
    ])('uses suffix-aware parsing for reachable %s files', (suffix, source) => {
      write(root, `scripts/entry${suffix}`, `${source}\n`);
      write(root, 'scripts/dangerous.js', 'github.rest.pulls.merge({ pull_number: 1 });\n');
      addCiRun(root, `${suffix.includes('ts') ? 'tsx' : 'node'} scripts/entry${suffix}`);

      expect(messages(root)).toContain('scripts/dangerous.js');
    });
  });

  describe('least-privilege permission classification', () => {
    test.each([
      ['write-all', 'permissions:\n  contents: read', 'permissions: write-all'],
      [
        'unknown write scope',
        'permissions:\n  contents: read',
        'permissions:\n  contents: read\n  packages: write',
      ],
      ['omitted permissions', 'permissions:\n  contents: read\n', ''],
      [
        'job override',
        '    runs-on: ubuntu-latest',
        '    permissions: write-all\n    runs-on: ubuntu-latest',
      ],
    ])('rejects %s', (_name, from, to) => {
      replace(root, '.github/workflows/ci.yml', from, to);

      expect(messages(root)).toContain('permissions');
    });

    it('rejects an unclassified workflow even when it requests read access', () => {
      write(
        root,
        '.github/workflows/new-workflow.yml',
        workflowWithTopPermissions('contents: read')
      );

      expect(messages(root)).toContain('workflow is not explicitly classified');
    });
  });

  describe('Dependabot application dependency policy', () => {
    test.each([
      ['npm major ignore', 'update-types: [version-update:semver-major]', 'update-types: [minor]'],
      ['development group', 'dependency-type: development', 'dependency-type: production'],
      ['production group', 'production-dependencies:', 'runtime-dependencies:'],
    ])('rejects drift in the %s', (_name, from, to) => {
      replace(root, '.github/dependabot.yml', from, to);

      expect(messages(root)).toContain('npm');
    });
  });
});
