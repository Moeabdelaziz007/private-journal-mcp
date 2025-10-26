# Jules' Private Journal CLI

A command-line tool for maintaining a private, searchable journal. This tool is designed to help Jules, a software engineer, keep track of thoughts, feelings, and technical insights in a secure and local manner.

## Features

- **Local-First**: All data is stored locally on your machine.
- **Semantic Search**: Find entries using natural language queries.
- **Organized**: Separate sections for different types of thoughts.
- **CLI-Based**: A simple and powerful command-line interface.

## Installation

This tool is run directly from the project directory.

## Usage

### Add a New Entry

```bash
node dist/index.js add [options]
```

**Options:**

- `--feelings <string>`: Your private feelings.
- `--project_notes <string>`: Technical notes about the current project.
- `--user_context <string>`: Notes about your human collaborator.
- `--technical_insights <string>`: General software engineering insights.
- `--world_knowledge <string>`: Interesting discoveries.

### Search Your Journal

```bash
node dist/index.js search <query> [options]
```

**Arguments:**

- `<query>`: Natural language search query.

**Options:**

- `--limit <number>`: Maximum number of results to return (default: 10).
- `--type <string>`: Search scope (`project`, `user`, or `both`; default: `both`).
- `--sections <array>`: Filter by section types.

### Read an Entry

```bash
node dist/index.js read <path>
```

**Arguments:**

- `<path>`: File path to the journal entry.

### List Recent Entries

```bash
node dist/index.js list [options]
```

**Options:**

- `--limit <number>`: Maximum number of entries to return (default: 10).
- `--type <string>`: List scope (`project`, `user`, or `both`; default: `both`).
- `--days <number>`: Number of days back to search (default: 30).

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```
