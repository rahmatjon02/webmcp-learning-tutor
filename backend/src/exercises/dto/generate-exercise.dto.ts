import { IsIn, IsOptional, IsString } from 'class-validator';
import { DIFFICULTIES, TOPICS } from '../exercise.types.js';
import type { Difficulty, Topic } from '../exercise.types.js';

export class GenerateExerciseDto {
  @IsOptional()
  @IsIn(TOPICS)
  topic?: Topic;

  @IsOptional()
  @IsIn(DIFFICULTIES)
  difficulty?: Difficulty;

  @IsOptional()
  @IsString()
  studentId?: string;
}
