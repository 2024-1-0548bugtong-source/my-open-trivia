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
export declare function fetchQuestions(params?: FetchQuestionsParams): Promise<Question[]>;
export {};
//# sourceMappingURL=opentdb.d.ts.map