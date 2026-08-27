import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from './submission.entity.js';
import { Exercise } from '../exercises/exercise.entity.js';
import { HintUsage } from '../exercises/hint-usage.entity.js';
import { CodeRunnerService } from './code-runner.service.js';
import { Difficulty, Topic } from '../exercises/exercise.types.js';

export interface TopicStats {
  attempted: number;
  solved: number;
}

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectRepository(Submission)
    private readonly submissionsRepo: Repository<Submission>,
    @InjectRepository(Exercise)
    private readonly exercisesRepo: Repository<Exercise>,
    @InjectRepository(HintUsage)
    private readonly hintUsageRepo: Repository<HintUsage>,
    private readonly codeRunner: CodeRunnerService,
  ) {}

  async submit(exerciseId: string, code: string, studentId: string) {
    const exercise = await this.exercisesRepo.findOne({
      where: { id: exerciseId },
    });
    if (!exercise) throw new NotFoundException(`Exercise ${exerciseId} not found`);

    const runResult = this.codeRunner.run(code, exercise.testCases);

    const submission = this.submissionsRepo.create({
      studentId,
      exerciseId,
      code,
      passed: runResult.allPassed,
      passedCount: runResult.passedCount,
      totalCount: runResult.totalCount,
      errorMessage: runResult.compileError,
    });
    await this.submissionsRepo.save(submission);

    const hintUsage = await this.hintUsageRepo.findOne({
      where: { exerciseId },
    });

    return {
      passed: runResult.allPassed,
      passedCount: runResult.passedCount,
      totalCount: runResult.totalCount,
      compileError: runResult.compileError,
      results: runResult.results,
      hintsUsed: hintUsage?.hintsRevealed ?? 0,
    };
  }

  async getProgress(studentId: string) {
    const exercises = await this.exercisesRepo.find({ where: { studentId } });
    const exerciseIds = exercises.map((e) => e.id);
    const exerciseById = new Map(exercises.map((e) => [e.id, e]));

    const submissions = exerciseIds.length
      ? await this.submissionsRepo.find({
          where: exerciseIds.map((id) => ({ exerciseId: id })),
          order: { createdAt: 'ASC' },
        })
      : [];

    const solvedExerciseIds = new Set(
      submissions.filter((s) => s.passed).map((s) => s.exerciseId),
    );

    const byTopic: Record<string, TopicStats> = {};
    const byDifficulty: Record<string, TopicStats> = {};

    for (const exercise of exercises) {
      const topicStats = (byTopic[exercise.topic] ??= { attempted: 0, solved: 0 });
      const diffStats = (byDifficulty[exercise.difficulty] ??= {
        attempted: 0,
        solved: 0,
      });
      const hasAttempt = submissions.some((s) => s.exerciseId === exercise.id);
      if (hasAttempt) {
        topicStats.attempted += 1;
        diffStats.attempted += 1;
        if (solvedExerciseIds.has(exercise.id)) {
          topicStats.solved += 1;
          diffStats.solved += 1;
        }
      }
    }

    const recentSubmissions = submissions
      .slice(-5)
      .reverse()
      .map((s) => {
        const exercise = exerciseById.get(s.exerciseId);
        return {
          exerciseId: s.exerciseId,
          title: exercise?.title ?? 'Unknown',
          topic: exercise?.topic as Topic | undefined,
          difficulty: exercise?.difficulty as Difficulty | undefined,
          passed: s.passed,
          passedCount: s.passedCount,
          totalCount: s.totalCount,
          createdAt: s.createdAt,
        };
      });

    const attemptedExerciseIds = new Set(submissions.map((s) => s.exerciseId));

    return {
      studentId,
      totalExercisesGenerated: exercises.length,
      totalExercisesAttempted: attemptedExerciseIds.size,
      totalExercisesSolved: solvedExerciseIds.size,
      totalSubmissions: submissions.length,
      successRate:
        submissions.length === 0
          ? 0
          : Math.round(
              (submissions.filter((s) => s.passed).length / submissions.length) *
                100,
            ),
      byTopic,
      byDifficulty,
      recentSubmissions,
    };
  }
}
