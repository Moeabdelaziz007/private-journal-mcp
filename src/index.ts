#!/usr/bin/env node

// ABOUTME: Main entry point for the private journal CLI

import { runCli } from './cli';

async function main(): Promise<void> {
  try {
    await runCli();
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    process.exit(1);
  }
}

main();
