// src/api/opentdb.ts
import axios from 'axios';
import type { Question } from '../types';

interface FetchQuestionsParams {
  amount?: number;
  category?: number;
  difficulty?: string;
  type?: string;
}

/**
 * Fetch trivia questions from OpenTDB API
 */
export async function fetchQuestions(params: FetchQuestionsParams = {}): Promise<Question[]> {
  const query = new URLSearchParams();

  if (params.amount) query.append('amount', params.amount.toString());
  if (params.category) query.append('category', params.category.toString());
  if (params.difficulty) query.append('difficulty', params.difficulty);
  if (params.type) query.append('type', params.type);

  const url = `https://opentdb.com/api.php?${query.toString()}`;

  const res = await axios.get(url);

  // Return the results array
  return res.data.results;
}
