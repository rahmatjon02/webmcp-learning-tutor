import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { StudentsService } from './students.service.js';

@Controller('api/students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  create(@Body('name') name?: string) {
    return this.studentsService.create(name);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentsService.findOrFail(id);
  }
}
