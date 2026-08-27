import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { store, useAppStore } from '../store';

const extensions = [javascript()];

export function CodeEditorPanel() {
  const { exercise, code, loading } = useAppStore();

  return (
    <div className="panel editor-panel">
      <CodeMirror
        value={code}
        height="320px"
        theme="dark"
        extensions={extensions}
        onChange={(value) => store.setCode(value)}
        basicSetup={{ lineNumbers: true, foldGutter: false }}
      />
      <div className="editor-actions">
        <button
          disabled={loading || !exercise}
          onClick={() => store.submitSolution()}
        >
          {loading ? 'Проверяю…' : 'Отправить решение'}
        </button>
        <button
          className="secondary"
          disabled={loading || !exercise}
          onClick={() => store.getHint()}
        >
          Подсказка
        </button>
      </div>
    </div>
  );
}
