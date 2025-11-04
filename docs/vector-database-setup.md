# Vector Database Configuration Guide

This guide explains how to set up and configure the vector database features for the Private Journal MCP.

## Quick Start

### 1. Run ChromaDB Server

The easiest way to get started is using Docker:

```bash
docker run -d \
  -p 8000:8000 \
  -v chroma-data:/chroma/chroma \
  --name chromadb \
  chromadb/chroma
```

Alternatively, use Python:

```bash
# Install ChromaDB
pip install chromadb

# Run the server
chroma run --path ./chroma-data --port 8000
```

### 2. Choose Your Embedding Provider

#### Option A: Local Embeddings (Default - No Setup Required)

Uses `Xenova/all-MiniLM-L6-v2` model running locally via Transformers.js.

```bash
# No additional setup needed
node dist/index.js add --feelings "Testing local embeddings"
```

**Pros:**
- Completely free
- No API keys required
- Works offline
- Full privacy (nothing leaves your machine)

**Cons:**
- Slower initial model download (first run only)
- Slightly lower quality than cloud providers
- Uses local compute resources

#### Option B: OpenAI Embeddings

Uses OpenAI's `text-embedding-3-small` model.

```bash
# Set your API key
export OPENAI_API_KEY="sk-your-api-key-here"

# Use OpenAI embeddings
node dist/index.js --embedding-provider openai add \
  --feelings "Testing OpenAI embeddings"
```

**Pros:**
- High-quality embeddings
- Fast generation
- 1536 dimensions

**Cons:**
- Costs money (pricing: ~$0.02 per 1M tokens)
- Requires internet connection
- Data sent to OpenAI

**Pricing:** Approximately $0.00002 per journal entry

#### Option C: Google Gemini Embeddings

Uses Google's `text-embedding-004` model.

```bash
# Set your API key
export GEMINI_API_KEY="your-gemini-api-key"
# or
export GOOGLE_API_KEY="your-google-api-key"

# Use Gemini embeddings
node dist/index.js --embedding-provider gemini add \
  --technical_insights "Testing Gemini embeddings"
```

**Pros:**
- High-quality embeddings
- Fast generation
- 768 dimensions
- Competitive pricing

**Cons:**
- Requires API key
- Requires internet connection
- Data sent to Google

**Pricing:** Free tier available, then pay-as-you-go

## Environment Variables

Create a `.env` file or set these in your shell:

```bash
# ChromaDB Configuration (optional - defaults to localhost:8000)
CHROMA_HOST=localhost
CHROMA_PORT=8000

# OpenAI Configuration (if using OpenAI embeddings)
OPENAI_API_KEY=sk-your-key-here

# Google Gemini Configuration (if using Gemini embeddings)
GEMINI_API_KEY=your-key-here
# or
GOOGLE_API_KEY=your-key-here
```

## Advanced Configuration

### Custom ChromaDB Host

If running ChromaDB on a different host or port:

```bash
export CHROMA_HOST=192.168.1.100
export CHROMA_PORT=9000
```

### Disabling Vector Store

To use only file-based storage (legacy mode):

```bash
node dist/index.js --use-vector-store false add \
  --feelings "Using file-based storage only"
```

## Production Deployment

### Docker Compose Setup

Create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  chromadb:
    image: chromadb/chroma:latest
    ports:
      - "8000:8000"
    volumes:
      - chroma-data:/chroma/chroma
    environment:
      - IS_PERSISTENT=TRUE
      - ANONYMIZED_TELEMETRY=FALSE
    restart: unless-stopped

volumes:
  chroma-data:
    driver: local
```

Start the service:

```bash
docker-compose up -d
```

### Kubernetes Deployment

Example deployment manifest:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: chromadb
spec:
  replicas: 1
  selector:
    matchLabels:
      app: chromadb
  template:
    metadata:
      labels:
        app: chromadb
    spec:
      containers:
      - name: chromadb
        image: chromadb/chroma:latest
        ports:
        - containerPort: 8000
        env:
        - name: IS_PERSISTENT
          value: "TRUE"
        volumeMounts:
        - name: chroma-data
          mountPath: /chroma/chroma
      volumes:
      - name: chroma-data
        persistentVolumeClaim:
          claimName: chroma-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: chromadb
spec:
  selector:
    app: chromadb
  ports:
  - port: 8000
    targetPort: 8000
```

