// ABOUTME: Centralized path resolution for journal files and directories
// ABOUTME: Ensures consistent and correct file paths across the application

import * as path from 'path';
import * as os from 'os';
import { AixConfig } from './config';

/**
 * Resolves the absolute path for the user-wide (global) journal directory.
 * This is typically located in the user's home directory.
 * @param config The application configuration object.
 * @param homedirOverride Optional override for the home directory, for testing.
 * @returns The absolute path to the user journal directory.
 */
export function resolveUserJournalPath(config: AixConfig, homedirOverride?: string): string {
  const homedir = homedirOverride || os.homedir();
  const userPath = config.settings.user_journal_path.replace(/^~/, homedir);
  return path.resolve(userPath);
}

/**
 * Resolves the absolute path for the project-specific journal directory.
 * This is located relative to the current working directory of the project.
 * @param config The application configuration object.
 * @returns The absolute path to the project journal directory.
 */
export function resolveProjectJournalPath(config: AixConfig): string {
  return path.resolve(process.cwd(), config.settings.project_journal_path);
}
