import { Injectable } from '@nestjs/common';
import * as vm from 'node:vm';
import { TestCase } from '../exercises/exercise.types.js';

export interface TestResult {
  passed: boolean;
  args: unknown[];
  expected: unknown;
  actual?: unknown;
  error?: string;
}

export interface RunResult {
  compileError?: string;
  results: TestResult[];
  passedCount: number;
  totalCount: number;
  allPassed: boolean;
}

const TIMEOUT_MS = 1000;

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return false;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, (b as unknown[])[i]));
  }
  if (typeof a === 'object' && typeof b === 'object') {
    const aKeys = Object.keys(a as object).sort();
    const bKeys = Object.keys(b as object).sort();
    if (aKeys.length !== bKeys.length) return false;
    if (!aKeys.every((k, i) => k === bKeys[i])) return false;
    return aKeys.every((k) =>
      deepEqual(
        (a as Record<string, unknown>)[k],
        (b as Record<string, unknown>)[k],
      ),
    );
  }
  return false;
}

/**
 * Runs untrusted JS in a node:vm context with a wall-clock timeout per script.
 * This is a best-effort sandbox suitable for a hackathon demo, not a hard
 * security boundary (node:vm is known to be escapable by a determined
 * attacker) — a production deployment should isolate execution in a
 * separate worker/container (e.g. isolated-vm or gVisor).
 */
@Injectable()
export class CodeRunnerService {
  run(code: string, testCases: TestCase[]): RunResult {
    const context = vm.createContext({
      console: { log: () => {}, error: () => {} },
      Math,
      JSON,
      Array,
      Object,
      String,
      Number,
      Boolean,
      Set,
      Map,
    });

    try {
      const script = new vm.Script(code, { filename: 'solution.js' });
      script.runInContext(context, { timeout: TIMEOUT_MS });
    } catch (err) {
      return {
        compileError: err instanceof Error ? err.message : 'Unknown error',
        results: [],
        passedCount: 0,
        totalCount: testCases.length,
        allPassed: false,
      };
    }

    if (typeof (context as Record<string, unknown>).solution !== 'function') {
      return {
        compileError:
          'Функция `solution` не найдена. Объяви `function solution(...) { ... }`.',
        results: [],
        passedCount: 0,
        totalCount: testCases.length,
        allPassed: false,
      };
    }

    const results: TestResult[] = testCases.map((tc) => {
      const ctx = context as Record<string, unknown>;
      ctx.__args = tc.args;
      ctx.__result = undefined;
      try {
        const runnerScript = new vm.Script(
          'globalThis.__result = solution(...globalThis.__args);',
          { filename: 'runner.js' },
        );
        runnerScript.runInContext(context, { timeout: TIMEOUT_MS });
      } catch (err) {
        return {
          passed: false,
          args: tc.args,
          expected: tc.expected,
          error: err instanceof Error ? err.message : 'Ошибка выполнения',
        };
      }
      const actual = ctx.__result;
      const passed = deepEqual(actual, tc.expected);
      return { passed, args: tc.args, expected: tc.expected, actual };
    });

    const passedCount = results.filter((r) => r.passed).length;
    return {
      results,
      passedCount,
      totalCount: testCases.length,
      allPassed: passedCount === testCases.length,
    };
  }
}
