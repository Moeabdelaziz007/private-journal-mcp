// ABOUTME: Vector database service using ChromaDB for semantic journal search
// ABOUTME: Supports local embeddings (Xenova), OpenAI embeddings, and Google Gemini embeddings

import { ChromaClient, Collection } from 'chromadb';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { EmbeddingService } from './embeddings';
import { resolveUserJournalPath, resolveProjectJournalPath } from './paths';
import * as path from 'path';

export type EmbeddingProvider = 'local' | 'openai' | 'gemini';

export interface VectorStoreConfig {
  embeddingProvider?: EmbeddingProvider;
  openAIKey?: string;
  geminiKey?: string;
  chromaPath?: string;
}

export interface DocumentMetadata {
  text: string;
  sections: string[];
  timestamp: number;
  path: string;
  type: 'project' | 'user';
}

export class VectorStoreService {
  private static instance: VectorStoreService;
  private chromaClient: ChromaClient;
  private projectCollection: Collection | null = null;
  private userCollection: Collection | null = null;
  private embeddingService: EmbeddingService;
  private openaiClient: OpenAI | null = null;
  private geminiClient: GoogleGenerativeAI | null = null;
  private embeddingProvider: EmbeddingProvider;
  private initPromise: Promise<void> | null = null;

  private constructor(config: VectorStoreConfig = {}) {
    this.embeddingProvider = config.embeddingProvider || 'local';
    
    // Initialize OpenAI if requested
    if (this.embeddingProvider === 'openai') {
      if (config.openAIKey) {
        this.openaiClient = new OpenAI({ apiKey: config.openAIKey });
      } else if (process.env.OPENAI_API_KEY) {
        this.openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      } else {
        console.error('Warning: OpenAI requested but no API key provided. Falling back to local embeddings.');
        this.embeddingProvider = 'local';
      }
    }

    // Initialize Gemini if requested
    if (this.embeddingProvider === 'gemini') {
      const apiKey = config.geminiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      if (apiKey) {
        this.geminiClient = new GoogleGenerativeAI(apiKey);
      } else {
        console.error('Warning: Gemini requested but no API key provided. Falling back to local embeddings.');
        this.embeddingProvider = 'local';
      }
    }

    // Initialize Chroma client with default localhost connection
    // ChromaDB expects a server URL, not a file path
    this.chromaClient = new ChromaClient({
      // Default connection to local Chroma server
      // Users can set CHROMA_HOST and CHROMA_PORT environment variables
    });
    
    // Initialize local embedding service as fallback
    this.embeddingService = EmbeddingService.getInstance();
  }

  static getInstance(config?: VectorStoreConfig): VectorStoreService {
    if (!VectorStoreService.instance) {
      VectorStoreService.instance = new VectorStoreService(config);
    }
    return VectorStoreService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.doInitialize();
    return this.initPromise;
  }

