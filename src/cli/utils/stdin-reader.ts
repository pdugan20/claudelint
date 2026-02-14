/**
 * stdin reader utility
 *
 * Reads content from stdin for --stdin mode.
 * Buffers full input before returning.
 */

/**
 * Read all content from stdin
 *
 * @param timeoutMs - Timeout in milliseconds (default: 5000)
 * @returns Promise resolving to the stdin content
 * @throws Error if stdin times out or is a TTY with no piped input
 */
export function readStdin(timeoutMs = 5000): Promise<string> {
  return new Promise((resolve, reject) => {
    // Detect if stdin is a TTY (no piped input)
    if (process.stdin.isTTY) {
      reject(
        new Error(
          'No input on stdin. Pipe content or use files instead.\n' +
            'Example: cat CLAUDE.md | claudelint --stdin --stdin-filename CLAUDE.md'
        )
      );
      return;
    }

    const chunks: Buffer[] = [];
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        process.stdin.destroy();
        reject(
          new Error(
            `stdin timed out after ${timeoutMs}ms. Ensure input is piped.\n` +
              'Example: cat CLAUDE.md | claudelint --stdin --stdin-filename CLAUDE.md'
          )
        );
      }
    }, timeoutMs);

    process.stdin.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    process.stdin.on('end', () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve(Buffer.concat(chunks).toString('utf-8'));
      }
    });

    process.stdin.on('error', (err: Error) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        reject(new Error(`Failed to read stdin: ${err.message}`));
      }
    });

    process.stdin.resume();
  });
}
