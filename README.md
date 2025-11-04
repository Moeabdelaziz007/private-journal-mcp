# Jules' Private Journal CLI

A command-line tool for maintaining a private, searchable journal with advanced vector database integration. This tool is designed to help Jules, a software engineer, keep track of thoughts, feelings, and technical insights with powerful semantic search capabilities.

## Features

- **Local-First**: All data is stored locally on your machine.
- **Vector Database**: Powered by ChromaDB for scalable semantic search.
- **Multiple Embedding Providers**: Choose between local (Xenova), OpenAI, or Google Gemini embeddings.
- **Semantic Search**: Find entries using natural language queries with advanced similarity matching.
- **Organized**: Separate sections for different types of thoughts.
- **CLI-Based**: A simple and powerful command-line interface.

## Installation

This tool is run directly from the project directory.

```bash
npm install
npm run build
```

## Prerequisites

### For Vector Database (Recommended)

The tool uses ChromaDB for vector storage. You need to run a Chroma server:

```bash
# Using Docker
docker run -p 8000:8000 chromadb/chroma

# Or using Python
pip install chromadb
chroma run --path /path/to/chroma/data
```

### For OpenAI Embeddings (Optional)

Set your OpenAI API key:
```bash
export OPENAI_API_KEY=your-api-key-here
```

### For Google Gemini Embeddings (Optional)

Set your Google API key:
```bash
export GEMINI_API_KEY=your-api-key-here
# or
export GOOGLE_API_KEY=your-api-key-here
```

## Usage

### Global Options

- `--embedding-provider <provider>`: Choose embedding provider (`local`, `openai`, or `gemini`; default: `local`)
- `--use-vector-store <boolean>`: Enable/disable vector database (default: `true`)

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

**Examples:**

```bash
# Using local embeddings (default)
node dist/index.js add --feelings "Feeling accomplished today"

# Using OpenAI embeddings
node dist/index.js --embedding-provider openai add --project_notes "Implemented vector search"

# Using Gemini embeddings
node dist/index.js --embedding-provider gemini add --technical_insights "Learned about ChromaDB"
```

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

**Examples:**

```bash
# Search with local embeddings
node dist/index.js search "database optimization"

# Search with Gemini embeddings
node dist/index.js --embedding-provider gemini search "how to improve performance" --limit 5
```

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

## Embedding Providers

### Local Embeddings (Default)
- Model: `Xenova/all-MiniLM-L6-v2`
- Pros: Free, private, no API calls required
- Cons: Slower than cloud-based options
- Best for: Privacy-conscious users, offline usage

### OpenAI Embeddings
- Model: `text-embedding-3-small`
- Pros: Fast, high-quality embeddings
- Cons: Requires API key and costs money
- Best for: Production use with high accuracy requirements

### Google Gemini Embeddings
- Model: `text-embedding-004`
- Pros: Fast, high-quality, competitive pricing
- Cons: Requires API key
- Best for: Users already in Google Cloud ecosystem

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   CLI Interface                      │
└───────────────────┬─────────────────────────────────┘
                    │
         ┌──────────┴──────────┐
         │                     │
         ▼                     ▼
┌────────────────┐    ┌────────────────┐
│ Journal        │    │ Search         │
│ Manager        │    │ Service        │
└────────┬───────┘    └───────┬────────┘
         │                    │
         └──────────┬─────────┘
                    │
         ┌──────────┴──────────┐
         │                     │
         ▼                     ▼
┌────────────────┐    ┌────────────────┐
│ Vector Store   │    │ Embedding      │
│ Service        │    │ Service        │
└────────┬───────┘    └───────┬────────┘
         │                    │
         ▼                    ▼
┌────────────────┐    ┌────────────────┐
│ ChromaDB       │    │ • Local        │
│                │    │ • OpenAI       │
│                │    │ • Gemini       │
└────────────────┘    └────────────────┘
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

## Troubleshooting

### ChromaDB Connection Issues

If you see connection errors, make sure ChromaDB is running:
```bash
# Check if Chroma is accessible
curl http://localhost:8000/api/v1/heartbeat
```

### Disabling Vector Store

For testing or when ChromaDB is unavailable:
```bash
node dist/index.js --use-vector-store false add --feelings "test"
```

## License

MIT
