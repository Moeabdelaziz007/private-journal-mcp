// ABOUTME: This file will contain the logic for reading and parsing the jules.aix config file.

import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'js-yaml';

export interface AixConfig {
  meta: {
    version: string;
    id: string;
    name: string;
    author: string;
  };
  persona: {
    role: string;
    tone: string;
    instructions: string;
  };
  settings: {
    project_journal_path: string;
    user_journal_path: string;
  };
  tools: {
    name: string;
    enabled: boolean;
  }[];
}

export async function loadConfig(): Promise<AixConfig> {
  const configPath = path.resolve(process.cwd(), 'jules.aix');
  try {
    const fileContent = await fs.readFile(configPath, 'utf8');
    const config = yaml.load(fileContent) as AixConfig;
    return config;
  } catch (error) {
    console.error('Failed to load jules.aix:', error);
    throw new Error('Could not load or parse jules.aix');
  }
}
