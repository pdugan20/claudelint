// Validate hooks command handler
import { HooksValidator } from './validators/hooks';
import { Reporter } from './utils/reporting';

export async function validateHooks(options: {
  path?: string;
  verbose?: boolean;
  warningsAsErrors?: boolean;
}): Promise<void> {
  const validator = new HooksValidator(options);
  const reporter = new Reporter({
    verbose: options.verbose,
    warningsAsErrors: options.warningsAsErrors,
  });

  reporter.section('Validating hooks.json files...');

  const result = await validator.validate();

  reporter.report(result, 'Hooks');

  process.exit(reporter.getExitCode(result));
}
