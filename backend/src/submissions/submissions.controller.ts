import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SubmissionsService } from './submissions.service.js';
import { SubmitSolutionDto } from './dto/submit-solution.dto.js';

@Controller('api')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post('solutions/submit')
  submit(@Body() dto: SubmitSolutionDto) {
    return this.submissionsService.submit(dto.exerciseId, dto.code, dto.studentId);
  }

  @Get('students/:id/progress')
  getProgress(@Param('id') id: string) {
    return this.submissionsService.getProgress(id);
  }
}
