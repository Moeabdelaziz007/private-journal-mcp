// ABOUTME: Unit tests for journal writing functionality
// ABOUTME: Tests file system operations, timestamps, and formatting


import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { JournalManager } from '../src/journal';
import { AixConfig } from '../src/config';
import { KnowledgeGraph } from '../src/knowledgeGraph';

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

function getFormattedDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

describe('JournalManager', () => {
  let projectTempDir: string;
  let userTempDir: string;
  let journalManager: JournalManager;
  let knowledgeGraphService: KnowledgeGraph;

  beforeEach(async () => {
    projectTempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'journal-project-test-'));
    userTempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'journal-user-test-'));
    
    const config = { ...mockConfig, settings: { project_journal_path: projectTempDir, user_journal_path: path.join(userTempDir, '.private-journal') } };
    knowledgeGraphService = new KnowledgeGraph();
    journalManager = new JournalManager(config, knowledgeGraphService, userTempDir);
  });

  afterEach(async () => {
    await fs.rm(projectTempDir, { recursive: true, force: true });
    await fs.rm(userTempDir, { recursive: true, force: true });
  });

  test('writes journal entry to correct file structure', async () => {
    const content = 'This is a test journal entry.';
    
    await journalManager.writeEntry(content);

    const today = new Date();
    const dateString = getFormattedDate(today);
    const dayDir = path.join(projectTempDir, dateString);
    
    const files = await fs.readdir(dayDir);
    expect(files.length).toBeGreaterThan(0);
    
    const mdFile = files.find(f => f.endsWith('.md'));
    expect(mdFile).toBeDefined();
  });

  test('writes project notes to project directory', async () => {
    const thoughts = {
      project_notes: 'The architecture is solid'
    };
    
    await journalManager.writeThoughts(thoughts);

    const today = new Date();
    const dateString = getFormattedDate(today);
    const projectDayDir = path.join(projectTempDir, dateString);
    
    const projectFiles = await fs.readdir(projectDayDir);
    expect(projectFiles.length).toBeGreaterThan(0);
    
    const userDayDir = path.join(userTempDir, '.private-journal', dateString);
    await expect(fs.access(userDayDir)).rejects.toThrow();
  });

  test('writes user thoughts to user directory', async () => {
    const thoughts = {
      feelings: 'I feel great about this feature'
    };
    
    await journalManager.writeThoughts(thoughts);

    const today = new Date();
    const dateString = getFormattedDate(today);
    const userDayDir = path.join(userTempDir, '.private-journal', dateString);
    
    const userFiles = await fs.readdir(userDayDir);
    expect(userFiles.length).toBeGreaterThan(0);
    
    const projectDayDir = path.join(projectTempDir, dateString);
    await expect(fs.access(projectDayDir)).rejects.toThrow();
  });
});