## Performance Tuning

### ChromaDB Performance

For better performance with large datasets:

```bash
# Run ChromaDB with increased resources
docker run -d \
  -p 8000:8000 \
  -v chroma-data:/chroma/chroma \
  --memory 4g \
  --cpus 2 \
  --name chromadb \
  chromadb/chroma
```

### Embedding Provider Comparison

| Provider | Speed | Quality | Cost | Privacy | Offline |
|----------|-------|---------|------|---------|---------|
| Local    | ⭐⭐⭐  | ⭐⭐⭐⭐ | Free | ✅ Full | ✅ Yes |
| OpenAI   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | $$   | ❌ API | ❌ No  |
| Gemini   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | $    | ❌ API | ❌ No  |

### Recommendations

**For Personal Use:**
- Start with local embeddings
- Upgrade to Gemini if you need better search quality

**For Team/Production:**
- Use OpenAI or Gemini for consistency
- Run ChromaDB in Docker for reliability
- Consider dedicated server for ChromaDB

## Backup and Restore

### Backing Up ChromaDB Data

```bash
# Stop ChromaDB
docker stop chromadb

# Backup the volume
docker run --rm -v chroma-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/chroma-backup.tar.gz /data

# Restart ChromaDB
docker start chromadb
```

### Restoring ChromaDB Data

```bash
# Stop ChromaDB
docker stop chromadb

# Restore the volume
docker run --rm -v chroma-data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/chroma-backup.tar.gz -C /

# Restart ChromaDB
docker start chromadb
```

## Troubleshooting

### ChromaDB Won't Connect

```bash
# Check if ChromaDB is running
curl http://localhost:8000/api/v1/heartbeat

# Check Docker logs
docker logs chromadb

# Verify port is not in use
lsof -i :8000
```

### Embedding Generation Fails

```bash
# For OpenAI: Verify API key
echo $OPENAI_API_KEY

# For Gemini: Verify API key
echo $GEMINI_API_KEY

# Test API connectivity
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Vector Store Disabled

If you need to temporarily disable vector store:

```bash
# Add entry without vector store
node dist/index.js --use-vector-store false add --feelings "test"

# Search using file-based search (slower)
node dist/index.js --use-vector-store false search "test query"
```

## Migration from File-Based to Vector Store

If you have existing journal entries, they will be automatically indexed when:

1. Vector store is enabled
2. You write a new entry
3. The system will backfill missing embeddings

Or you can manually trigger reindexing by writing any entry with vector store enabled.

## Security Considerations

### API Keys

**Never commit API keys to version control!**

```bash
# Add to .gitignore
echo ".env" >> .gitignore
echo "*.key" >> .gitignore
```

### ChromaDB Security

For production deployments, consider:

1. **Authentication**: Set up authentication for ChromaDB
2. **Encryption**: Use TLS for connections
3. **Network**: Restrict access to trusted networks
4. **Backups**: Regular automated backups

## Cost Estimation

### OpenAI Embeddings

- Average journal entry: ~100 tokens
- Cost: $0.02 / 1M tokens
- 100 entries/day × 365 days = 36,500 entries
- Total cost: ~$0.73/year

### Google Gemini Embeddings

- Free tier: First 1M tokens/month
- After free tier: Similar to OpenAI
- Likely free for personal use

### ChromaDB Hosting

- Self-hosted (Docker): Free (just compute costs)
- Cloud-hosted options available at various price points

## Getting Help

If you encounter issues:

1. Check ChromaDB logs: `docker logs chromadb`
2. Verify API keys are set correctly
3. Test with `--use-vector-store false` to isolate issues
4. Consult the main README.md
5. File an issue on GitHub
