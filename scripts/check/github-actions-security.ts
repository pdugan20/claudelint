#!/usr/bin/env ts-node
/** Enforce repository-owned GitHub automation security policy. */

import { join } from 'path';
import { log } from '../util/logger';
import { checkGitHubActionsSecurity } from './github-actions-security-policy';

const violations = checkGitHubActionsSecurity(join(__dirname, '../..'));

if (violations.length > 0) {
  log.error(`GitHub automation policy failed with ${violations.length} violation(s):`);
  for (const violation of violations) {
    log.error(`- ${violation}`);
  }
  process.exit(1);
}

log.success('GitHub automation policy passed');
