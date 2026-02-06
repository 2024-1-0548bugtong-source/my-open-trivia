// src/api/opentdb.ts
import axios from 'axios';
import type { Question } from '../types';

interface FetchQuestionsParams {
  amount?: number;
  category?: number;
  difficulty?: string;
  type?: string;
}

// Simple in-memory cache for API responses
const questionCache = new Map<string, { data: Question[]; timestamp: number }>();
const CACHE_DURATION = 60000; // 60 seconds cache

/**
 * Fetch trivia questions from OpenTDB API with rate limiting protection and caching
 */
export async function fetchQuestions(params: FetchQuestionsParams = {}): Promise<Question[]> {
  const query = new URLSearchParams();

  if (params.amount) query.append('amount', params.amount.toString());
  if (params.category) query.append('category', params.category.toString());
  if (params.difficulty) query.append('difficulty', params.difficulty);
  if (params.type) query.append('type', params.type);

  const url = `https://opentdb.com/api.php?${query.toString()}`;
  const cacheKey = url;

  // Check cache first
  const cached = questionCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('[CACHE] Using cached questions for:', cacheKey);
    return cached.data;
  }

  let lastError: any;
  const maxRetries = 3;
  const baseDelay = 500;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`[API] Fetching questions (attempt ${attempt + 1}/${maxRetries}):`, url);
      
      const res = await axios.get(url, {
        timeout: 10000, // 10 second timeout
      });

      const results = res.data.results;
      
      // Cache the successful response
      questionCache.set(cacheKey, {
        data: results,
        timestamp: Date.now()
      });

      // Clean up old cache entries periodically
      if (questionCache.size > 50) {
        const now = Date.now();
        for (const [key, value] of questionCache.entries()) {
          if (now - value.timestamp > CACHE_DURATION * 2) {
            questionCache.delete(key);
          }
        }
      }

      return results;

    } catch (error: any) {
      lastError = error;
      
      if (error.response?.status === 429) {
        console.warn(`[RATE_LIMIT] 429 error on attempt ${attempt + 1}, retrying...`);
        
        if (attempt < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        } else {
          throw new Error('Too many requests. Please wait a moment and try again.');
        }
      }
      
      // For other errors, don't retry
      throw error;
    }
  }

  throw lastError;
}

/**
 * Fetch questions with graceful fallback for insufficient questions
 */
export async function fetchQuestionsWithFallback(params: FetchQuestionsParams = {}): Promise<Question[]> {
  const { amount = 10, category } = params;
  
  try {
    // First attempt: category + mixed difficulty/type (no filters)
    const questions = await fetchQuestions({
      amount,
      category
      // No difficulty or type filters for better availability
    });
    
    if (questions.length >= Math.min(amount, 5)) {
      return questions.slice(0, amount);
    }
    
    console.warn('[FALLBACK] Insufficient questions in category, trying mixed categories');
    
    // Second attempt: mixed categories, same amount
    const mixedQuestions = await fetchQuestions({
      amount
    });
    
    if (mixedQuestions.length >= Math.min(amount, 5)) {
      return mixedQuestions.slice(0, amount);
    }
    
    console.warn('[FALLBACK] Still insufficient, trying reduced amount');
    
    // Third attempt: reduced amount
    const reducedAmount = Math.max(5, Math.floor(amount / 2));
    const reducedQuestions = await fetchQuestions({
      amount: reducedAmount
    });
    
    return reducedQuestions;
    
  } catch (error: any) {
    console.error('[ERROR] Failed to fetch questions:', error);
    
    // Final fallback: return empty array and let UI handle it
    if (error.message.includes('Too many requests')) {
      throw error; // Re-throw rate limit errors for UI handling
    }
    
    // For other errors, return empty to allow graceful degradation
    return [];
  }
}
