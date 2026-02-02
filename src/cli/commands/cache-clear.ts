/**
 * cache-clear command - Clear validation cache
 */

import { Command } from 'commander';
import { ValidationCache } from '../../utils/cache';
import { logger } from '../utils/logger';

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
        logger.success('Cache cleared successfully');
        process.exit(0);
      } catch (error) {
        logger.error(`Failed to clear cache: ${String(error)}`);
        process.exit(1);
      }
    });
}
