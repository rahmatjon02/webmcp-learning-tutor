import { useAppStore } from '../store';

export function ResultsAndHints() {
  const { lastResult, revealedHints, hintsTotal } = useAppStore();

  return (
    <div className="panel">
      {lastResult && (
        <div className={`result ${lastResult.passed ? 'result-pass' : 'result-fail'}`}>
          {lastResult.compileError ? (
            <p>Ошибка: {lastResult.compileError}</p>
          ) : (
            <>
              <p>
                {lastResult.passed ? '✅ Все тесты пройдены' : '❌ Не все тесты пройдены'}{' '}
                ({lastResult.passedCount}/{lastResult.totalCount})
              </p>
              <ul>
                {lastResult.results.map((r, i) => (
                  <li key={i} className={r.passed ? 'pass' : 'fail'}>
                    solution({r.args.map((a) => JSON.stringify(a)).join(', ')}) ={' '}
                    {r.error ? `ошибка: ${r.error}` : JSON.stringify(r.actual)}
                    {!r.passed && !r.error && (
                      <> (ожидалось {JSON.stringify(r.expected)})</>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {revealedHints.length > 0 && (
        <div className="hints">
          <h3>
            Подсказки ({revealedHints.length}
            {hintsTotal ? `/${hintsTotal}` : ''})
          </h3>
          <ol>
            {revealedHints.map((hint, i) => (
              <li key={i}>{hint}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
