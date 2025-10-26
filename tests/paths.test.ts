// ABOUTME: Unit tests for path resolution logic
// ABOUTME: Ensures journal paths are correctly determined across platforms

import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs/promises';
import { resolveUserJournalPath, resolveProjectJournalPath } from '../src/paths';
import { AixConfig } from '../src/config';

// Mock config for testing
const mockConfig: AixConfig = {
  meta: {
    version: "1.0",
    id: "jules-001",
    name: "Jules Private Journal",
    author: "Jules",
  },
  persona: {
    role: "An extremely skilled software engineer",
    tone: "thoughtful and articulate",
    instructions: "Assist users by completing coding tasks, such as solving bugs, implementing features, and writing tests.",
  },
  settings: {
    project_journal_path: ".private-journal",
    user_journal_path: "~/.private-journal",
  },
  tools: [],
};

describe('Path Resolution', () => {
  let tempHomeDir: string;

  beforeEach(async () => {
    // Create a temporary directory to act as a fake home directory
    tempHomeDir = await fs.mkdtemp(path.join(os.tmpdir(), 'home-test-'));
  });

  afterEach(async () => {
    // Clean up the temporary home directory
    await fs.rm(tempHomeDir, { recursive: true, force: true });
  });

  describe('resolveUserJournalPath', () => {
    test('should resolve to the mocked home directory', () => {
      const result = resolveUserJournalPath(mockConfig, tempHomeDir);
      const expectedPath = path.join(tempHomeDir, '.private-journal');
      expect(result).toBe(expectedPath);
    });

    test('should handle custom user path from config', () => {
      const customConfig = { ...mockConfig, settings: { ...mockConfig.settings, user_journal_path: '~/custom-journal' } };
      const result = resolveUserJournalPath(customConfig, tempHomeDir);
      const expectedPath = path.join(tempHomeDir, 'custom-journal');
      expect(result).toBe(expectedPath);
    });
  });

  describe('resolveProjectJournalPath', () => {
    test('should resolve to the current working directory', () => {
      const result = resolveProjectJournalPath(mockConfig);
      const expectedPath = path.join(process.cwd(), '.private-journal');
      expect(result).toBe(expectedPath);
    });
  });
});