  private async doInitialize(): Promise<void> {
    try {
      console.error('Initializing vector store...');
      
      // Initialize embedding service if using local embeddings
      if (this.embeddingProvider === 'local') {
        await this.embeddingService.initialize();
      }

      // Get or create collections
      this.projectCollection = await this.chromaClient.getOrCreateCollection({
        name: 'journal_project',
        metadata: { 'hnsw:space': 'cosine' }
      });

      this.userCollection = await this.chromaClient.getOrCreateCollection({
        name: 'journal_user',
        metadata: { 'hnsw:space': 'cosine' }
      });

      console.error('Vector store initialized successfully');
    } catch (error) {
      console.error('Failed to initialize vector store:', error);
      throw error;
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    // Try OpenAI if configured
    if (this.embeddingProvider === 'openai' && this.openaiClient) {
      try {
        const response = await this.openaiClient.embeddings.create({
          model: 'text-embedding-3-small',
          input: text,
        });
        return response.data[0].embedding;
      } catch (error) {
        console.error('OpenAI embedding failed, falling back to local:', error);
        return await this.embeddingService.generateEmbedding(text);
      }
    }
    
    // Try Gemini if configured
    if (this.embeddingProvider === 'gemini' && this.geminiClient) {
      try {
        const model = this.geminiClient.getGenerativeModel({ model: 'text-embedding-004' });
        const result = await model.embedContent(text);
        return result.embedding.values;
      } catch (error) {
        console.error('Gemini embedding failed, falling back to local:', error);
        return await this.embeddingService.generateEmbedding(text);
      }
    }
    
    // Default to local embeddings
    return await this.embeddingService.generateEmbedding(text);
  }

  async addEntry(
    id: string,
    text: string,
    metadata: DocumentMetadata
  ): Promise<void> {
    if (!this.projectCollection || !this.userCollection) {
      await this.initialize();
    }

    const embedding = await this.generateEmbedding(text);
    const collection = metadata.type === 'project' ? this.projectCollection! : this.userCollection!;

    await collection.add({
      ids: [id],
      embeddings: [embedding],
      documents: [text],
      metadatas: [metadata as any]
    });
  }

  async search(
    query: string,
    options: {
      type?: 'project' | 'user' | 'both';
      limit?: number;
      sections?: string[];
      dateRange?: { start?: Date; end?: Date };
    } = {}
  ): Promise<Array<DocumentMetadata & { score: number; id: string }>> {
    if (!this.projectCollection || !this.userCollection) {
      await this.initialize();
    }

    const {
      type = 'both',
      limit = 10,
      sections,
      dateRange
    } = options;

    const queryEmbedding = await this.generateEmbedding(query);
    const results: Array<DocumentMetadata & { score: number; id: string }> = [];

    // Build filter for metadata
    const where: any = {};
    if (sections && sections.length > 0) {
      // Note: Chroma filters would need custom implementation for array contains
      // For now, we'll filter in post-processing
    }
    if (dateRange) {
      if (dateRange.start) {
        where.timestamp = { $gte: dateRange.start.getTime() };
      }
      if (dateRange.end) {
        where.timestamp = { ...where.timestamp, $lte: dateRange.end.getTime() };
      }
    }

    // Query project collection
    if (type === 'both' || type === 'project') {
      const projectResults = await this.projectCollection!.query({
        queryEmbeddings: [queryEmbedding],
        nResults: limit,
        where: Object.keys(where).length > 0 ? where : undefined
      });

      if (projectResults.ids && projectResults.ids[0]) {
        for (let i = 0; i < projectResults.ids[0].length; i++) {
          const metadata = projectResults.metadatas?.[0]?.[i] as unknown as DocumentMetadata;
          const distance = projectResults.distances?.[0]?.[i] || 0;
          
          // Filter by sections if specified
          if (sections && sections.length > 0) {
            const hasMatchingSection = sections.some(section => 
              metadata.sections?.some(embeddingSection => 
                embeddingSection.toLowerCase().includes(section.toLowerCase())
              )
            );
            if (!hasMatchingSection) continue;
          }

          results.push({
            ...metadata,
            score: 1 - distance, // Convert distance to similarity score
            id: projectResults.ids[0][i]
          });
        }
      }
    }

    // Query user collection
    if (type === 'both' || type === 'user') {
      const userResults = await this.userCollection!.query({
        queryEmbeddings: [queryEmbedding],
        nResults: limit,
        where: Object.keys(where).length > 0 ? where : undefined
      });

      if (userResults.ids && userResults.ids[0]) {
        for (let i = 0; i < userResults.ids[0].length; i++) {
          const metadata = userResults.metadatas?.[0]?.[i] as unknown as DocumentMetadata;
          const distance = userResults.distances?.[0]?.[i] || 0;
          
          // Filter by sections if specified
          if (sections && sections.length > 0) {
            const hasMatchingSection = sections.some(section => 
              metadata.sections?.some(embeddingSection => 
                embeddingSection.toLowerCase().includes(section.toLowerCase())
              )
            );
            if (!hasMatchingSection) continue;
          }

          results.push({
            ...metadata,
            score: 1 - distance,
            id: userResults.ids[0][i]
          });
        }
      }
    }

    // Sort by score and limit
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }

  async listRecent(options: {
    type?: 'project' | 'user' | 'both';
    limit?: number;
    dateRange?: { start?: Date; end?: Date };
  } = {}): Promise<Array<DocumentMetadata & { id: string }>> {
    if (!this.projectCollection || !this.userCollection) {
      await this.initialize();
    }

    const {
      type = 'both',
      limit = 10,
      dateRange
    } = options;

    const results: Array<DocumentMetadata & { id: string }> = [];

    // Build filter
    const where: any = {};
    if (dateRange) {
      if (dateRange.start) {
        where.timestamp = { $gte: dateRange.start.getTime() };
      }
      if (dateRange.end) {
        where.timestamp = { ...where.timestamp, $lte: dateRange.end.getTime() };
      }
    }

    // Get from project collection
    if (type === 'both' || type === 'project') {
      const projectResults = await this.projectCollection!.get({
        where: Object.keys(where).length > 0 ? where : undefined,
        limit: limit
      });

      if (projectResults.ids) {
        for (let i = 0; i < projectResults.ids.length; i++) {
          const metadata = projectResults.metadatas?.[i] as unknown as DocumentMetadata;
          results.push({
            ...metadata,
            id: projectResults.ids[i]
          });
        }
      }
    }

    // Get from user collection
    if (type === 'both' || type === 'user') {
      const userResults = await this.userCollection!.get({
        where: Object.keys(where).length > 0 ? where : undefined,
        limit: limit
      });

      if (userResults.ids) {
        for (let i = 0; i < userResults.ids.length; i++) {
          const metadata = userResults.metadatas?.[i] as unknown as DocumentMetadata;
          results.push({
            ...metadata,
            id: userResults.ids[i]
          });
        }
      }
    }

    // Sort by timestamp (most recent first) and limit
    results.sort((a, b) => b.timestamp - a.timestamp);
    return results.slice(0, limit);
  }

  async deleteEntry(id: string, type: 'project' | 'user'): Promise<void> {
    if (!this.projectCollection || !this.userCollection) {
      await this.initialize();
    }

    const collection = type === 'project' ? this.projectCollection! : this.userCollection!;
    await collection.delete({ ids: [id] });
  }

  async reset(): Promise<void> {
    if (!this.projectCollection || !this.userCollection) {
      await this.initialize();
    }

    await this.chromaClient.deleteCollection({ name: 'journal_project' });
    await this.chromaClient.deleteCollection({ name: 'journal_user' });
    
    // Recreate collections
    this.projectCollection = await this.chromaClient.getOrCreateCollection({
      name: 'journal_project',
      metadata: { 'hnsw:space': 'cosine' }
    });

    this.userCollection = await this.chromaClient.getOrCreateCollection({
      name: 'journal_user',
      metadata: { 'hnsw:space': 'cosine' }
    });
  }
}
