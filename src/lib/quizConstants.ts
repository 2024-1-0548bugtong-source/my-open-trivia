/**
 * Leaderboard Quiz Configuration
 * These constants define the standardized rules for all leaderboard attempts.
 * All players must use these exact settings for fair comparison.
 */

export const LEADERBOARD_QUIZ_CONFIG = {
  TOTAL_QUESTIONS: 10,
  QUESTION_TYPE: "multiple" as const,
  DIFFICULTY: "medium" as const,
} as const;

export const { TOTAL_QUESTIONS, QUESTION_TYPE, DIFFICULTY } = LEADERBOARD_QUIZ_CONFIG;
