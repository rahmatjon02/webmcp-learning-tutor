import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Submission } from './submission.entity.js';
import { Exercise } from '../exercises/exercise.entity.js';
import { HintUsage } from '../exercises/hint-usage.entity.js';
import { SubmissionsService } from './submissions.service.js';
import { SubmissionsController } from './submissions.controller.js';
import { CodeRunnerService } from './code-runner.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Submission, Exercise, HintUsage])],
  controllers: [SubmissionsController],
  providers: [SubmissionsService, CodeRunnerService],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}
