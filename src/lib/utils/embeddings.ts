
/**
 * Utility for creating text embeddings
 */

/**
 * Generate an embedding vector for a text string
 * @param text Text to generate embedding for
 * @returns Promise that resolves to an embedding vector
 */
export async function getEmbeddingForText(text: string): Promise<number[]> {
  try {
    // In a real implementation, this would call an embedding API like OpenAI
    // For now, return a dummy vector
    return Array.from({ length: 16 }, () => Math.random() - 0.5);
  } catch (error) {
    console.error('Error generating embedding:', error);
    // Return a zero vector as fallback
    return Array.from({ length: 16 }, () => 0);
  }
}

/**
 * Calculate cosine similarity between two vectors
 * @param vectorA First vector
 * @param vectorB Second vector
 * @returns Similarity score (1 is identical, -1 is opposite, 0 is orthogonal)
 */
export function calculateSimilarity(vectorA: number[], vectorB: number[]): number {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length');
  }
  
  // Calculate dot product
  const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
  
  // Calculate magnitudes
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0));
  
  // Calculate cosine similarity
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }
  
  return dotProduct / (magnitudeA * magnitudeB);
}
