import { useState } from 'react';
import { store, useAppStore } from '../store';
import { DIFFICULTIES, TOPICS, type Difficulty, type Topic } from '../types';

export function ExerciseControls() {
  const { loading } = useAppStore();
  const [topic, setTopic] = useState<Topic | ''>('');
  const [difficulty, setDifficulty] = useState<Difficulty | ''>('');

  return (
    <div className="controls">
      <select
        value={topic}
        onChange={(e) => setTopic(e.target.value as Topic | '')}
        disabled={loading}
      >
        <option value="">Любая тема</option>
        {TOPICS.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <select
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value as Difficulty | '')}
        disabled={loading}
      >
        <option value="">Авто-сложность</option>
        {DIFFICULTIES.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
      <button
        disabled={loading}
        onClick={() =>
          store.generateExercise(topic || undefined, difficulty || undefined)
        }
      >
        {loading ? 'Генерирую…' : 'Новая задача'}
      </button>
    </div>
  );
}
