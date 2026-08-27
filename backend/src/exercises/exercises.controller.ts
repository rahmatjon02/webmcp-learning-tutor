import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ExercisesService } from './exercises.service.js';
import { GenerateExerciseDto } from './dto/generate-exercise.dto.js';

@Controller('api/exercises')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Post('generate')
  async generate(@Body() dto: GenerateExerciseDto) {
    const exercise = await this.exercisesService.generate(
      dto.topic,
      dto.difficulty,
      dto.studentId,
    );
    return this.exercisesService.toPublic(exercise);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const exercise = await this.exercisesService.findOrFail(id);
    return this.exercisesService.toPublic(exercise);
  }

  @Get(':id/hint')
  getHint(@Param('id') id: string) {
    return this.exercisesService.getHint(id);
  }
}
