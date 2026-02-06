/**
 * Leaderboard Quiz Configuration
 * These constants define the standardized rules for all leaderboard attempts.
 * All players must use these exact settings for fair comparison.
 */

export const LEADERBOARD_QUIZ_CONFIG = {
  TOTAL_QUESTIONS: 10,
  QUESTION_TYPE: "mixed" as const, // Can include multiple choice, true/false, etc.
  DIFFICULTY: "randomized" as const, // Randomized per question for fairness
} as const;

export const { TOTAL_QUESTIONS, QUESTION_TYPE, DIFFICULTY } = LEADERBOARD_QUIZ_CONFIG;
