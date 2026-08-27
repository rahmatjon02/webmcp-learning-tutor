export type Topic = 'arrays' | 'strings' | 'loops' | 'functions' | 'objects';
export type Difficulty = 'easy' | 'medium' | 'hard';

export const TOPICS: Topic[] = [
  'arrays',
  'strings',
  'loops',
  'functions',
  'objects',
];

export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export interface TestCase {
  args: unknown[];
  expected: unknown;
}

export interface GeneratedExercise {
  templateKey: string;
  topic: Topic;
  difficulty: Difficulty;
  title: string;
  description: string;
  starterCode: string;
  testCases: TestCase[];
  hints: string[];
}
