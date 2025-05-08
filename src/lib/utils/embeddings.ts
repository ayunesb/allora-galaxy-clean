
import { supabase } from '@/integrations/supabase/client';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

/**
 * Generates an embedding from text using the OpenAI API
 * @param text Text to create embedding for
 * @returns Array of embedding values
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    const { data, error } = await supabase.functions.invoke('create-embedding', {
      body: { text }
    });

    if (error) {
      throw new Error(`Error generating embedding: ${error.message}`);
    }

    return data?.embedding || null;
  } catch (error: any) {
    console.error('Error generating embedding:', error);
    return null;
  }
}

/**
 * Stores a document embedding in the database
 * @param docId Document ID
 * @param content Document content
 * @param metadata Additional metadata
 * @param tenantId Optional tenant ID
 */
export async function storeEmbedding(
  docId: string, 
  content: string, 
  metadata: Record<string, any> = {}, 
  tenantId?: string
): Promise<boolean> {
  try {
    const embedding = await generateEmbedding(content);
    
    if (!embedding) {
      await logSystemEvent(
        tenantId || 'system',
        'system', 
        'embedding_generation_failed',
        { doc_id: docId, content_length: content.length }
      );
      return false;
    }
    
    const { error } = await supabase
      .from('document_embeddings')
      .insert({
        id: docId,
        content,
        embedding,
        metadata,
        tenant_id: tenantId
      });
      
    if (error) {
      await logSystemEvent(
        tenantId || 'system',
        'system',
        'embedding_storage_failed',
        { doc_id: docId, error: error.message }
      );
      throw error;
    }
    
    return true;
  } catch (error: any) {
    console.error('Error storing embedding:', error);
    return false;
  }
}
