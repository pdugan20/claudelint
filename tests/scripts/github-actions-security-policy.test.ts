import { createHash } from 'crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { dirname, join } from 'path';
import { checkGitHubActionsSecurity } from '../../scripts/check/github-actions-security-policy';

const REPOSITORY_ROOT = join(__dirname, '../..');
const CHECKOUT_SHA = '3d3c42e5aac5ba805825da76410c181273ba90b1';
const SETUP_NODE_SHA = '249970729cb0ef3589644e2896645e5dc5ba9c38';
const APP_TOKEN_SHA = '0123456789abcdef0123456789abcdef01234567';
const REUSABLE_SHA = 'abcdef0123456789abcdef0123456789abcdef01';
const GITHUB_SCRIPT_SHA = '1111111111111111111111111111111111111111';
const DOCKER_DIGEST = '2'.repeat(64);
const REQUIRED_FILES = [
  '.github/dependabot.yml',
  '.github/workflows/ci.yml',
  '.github/workflows/labeler.yml',
  '.github/workflows/pr-lint.yml',
  '.github/workflows/pr-size.yml',
  '.github/workflows/publish.yml',
  '.github/workflows/stale.yml',
  '.github/workflows/upstream-watch.yml',
  '.github/workflows/welcome.yml',
  'package.json',
  'scripts/check/github-automation-profiles.json',
  'scripts/check/github-actions-provenance.json',
  'scripts/util/package-plugin.sh',
] as const;

function write(root: string, path: string, content: string): void {
  const absolutePath = join(root, path);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, content);
}

