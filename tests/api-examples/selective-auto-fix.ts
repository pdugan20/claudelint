// Corresponds to: website/api/recipes.md — "Selective Auto-fix"
import { ClaudeLint } from 'claude-code-lint';

async function selectiveFix() {
  const linter = new ClaudeLint({
    fix: (message) => {
      // Only fix formatting issues, not structural problems
      return message.ruleId?.includes('format') || message.ruleId?.includes('style') || false;
    },
  });

  const results = await linter.lintFiles(['**/*.md']);
  await ClaudeLint.outputFixes(results);
}

selectiveFix();
