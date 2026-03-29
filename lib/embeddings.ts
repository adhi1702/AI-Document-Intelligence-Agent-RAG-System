import { pipeline } from "@xenova/transformers";

// Singleton pattern to ensure the model only loads once
class PipelineSingleton {
  static task: any = "feature-extraction";
  static model = "Xenova/bge-small-en-v1.5";
  static instance: any = null;

  static async getInstance(progress_callback?: any) {
    if (PipelineSingleton.instance === null) {
      console.log(`[embeddings] Loading model ${PipelineSingleton.model}...`);
      PipelineSingleton.instance = await pipeline(
        PipelineSingleton.task,
        PipelineSingleton.model,
        {
          progress_callback,
        }
      );
      console.log(`[embeddings] Model loaded!`);
    }
    return PipelineSingleton.instance;
  }
}

// Next.js Dev Mode Fix: Prevent multiple model instances during hot reloading
const globalForPipeline = global as unknown as { 
  pipelineInstance: any;
  PipelineSingleton: typeof PipelineSingleton;
};

if (!globalForPipeline.PipelineSingleton) {
  globalForPipeline.PipelineSingleton = PipelineSingleton;
}

/**
 * Gets embeddings using the local Transformers.js model BAAI/bge-small-en-v1.5.
 * This runs entirely on your machine with NO external API calls or rate limits.
 */
export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  // Use the singleton from global scope
  const extractor = await globalForPipeline.PipelineSingleton.getInstance();

  const results = await Promise.all(
    texts.map(async (text) => {
      // Generate the embedding
      const output = await extractor(text, {
        pooling: "mean",
        normalize: true,
      });

      // Transform Tensor to standard JS array
      const rawData = Array.from(output.data) as number[];
      
      // Verification log for the first element
      if (texts.indexOf(text) === 0) {
        console.log(`[embeddings] Generated embedding with dimensions: ${rawData.length}`);
      }

      return rawData;
    })
  );

  return results;
}

/**
 * Computes cosine similarity between two vectors.
 * Returns a score between -1 and 1 (1 = identical direction).
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length) {
    if (a && b) console.warn(`[embeddings] Dimension mismatch: ${a.length} vs ${b.length}`);
    return 0;
  }
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}