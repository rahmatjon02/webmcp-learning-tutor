import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exercise } from './exercise.entity.js';
import { HintUsage } from './hint-usage.entity.js';
import { Submission } from '../submissions/submission.entity.js';
import { ExercisesService } from './exercises.service.js';
import { ExercisesController } from './exercises.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Exercise, HintUsage, Submission])],
  controllers: [ExercisesController],
  providers: [ExercisesService],
  exports: [ExercisesService],
})
export class ExercisesModule {}