function copyBaseRepository(root: string): void {
  for (const path of REQUIRED_FILES) {
    write(root, path, readFileSync(join(REPOSITORY_ROOT, path), 'utf8'));
  }
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

function workflow(
  permissions: string,
  steps: string,
  options: { event?: string; jobPermissions?: string } = {}
): string {
  const permissionBlock = permissions
    ? `permissions:\n${permissions
        .split('\n')
        .map((line) => `  ${line}`)
        .join('\n')}\n`
    : '';
  const jobPermissionBlock = options.jobPermissions
    ? `    permissions:\n${options.jobPermissions
        .split('\n')
        .map((line) => `      ${line}`)
        .join('\n')}\n`
    : '';
  return `name: Fixture
on: ${options.event ?? 'push'}
${permissionBlock}jobs:
  fixture:
    runs-on: ubuntu-latest
${jobPermissionBlock}    steps:
${steps}
`;
}

function checkoutStep(persistCredentials = 'false'): string {
  return `      - uses: actions/checkout@${CHECKOUT_SHA} # v7.0.1
        with:
          persist-credentials: ${persistCredentials}`;
}

function setCiWorkflow(
  root: string,
  permissions: string,
  steps: string,
  options: { event?: string; jobPermissions?: string } = {}
): void {
  const event = options.event ?? 'push';
  const source = workflow(permissions, steps, options).replace(
    `on: ${event}\n`,
    `on:\n  ${event}:\n  workflow_dispatch:\n`
  );
  write(root, '.github/workflows/ci.yml', source);
  const provenancePath = join(root, 'scripts/check/github-actions-provenance.json');
  const provenance = JSON.parse(readFileSync(provenancePath, 'utf8')) as Record<string, unknown>;
  for (const action of [
    'actions/download-artifact',
    'actions/upload-artifact',
    'codecov/codecov-action',
  ]) {
    delete provenance[action];
  }
  writeFileSync(provenancePath, `${JSON.stringify(provenance, null, 2)}\n`);
}

function setPrivilegedWorkflow(root: string, steps: string, event = 'pull_request'): void {
  write(root, '.github/workflows/pr-size.yml', workflow('pull-requests: write', steps, { event }));
}

function addProvenance(root: string, action: string, version: string, sha: string): void {
  const path = join(root, 'scripts/check/github-actions-provenance.json');
  const provenance = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
  provenance[action] = { version, sha };
  writeFileSync(path, `${JSON.stringify(provenance, null, 2)}\n`);
}

function addProfile(root: string, path: string, sha256: string): void {
  const manifestPath = join(root, 'scripts/check/github-automation-profiles.json');
  let profiles: Record<string, string> = {};
  try {
    profiles = JSON.parse(readFileSync(manifestPath, 'utf8')) as Record<string, string>;
  } catch {
    // The production manifest is introduced by the implementation under test.
  }
  profiles[path] = sha256;
  write(
    root,
    'scripts/check/github-automation-profiles.json',
    `${JSON.stringify(profiles, null, 2)}\n`
  );
}

describe('GitHub Actions capability policy', () => {
  let root: string;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'claudelint-actions-policy-'));
    copyBaseRepository(root);
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  test('accepts the repository workflows and exact privileged profiles', () => {
    expect(checkGitHubActionsSecurity(root)).toEqual([]);
  });

  test('requires workflow_dispatch on CI for manual default-branch canaries', () => {
    replace(root, '.github/workflows/ci.yml', '  workflow_dispatch:\n', '');

    expect(messages(root)).toContain(
      '.github/workflows/ci.yml: workflow_dispatch trigger is required for manual default-branch canaries'
    );
  });

  describe('effective permissions', () => {
    test.each([
      ['missing workflow and job permissions', '', undefined],
      ['read-all shorthand', 'read-all', undefined],
      ['write-all shorthand', 'write-all', undefined],
      ['dynamic permission', 'contents: ${{ inputs.permission }}', undefined],
      [
        'missing workflow permissions with only a dynamic job map',
        '',
        'contents: ${{ matrix.level }}',
      ],
    ])('fails closed for %s', (_name, permissions, jobPermissions) => {
      setCiWorkflow(root, permissions, '      - run: echo safe', { jobPermissions });

      expect(messages(root)).toContain('permissions');
    });

    test('uses a job permission map as a complete workflow override', () => {
      setCiWorkflow(root, 'contents: write', '      - run: npm run safe', {
        jobPermissions: 'contents: read',
      });
      const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
        scripts: Record<string, string>;
      };
      manifest.scripts.safe = 'bash scripts/safe.sh';
      write(root, 'package.json', `${JSON.stringify(manifest, null, 2)}\n`);
      write(root, 'scripts/safe.sh', 'echo safe\n');

      expect(checkGitHubActionsSecurity(root)).toEqual([]);
    });

    test('accepts an explicit empty permission map as no token access', () => {
      setCiWorkflow(root, '{}', '      - run: echo safe');

      expect(checkGitHubActionsSecurity(root)).toEqual([]);
    });
  });

  describe('capability boundary', () => {
    test.each([
      ['package script', '      - run: npm run safe'],
      ['repository script', '      - run: bash scripts/safe.sh'],
      ['local action', '      - uses: ./.github/actions/safe'],
    ])('allows read-only %s delegation without recursive interpretation', (_name, steps) => {
      setCiWorkflow(root, 'contents: read', steps);
      const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
        scripts: Record<string, string>;
      };
      manifest.scripts.safe = 'bash scripts/safe.sh';
      write(root, 'package.json', `${JSON.stringify(manifest, null, 2)}\n`);
      write(root, 'scripts/safe.sh', 'gh pr merge 17 --squash\n');
      write(
        root,
        '.github/actions/safe/action.yml',
        'name: Safe\nruns:\n  using: composite\n  steps:\n    - run: gh pr merge 17 --squash\n      shell: bash\n'
      );

      expect(checkGitHubActionsSecurity(root)).toEqual([]);
    });

    test.each([
      ['package script', '      - run: npm run safe'],
      ['repository script', '      - run: bash scripts/safe.sh'],
      ['local action', '      - uses: ./.github/actions/safe'],
      ['dynamic command', '      - run: ${{ github.event.pull_request.title }}'],
      ['literal command', '      - run: echo safe'],
    ])('denies privileged %s execution', (_name, steps) => {
      setPrivilegedWorkflow(root, steps);
      const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
        scripts: Record<string, string>;
      };
      manifest.scripts.safe = 'echo safe';
      write(root, 'package.json', `${JSON.stringify(manifest, null, 2)}\n`);
      write(root, 'scripts/safe.sh', 'echo safe\n');
      write(
        root,
        '.github/actions/safe/action.yml',
        'name: Safe\nruns:\n  using: composite\n  steps:\n    - run: echo safe\n      shell: bash\n'
      );

      expect(messages(root)).toContain('merge-capable');
    });

    test('denies untrusted pull request head checkout in a privileged job', () => {
      setPrivilegedWorkflow(
        root,
        `${checkoutStep()}\n          ref: \${{ github.event.pull_request.head.sha }}`,
        'pull_request_target'
      );

      expect(messages(root)).toContain('untrusted');
    });

    test('denies default untrusted checkout on a privileged pull_request job', () => {
      setPrivilegedWorkflow(root, checkoutStep(), 'pull_request');

      expect(messages(root)).toContain('untrusted');
    });

    test('denies default checkout on a privileged pull_request_target job', () => {
      setPrivilegedWorkflow(root, checkoutStep(), 'pull_request_target');

      expect(messages(root)).toContain('untrusted');
    });

    test('rejects a workflow-env-laundered pull request head ref', () => {
      setPrivilegedWorkflow(
        root,
        `${checkoutStep()}\n          ref: \${{ env.PR_HEAD }}`,
        'pull_request_target'
      );
      replace(
        root,
        '.github/workflows/pr-size.yml',
        'on: pull_request_target',
        'on: pull_request_target\nenv:\n  PR_HEAD: ${{ github.event.pull_request.head.sha }}'
      );

      const result = messages(root);
      expect(result).toContain('event-controlled');
      expect(result).toContain('untrusted');
    });

    test('rejects untrusted event expressions in privileged job and step env', () => {
      setPrivilegedWorkflow(
        root,
        `      - uses: actions/setup-node@${SETUP_NODE_SHA} # v6.5.0
        env:
          STEP_REF: \${{ github.event.pull_request.head.sha }}`,
        'pull_request_target'
      );
      replace(
        root,
        '.github/workflows/pr-size.yml',
        '    runs-on: ubuntu-latest',
        '    runs-on: ubuntu-latest\n    env:\n      JOB_REF: ${{ github.event.pull_request.head.ref }}'
      );

      expect(messages(root)).toContain('event-controlled');
    });

    test('rejects every dynamic privileged action input', () => {
      setPrivilegedWorkflow(
        root,
        `      - uses: actions/setup-node@${SETUP_NODE_SHA} # v6.5.0
        with:
          node-version: \${{ env.NODE_VERSION }}`,
        'push'
      );

      expect(messages(root)).toContain('dynamic');
    });

    test('checks Docker digest action inputs before returning from pin validation', () => {
      setPrivilegedWorkflow(
        root,
        `      - uses: docker://example/image@sha256:${DOCKER_DIGEST}
        with:
          ref: \${{ github.event.pull_request.head.sha }}`,
        'pull_request_target'
      );

      expect(messages(root)).toContain('event-controlled');
    });

    test.each([
      ["github['event']", "${{ github['event'].pull_request.head.sha }}"],
      ['full bracket event path', "${{ github['event']['pull_request']['head']['sha'] }}"],
      ['dynamic github namespace', '${{ github[inputs.namespace].pull_request.head.sha }}'],
    ])('rejects %s laundering through privileged env', (_name, expression) => {
      setPrivilegedWorkflow(
        root,
        `      - uses: actions/setup-node@${SETUP_NODE_SHA} # v6.5.0
        env:
          PR_REF: ${expression}`,
        'pull_request_target'
      );

      expect(messages(root)).toContain('event-controlled');
    });

    test('keeps welcome pull_request_target safe only with fixed pinned action inputs', () => {
      replace(
        root,
        '.github/workflows/welcome.yml',
        'Thanks for your first pull request to claudelint!',
        '${{ github.event.pull_request.title }}'
      );

      expect(messages(root)).toContain('event-controlled');
    });
  });

  describe('unbounded GitHub credentials', () => {
    test.each([
      ['quoted bracket', "${{ secrets['RELEASE_PAT'] }}"],
      ['dynamic bracket', '${{ secrets[inputs.name] }}'],
      ['whole namespace', '${{ toJSON(secrets) }}'],
      ['unsupported bracket built-in', "${{ secrets['GITHUB_TOKEN'] }}"],
    ])('rejects %s secret expression in an arbitrary action input', (_name, expression) => {
      setCiWorkflow(
        root,
        'contents: read',
        `      - uses: actions/setup-node@${SETUP_NODE_SHA} # v6.5.0
        with:
          arbitrary-value: "${expression}"`
      );

      expect(messages(root)).toContain('unbounded GitHub token');
    });

    test.each([
      ['quoted bracket', "${{ secrets['RELEASE_PAT'] }}"],
      ['dynamic bracket', '${{ secrets[inputs.name] }}'],
      ['whole namespace', '${{ toJSON(secrets) }}'],
    ])('rejects %s secret expression in arbitrary env', (_name, expression) => {
      setCiWorkflow(
        root,
        'contents: read',
        `      - run: echo safe
        env:
          BOT_CREDENTIAL: "${expression}"`
      );

      expect(messages(root)).toContain('unbounded GitHub token');
    });

    test.each([
      ['quoted bracket', "${{ secrets['RELEASE_PAT'] }}"],
      ['dynamic bracket', '${{ secrets[inputs.name] }}'],
      ['whole namespace', '${{ toJSON(secrets) }}'],
    ])('rejects %s secret expression in a reusable secret input', (_name, expression) => {
      addProvenance(root, 'acme/platform/.github/workflows/build.yml', 'v1.2.3', REUSABLE_SHA);
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
    secrets:
      arbitrary: "${expression}"
`
      );

      expect(messages(root)).toContain('unbounded GitHub token');
    });

    test.each([
      ['quoted bracket', "${{ secrets['RELEASE_PAT'] }}"],
      ['dynamic bracket', '${{ secrets[inputs.name] }}'],
      ['whole namespace', '${{ toJSON(secrets) }}'],
    ])('rejects %s as an extra Codecov secret', (_name, expression) => {
      replace(
        root,
        '.github/workflows/ci.yml',
        '          token: ${{ secrets.CODECOV_TOKEN }}',
        `          token: \${{ secrets.CODECOV_TOKEN }}\n          audit: "${expression}"`
      );

      expect(messages(root)).toContain('unbounded GitHub token');
    });

    test.each([
      ["${{ secrets['RELEASE_PAT'] }}"],
      ['${{ secrets[inputs.name] }}'],
      ['${{ toJSON(secrets) }}'],
    ])('escalates a read-only job using %s and requires an exact profile', (expression) => {
      setCiWorkflow(
        root,
        'contents: read',
        `      - run: echo safe
        env:
          BOT_CREDENTIAL: "${expression}"`
      );

      const result = messages(root);
      expect(result).toContain('unbounded GitHub token');
      expect(result).toContain('exact privileged workflow profile');
    });

    test.each(['BOT_CREDENTIAL', 'APP_PRIVATE_KEY'])(
      'rejects arbitrary custom secret %s regardless of input key',
      (secret) => {
        setCiWorkflow(
          root,
          'contents: read',
          `      - uses: actions/setup-node@${SETUP_NODE_SHA} # v6.5.0
        with:
          arbitrary-value: \${{ secrets.${secret} }}`
        );

        expect(messages(root)).toContain('unbounded GitHub token');
      }
    );

    test('rejects an arbitrary secret passed to a reusable workflow', () => {
      addProvenance(root, 'acme/platform/.github/workflows/build.yml', 'v1.2.3', REUSABLE_SHA);
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
    secrets:
      bot: \${{ secrets.BOT_CREDENTIAL }}
`
      );

      expect(messages(root)).toContain('unbounded GitHub token');
    });

    test('rejects an arbitrary workflow-level secret and escalates every run step', () => {
      setCiWorkflow(root, 'contents: read', '      - run: echo safe');
      replace(
        root,
        '.github/workflows/ci.yml',
        'jobs:',
        'env:\n  BOT_CREDENTIAL: ${{ secrets.BOT_CREDENTIAL }}\njobs:'
      );

      const result = messages(root);
      expect(result).toContain('unbounded GitHub token');
      expect(result).toContain('merge-capable');
    });

    test.each(['GH_TOKEN', 'GITHUB_TOKEN'])('rejects a custom PAT in %s', (name) => {
      setCiWorkflow(
        root,
        'contents: read',
        `      - run: gh api repos/acme/project/issues\n        env:\n          ${name}: \${{ secrets.RELEASE_PAT }}`
      );

      expect(messages(root)).toContain('unbounded GitHub token');
    });

    test('treats a custom PAT as merge capability when checking repository delegation', () => {
      setCiWorkflow(
        root,
        'contents: read',
        `      - run: npm run safe\n        env:\n          GH_TOKEN: \${{ secrets.RELEASE_PAT }}`
      );

      const result = messages(root);
      expect(result).toContain('unbounded GitHub token');
      expect(result).toContain('merge-capable');
    });

    test('applies a later custom PAT to every step in the job', () => {
      setCiWorkflow(
        root,
        'contents: read',
        `      - run: npm run safe
      - run: gh api repos/acme/project/issues
        env:
          GH_TOKEN: \${{ secrets.RELEASE_PAT }}`
      );

      const result = messages(root);
      expect(result).toContain('unbounded GitHub token');
      expect(result).toContain('merge-capable');
    });

    test('treats a job-level custom PAT as merge capability', () => {
      setCiWorkflow(root, 'contents: read', '      - run: npm run safe');
      replace(
        root,
        '.github/workflows/ci.yml',
        '    runs-on: ubuntu-latest',
        '    runs-on: ubuntu-latest\n    env:\n      GH_TOKEN: ${{ secrets.RELEASE_PAT }}'
      );

      const result = messages(root);
      expect(result).toContain('unbounded GitHub token');
      expect(result).toContain('merge-capable');
    });

    test('rejects inherited secrets on an external reusable workflow', () => {
      addProvenance(root, 'acme/platform/.github/workflows/build.yml', 'v1.2.3', REUSABLE_SHA);
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
    secrets: inherit
`
      );

      expect(messages(root)).toContain('unbounded GitHub token');
    });

    test('rejects a custom secret in an Authorization header', () => {
      setCiWorkflow(
        root,
        'contents: read',
        `      - run: |\n          curl -H "Authorization: Bearer \${{ secrets.RELEASE_PAT }}" https://api.github.com/repos/acme/project`
      );

      expect(messages(root)).toContain('unbounded GitHub token');
    });

    test('does not let a built-in token mask a custom secret in the same API sink', () => {
      setCiWorkflow(
        root,
        'contents: read',
        `      - run: |
          curl -H "Authorization: Bearer \${{ secrets.RELEASE_PAT }}" \\
            -H "X-Audit: \${{ secrets.GITHUB_TOKEN }}" \\
            https://api.github.com/repos/acme/project`
      );

      expect(messages(root)).toContain('unbounded GitHub token');
    });

    test('rejects a custom Authorization credential in an action input', () => {
      setCiWorkflow(
        root,
        'contents: read',
        `      - uses: actions/setup-node@${SETUP_NODE_SHA} # v6.5.0
        with:
          headers: "Authorization: Bearer \${{ secrets.RELEASE_PAT }}"`
      );

      expect(messages(root)).toContain('unbounded GitHub token');
    });

    test('rejects GitHub App token creation without an exact safe sink', () => {
      addProvenance(root, 'actions/create-github-app-token', 'v2.1.1', APP_TOKEN_SHA);
      setCiWorkflow(
        root,
        'contents: read',
        `      - id: app-token\n        uses: actions/create-github-app-token@${APP_TOKEN_SHA} # v2.1.1\n        with:\n          app-id: \${{ vars.APP_ID }}\n          private-key: \${{ secrets.APP_PRIVATE_KEY }}`
      );

      expect(messages(root)).toContain('unbounded GitHub token');
    });

    test('allows CODECOV_TOKEN only on the exact pinned Codecov action in non-merge CI', () => {
      expect(checkGitHubActionsSecurity(root)).toEqual([]);

      setCiWorkflow(
        root,
        'contents: read',
        '      - run: echo "$CODECOV_TOKEN"\n        env:\n          CODECOV_TOKEN: ${{ secrets.CODECOV_TOKEN }}'
      );
      expect(messages(root)).toContain('CODECOV_TOKEN');
    });

    test('rejects an extra secret on the otherwise exact Codecov action', () => {
      replace(
        root,
        '.github/workflows/ci.yml',
        '          token: ${{ secrets.CODECOV_TOKEN }}',
        '          token: ${{ secrets.CODECOV_TOKEN }}\n          audit: ${{ secrets.RELEASE_PAT }}'
      );

      expect(messages(root)).toContain('unbounded GitHub token');
    });

    test('does not classify npm OIDC publishing as GitHub merge capability', () => {
      expect(messages(root)).not.toContain('Publish to npm: merge-capable');
    });
  });

  describe('inline merge and approval literals', () => {
    test.each([
      ['gh merge', 'gh pr merge 1 --squash'],
      ['gh approval', 'gh pr review 1 --approve'],
      ['REST merge', 'gh api --method PUT repos/acme/project/pulls/1/merge'],
      [
        'expression REST merge',
        'gh api --method PUT "repos/${{ github.repository }}/pulls/${{ github.event.pull_request.number }}/merge"',
      ],
      [
        'REST approval',
        `curl -X POST https://api.github.com/repos/acme/project/pulls/1/reviews -d '{"event":"APPROVE"}'`,
      ],
      [
        'expression REST approval',
        'gh api --method POST "repos/${{ github.repository }}/pulls/${{ github.event.pull_request.number }}/reviews" -f event=APPROVE',
      ],
      ['Octokit merge', 'github.rest.pulls.merge({ pull_number: 1 })'],
      ['Octokit approval', "github.rest.pulls.createReview({ event: 'APPROVE' })"],
      ['GraphQL merge', 'mutation { mergePullRequest(input: $input) { clientMutationId } }'],
      [
        'GraphQL approval',
        'mutation { addPullRequestReview(input: {event: APPROVE}) { clientMutationId } }',
      ],
    ])('rejects %s in a read-only inline run block', (_name, command) => {
      setCiWorkflow(root, 'contents: read', `      - run: |\n          ${command}`);

      expect(messages(root)).toContain('forbidden');
    });

    test.each([
      [
        'action input',
        `      - uses: actions/github-script@${GITHUB_SCRIPT_SHA} # v7.1.0
        with:
          script: |
            github.rest.pulls.merge({ pull_number: 1 })`,
      ],
      [
        'action env',
        `      - uses: actions/github-script@${GITHUB_SCRIPT_SHA} # v7.1.0
        env:
          SCRIPT: gh pr review 1 --approve`,
      ],
    ])('rejects forbidden mutation code in an %s', (_name, step) => {
      addProvenance(root, 'actions/github-script', 'v7.1.0', GITHUB_SCRIPT_SHA);
      setCiWorkflow(root, 'contents: read', step);

      expect(messages(root)).toContain('forbidden');
    });

    test('rejects forbidden mutation code in reusable workflow inputs', () => {
      addProvenance(root, 'acme/platform/.github/workflows/build.yml', 'v1.2.3', REUSABLE_SHA);
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
    with:
      script: gh pr merge 1 --squash
`
      );

      expect(messages(root)).toContain('forbidden');
    });
  });

  describe('pins, checkout, and privileged profiles', () => {
    test('does not parse uses-like text inside an inline run block as an action', () => {
      setCiWorkflow(
        root,
        'contents: read',
        `      - run: |
          cat <<'EOF'
          uses: untrusted/example@main # v1.2.3
          EOF
${checkoutStep()}`
      );

      expect(checkGitHubActionsSecurity(root)).toEqual([]);
    });

    test('rejects mutable action references', () => {
      setCiWorkflow(root, 'contents: read', '      - uses: actions/checkout@v7 # v7.0.1');

      expect(messages(root)).toContain('40-character commit');
    });

    test('requires checkout credentials to be disabled', () => {
      setCiWorkflow(root, 'contents: read', checkoutStep('true'));

      expect(messages(root)).toContain('persist-credentials must be false');
    });

    test.each([
      ['tag-only trigger', "    tags:\n      - 'v*'", "    branches:\n      - 'main'"],
      ['exact permission', '      contents: write', '      contents: read'],
      [
        'normalized release body',
        'gh release create "${{ github.ref_name }}"',
        'gh release create --draft "${{ github.ref_name }}"',
      ],
      ['ordered pinned checkout config', '          fetch-depth: 0', '          fetch-depth: 1'],
      [
        'package script string',
        '"package:plugin": "bash scripts/util/package-plugin.sh"',
        '"package:plugin": "bash scripts/util/package-plugin.sh --fast"',
      ],
    ])('rejects release-profile drift in %s', (_name, from, to) => {
      const path =
        _name === 'package script string' ? 'package.json' : '.github/workflows/publish.yml';
      replace(root, path, from, to);

      expect(messages(root)).toContain('release profile');
    });

    test('rejects release package script provenance drift', () => {
      write(root, 'scripts/util/package-plugin.sh', '#!/usr/bin/env bash\necho changed\n');

      expect(messages(root)).toContain('release profile');
    });

    test.each([
      ['workflow defaults', 'defaults:\n  run:\n    shell: bash'],
      ['workflow env', 'env:\n  RELEASE_MODE: trusted'],
    ])('rejects release-profile drift in %s', (_name, addition) => {
      replace(root, '.github/workflows/publish.yml', '\njobs:\n', `\n${addition}\n\njobs:\n`);

      expect(messages(root)).toContain('release profile');
    });

    test('rejects provenance entries that are not used by any workflow', () => {
      addProvenance(root, 'unused/example', 'v1.2.3', REUSABLE_SHA);

      expect(messages(root)).toContain('unused provenance');
    });

    test.each([
      ['labeler.yml', 'name: Labeler', 'name: Labeler drifted'],
      ['pr-size.yml', 'name: PR Size Label', 'name: PR Size Label drifted'],
      ['stale.yml', 'name: Stale', 'name: Stale drifted'],
      ['welcome.yml', 'name: Welcome', 'name: Welcome drifted'],
    ])('rejects whole-file privileged profile drift in %s', (filename, from, to) => {
      replace(root, `.github/workflows/${filename}`, from, to);

      const result = messages(root);
      expect(result).toContain('exact privileged workflow profile drifted');
      expect(result).toContain(`unused profile entry for .github/workflows/${filename}`);
    });

    test('rejects obfuscated merge code by invalidating the exact privileged profile', () => {
      replace(
        root,
        '.github/workflows/pr-size.yml',
        "          xs_label: 'size/xs'",
        `          xs_label: "github.rest.pulls[['mer','ge'].join('')]()"`
      );

      expect(messages(root)).toContain('exact privileged workflow profile');
    });

    test('rejects unused exact profile entries', () => {
      addProfile(root, '.github/workflows/unused.yml', '3'.repeat(64));

      expect(messages(root)).toContain('unused profile');
    });

    test('rejects a mismatched profile preseeded for an existing read-only workflow', () => {
      addProfile(root, '.github/workflows/ci.yml', '4'.repeat(64));

      expect(messages(root)).toContain('unused profile entry for .github/workflows/ci.yml');
    });

    test('rejects an exact profile preseeded for an existing read-only workflow', () => {
      const source = readFileSync(join(root, '.github/workflows/ci.yml'));
      addProfile(
        root,
        '.github/workflows/ci.yml',
        createHash('sha256').update(source).digest('hex')
      );

      expect(messages(root)).toContain('unused profile entry for .github/workflows/ci.yml');
    });
  });

  describe('Dependabot hardening', () => {
    test.each([
      ['cooldown', '      default-days: 14', '      default-days: 1'],
      ['grouping', '        patterns: ["*"]', '        patterns: ["actions/*"]'],
      [
        'major ignore',
        '        update-types: ["version-update:semver-major"]',
        '        update-types: []',
      ],
      ['interval', '      interval: "weekly"', '      interval: "daily"'],
      ['directory', '    directory: "/"', '    directory: "/packages/cli"'],
    ])('rejects drift in %s', (_name, from, to) => {
      replace(root, '.github/dependabot.yml', from, to);

      expect(messages(root)).toContain('dependabot');
    });
  });
});
