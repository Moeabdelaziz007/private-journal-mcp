#!/usr/bin/env node

// ABOUTME: Main entry point for the private journal tool.
// Handles command line arguments to start either the CLI or the MCP server.

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { loadConfig } from './config';
import { runCli } from './cli';
import { PrivateJournalServer } from './server';

async function main(): Promise<void> {
  const argv = await yargs(hideBin(process.argv))
    .option('mode', {
      alias: 'm',
      type: 'string',
      description: 'Run mode',
      choices: ['cli', 'mcp'],
      default: 'cli',
    })
    .help()
    .argv;

  try {
    const config = await loadConfig();

    if (argv.mode === 'cli') {
      await runCli(config);
    } else if (argv.mode === 'mcp') {
      const server = new PrivateJournalServer(config);
      await server.run();
    }
  } catch (error) {
    console.error('Failed to start:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
