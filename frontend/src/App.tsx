import { useEffect } from 'react';
import { store, useAppStore } from './store';
import { registerWebMcpTools } from './webmcp-tools';
import { ExerciseControls } from './components/ExerciseControls';
import { ExercisePanel } from './components/ExercisePanel';
import { CodeEditorPanel } from './components/CodeEditorPanel';
import { ResultsAndHints } from './components/ResultsAndHints';
import { ProgressPanel } from './components/ProgressPanel';

export default function App() {
  const { error } = useAppStore();

  useEffect(() => {
    store.init();
    const controller = new AbortController();
    registerWebMcpTools(controller.signal).catch((err) => {
      if (controller.signal.aborted) return;
      console.error('Failed to register WebMCP tools', err);
    });
    return () => controller.abort();
  }, []);

  return (
    <div className="app">
      <header>
        <h1>WebMCP Learning Tutor</h1>
        <p className="muted">
          Тренажёр программирования с ассистентом-наставником. Открой эту
          страницу в браузере ChatGPT — агент увидит инструменты{' '}
          <code>generateExercise</code>, <code>submitSolution</code>,{' '}
          <code>getHint</code>, <code>getProgress</code> и сможет вести тебя
          по задачам прямо в чате.
        </p>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <main>
        <section className="main-column">
          <ExerciseControls />
          <ExercisePanel />
          <CodeEditorPanel />
          <ResultsAndHints />
        </section>
        <aside className="side-column">
          <ProgressPanel />
        </aside>
      </main>
    </div>
  );
}
