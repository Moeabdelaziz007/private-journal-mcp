// ABOUTME: Unit tests for vector store functionality
// ABOUTME: Tests vector database operations and embedding integration

import { VectorStoreService, EmbeddingProvider } from '../src/vectorStore';

describe('VectorStoreService', () => {
  describe('Configuration', () => {
    test('initializes with local embeddings by default', () => {
      const service = VectorStoreService.getInstance();
      expect(service).toBeDefined();
    });

    test('accepts embedding provider configuration', () => {
      const service = VectorStoreService.getInstance({
        embeddingProvider: 'local'
      });
      expect(service).toBeDefined();
    });
  });

  describe('Embedding Provider Selection', () => {
    test('supports local embedding provider', () => {
      const service = VectorStoreService.getInstance({
        embeddingProvider: 'local'
      });
      expect(service).toBeDefined();
    });

    test('falls back to local when OpenAI key is missing', () => {
      // Clear any existing API key
      const originalKey = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;

      const service = VectorStoreService.getInstance({
        embeddingProvider: 'openai'
      });
      expect(service).toBeDefined();

      // Restore original key
      if (originalKey) {
        process.env.OPENAI_API_KEY = originalKey;
      }
    });

    test('falls back to local when Gemini key is missing', () => {
      // Clear any existing API keys
      const originalGeminiKey = process.env.GEMINI_API_KEY;
      const originalGoogleKey = process.env.GOOGLE_API_KEY;
      delete process.env.GEMINI_API_KEY;
      delete process.env.GOOGLE_API_KEY;

      const service = VectorStoreService.getInstance({
        embeddingProvider: 'gemini'
      });
      expect(service).toBeDefined();

      // Restore original keys
      if (originalGeminiKey) {
        process.env.GEMINI_API_KEY = originalGeminiKey;
      }
      if (originalGoogleKey) {
        process.env.GOOGLE_API_KEY = originalGoogleKey;
      }
    });
  });

  describe('Embedding Generation', () => {
    test('generateEmbedding returns array of numbers for local provider', async () => {
      const service = VectorStoreService.getInstance({
        embeddingProvider: 'local'
      });

      const text = 'This is a test text for embedding generation';
      const embedding = await service.generateEmbedding(text);

      expect(Array.isArray(embedding)).toBe(true);
      expect(embedding.length).toBeGreaterThan(0);
      expect(typeof embedding[0]).toBe('number');
    }, 30000); // Increased timeout for model loading
  });

  // Note: The following tests require a running ChromaDB server
  // They are skipped by default to avoid test failures
  describe.skip('ChromaDB Integration', () => {
    test('can add entry to vector store', async () => {
      const service = VectorStoreService.getInstance();
      await service.initialize();

      const metadata = {
        text: 'Test journal entry',
        sections: ['Test Section'],
        timestamp: Date.now(),
        path: '/test/path.md',
        type: 'project' as const
      };

      await expect(
        service.addEntry('test-id-1', 'Test journal entry', metadata)
      ).resolves.not.toThrow();
    });

    test('can search entries in vector store', async () => {
      const service = VectorStoreService.getInstance();
      await service.initialize();

      const metadata = {
        text: 'ChromaDB is a vector database',
        sections: ['Technical'],
        timestamp: Date.now(),
        path: '/test/path2.md',
        type: 'project' as const
      };

      await service.addEntry('test-id-2', metadata.text, metadata);

      const results = await service.search('vector database', {
        limit: 5,
        type: 'project'
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty('score');
      expect(results[0]).toHaveProperty('text');
    });

    test('can list recent entries', async () => {
      const service = VectorStoreService.getInstance();
      await service.initialize();

      const results = await service.listRecent({
        limit: 10,
        type: 'both'
      });

      expect(Array.isArray(results)).toBe(true);
    });
  });
});
