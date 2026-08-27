import { IsNotEmpty, IsString } from 'class-validator';

export class SubmitSolutionDto {
  @IsString()
  @IsNotEmpty()
  exerciseId: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  studentId: string;
}
