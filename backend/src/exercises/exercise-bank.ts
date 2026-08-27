import {
  Difficulty,
  GeneratedExercise,
  Topic,
} from './exercise.types.js';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randArray(length: number, min = -20, max = 20): number[] {
  return Array.from({ length }, () => randInt(min, max));
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

interface Template {
  key: string;
  topic: Topic;
  difficulty: Difficulty;
  generate: () => Omit<GeneratedExercise, 'templateKey' | 'topic' | 'difficulty'>;
}

const templates: Template[] = [
  // ---------------- ARRAYS ----------------
  {
    key: 'arrays-sum',
    topic: 'arrays',
    difficulty: 'easy',
    generate: () => {
      const arr = randArray(randInt(4, 7));
      return {
        title: 'Сумма массива',
        description:
          'Напиши функцию `solution(arr)`, которая возвращает сумму всех чисел в массиве `arr`.',
        starterCode: 'function solution(arr) {\n  // твой код здесь\n}\n',
        testCases: [
          { args: [arr], expected: arr.reduce((a, b) => a + b, 0) },
          {
            args: [[1, 2, 3]],
            expected: 6,
          },
          { args: [[]], expected: 0 },
        ],
        hints: [
          'Пройдись по массиву циклом или используй метод `reduce`.',
          'Начни с накопителя `sum = 0`, прибавляй к нему каждый элемент.',
          'Пример: `arr.reduce((sum, x) => sum + x, 0)`.',
        ],
      };
    },
  },
  {
    key: 'arrays-unique',
    topic: 'arrays',
    difficulty: 'medium',
    generate: () => {
      const base = randArray(randInt(4, 6), 0, 5);
      const withDupes = shuffle([...base, ...base.slice(0, 2)]);
      return {
        title: 'Уникальные значения',
        description:
          'Напиши функцию `solution(arr)`, которая возвращает новый массив без повторяющихся элементов, сохраняя порядок первого появления.',
        starterCode: 'function solution(arr) {\n  // твой код здесь\n}\n',
        testCases: [
          {
            args: [withDupes],
            expected: [...new Set(withDupes)],
          },
          { args: [[1, 1, 2, 2, 3]], expected: [1, 2, 3] },
          { args: [[]], expected: [] },
        ],
        hints: [
          'Используй структуру данных, которая не допускает дубликатов — например, `Set`.',
          '`[...new Set(arr)]` уже даёт уникальные значения в исходном порядке.',
          'Если не хочешь использовать `Set`, храни виденные значения в объекте/массиве и фильтруй по нему.',
        ],
      };
    },
  },
  {
    key: 'arrays-max-subarray',
    topic: 'arrays',
    difficulty: 'hard',
    generate: () => {
      const arr = randArray(randInt(6, 9), -10, 10);
      const k = randInt(2, 3);
      const maxWindowSum = (a: number[], size: number) => {
        let best = -Infinity;
        for (let i = 0; i + size <= a.length; i++) {
          const sum = a.slice(i, i + size).reduce((s, x) => s + x, 0);
          best = Math.max(best, sum);
        }
        return best;
      };
      return {
        title: 'Максимальная сумма подмассива',
        description:
          'Напиши функцию `solution(arr, k)`, которая возвращает максимальную сумму среди всех непрерывных подмассивов длины `k`.',
        starterCode: 'function solution(arr, k) {\n  // твой код здесь\n}\n',
        testCases: [
          { args: [arr, k], expected: maxWindowSum(arr, k) },
          { args: [[1, 2, 3, 4], 2], expected: 7 },
        ],
        hints: [
          'Можно перебрать все окна длины `k` и посчитать сумму каждого — это работает, но медленно.',
          'Более быстрый способ — "скользящее окно": храни текущую сумму и при сдвиге окна вычитай элемент слева, прибавляй новый справа.',
          'Не забудь отслеживать лучший (максимальный) результат на каждом шаге.',
        ],
      };
    },
  },

  // ---------------- STRINGS ----------------
  {
    key: 'strings-reverse',
    topic: 'strings',
    difficulty: 'easy',
    generate: () => {
      const words = ['hello', 'coding', 'javascript', 'tutor', 'openai', 'chatgpt'];
      const word = words[randInt(0, words.length - 1)];
      return {
        title: 'Разворот строки',
        description:
          'Напиши функцию `solution(str)`, которая возвращает строку `str`, записанную в обратном порядке.',
        starterCode: 'function solution(str) {\n  // твой код здесь\n}\n',
        testCases: [
          { args: [word], expected: word.split('').reverse().join('') },
          { args: ['abc'], expected: 'cba' },
          { args: [''], expected: '' },
        ],
        hints: [
          'Строку можно превратить в массив символов методом `split("")`.',
          'У массивов есть метод `reverse()`.',
          'Собери массив обратно в строку методом `join("")`.',
        ],
      };
    },
  },
  {
    key: 'strings-palindrome',
    topic: 'strings',
    difficulty: 'medium',
    generate: () => {
      const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
      const isPal = (s: string) => {
        const c = clean(s);
        return c === c.split('').reverse().join('');
      };
      const candidates = [
        'A man a plan a canal Panama',
        'Not a palindrome',
        'racecar',
        'Hello World',
      ];
      const pick = candidates[randInt(0, candidates.length - 1)];
      return {
        title: 'Проверка на палиндром',
        description:
          'Напиши функцию `solution(str)`, которая возвращает `true`, если строка является палиндромом (без учёта регистра и не-буквенно-цифровых символов), иначе `false`.',
        starterCode: 'function solution(str) {\n  // твой код здесь\n}\n',
        testCases: [
          { args: [pick], expected: isPal(pick) },
          { args: ['racecar'], expected: true },
          { args: ['hello'], expected: false },
        ],
        hints: [
          'Сначала приведи строку к нижнему регистру и убери всё, что не буквы/цифры (`replace` с регуляркой).',
          'Сравни очищенную строку с её развёрнутой версией.',
          'Регулярка для удаления лишнего: `/[^a-z0-9]/g`.',
        ],
      };
    },
  },
  {
    key: 'strings-most-frequent-char',
    topic: 'strings',
    difficulty: 'hard',
    generate: () => {
      const words = ['programming', 'javascript', 'mississippi', 'engineering', 'assessment'];
      const word = words[randInt(0, words.length - 1)];
      const mostFrequent = (s: string) => {
        const counts: Record<string, number> = {};
        for (const ch of s) counts[ch] = (counts[ch] || 0) + 1;
        let best = s[0];
        for (const ch of s) {
          if (counts[ch] > counts[best]) best = ch;
        }
        return best;
      };
      return {
        title: 'Самый частый символ',
        description:
          'Напиши функцию `solution(str)`, которая возвращает символ, встречающийся в строке `str` чаще всего. При равенстве — первый из таких символов по порядку появления.',
        starterCode: 'function solution(str) {\n  // твой код здесь\n}\n',
        testCases: [
          { args: [word], expected: mostFrequent(word) },
          { args: ['aabbbcc'], expected: 'b' },
        ],
        hints: [
          'Посчитай, сколько раз встречается каждый символ — удобно хранить в объекте `{символ: количество}`.',
          'Пройдись по строке ещё раз (в исходном порядке) и найди символ с максимальным счётчиком.',
          'Так как ты идёшь по исходному порядку, первый найденный максимум и будет ответом при равенстве.',
        ],
      };
    },
  },

  // ---------------- LOOPS ----------------
  {
    key: 'loops-sum-even',
    topic: 'loops',
    difficulty: 'easy',
    generate: () => {
      const n = randInt(10, 30);
      const sumEven = (m: number) => {
        let s = 0;
        for (let i = 1; i <= m; i++) if (i % 2 === 0) s += i;
        return s;
      };
      return {
        title: 'Сумма чётных чисел',
        description:
          'Напиши функцию `solution(n)`, которая возвращает сумму всех чётных чисел от 1 до `n` включительно.',
        starterCode: 'function solution(n) {\n  // твой код здесь\n}\n',
        testCases: [
          { args: [n], expected: sumEven(n) },
          { args: [10], expected: 30 },
        ],
        hints: [
          'Используй цикл `for`, перебирающий числа от 1 до `n`.',
          'Проверяй чётность через остаток от деления: `i % 2 === 0`.',
          'Накапливай сумму в переменной, объявленной до цикла.',
        ],
      };
    },
  },
  {
    key: 'loops-fizzbuzz',
    topic: 'loops',
    difficulty: 'medium',
    generate: () => {
      const n = randInt(15, 25);
      const fizzbuzz = (m: number) => {
        const res: string[] = [];
        for (let i = 1; i <= m; i++) {
          if (i % 15 === 0) res.push('FizzBuzz');
          else if (i % 3 === 0) res.push('Fizz');
          else if (i % 5 === 0) res.push('Buzz');
          else res.push(String(i));
        }
        return res;
      };
      return {
        title: 'FizzBuzz',
        description:
          'Напиши функцию `solution(n)`, которая возвращает массив строк для чисел от 1 до `n`: "Fizz" для кратных 3, "Buzz" для кратных 5, "FizzBuzz" для кратных и 3, и 5, иначе само число в виде строки.',
        starterCode: 'function solution(n) {\n  // твой код здесь\n}\n',
        testCases: [
          { args: [n], expected: fizzbuzz(n) },
          { args: [15], expected: fizzbuzz(15) },
        ],
        hints: [
          'Собирай результат в массив, проходя от 1 до `n` циклом `for`.',
          'Проверяй кратность 15 раньше, чем 3 и 5 по отдельности, иначе логика сломается.',
          'Не забудь превращать обычные числа в строку: `String(i)`.',
        ],
      };
    },
  },
  {
    key: 'loops-primes',
    topic: 'loops',
    difficulty: 'hard',
    generate: () => {
      const n = randInt(20, 40);
      const isPrime = (x: number) => {
        if (x < 2) return false;
        for (let i = 2; i * i <= x; i++) if (x % i === 0) return false;
        return true;
      };
      const primesUpTo = (m: number) =>
        Array.from({ length: m }, (_, i) => i + 1).filter(isPrime);
      return {
        title: 'Простые числа',
        description:
          'Напиши функцию `solution(n)`, которая возвращает массив всех простых чисел от 2 до `n` включительно.',
        starterCode: 'function solution(n) {\n  // твой код здесь\n}\n',
        testCases: [
          { args: [n], expected: primesUpTo(n) },
          { args: [10], expected: [2, 3, 5, 7] },
        ],
        hints: [
          'Число простое, если оно больше 1 и делится только на 1 и на себя.',
          'Для проверки простоты числа `x` достаточно перебрать делители до `sqrt(x)`.',
          'Пройдись циклом по всем числам от 2 до `n` и собери те, что прошли проверку на простоту.',
        ],
      };
    },
  },

  // ---------------- FUNCTIONS ----------------
  {
    key: 'functions-multiply-all',
    topic: 'functions',
    difficulty: 'easy',
    generate: () => {
      const nums = randArray(randInt(3, 5), 1, 6);
      return {
        title: 'Произведение чисел',
        description:
          'Напиши функцию `solution(...nums)`, которая принимает произвольное число аргументов-чисел и возвращает их произведение.',
        starterCode: 'function solution(...nums) {\n  // твой код здесь\n}\n',
        testCases: [
          { args: nums, expected: nums.reduce((a, b) => a * b, 1) },
          { args: [2, 3, 4], expected: 24 },
        ],
        hints: [
          'Используй rest-параметр `...nums`, чтобы собрать все аргументы в массив.',
          'Пройдись по массиву и перемножь все значения, начиная с накопителя `1`.',
          'Можно использовать `nums.reduce((a, b) => a * b, 1)`.',
        ],
      };
    },
  },
  {
    key: 'functions-fibonacci',
    topic: 'functions',
    difficulty: 'medium',
    generate: () => {
      const n = randInt(8, 15);
      const fib = (m: number): number => {
        let [a, b] = [0, 1];
        for (let i = 0; i < m; i++) [a, b] = [b, a + b];
        return a;
      };
      return {
        title: 'Число Фибоначчи',
        description:
          'Напиши функцию `solution(n)`, которая возвращает n-е число Фибоначчи (`solution(0) === 0`, `solution(1) === 1`).',
        starterCode: 'function solution(n) {\n  // твой код здесь\n}\n',
        testCases: [
          { args: [n], expected: fib(n) },
          { args: [0], expected: 0 },
          { args: [1], expected: 1 },
          { args: [10], expected: 55 },
        ],
        hints: [
          'Каждое следующее число Фибоначчи — сумма двух предыдущих.',
          'Заведи две переменные для текущего и предыдущего числа и обновляй их в цикле.',
          'Рекурсия тоже работает, но для больших `n` цикл эффективнее.',
        ],
      };
    },
  },
  {
    key: 'functions-nth-prime',
    topic: 'functions',
    difficulty: 'hard',
    generate: () => {
      const n = randInt(5, 12);
      const isPrime = (x: number) => {
        if (x < 2) return false;
        for (let i = 2; i * i <= x; i++) if (x % i === 0) return false;
        return true;
      };
      const nthPrime = (m: number) => {
        let count = 0;
        let candidate = 1;
        while (count < m) {
          candidate++;
          if (isPrime(candidate)) count++;
        }
        return candidate;
      };
      return {
        title: 'N-ое простое число',
        description:
          'Напиши функцию `solution(n)`, которая возвращает n-ое по счёту простое число (`solution(1) === 2`, `solution(2) === 3`, `solution(3) === 5`).',
        starterCode: 'function solution(n) {\n  // твой код здесь\n}\n',
        testCases: [
          { args: [n], expected: nthPrime(n) },
          { args: [1], expected: 2 },
          { args: [4], expected: 7 },
        ],
        hints: [
          'Тебе понадобится вспомогательная проверка "является ли число простым".',
          'Перебирай числа по порядку, считая количество найденных простых, пока не дойдёшь до n-го.',
          'Проверку простоты можно ускорить, перебирая делители только до `sqrt(x)`.',
        ],
      };
    },
  },

  // ---------------- OBJECTS ----------------
  {
    key: 'objects-count-keys',
    topic: 'objects',
    difficulty: 'easy',
    generate: () => {
      const keys = ['a', 'b', 'c', 'd', 'e'].slice(0, randInt(2, 5));
      const obj: Record<string, number> = {};
      keys.forEach((k, i) => (obj[k] = i));
      return {
        title: 'Количество ключей',
        description:
          'Напиши функцию `solution(obj)`, которая возвращает количество собственных ключей объекта `obj`.',
        starterCode: 'function solution(obj) {\n  // твой код здесь\n}\n',
        testCases: [
          { args: [obj], expected: Object.keys(obj).length },
          { args: [{ x: 1, y: 2 }], expected: 2 },
          { args: [{}], expected: 0 },
        ],
        hints: [
          '`Object.keys(obj)` возвращает массив ключей объекта.',
          'У массива есть свойство `length`.',
          'Комбинация: `Object.keys(obj).length`.',
        ],
      };
    },
  },
  {
    key: 'objects-invert',
    topic: 'objects',
    difficulty: 'medium',
    generate: () => {
      const pairs: [string, string][] = [
        ['a', '1'],
        ['b', '2'],
        ['c', '3'],
        ['d', '4'],
      ];
      const chosen = shuffle(pairs).slice(0, randInt(2, 4));
      const obj = Object.fromEntries(chosen);
      const inverted = Object.fromEntries(chosen.map(([k, v]) => [v, k]));
      return {
        title: 'Инверсия объекта',
        description:
          'Напиши функцию `solution(obj)`, которая возвращает новый объект, где ключи и значения исходного объекта `obj` поменяны местами.',
        starterCode: 'function solution(obj) {\n  // твой код здесь\n}\n',
        testCases: [
          { args: [obj], expected: inverted },
          { args: [{ x: 'y' }], expected: { y: 'x' } },
        ],
        hints: [
          'Можно пройтись по ключам объекта циклом `for...in` и класть `obj[key]` как новый ключ.',
          'Или использовать `Object.entries(obj)` и `map`, чтобы поменять пары местами.',
          '`Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]))`.',
        ],
      };
    },
  },
  {
    key: 'objects-flatten',
    topic: 'objects',
    difficulty: 'hard',
    generate: () => {
      const candidates = [
        { user: { name: 'Ann', address: { city: 'Tashkent', zip: '100000' } } },
        { a: 1, b: { c: 2, d: { e: 3 } } },
        { settings: { theme: 'dark', volume: { level: 5 } } },
      ];
      const obj = candidates[randInt(0, candidates.length - 1)];
      const flatten = (o: any, prefix = ''): Record<string, unknown> => {
        let result: Record<string, unknown> = {};
        for (const key of Object.keys(o)) {
          const value = o[key];
          const newKey = prefix ? `${prefix}.${key}` : key;
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            result = { ...result, ...flatten(value, newKey) };
          } else {
            result[newKey] = value;
          }
        }
        return result;
      };
      return {
        title: 'Разворачивание вложенного объекта',
        description:
          'Напиши функцию `solution(obj)`, которая превращает вложенный объект в плоский, где ключи — это пути через точку (например, `{a: {b: 1}}` → `{"a.b": 1}`).',
        starterCode: 'function solution(obj) {\n  // твой код здесь\n}\n',
        testCases: [
          { args: [obj], expected: flatten(obj) },
          { args: [{ a: { b: { c: 1 } } }], expected: { 'a.b.c': 1 } },
        ],
        hints: [
          'Это задача на рекурсию: для каждого ключа проверяй, является ли значение объектом.',
          'Если значение — вложенный объект, рекурсивно разворачивай его, добавляя текущий ключ как префикс.',
          'Собирай результат в один плоский объект через `{...result, ...flatten(value, newKey)}`.',
        ],
      };
    },
  },
];

export function pickTemplate(topic?: Topic, difficulty?: Difficulty): Template {
  let pool = templates;
  if (topic) pool = pool.filter((t) => t.topic === topic);
  if (difficulty) pool = pool.filter((t) => t.difficulty === difficulty);
  if (pool.length === 0) pool = templates;
  return pool[randInt(0, pool.length - 1)];
}

export function generateFromTemplate(
  topic?: Topic,
  difficulty?: Difficulty,
): GeneratedExercise {
  const template = pickTemplate(topic, difficulty);
  const generated = template.generate();
  return {
    templateKey: template.key,
    topic: template.topic,
    difficulty: template.difficulty,
    ...generated,
  };
}

export { templates };
