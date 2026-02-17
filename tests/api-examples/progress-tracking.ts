// Corresponds to: website/api/recipes.md — "Progress Tracking"
import { ClaudeLint } from 'claude-code-lint';

async function trackProgress() {
  const linter = new ClaudeLint({
    onStart: (fileCount) => {
      console.log(`Starting validation of ${fileCount} files`);
    },
    onProgress: (file, index, total) => {
      const percent = Math.round((index / total) * 100);
      console.log(`[${percent}%] ${file}`);
    },
    onComplete: (results) => {
      const totalErrors = results.reduce((sum, r) => sum + r.errorCount, 0);
      console.log(`Completed with ${totalErrors} total errors`);
    },
  });

  await linter.lintFiles(['**/*.md']);
}

trackProgress();
