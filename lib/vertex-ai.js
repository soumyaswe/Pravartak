/**
 * Vertex AI Server Utility for Next.js
 * 
 * This module provides secure server-side access to Vertex AI (Gemini models)
 * using Application Default Credentials (ADC) from Google Cloud.
 * Environment variables are read at runtime for proper Cloud Run deployment.
 * 
 * ✅ Security: No API keys stored or exposed to frontend
 * ✅ Firebase/GCP: Works automatically with service account on Cloud Run/Functions
 * ✅ Local Dev: Uses GOOGLE_APPLICATION_CREDENTIALS environment variable
 * 
 * Usage in API routes:
 *   import { getVertexAIModel, generateWithFallback } from '@/lib/vertex-ai';
 *   const model = getVertexAIModel('gemini-1.5-flash');
 *   const result = await model.generateContent(prompt);
 */

import { VertexAI } from '@google-cloud/vertexai';

// Fallback models in priority order
const MODELS = [
  'gemini-2.0-flash-exp',
  'gemini-1.5-flash',
  'gemini-1.5-pro'
];

// Singleton instance
let vertexAIInstance = null;

/**
 * Initialize Vertex AI with Application Default Credentials
 * @returns {VertexAI} Initialized Vertex AI instance
 */
function getVertexAI() {
  if (!vertexAIInstance) {
    // Read environment variables at runtime (not at module load time)
    const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID || process.env.GCP_PROJECT_ID;
    const LOCATION = process.env.GOOGLE_CLOUD_REGION || 'us-central1';
    
    if (!PROJECT_ID) {
      throw new Error('GOOGLE_CLOUD_PROJECT_ID or GCP_PROJECT_ID environment variable is required');
    }

    console.log(`🔷 Initializing Vertex AI (Project: ${PROJECT_ID}, Region: ${LOCATION})`);
    
    vertexAIInstance = new VertexAI({
      project: PROJECT_ID,
      location: LOCATION,
    });
  }
  return vertexAIInstance;
}

/**
 * Get a Generative Model instance
 * @param {string} modelName - Model name (e.g., 'gemini-1.5-flash')
 * @returns {GenerativeModel} Generative model instance
 */
export function getVertexAIModel(modelName = 'gemini-1.5-flash') {
  const vertexAI = getVertexAI();
  return vertexAI.getGenerativeModel({ model: modelName });
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise<any>} Result from function
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      const isLastRetry = i === maxRetries - 1;
      const is503 = error.message?.includes('503') || error.message?.includes('overloaded');
      const is429 = error.message?.includes('429') || error.message?.includes('quota');
      
      // Don't retry if it's not a retryable error
      if (!is503 && !is429) {
        throw error;
      }
      
      if (isLastRetry) {
        throw error;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, i);
      console.log(`⚠️ Vertex AI: Retry ${i + 1}/${maxRetries} after ${delay}ms due to ${is503 ? '503' : '429'} error`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Generate content with automatic model fallback
 * @param {string|object} prompt - Text prompt or structured request
 * @param {string[]} models - Array of model names to try (default: MODELS)
 * @returns {Promise<object>} Generation result
 */
export async function generateWithFallback(prompt, models = MODELS) {
  let lastError = null;
  
  for (const modelName of models) {
    try {
      console.log(`🔷 Vertex AI: Trying model: ${modelName}`);
      const model = getVertexAIModel(modelName);
      
      const result = await retryWithBackoff(async () => {
        return await model.generateContent(prompt);
      });
      
      console.log(`✅ Vertex AI: Successfully generated content with ${modelName}`);
      return result;
    } catch (error) {
      console.log(`❌ Vertex AI: Model ${modelName} failed:`, error.message);
      lastError = error;
      // Continue to next model
    }
  }
  
  // All models failed
  throw lastError || new Error('All Vertex AI models failed');
}

/**
 * Generate content with streaming support
 * @param {string|object} prompt - Text prompt or structured request
 * @param {string} modelName - Model name (default: 'gemini-1.5-flash')
 * @returns {Promise<AsyncIterable>} Stream of responses
 */
export async function generateContentStream(prompt, modelName = 'gemini-1.5-flash') {
  const model = getVertexAIModel(modelName);
  return await model.generateContentStream(prompt);
}

/**
 * Check if Vertex AI is properly configured
 * @returns {boolean} True if configured
 */
export function isVertexAIConfigured() {
  return !!PROJECT_ID;
}

export default {
  getVertexAIModel,
  generateWithFallback,
  generateContentStream,
  isVertexAIConfigured,
  MODELS,
};
