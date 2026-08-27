import type {
  Difficulty,
  HintResult,
  ProgressResponse,
  PublicExercise,
  Student,
  SubmitResult,
  Topic,
} from './types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${path} failed (${res.status}): ${body}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  createStudent(name?: string) {
    return request<Student>('/students', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },
  getStudent(id: string) {
    return request<Student>(`/students/${id}`);
  },
  generateExercise(topic?: Topic, difficulty?: Difficulty, studentId?: string) {
    return request<PublicExercise>('/exercises/generate', {
      method: 'POST',
      body: JSON.stringify({ topic, difficulty, studentId }),
    });
  },
  getExercise(id: string) {
    return request<PublicExercise>(`/exercises/${id}`);
  },
  getHint(exerciseId: string) {
    return request<HintResult>(`/exercises/${exerciseId}/hint`);
  },
  submitSolution(exerciseId: string, code: string, studentId: string) {
    return request<SubmitResult>('/solutions/submit', {
      method: 'POST',
      body: JSON.stringify({ exerciseId, code, studentId }),
    });
  },
  getProgress(studentId: string) {
    return request<ProgressResponse>(`/students/${studentId}/progress`);
  },
};
