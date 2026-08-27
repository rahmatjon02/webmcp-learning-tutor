import { useAppStore } from '../store';

export function ProgressPanel() {
  const { progress, studentId } = useAppStore();

  return (
    <div className="panel progress-panel">
      <h3>Прогресс</h3>
      <p className="muted small">ID ученика: {studentId ?? '…'}</p>
      {!progress || progress.totalExercisesGenerated === 0 ? (
        <p className="muted">Пока нет данных — сгенерируй и реши первую задачу.</p>
      ) : (
        <>
          <p>
            Решено {progress.totalExercisesSolved} из {progress.totalExercisesAttempted}{' '}
            попыток ({progress.successRate}% успешных отправок)
          </p>
          <table>
            <thead>
              <tr>
                <th>Тема</th>
                <th>Решено</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(progress.byTopic).map(([topic, stats]) => (
                <tr key={topic}>
                  <td>{topic}</td>
                  <td>
                    {stats.solved}/{stats.attempted}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {progress.recentSubmissions.length > 0 && (
            <>
              <h4>Последние попытки</h4>
              <ul className="recent">
                {progress.recentSubmissions.map((s, i) => (
                  <li key={i} className={s.passed ? 'pass' : 'fail'}>
                    {s.passed ? '✅' : '❌'} {s.title} ({s.passedCount}/{s.totalCount})
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}
