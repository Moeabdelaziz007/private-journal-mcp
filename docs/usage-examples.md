# Usage Examples

This document provides practical examples for using the Private Journal MCP with vector database features.

## Basic Usage Examples

### 1. Adding Entries with Local Embeddings (Default)

```bash
# Add feelings
node dist/index.js add --feelings "Had a productive day working on the new feature"

# Add project notes
node dist/index.js add --project_notes "Implemented vector search with ChromaDB. Performance is excellent!"

# Add technical insights
node dist/index.js add --technical_insights "Learned that vector databases use HNSW algorithm for efficient similarity search"

# Add multiple sections at once
node dist/index.js add \
  --feelings "Excited about the new architecture" \
  --project_notes "Refactored the embedding service" \
  --technical_insights "Semantic search is much better than keyword search"
```

### 2. Using OpenAI Embeddings

```bash
# Set your API key
export OPENAI_API_KEY="sk-your-api-key-here"

# Add entries with OpenAI embeddings
node dist/index.js --embedding-provider openai add \
  --project_notes "Integrated OpenAI embeddings for higher quality search"

# Search with OpenAI embeddings
node dist/index.js --embedding-provider openai search \
  "how to improve database performance"
```

### 3. Using Google Gemini Embeddings

```bash
# Set your API key
export GEMINI_API_KEY="your-gemini-api-key"

# Add entries with Gemini embeddings
node dist/index.js --embedding-provider gemini add \
  --technical_insights "Vector databases excel at semantic similarity search"

# Search with Gemini embeddings
node dist/index.js --embedding-provider gemini search \
  "optimization techniques for AI applications" \
  --limit 5
```

## Search Examples

### Basic Search

```bash
# Simple search
node dist/index.js search "database optimization"

# Search with limit
node dist/index.js search "performance improvements" --limit 5

# Search specific type (project or user)
node dist/index.js search "debugging tips" --type user

# Search with section filter
node dist/index.js search "architecture" --sections "Technical Insights"
```

### Advanced Search

```bash
# Search recent entries from last 7 days
node dist/index.js list --days 7

# Search recent project notes only
node dist/index.js list --type project --limit 20

# Semantic search across all entries
node dist/index.js search "how to handle async operations in nodejs"
```

## Reading Entries

```bash
# List recent entries to find the path
node dist/index.js list --limit 5

# Read a specific entry (replace with actual path from list output)
node dist/index.js read "/path/to/.private-journal/2025-11-04/14-30-45-123456.md"
```

## Working Without Vector Store

Sometimes you might want to use the traditional file-based approach:

```bash
# Disable vector store
node dist/index.js --use-vector-store false add \
  --feelings "Testing legacy mode"

# Search without vector store (slower, but works offline)
node dist/index.js --use-vector-store false search "test"
```

## Workflow Examples

### Daily Journal Routine

```bash
#!/bin/bash
# Save as journal-daily.sh

# Morning: Record initial thoughts
node dist/index.js add \
  --feelings "Starting the day fresh" \
  --project_notes "Planning to work on authentication module"

# Afternoon: Technical insights
node dist/index.js add \
  --technical_insights "JWT tokens should be stored in httpOnly cookies for security"

# Evening: Reflection
node dist/index.js add \
  --feelings "Made good progress today" \
  --world_knowledge "Learned about vector embeddings and semantic search"

# Review today's entries
node dist/index.js list --days 1
```

### Research Session

```bash
#!/bin/bash
# Save as journal-research.sh

TOPIC="Machine Learning Optimization"

# Start research
node dist/index.js add \
  --technical_insights "Researching $TOPIC" \
  --project_notes "Need to optimize model inference time"

# ... do research ...

# Record findings
node dist/index.js add \
  --technical_insights "Quantization can reduce model size by 4x without significant accuracy loss" \
  --world_knowledge "ONNX Runtime provides optimized inference across platforms"

# Later: Find related research
node dist/index.js search "model optimization techniques"
```

### Project Documentation

```bash
#!/bin/bash
# Save as journal-project-notes.sh

PROJECT="E-commerce API"

# Architecture decisions
node dist/index.js add \
  --project_notes "[$PROJECT] Using microservices architecture with event-driven communication" \
  --technical_insights "Event sourcing helps maintain audit trail"

# Implementation notes
node dist/index.js add \
  --project_notes "[$PROJECT] Implemented payment gateway integration with Stripe" \
  --technical_insights "Always validate webhooks to prevent fraudulent requests"

# Search project-specific notes
node dist/index.js search "$PROJECT architecture decisions" --type project
```

## Embedding Provider Comparison

### Quality Test

