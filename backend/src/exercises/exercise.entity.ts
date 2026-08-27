import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Difficulty, TestCase, Topic } from './exercise.types.js';

@Entity()
export class Exercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  templateKey: string;

  @Column()
  topic: Topic;

  @Column()
  difficulty: Difficulty;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('text')
  starterCode: string;

  @Column('simple-json')
  testCases: TestCase[];

  @Column('simple-json')
  hints: string[];

  @Column({ nullable: true })
  studentId?: string;

  @CreateDateColumn()
  createdAt: Date;
}
