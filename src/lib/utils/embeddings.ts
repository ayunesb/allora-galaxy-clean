
import { getEnvWithDefault } from '@/lib/env/envUtils';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

/**
 * Generate embeddings for text using OpenAI API
 * @param text Text to generate embeddings for
 * @returns Promise resolving to embedding vector
 */
export async function generateEmbeddings(text: string): Promise<number[]> {
  try {
    const OPENAI_API_KEY = getEnvWithDefault('VITE_OPENAI_API_KEY', '');
    
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not found in environment variables');
    }
    
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-3-small'
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }
    
    const result = await response.json();
    const embeddings = result.data[0].embedding;
    
    // Log success event
    await logSystemEvent('system', 'embeddings', 'generate_embedding_success', {
      text_length: text.length,
      model: 'text-embedding-3-small'
    });
    
    return embeddings;
  } catch (error: any) {
    // Log error event
    await logSystemEvent('system', 'embeddings', 'generate_embedding_error', {
      error: error.message
    });
    
    throw error;
  }
}

/**
 * Calculate cosine similarity between two embedding vectors
 * @param embeddingA First embedding vector
 * @param embeddingB Second embedding vector
 * @returns Cosine similarity score (0-1)
 */
export function calculateSimilarity(embeddingA: number[], embeddingB: number[]): number {
  if (embeddingA.length !== embeddingB.length) {
    throw new Error('Embedding dimensions do not match');
  }
  
  // Calculate dot product
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < embeddingA.length; i++) {
    dotProduct += embeddingA[i] * embeddingB[i];
    normA += embeddingA[i] * embeddingA[i];
    normB += embeddingB[i] * embeddingB[i];
  }
  
  // Calculate magnitudes
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  // Calculate cosine similarity
  return dotProduct / (normA * normB);
}
