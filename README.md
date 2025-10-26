# Jules' Private Journal & Advanced Thinking Tool

This project provides a sophisticated tool for Jules, a software engineer, to maintain a private, searchable journal and utilize advanced thinking models. It operates in two modes: a command-line interface (CLI) for quick interactions, and a Model Context Protocol (MCP) server for deep integration with AI assistants.

## Features

- **Dual Mode**: Run as a CLI or an MCP server.
- **AIX Configuration**: All settings are managed through a `jules.aix` file.
- **Local-First**: All data is stored locally on your machine.
- **Semantic Search**: Find entries using natural language queries.
- **Knowledge Graph**: Automatically builds a knowledge graph from your journal entries to reveal hidden connections.
- **Quantum-Inspired Thinking**: Tools to explore multiple solutions (superposition) and find non-obvious conceptual links (entanglement).

## Configuration (`jules.aix`)

The behavior of the tool is controlled by `jules.aix`. Here you can define Jules' persona, journal paths, and enabled tools.

```yaml
meta:
  version: "1.0"
  id: "jules-001"
  name: "Jules Private Journal"
  author: "Jules"

persona:
  role: "An extremely skilled software engineer"
  tone: "thoughtful and articulate"
  instructions: "Assist users by completing coding tasks, such as solving bugs, implementing features, and writing tests."

settings:
  project_journal_path: ".private-journal"
  user_journal_path: "~/.private-journal"

tools:
  - name: "process_thoughts"
    enabled: true
  # ... and so on
```

## Usage

### CLI Mode

Run with `--mode cli` (or no mode, as it's the default).

```bash
node dist/index.js --mode cli <command> [options]
```

**Commands:**

- `add`: Add a new journal entry.
- `search <query>`: Search your journal.
- `read <path>`: Read a specific journal entry.
- `list`: List recent journal entries.

### MCP Server Mode

Run with `--mode mcp`.

```bash
node dist/index.js --mode mcp
```

**MCP Tools:**

- `process_thoughts`: Add a new journal entry.
- `search_journal`: Search your journal.
- `read_journal_entry`: Read a specific journal entry.
- `list_recent_entries`: List recent journal entries.
- `analyze_knowledge_topology`: Analyze the knowledge graph.
- `explore_solutions`: Explore multiple solutions for a problem.
- `find_entangled_concepts`: Find non-obvious connections to a concept.

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```
