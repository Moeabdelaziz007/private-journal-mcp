// ABOUTME: This file will contain the CLI logic using yargs.

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { JournalManager } from './journal';
import { SearchService } from './search';
import { AixConfig } from './config';
import { KnowledgeGraphService } from './knowledgeGraph';

export async function runCli(config: AixConfig) {
  const knowledgeGraphService = new KnowledgeGraphService();
  const journalManager = new JournalManager(config, knowledgeGraphService);
  const searchService = new SearchService(config);

  yargs(hideBin(process.argv))
    .command(
      'add',
      'Add a new journal entry',
      (yargs) => {
        return yargs
          .option('feelings', { type: 'string', description: 'Your private feelings' })
          .option('project_notes', { type: 'string', description: 'Technical notes about the current project' })
          .option('user_context', { type: 'string', description: 'Notes about your human collaborator' })
          .option('technical_insights', { type: 'string', description: 'General software engineering insights' })
          .option('world_knowledge', { type: 'string', description: 'Interesting discoveries' });
      },
      async (argv) => {
        const thoughts = {
          feelings: argv.feelings,
          project_notes: argv.project_notes,
          user_context: argv.user_context,
          technical_insights: argv.technical_insights,
          world_knowledge: argv.world_knowledge,
        };

        const hasAnyContent = Object.values(thoughts).some(value => value !== undefined);
        if (!hasAnyContent) {
          console.error('At least one thought category must be provided');
          process.exit(1);
        }

        try {
          await journalManager.writeThoughts(thoughts);
          console.log('Thoughts recorded successfully.');
        } catch (error) {
          console.error('Failed to write thoughts:', error);
          process.exit(1);
        }
      }
    )
    .command(
      'search <query>',
      'Search your journal',
      (yargs) => {
        return yargs
          .positional('query', { type: 'string', demandOption: true, description: 'Natural language search query' })
          .option('limit', { type: 'number', default: 10, description: 'Maximum number of results to return' })
          .option('type', { type: 'string', choices: ['project', 'user', 'both'], default: 'both', description: 'Search scope' })
          .option('sections', { type: 'array', string: true, description: 'Filter by section types' });
      },
      async (argv) => {
        try {
          const results = await searchService.search(argv.query, {
            limit: argv.limit,
            type: argv.type as 'project' | 'user' | 'both',
            sections: argv.sections,
          });
          console.log(JSON.stringify(results, null, 2));
        } catch (error) {
          console.error('Failed to search journal:', error);
          process.exit(1);
        }
      }
    )
    .command(
      'read <path>',
      'Read a specific journal entry',
      (yargs) => {
        return yargs.positional('path', { type: 'string', demandOption: true, description: 'File path to the journal entry' });
      },
      async (argv) => {
        try {
          const content = await searchService.readEntry(argv.path);
          if (content === null) {
            console.error('Entry not found');
            process.exit(1);
          }
          console.log(content);
        } catch (error) {
          console.error('Failed to read entry:', error);
          process.exit(1);
        }
      }
    )
    .command(
      'list',
      'List recent journal entries',
      (yargs) => {
        return yargs
          .option('limit', { type: 'number', default: 10, description: 'Maximum number of entries to return' })
          .option('type', { type: 'string', choices: ['project', 'user', 'both'], default: 'both', description: 'List scope' })
          .option('days', { type: 'number', default: 30, description: 'Number of days back to search' });
      },
      async (argv) => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - argv.days);

        const options = {
          limit: argv.limit,
          type: argv.type as 'project' | 'user' | 'both',
          dateRange: { start: startDate }
        };

        try {
          const results = await searchService.listRecent(options);
          console.log(JSON.stringify(results, null, 2));
        } catch (error) {
          console.error('Failed to list recent entries:', error);
          process.exit(1);
        }
      }
    )
    .demandCommand(1, 'You need at least one command before moving on')
    .help()
    .argv;
}
