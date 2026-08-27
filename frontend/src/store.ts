import { useSyncExternalStore } from 'react';
import { api } from './api';
import type {
  Difficulty,
  ProgressResponse,
  PublicExercise,
  SubmitResult,
  Topic,
} from './types';

const STUDENT_ID_KEY = 'webmcp-tutor-student-id';

interface AppState {
  studentId: string | null;
  studentName: string;
  exercise: PublicExercise | null;
  code: string;
  revealedHints: string[];
  hintsTotal: number;
  lastResult: SubmitResult | null;
  progress: ProgressResponse | null;
  loading: boolean;
  error: string | null;
  ready: boolean;
}

let state: AppState = {
  studentId: null,
  studentName: 'Student',
  exercise: null,
  code: '',
  revealedHints: [],
  hintsTotal: 0,
  lastResult: null,
  progress: null,
  loading: false,
  error: null,
  ready: false,
};

const listeners = new Set<() => void>();

function setState(patch: Partial<AppState>) {
  state = { ...state, ...patch };
  for (const listener of listeners) listener();
}

function getState(): AppState {
  return state;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAppStore(): AppState {
  return useSyncExternalStore(subscribe, getState, getState);
}

async function ensureStudent(): Promise<string> {
  const stored = localStorage.getItem(STUDENT_ID_KEY);
  if (stored) {
    try {
      const student = await api.getStudent(stored);
      setState({ studentId: student.id, studentName: student.name, ready: true });
      return student.id;
    } catch {
      localStorage.removeItem(STUDENT_ID_KEY);
    }
  }
  const student = await api.createStudent('Student');
  localStorage.setItem(STUDENT_ID_KEY, student.id);
  setState({ studentId: student.id, studentName: student.name, ready: true });
  return student.id;
}

async function init() {
  setState({ loading: true, error: null });
  try {
    const studentId = await ensureStudent();
    await refreshProgress(studentId);
  } catch (err) {
    setState({ error: (err as Error).message });
  } finally {
    setState({ loading: false });
  }
}

async function generateExercise(topic?: Topic, difficulty?: Difficulty) {
  setState({ loading: true, error: null });
  try {
    const studentId = state.studentId ?? (await ensureStudent());
    const exercise = await api.generateExercise(topic, difficulty, studentId);
    setState({
      exercise,
      code: exercise.starterCode,
      revealedHints: [],
      hintsTotal: 0,
      lastResult: null,
    });
    return exercise;
  } catch (err) {
    setState({ error: (err as Error).message });
    throw err;
  } finally {
    setState({ loading: false });
  }
}

async function submitSolution(code?: string, exerciseId?: string) {
  const targetExerciseId = exerciseId ?? state.exercise?.id;
  if (!targetExerciseId) {
    throw new Error('Нет активного упражнения. Сначала сгенерируй задачу.');
  }
  const studentId = state.studentId ?? (await ensureStudent());
  const finalCode = code ?? state.code;

  setState({ loading: true, error: null, code: finalCode });
  try {
    const result = await api.submitSolution(targetExerciseId, finalCode, studentId);
    setState({ lastResult: result });
    await refreshProgress(studentId);
    return result;
  } catch (err) {
    setState({ error: (err as Error).message });
    throw err;
  } finally {
    setState({ loading: false });
  }
}

async function getHint(exerciseId?: string) {
  const targetExerciseId = exerciseId ?? state.exercise?.id;
  if (!targetExerciseId) {
    throw new Error('Нет активного упражнения. Сначала сгенерируй задачу.');
  }
  setState({ loading: true, error: null });
  try {
    const result = await api.getHint(targetExerciseId);
    if (result.hint) {
      setState({
        revealedHints: [...state.revealedHints, result.hint],
        hintsTotal: result.totalHints,
      });
    } else {
      setState({ hintsTotal: result.totalHints });
    }
    return result;
  } catch (err) {
    setState({ error: (err as Error).message });
    throw err;
  } finally {
    setState({ loading: false });
  }
}

async function refreshProgress(studentId?: string) {
  const targetStudentId = studentId ?? state.studentId;
  if (!targetStudentId) return null;
  const progress = await api.getProgress(targetStudentId);
  setState({ progress });
  return progress;
}

function setCode(code: string) {
  setState({ code });
}

export const store = {
  getState,
  subscribe,
  init,
  generateExercise,
  submitSolution,
  getHint,
  refreshProgress,
  setCode,
};
