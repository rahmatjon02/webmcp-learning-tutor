import '@mcp-b/global';
import { store } from './store';
import { DIFFICULTIES, TOPICS } from './types';

function text(value: string) {
  return { content: [{ type: 'text' as const, text: value }] };
}

function formatResult(result: Awaited<ReturnType<typeof store.submitSolution>>) {
  if (result.compileError) {
    return `Код не выполнился: ${result.compileError}`;
  }
  const lines = [
    result.passed
      ? `Все тесты пройдены (${result.passedCount}/${result.totalCount})! Задача решена.`
      : `Пройдено ${result.passedCount} из ${result.totalCount} тестов.`,
  ];
  for (const [i, r] of result.results.entries()) {
    if (r.passed) continue;
    lines.push(
      `  Тест ${i + 1}: solution(${r.args.map((a) => JSON.stringify(a)).join(', ')}) ` +
        (r.error
          ? `упал с ошибкой: ${r.error}`
          : `вернул ${JSON.stringify(r.actual)}, ожидалось ${JSON.stringify(r.expected)}`),
    );
  }
  return lines.join('\n');
}

/**
 * Registers the 4 WebMCP tools this tutor exposes to any AI agent (e.g. ChatGPT)
 * browsing this page, backed by the same store the human-facing UI uses — so an
 * agent driving the page and a student clicking buttons stay in sync.
 */
export async function registerWebMcpTools(signal?: AbortSignal) {
  const modelContext = document.modelContext;
  if (!modelContext) {
    console.warn('document.modelContext is unavailable — WebMCP tools not registered.');
    return;
  }
  const options = signal ? { signal } : undefined;

  await modelContext.registerTool({
    name: 'generateExercise',
    description:
      'Создаёт новое упражнение по программированию на JavaScript для ученика. Если сложность не указана, она подбирается автоматически по прогрессу ученика.',
    inputSchema: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          enum: TOPICS,
          description: 'Тема задачи: arrays, strings, loops, functions или objects.',
        },
        difficulty: {
          type: 'string',
          enum: DIFFICULTIES,
          description: 'Сложность: easy, medium или hard. Необязательно.',
        },
      },
    },
    async execute({ topic, difficulty }) {
      const exercise = await store.generateExercise(topic, difficulty);
      return text(
        `Сгенерирована задача "${exercise.title}" (${exercise.topic}/${exercise.difficulty}, id=${exercise.id}).\n\n${exercise.description}\n\nСтартовый код:\n${exercise.starterCode}`,
      );
    },
  }, options);

  await modelContext.registerTool({
    name: 'submitSolution',
    description:
      'Отправляет решение ученика (или предложенное агентом) на проверку по скрытым тест-кейсам активного упражнения.',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'Полный код решения — должен объявлять `function solution(...) {...}`.',
        },
        exerciseId: {
          type: 'string',
          description:
            'ID упражнения. Необязательно — по умолчанию используется текущее открытое упражнение.',
        },
      },
      required: ['code'],
    },
    async execute({ code, exerciseId }) {
      const result = await store.submitSolution(code, exerciseId);
      return text(formatResult(result));
    },
  }, options);

  await modelContext.registerTool({
    name: 'getHint',
    description:
      'Запрашивает следующую подсказку для активного упражнения, если ученик застрял.',
    inputSchema: {
      type: 'object',
      properties: {
        exerciseId: {
          type: 'string',
          description:
            'ID упражнения. Необязательно — по умолчанию используется текущее открытое упражнение.',
        },
      },
    },
    async execute({ exerciseId }) {
      const result = await store.getHint(exerciseId);
      if (!result.hint) {
        return text('Все подсказки для этой задачи уже показаны.');
      }
      return text(
        `Подсказка ${result.hintsRevealed}/${result.totalHints}: ${result.hint}`,
      );
    },
  }, options);

  await modelContext.registerTool({
    name: 'getProgress',
    description:
      'Возвращает статистику прогресса ученика: сколько задач решено, по каким темам и сложностям, последние попытки.',
    inputSchema: {
      type: 'object',
      properties: {
        studentId: {
          type: 'string',
          description:
            'ID ученика. Необязательно — по умолчанию используется текущий ученик этой сессии.',
        },
      },
    },
    async execute({ studentId }) {
      const progress = await store.refreshProgress(studentId);
      if (!progress) {
        return text('Прогресс пока недоступен — сначала сгенерируй упражнение.');
      }
      const topicLines = Object.entries(progress.byTopic)
        .map(([topic, s]) => `  ${topic}: ${s.solved}/${s.attempted} решено`)
        .join('\n');
      return text(
        `Ученик ${progress.studentId}:\n` +
          `Решено задач: ${progress.totalExercisesSolved} из ${progress.totalExercisesAttempted} попыток (успех ${progress.successRate}%).\n` +
          `По темам:\n${topicLines || '  нет данных'}`,
      );
    },
  }, options);
}
