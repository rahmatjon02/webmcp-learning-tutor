import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class HintUsage {
  @PrimaryColumn()
  exerciseId: string;

  @Column({ default: 0 })
  hintsRevealed: number;
}
