export type Topic = 'arrays' | 'strings' | 'loops' | 'functions' | 'objects';
export type Difficulty = 'easy' | 'medium' | 'hard';

export const TOPICS: Topic[] = ['arrays', 'strings', 'loops', 'functions', 'objects'];
export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export interface PublicExercise {
  id: string;
  topic: Topic;
  difficulty: Difficulty;
  title: string;
  description: string;
  starterCode: string;
  example: { args: unknown[]; expected: unknown } | null;
  totalTestCases: number;
  createdAt: string;
}

export interface TestResult {
  passed: boolean;
  args: unknown[];
  expected: unknown;
  actual?: unknown;
  error?: string;
}

export interface SubmitResult {
  passed: boolean;
  passedCount: number;
  totalCount: number;
  compileError?: string;
  results: TestResult[];
  hintsUsed: number;
}

export interface HintResult {
  hint: string | null;
  hintsRevealed: number;
  totalHints: number;
  exhausted: boolean;
}

export interface TopicStats {
  attempted: number;
  solved: number;
}

export interface ProgressResponse {
  studentId: string;
  totalExercisesGenerated: number;
  totalExercisesAttempted: number;
  totalExercisesSolved: number;
  totalSubmissions: number;
  successRate: number;
  byTopic: Record<string, TopicStats>;
  byDifficulty: Record<string, TopicStats>;
  recentSubmissions: {
    exerciseId: string;
    title: string;
    topic?: Topic;
    difficulty?: Difficulty;
    passed: boolean;
    passedCount: number;
    totalCount: number;
    createdAt: string;
  }[];
}

export interface Student {
  id: string;
  name: string;
  createdAt: string;
}