```bash
# Test the same query with different providers

# Local embeddings
node dist/index.js --embedding-provider local search \
  "best practices for error handling" > results-local.json

# OpenAI embeddings
node dist/index.js --embedding-provider openai search \
  "best practices for error handling" > results-openai.json

# Gemini embeddings
node dist/index.js --embedding-provider gemini search \
  "best practices for error handling" > results-gemini.json

# Compare results
diff results-local.json results-openai.json
```

## Integration Examples

### Shell Alias

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
# Quick journal entry
alias jf='node /path/to/private-journal-mcp/dist/index.js add --feelings'
alias jp='node /path/to/private-journal-mcp/dist/index.js add --project_notes'
alias jt='node /path/to/private-journal-mcp/dist/index.js add --technical_insights'
alias js='node /path/to/private-journal-mcp/dist/index.js search'
alias jl='node /path/to/private-journal-mcp/dist/index.js list'

# With Gemini embeddings by default
alias jfg='node /path/to/private-journal-mcp/dist/index.js --embedding-provider gemini add --feelings'
alias jsg='node /path/to/private-journal-mcp/dist/index.js --embedding-provider gemini search'
```

Usage:
```bash
jf "Great debugging session today"
jp "Implemented new caching layer with Redis"
jt "Learned about SOLID principles in depth"
js "redis caching strategies"
jl --days 7
```

### Git Hook Integration

Create `.git/hooks/post-commit`:

```bash
#!/bin/bash
# Auto-journal git commits

COMMIT_MSG=$(git log -1 --pretty=%B)
PROJECT=$(basename $(git rev-parse --show-toplevel))

node /path/to/private-journal-mcp/dist/index.js add \
  --project_notes "[$PROJECT] $COMMIT_MSG"
```

### VS Code Task

Add to `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Journal: Add Insight",
      "type": "shell",
      "command": "node",
      "args": [
        "${workspaceFolder}/dist/index.js",
        "add",
        "--technical_insights",
        "${input:insight}"
      ],
      "problemMatcher": []
    },
    {
      "label": "Journal: Search",
      "type": "shell",
      "command": "node",
      "args": [
        "${workspaceFolder}/dist/index.js",
        "search",
        "${input:query}"
      ],
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "insight",
      "type": "promptString",
      "description": "Technical insight to record"
    },
    {
      "id": "query",
      "type": "promptString",
      "description": "Search query"
    }
  ]
}
```

## Automation Examples

### Cron Job for Daily Summaries

```bash
# Add to crontab: crontab -e
# Run every day at 6 PM
0 18 * * * cd /path/to/private-journal-mcp && node dist/index.js list --days 1 | mail -s "Daily Journal Summary" you@example.com
```

### GitHub Actions Workflow

```yaml
name: Project Journal Update
on:
  push:
    branches: [main]

jobs:
  journal:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Record deployment
        run: |
          cd /path/to/private-journal-mcp
          node dist/index.js add \
            --project_notes "Deployed ${GITHUB_REPOSITORY} to production"
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
```

## Tips and Tricks

### 1. Batch Adding Entries

```bash
# Read from file
while IFS= read -r line; do
  node dist/index.js add --technical_insights "$line"
done < insights.txt
```

### 2. Export to Markdown

```bash
# Export recent entries
node dist/index.js list --days 30 --type both | \
  jq -r '.[] | "# \(.timestamp | strftime("%Y-%m-%d"))\n\n\(.text)\n"' > journal-export.md
```

### 3. Search and Open in Editor

```bash
# Search and open in VS Code
ENTRY=$(node dist/index.js search "authentication" --limit 1 | jq -r '.[0].path')
code "$ENTRY"
```

### 4. Stats and Analytics

```bash
# Count entries by type
node dist/index.js list --days 365 | jq '[.[] | .type] | group_by(.) | map({type: .[0], count: length})'

# Most common sections
node dist/index.js list --days 365 | jq '[.[].sections[]] | group_by(.) | map({section: .[0], count: length}) | sort_by(.count) | reverse'
```

## Troubleshooting Examples

### Check if ChromaDB is accessible

```bash
curl http://localhost:8000/api/v1/heartbeat
```

### Test embedding generation

```bash
# Test local embeddings
node dist/index.js --use-vector-store false add --feelings "test" && echo "Local embeddings working!"

# Test OpenAI
node dist/index.js --embedding-provider openai --use-vector-store false add --feelings "test" && echo "OpenAI embeddings working!"

# Test Gemini
node dist/index.js --embedding-provider gemini --use-vector-store false add --feelings "test" && echo "Gemini embeddings working!"
```

### Debug mode

```bash
# Enable verbose logging (if implemented)
DEBUG=* node dist/index.js add --feelings "debug test"

# Or check what's happening
node dist/index.js add --feelings "test" 2>&1 | tee debug.log
```
