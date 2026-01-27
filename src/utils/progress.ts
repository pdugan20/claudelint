/**
 * Progress Indicator
 *
 * Provides visual feedback during validation with spinners and timing.
 * Automatically detects CI environments and disables spinners when appropriate.
 */

import ora, { Ora } from 'ora';

export class ProgressIndicator {
  private spinner: Ora | null = null;
  private isCI: boolean;
  private enabled: boolean;

  constructor(options?: { enabled?: boolean }) {
    // Detect CI environment
    this.isCI = this.detectCI();
    this.enabled = options?.enabled !== false;
  }

  /**
   * Detect if running in CI environment
   */
  private detectCI(): boolean {
    return !!(
      process.env.CI ||
      process.env.CONTINUOUS_INTEGRATION ||
      process.env.GITHUB_ACTIONS ||
      process.env.GITLAB_CI ||
      process.env.CIRCLECI ||
      process.env.TRAVIS ||
      process.env.JENKINS_URL ||
      // Check if stdin is not a TTY
      !process.stdin.isTTY
    );
  }

  /**
   * Start a progress indicator
   */
  start(message: string): void {
    if (!this.enabled) {
      return;
    }

    if (this.isCI) {
      // In CI, just print the message
      console.log(message);
    } else {
      // In terminal, use spinner
      this.spinner = ora(message).start();
    }
  }

  /**
   * Update the progress message
   */
  update(message: string): void {
    if (!this.enabled) {
      return;
    }

    if (this.isCI) {
      // In CI, print the update
      console.log(message);
    } else if (this.spinner) {
      // In terminal, update spinner text
      this.spinner.text = message;
    }
  }

  /**
   * Mark progress as successful
   */
  succeed(message: string, duration?: number): void {
    if (!this.enabled) {
      return;
    }

    const displayMessage = duration ? `${message} (${duration}ms)` : message;

    if (this.isCI) {
      console.log(`✓ ${displayMessage}`);
    } else if (this.spinner) {
      this.spinner.succeed(displayMessage);
      this.spinner = null;
    } else {
      console.log(`✓ ${displayMessage}`);
    }
  }

  /**
   * Mark progress as failed
   */
  fail(message: string): void {
    if (!this.enabled) {
      return;
    }

    if (this.isCI) {
      console.log(`✗ ${message}`);
    } else if (this.spinner) {
      this.spinner.fail(message);
      this.spinner = null;
    } else {
      console.log(`✗ ${message}`);
    }
  }

  /**
   * Stop the progress indicator without success/failure
   */
  stop(): void {
    if (this.spinner) {
      this.spinner.stop();
      this.spinner = null;
    }
  }

  /**
   * Check if progress indicators are enabled
   */
  isEnabled(): boolean {
    return this.enabled && !this.isCI;
  }
}
