import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { StudentsModule } from './students/students.module.js';
import { ExercisesModule } from './exercises/exercises.module.js';
import { SubmissionsModule } from './submissions/submissions.module.js';
import { Student } from './students/student.entity.js';
import { Exercise } from './exercises/exercise.entity.js';
import { HintUsage } from './exercises/hint-usage.entity.js';
import { Submission } from './submissions/submission.entity.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.DB_PATH ?? 'data/db.sqlite',
      entities: [Student, Exercise, HintUsage, Submission],
      synchronize: true,
    }),
    StudentsModule,
    ExercisesModule,
    SubmissionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
