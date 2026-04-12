import type { Print } from "./worker/types/data/Print";
import type { Problem, Statement } from "./worker/types/data/Problems";
import type { Submission } from "./worker/types/data/Submission";

// ── helpers ────────────────────────────────────────────────────────────

const uid = (): string => crypto.randomUUID();

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── generator ──────────────────────────────────────────────────────────

function generateProblem(overrides: Partial<Problem> = {}): Problem {
  const LABELS = ["A", "B", "C", "D", "E", "F"];
  const NAMES = [
    "Two Sum",
    "Graph Traversal",
    "Longest Path",
    "Matrix Rotation",
    "Segment Tree",
    "Convex Hull",
  ];

  const STATEMENTS: Statement[] = [
    {
      href: "https://example.com/statements/problem-a.pdf",
      mime: "application/pdf",
    },
    {
      href: "https://example.com/statements/problem-b.pdf",
      mime: "application/pdf",
    },
    {
      href: "https://example.com/statements/problem-c.pdf",
      mime: "application/pdf",
    },
  ];

  return {
    id: uid(),
    label: pick(LABELS),
    name: pick(NAMES),
    time_limit: pick([1, 2, 3, 5]),
    memory_limit: pick([64, 128, 256, 512]),
    statement: [pick(STATEMENTS)],
    ...overrides,
  };
}

// ── bulk generator ─────────────────────────────────────────────────────

export function generateProblems(
  count: number,
  overrides: Partial<Problem> = {},
) {
  return Object.fromEntries(
    Array.from({ length: count }, () => {
      const problem = generateProblem(overrides);
      return [problem.id, problem];
    }),
  );
}

const STATUSES: Submission["status"][] = [
  "starting",
  "compiling",
  "running",
  "finished",
  "failed",
];

const JUDGEMENT_TYPE_IDS = [
  "AC", // Accepted
  "WA", // Wrong Answer
  "TLE", // Time Limit Exceeded
  "MLE", // Memory Limit Exceeded
  "RTE", // Runtime Error
  "CE", // Compilation Error
  "PE", // Presentation Error
];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const languageIdToName: Record<string, string> = {
  ada: "Ada",
  c: "C",
  cpp: "C++",
  csharp: "C#",
  go: "Go",
  haskell: "Haskell",
  java: "Java",
  javascript: "JavaScript",
  kotlin: "Kotlin",
  objectivec: "Objective-C",
  pascal: "Pascal",
  php: "PHP",
  prolog: "Prolog",
  python2: "Python 2",
  python3: "Python 3",
  ruby: "Ruby",
  rust: "Rust",
  scala: "Scala",
};

function createSubmission(): Submission {
  const status = randomElement(STATUSES);

  return {
    id: crypto.randomUUID(),
    status,
    language_id: randomElement(Object.keys(languageIdToName)),
    problem_id: crypto.randomUUID(),
    account_id: crypto.randomUUID(),
    team_id: crypto.randomUUID(),
    ...(status === "finished" && {
      judgement_type_id: randomElement(JUDGEMENT_TYPE_IDS),
    }),
  };
}

export function generateSubmissions(count: number): Record<string, Submission> {
  return Object.fromEntries(
    Array.from({ length: count }, () => {
      const submission = createSubmission();
      return [submission.id, submission];
    }),
  );
}

// helper to generate random IDs
const randomId = (length = 10): string =>
  Math.random()
    .toString(36)
    .substring(2, 2 + length);

// helper to pick random status
const randomStatus = (): Print["status"] => {
  const statuses: Print["status"][] = [
    "pending",
    "compiling",
    "ready",
    "failure",
    "error",
    "done",
  ];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

export function generatePrintMap(count: number): Record<string, Print> {
  const result: Record<string, Print> = {};

  for (let i = 0; i < count; i++) {
    const id = randomId();
    const status = randomStatus();

    const print: Print = {
      id,
      owner_id: randomId(8),
      status,
      code_href: `https://example.com/code/${id}`,
    };

    // add optional fields based on status
    if (status === "failure" || status === "error") {
      print.simple_error = "Something went wrong";
      print.err_href = `https://example.com/error/${id}`;
    }

    if (status === "ready" || status === "done") {
      print.pdf_href = `https://example.com/pdf/${id}`;
    }

    result[id] = print;
  }

  return result;
}
