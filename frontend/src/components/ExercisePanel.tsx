import { useAppStore } from '../store';

export function ExercisePanel() {
  const { exercise } = useAppStore();

  if (!exercise) {
    return (
      <div className="panel">
        <p className="muted">
          Нажми «Новая задача» или попроси агента в чате ChatGPT сгенерировать
          упражнение — он видит инструмент <code>generateExercise</code> на этой
          странице.
        </p>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="badge-row">
        <span className="badge">{exercise.topic}</span>
        <span className="badge">{exercise.difficulty}</span>
      </div>
      <h2>{exercise.title}</h2>
      <p>{exercise.description}</p>
      {exercise.example && (
        <pre className="example">
          {`solution(${exercise.example.args
            .map((a) => JSON.stringify(a))
            .join(', ')}) => ${JSON.stringify(exercise.example.expected)}`}
        </pre>
      )}
    </div>
  );
}
