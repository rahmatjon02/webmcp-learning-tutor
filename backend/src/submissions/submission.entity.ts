import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Submission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentId: string;

  @Column()
  exerciseId: string;

  @Column('text')
  code: string;

  @Column()
  passed: boolean;

  @Column()
  passedCount: number;

  @Column()
  totalCount: number;

  @Column({ nullable: true, type: 'text' })
  errorMessage?: string;

  @CreateDateColumn()
  createdAt: Date;
}
