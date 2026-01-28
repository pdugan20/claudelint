/**
 * Setup file to register custom Jest matchers
 * Import this in test files that use custom matchers
 */

import { matchers } from './matchers';

// Extend Jest with custom matchers
expect.extend(matchers);
