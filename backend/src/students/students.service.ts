import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './student.entity.js';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentsRepo: Repository<Student>,
  ) {}

  async create(name?: string): Promise<Student> {
    const student = this.studentsRepo.create({ name: name || 'Student' });
    return this.studentsRepo.save(student);
  }

  async findOrFail(id: string): Promise<Student> {
    const student = await this.studentsRepo.findOne({ where: { id } });
    if (!student) {
      throw new NotFoundException(`Student ${id} not found`);
    }
    return student;
  }

  async findOrCreate(id?: string, name?: string): Promise<Student> {
    if (id) {
      const existing = await this.studentsRepo.findOne({ where: { id } });
      if (existing) return existing;
    }
    return this.create(name);
  }
}
