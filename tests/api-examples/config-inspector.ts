// Corresponds to: website/api/recipes.md — "Configuration Inspector"
import { resolveConfig, getFileInfo } from 'claude-code-lint';

async function inspectFile(filePath: string) {
  const [config, info] = await Promise.all([
    resolveConfig(filePath),
    getFileInfo(filePath),
  ]);

  console.log(`File: ${filePath}`);
  console.log(`Ignored: ${info.ignored}`);
  console.log(`Validators: ${info.validators.join(', ')}`);
  console.log('\nActive Rules:');

  for (const [ruleId, ruleConfig] of Object.entries(config.rules || {})) {
    if (ruleConfig !== 'off') {
      console.log(`  ${ruleId}: ${ruleConfig}`);
    }
  }
}

inspectFile('skills/test-skill/SKILL.md');
