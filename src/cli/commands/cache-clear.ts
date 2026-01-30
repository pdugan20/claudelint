/**
 * cache-clear command - Clear validation cache
 */

import { Command } from 'commander';
import { ValidationCache } from '../../utils/cache';

/**
 * Register the cache-clear command
 *
 * @param program - Commander program instance
 */
export function registerCacheClearCommand(program: Command): void {
  program
    .command('cache-clear')
    .description('Clear validation cache')
    .option('--cache-location <path>', 'Cache directory', '.claudelint-cache')
    .action((options: { cacheLocation?: string }) => {
      const cache = new ValidationCache({
        enabled: true,
        location: options.cacheLocation || '.claudelint-cache',
        strategy: 'content',
      });

      try {
        cache.clear();
        console.log('Cache cleared successfully');
        process.exit(0);
      } catch (error) {
        console.error('[ERROR] Failed to clear cache:', error);
        process.exit(1);
      }
    });
}
