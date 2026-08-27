import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exercise } from './exercise.entity.js';
import { HintUsage } from './hint-usage.entity.js';
import { generateFromTemplate } from './exercise-bank.js';
import { Difficulty, Topic } from './exercise.types.js';
import { Submission } from '../submissions/submission.entity.js';

const LEVEL_ORDER: Difficulty[] = ['easy', 'medium', 'hard'];

@Injectable()
export class ExercisesService {
  constructor(
    @InjectRepository(Exercise)
    private readonly exercisesRepo: Repository<Exercise>,
    @InjectRepository(HintUsage)
    private readonly hintUsageRepo: Repository<HintUsage>,
    @InjectRepository(Submission)
    private readonly submissionsRepo: Repository<Submission>,
  ) {}

  async suggestDifficulty(studentId: string): Promise<Difficulty> {
    const lastExercise = await this.exercisesRepo.findOne({
      where: { studentId },
      order: { createdAt: 'DESC' },
    });
    if (!lastExercise) return 'easy';

    const attempts = await this.submissionsRepo.find({
      where: { exerciseId: lastExercise.id },
      order: { createdAt: 'ASC' },
    });
    if (attempts.length === 0) return lastExercise.difficulty;

    const solved = attempts.some((a) => a.passed);
    const attemptsUntilSolved = solved
      ? attempts.findIndex((a) => a.passed) + 1
      : attempts.length;
    const currentIndex = LEVEL_ORDER.indexOf(lastExercise.difficulty);

    if (solved && attemptsUntilSolved <= 2) {
      return LEVEL_ORDER[Math.min(currentIndex + 1, LEVEL_ORDER.length - 1)];
    }
    if (!solved && attempts.length >= 3) {
      return LEVEL_ORDER[Math.max(currentIndex - 1, 0)];
    }
    return lastExercise.difficulty;
  }

  async generate(
    topic?: Topic,
    difficulty?: Difficulty,
    studentId?: string,
  ): Promise<Exercise> {
    const effectiveDifficulty =
      difficulty ?? (studentId ? await this.suggestDifficulty(studentId) : undefined);

    const generated = generateFromTemplate(topic, effectiveDifficulty);
    const exercise = this.exercisesRepo.create({ ...generated, studentId });
    const saved = await this.exercisesRepo.save(exercise);
    await this.hintUsageRepo.save(
      this.hintUsageRepo.create({ exerciseId: saved.id, hintsRevealed: 0 }),
    );
    return saved;
  }

  async findOrFail(id: string): Promise<Exercise> {
    const exercise = await this.exercisesRepo.findOne({ where: { id } });
    if (!exercise) throw new NotFoundException(`Exercise ${id} not found`);
    return exercise;
  }

  async getHint(exerciseId: string): Promise<{
    hint: string | null;
    hintsRevealed: number;
    totalHints: number;
    exhausted: boolean;
  }> {
    const exercise = await this.findOrFail(exerciseId);
    let usage = await this.hintUsageRepo.findOne({ where: { exerciseId } });
    if (!usage) {
      usage = this.hintUsageRepo.create({ exerciseId, hintsRevealed: 0 });
    }

    const totalHints = exercise.hints.length;
    if (usage.hintsRevealed >= totalHints) {
      return {
        hint: null,
        hintsRevealed: usage.hintsRevealed,
        totalHints,
        exhausted: true,
      };
    }

    const hint = exercise.hints[usage.hintsRevealed];
    usage.hintsRevealed += 1;
    await this.hintUsageRepo.save(usage);

    return {
      hint,
      hintsRevealed: usage.hintsRevealed,
      totalHints,
      exhausted: usage.hintsRevealed >= totalHints,
    };
  }

  async getHintsUsed(exerciseId: string): Promise<number> {
    const usage = await this.hintUsageRepo.findOne({ where: { exerciseId } });
    return usage?.hintsRevealed ?? 0;
  }

  /** Strips hidden test cases (keeps one worked example) so answers aren't leaked to the client. */
  toPublic(exercise: Exercise) {
    const [example] = exercise.testCases;
    return {
      id: exercise.id,
      topic: exercise.topic,
      difficulty: exercise.difficulty,
      title: exercise.title,
      description: exercise.description,
      starterCode: exercise.starterCode,
      example: example ? { args: example.args, expected: example.expected } : null,
      totalTestCases: exercise.testCases.length,
      createdAt: exercise.createdAt,
    };
  }
}
