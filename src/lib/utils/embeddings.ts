
import { supabase } from '@/integrations/supabase/client';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

/**
 * Generate embeddings for text content
 * 
 * @param text The text to generate embeddings for
 * @param options Additional options
 * @returns Generated embeddings vector
 */
export async function generateEmbeddings(
  text: string, 
  options: { 
    model?: string,
    tenantId?: string,
    userId?: string
  } = {}
): Promise<number[] | null> {
  const {
    model = 'openai-text-embedding-ada-002',
    tenantId = 'system',
    userId
  } = options;
  
  try {
    // Call embeddings API through our edge function
    const { data, error } = await supabase.functions.invoke('generate-embeddings', {
      body: {
        text,
        model,
        tenant_id: tenantId,
        user_id: userId
      }
    });
    
    if (error) {
      throw new Error(`Error generating embeddings: ${error.message}`);
    }
    
    if (!data?.embeddings) {
      throw new Error('No embeddings returned from API');
    }
    
    return data.embeddings;
  } catch (error: any) {
    // Log the error
    logSystemEvent(
      'system',
      'error',
      {
        action: 'generate_embeddings',
        error: error.message,
        text_length: text.length,
        model
      },
      tenantId
    ).catch(err => {
      console.error('Failed to log embeddings error:', err);
    });
    
    console.error('Error generating embeddings:', error);
    return null;
  }
}

/**
 * Calculate similarity between two embedding vectors using cosine similarity
 * 
 * @param embeddingA First embedding vector
 * @param embeddingB Second embedding vector
 * @returns Similarity score between 0 and 1
 */
export function calculateSimilarity(embeddingA: number[], embeddingB: number[]): number {
  try {
    if (embeddingA.length !== embeddingB.length) {
      throw new Error(`Embedding dimensions don't match: ${embeddingA.length} vs ${embeddingB.length}`);
    }
    
    // Calculate dot product
    const dotProduct = embeddingA.reduce((sum, a, i) => sum + a * embeddingB[i], 0);
    
    // Calculate magnitudes
    const magnitudeA = Math.sqrt(embeddingA.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(embeddingB.reduce((sum, val) => sum + val * val, 0));
    
    // Cosine similarity
    return dotProduct / (magnitudeA * magnitudeB);
  } catch (error: any) {
    logSystemEvent(
      'system',
      'error',
      {
        action: 'calculate_similarity',
        error: error.message
      }
    ).catch(console.error);
    
    return 0;
  }
}
