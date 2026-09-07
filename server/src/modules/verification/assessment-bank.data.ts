export interface AssessmentQuestion {
  id: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

export interface AssessmentTrack {
  id: string;
  title: string;
  skillName: string;
  category: "Frontend" | "Backend" | "Cloud & DevOps" | "Programming" | "Mobile";
  description: string;
  durationMinutes: number;
  passingScore: number; // e.g. 70
  iconName: string;
  color: string;
  questions: AssessmentQuestion[];
}

export const ASSESSMENT_BANK: Record<string, AssessmentTrack> = {
  react: {
    id: "react",
    title: "React.js Architecture & Concurrency",
    skillName: "React",
    category: "Frontend",
    description:
      "Advanced evaluation covering Hooks lifecycle, Server Components, Concurrency, Fiber architecture, and Performance optimization.",
    durationMinutes: 15,
    passingScore: 70,
    iconName: "Atom",
    color: "#61DAFB",
    questions: [
      {
        id: "react_q1",
        question: "What is the primary architectural difference between React Server Components (RSC) and standard Client Components?",
        codeSnippet: `// ServerComponent.tsx
export default async function UserProfile({ id }: { id: string }) {
  const user = await db.user.findUnique({ where: { id } });
  return <div><h1>{user.name}</h1></div>;
}`,
        options: [
          "RSCs send zero JavaScript bundle to the client and execute exclusively on the server, whereas Client Components ship JS and hydrate on the browser.",
          "RSCs only work with GraphQL queries and cannot access database drivers directly.",
          "Client Components cannot use React Hooks such as useState or useEffect.",
          "RSCs are rendered as static HTML once at build time and cannot receive dynamic request params."
        ],
        correctOptionIndex: 0,
        explanation: "React Server Components execute only on the server and pass their rendered JSX/tree representation without adding component JS to the client bundle, reducing hydration cost.",
        difficulty: "advanced"
      },
      {
        id: "react_q2",
        question: "When using `useTransition` in React 18+, how does React prioritize state updates scheduled inside `startTransition`?",
        codeSnippet: `const [isPending, startTransition] = useTransition();

const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
  setQuery(e.target.value); // Urgent update
  startTransition(() => {
    setSearchResults(filterLargeList(e.target.value)); // Non-urgent
  });
};`,
        options: [
          "Transitions run in a web worker thread outside the main UI loop.",
          "Updates inside startTransition are treated as non-urgent background transitions that can be interrupted by urgent user interactions like keystrokes.",
          "React delays the entire component re-render by a fixed setTimeout of 300ms.",
          "Transitions prevent all re-renders until the component is fully unmounted."
        ],
        correctOptionIndex: 1,
        explanation: "startTransition marks state updates as non-urgent, allowing React to interrupt them to keep high-priority interactions (typing, clicking) responsive.",
        difficulty: "intermediate"
      },
      {
        id: "react_q3",
        question: "In the following `useEffect` hook, what is the cause of the memory leak / stale closure bug, and how should it be resolved?",
        codeSnippet: `useEffect(() => {
  const handleScroll = () => {
    if (window.scrollY > offset) {
      setIsScrolled(true);
    }
  };
  window.addEventListener('scroll', handleScroll);
}, []);`,
        options: [
          "offset is not in the dependency array causing a stale closure, and the event listener is never cleaned up in a return callback.",
          "window.addEventListener cannot be invoked inside useEffect.",
          "setIsScrolled requires a synchronous dispatch outside of callback functions.",
          "useEffect must return a Promise with the cleanup function."
        ],
        correctOptionIndex: 0,
        explanation: "The effect omits 'offset' from dependencies (stale closure) and lacks a cleanup return () => window.removeEventListener('scroll', handleScroll) leading to memory leaks.",
        difficulty: "intermediate"
      },
      {
        id: "react_q4",
        question: "How does React Fiber achieve time-slicing and interruptible rendering?",
        options: [
          "By splitting the rendering work into atomic units of work (Fiber nodes) and yielding control to the browser event loop using scheduler mechanisms like MessageChannel.",
          "By executing virtual DOM diffs using WebAssembly compiled binaries.",
          "By locking the main thread using synchronous while loops until the reconciliation completes.",
          "By using SharedArrayBuffers across browser workers."
        ],
        correctOptionIndex: 0,
        explanation: "Fiber breaks the render phase into linked-list units of work, checking elapsed frame time (5ms budget) and yielding back to the browser when needed.",
        difficulty: "advanced"
      },
      {
        id: "react_q5",
        question: "What is the key difference between `useMemo` and `useCallback`?",
        options: [
          "useMemo memoizes the computed return value of a function, whereas useCallback memoizes the function definition instance itself.",
          "useCallback is only used for asynchronous promises, while useMemo is purely synchronous.",
          "useMemo triggers a re-render when dependencies change, while useCallback suppresses re-renders.",
          "There is no difference; useCallback is an alias for useMemo(() => fn, deps)."
        ],
        correctOptionIndex: 0,
        explanation: "useMemo(() => compute(a, b), [a, b]) caches the result, while useCallback(fn, deps) caches the function reference across renders.",
        difficulty: "beginner"
      },
      {
        id: "react_q6",
        question: "Which pattern prevents unnecessary re-renders in deeply nested React component trees without drilling props?",
        options: [
          "React Context combined with custom hooks or state management stores (Zustand/Redux) with selective state subscriptions.",
          "Using global window variables inside component bodies.",
          "Wrapping every single JSX element in React.memo().",
          "Setting shouldComponentUpdate to always return false."
        ],
        correctOptionIndex: 0,
        explanation: "Using Context with fine-grained selectors or atomic store subscriptions (Zustand/Redux) avoids deep prop drilling and prevents re-renders of non-subscriber components.",
        difficulty: "intermediate"
      }
    ]
  },

  typescript: {
    id: "typescript",
    title: "TypeScript Deep Dive & Type Safety",
    skillName: "TypeScript",
    category: "Programming",
    description:
      "Advanced type system mastery: conditional types, mapped types, template literals, type guards, and generics.",
    durationMinutes: 15,
    passingScore: 70,
    iconName: "FileCode2",
    color: "#3178C6",
    questions: [
      {
        id: "ts_q1",
        question: "What does the following advanced TypeScript conditional type resolve to when applied to a Promise type?",
        codeSnippet: `type UnwrapPromise<T> = T extends Promise<infer U> ? UnwrapPromise<U> : T;

type Result = UnwrapPromise<Promise<Promise<string>>>;`,
        options: [
          "string",
          "Promise<string>",
          "Promise<Promise<string>>",
          "unknown"
        ],
        correctOptionIndex: 0,
        explanation: "The recursive conditional type unwraps nested Promise types using the 'infer' keyword until a non-promise type 'string' is reached.",
        difficulty: "advanced"
      },
      {
        id: "ts_q2",
        question: "What is the purpose of the `satisfies` operator introduced in TypeScript 4.9?",
        codeSnippet: `type Colors = "red" | "green" | "blue";
type RGB = [red: number, green: number, blue: number];

const palette = {
  red: [255, 0, 0],
  green: "#00ff00",
  blue: [0, 0, 255],
} satisfies Record<Colors, string | RGB>;`,
        options: [
          "It validates that an expression matches a type without widening or erasing the more specific inferred type of the variable.",
          "It dynamically casts the variable at JavaScript runtime and throws a TypeError if invalid.",
          "It creates an immutable frozen object using Object.freeze().",
          "It marks the variable as an optional interface implementation."
        ],
        correctOptionIndex: 0,
        explanation: "The 'satisfies' operator ensures conformance to a type contract while preserving the exact literal types of values (e.g., palette.green is inferred as string rather than string | RGB).",
        difficulty: "advanced"
      },
      {
        id: "ts_q3",
        question: "How do Discriminated Unions enable type narrowing in TypeScript?",
        codeSnippet: `type NetworkState =
  | { status: 'loading' }
  | { status: 'success'; data: string[] }
  | { status: 'error'; error: Error };

function render(state: NetworkState) {
  if (state.status === 'success') {
    console.log(state.data); // Valid
  }
}`,
        options: [
          "By utilizing a common literal property (the discriminant, e.g., 'status') that TypeScript compiler checks in control flow branches.",
          "By inspecting the JavaScript prototype chain using instanceof at runtime.",
          "By converting union types to intersection types automatically.",
          "By forcing all union members to implement the same class interface."
        ],
        correctOptionIndex: 0,
        explanation: "Discriminated unions use a singleton literal field (discriminant) that control flow analysis uses to eliminate inapplicable branches and narrow the type.",
        difficulty: "intermediate"
      },
      {
        id: "ts_q4",
        question: "What is the difference between `any` and `unknown` in TypeScript?",
        options: [
          "any disables all type checking and allows arbitrary operations; unknown is a type-safe counterpart that requires type narrowing before performing operations.",
          "unknown disables type checking, while any is restricted to primitive types.",
          "unknown cannot be assigned to any variable.",
          "any is only valid in TypeScript 3.0 or below."
        ],
        correctOptionIndex: 0,
        explanation: "unknown represents any value but forces developers to perform type checks (narrowing) before calling methods or accessing properties on it.",
        difficulty: "beginner"
      },
      {
        id: "ts_q5",
        question: "How do you construct a type in TypeScript that makes all properties in `T` readonly and optional recursively?",
        codeSnippet: `type DeepPartialReadonly<T> = {
  readonly [P in keyof T]?: T[P] extends object ? DeepPartialReadonly<T[P]> : T[P];
};`,
        options: [
          "Using recursive mapped types with the readonly and optional modifiers (as shown in the snippet).",
          "Using TypeScript's built-in Partial<Readonly<T>> which is automatically recursive.",
          "Using Object.freeze<T> type alias.",
          "Using enum declarations."
        ],
        correctOptionIndex: 0,
        explanation: "Built-in Partial<T> and Readonly<T> are shallow. A recursive mapped type traversing nested object types is required for deep immutability and optionality.",
        difficulty: "advanced"
      },
      {
        id: "ts_q6",
        question: "What does the `never` type represent in TypeScript?",
        options: [
          "A type representing values that never occur (e.g. functions that throw exceptions or infinite loops, or exhaustive switch checks).",
          "A type alias for null or undefined.",
          "A variable that can be assigned any value at any time.",
          "A promise that has not yet resolved."
        ],
        correctOptionIndex: 0,
        explanation: "never is the bottom type in TypeScript's type system, used to model unreachable states and perform exhaustive pattern matching checks.",
        difficulty: "intermediate"
      }
    ]
  },

  nodejs: {
    id: "nodejs",
    title: "Node.js Backend & Runtime Engineering",
    skillName: "Node.js",
    category: "Backend",
    description:
      "Enterprise Node.js: Event Loop mechanics, Streams & Buffers, Cluster & Worker Threads, Asynchronous patterns, and API architecture.",
    durationMinutes: 15,
    passingScore: 70,
    iconName: "Server",
    color: "#339933",
    questions: [
      {
        id: "node_q1",
        question: "In what order does the Node.js event loop execute microtasks (process.nextTick vs Promise callbacks) relative to the phases of the libuv event loop?",
        options: [
          "process.nextTick queue is processed immediately after the current operation finishes, followed by the Promise microtask queue, before the event loop advances to the next phase.",
          "Promises always execute before process.nextTick.",
          "Microtasks only execute once at the end of the entire check phase.",
          "process.nextTick callbacks are scheduled in the timers phase with setTimeout(fn, 0)."
        ],
        correctOptionIndex: 0,
        explanation: "process.nextTick has the highest priority and drains before the Promise microtask queue, both of which execute immediately after the current tick of JavaScript completes.",
        difficulty: "advanced"
      },
      {
        id: "node_q2",
        question: "What is the primary advantage of Node.js Streams (Transform / Readable / Writable) over `fs.readFile` for large files?",
        codeSnippet: `import { createReadStream, createWriteStream } from 'fs';
import { createGzip } from 'zlib';

createReadStream('huge_file.log')
  .pipe(createGzip())
  .pipe(createWriteStream('huge_file.log.gz'));`,
        options: [
          "Streams process data in chunks (buffering bounded memory), preventing out-of-memory (OOM) crashes by implementing automatic backpressure.",
          "Streams encrypt the file automatically using SSL certificates.",
          "Streams execute synchronously on the main thread without libuv thread pool.",
          "fs.readFile is deprecated in Node.js 18+."
        ],
        correctOptionIndex: 0,
        explanation: "Streaming processes data piece by piece in chunks, handling backpressure so fast producers don't overwhelm slow consumers or exceed heap allocation.",
        difficulty: "intermediate"
      },
      {
        id: "node_q3",
        question: "When handling CPU-intensive tasks (e.g. video transcoding, heavy cryptography) in Node.js, what is the recommended architecture?",
        options: [
          "Offloading computation to `worker_threads` or dedicated background microservice workers to avoid blocking the main event loop.",
          "Wrapping the CPU calculation in a `Promise.resolve().then(...)`.",
          "Using `process.nextTick()` recursively.",
          "Increasing `uv_threadpool_size` which automatically speeds up JS CPU calculations."
        ],
        correctOptionIndex: 0,
        explanation: "Promises and nextTick still run JavaScript on the single main thread. CPU-intensive operations block the event loop unless offloaded to worker threads or external worker processes.",
        difficulty: "intermediate"
      },
      {
        id: "node_q4",
        question: "What happens if an asynchronous Promise rejection occurs in Node.js without a `.catch()` or `try/catch` handler?",
        options: [
          "The process emits an `unhandledRejection` event and terminates with a non-zero exit code (default in modern Node.js versions).",
          "Node.js silently ignores the error and continues normal execution.",
          "The error is logged to stdout and automatically retried 3 times.",
          "The event loop pauses until an incoming HTTP request resumes it."
        ],
        correctOptionIndex: 0,
        explanation: "In Node.js 15+, unhandled rejections trigger unhandledRejection and crash the process with code 1 by default unless an explicit listener handles it.",
        difficulty: "intermediate"
      },
      {
        id: "node_q5",
        question: "What is the purpose of `express.Router()` and Express middleware chaining `(req, res, next)`?",
        options: [
          "To create modular, mountable route handlers and sequentially execute cross-cutting concerns (auth, validation, logging) by calling next().",
          "To compile routes into static C++ binaries for performance.",
          "To run routes concurrently across multi-core CPUs without cluster.",
          "To manage database connections in MongoDB."
        ],
        correctOptionIndex: 0,
        explanation: "Express middleware functions have access to req, res, and the next middleware function in the request-response cycle, creating a flexible processing pipeline.",
        difficulty: "beginner"
      },
      {
        id: "node_q6",
        question: "How does `Buffer.from()` allocate memory compared to regular V8 heap allocations in Node.js?",
        options: [
          "Buffers allocate raw memory outside the V8 JavaScript heap through C++ libuv memory allocators.",
          "Buffers are stored in the browser LocalStorage.",
          "Buffers are always written directly to the physical hard drive.",
          "Buffers can only store ASCII strings up to 256 characters."
        ],
        correctOptionIndex: 0,
        explanation: "Node.js Buffers represent fixed-length sequences of bytes allocated outside the V8 heap in raw C++ memory, optimized for binary stream handling.",
        difficulty: "advanced"
      }
    ]
  },

  cloud: {
    id: "cloud",
    title: "Cloud Architecture, DevOps & Containers",
    skillName: "Cloud Architecture",
    category: "Cloud & DevOps",
    description:
      "Enterprise Cloud & DevOps: Docker containerization, Kubernetes orchestration, AWS primitives, Infrastructure as Code, and CI/CD.",
    durationMinutes: 15,
    passingScore: 70,
    iconName: "Cloud",
    color: "#FF9900",
    questions: [
      {
        id: "cloud_q1",
        question: "Why are Multi-Stage Docker builds considered a best practice for production container images?",
        codeSnippet: `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/server.js"]`,
        options: [
          "They separate build dependencies (compilers, SDKs, devDependencies) from the runtime environment, resulting in minimal image size and reduced attack surface.",
          "They automatically deploy the container to AWS ECS without a registry.",
          "They enable the container to run on ARM and x86 simultaneously in one stage.",
          "They eliminate the need for Dockerfiles."
        ],
        correctOptionIndex: 0,
        explanation: "Multi-stage builds leave behind heavyweight compilers, git dependencies, and temp files, copying only compiled artifacts to the lightweight final production image.",
        difficulty: "intermediate"
      },
      {
        id: "cloud_q2",
        question: "In Kubernetes, what is the role of an Ingress Controller compared to a ClusterIP Service?",
        options: [
          "An Ingress Controller manages external HTTP/HTTPS routing, SSL termination, and host/path-based traffic into internal ClusterIP Services.",
          "ClusterIP exposes services publicly to the internet, while Ingress is only used for internal database connections.",
          "An Ingress Controller is a physical hardware switch in AWS data centers.",
          "ClusterIP handles DNS resolution for external third-party APIs."
        ],
        correctOptionIndex: 0,
        explanation: "An Ingress exposes HTTP and HTTPS routes from outside the cluster to services within the cluster, handling TLS, load balancing, and virtual hosting.",
        difficulty: "advanced"
      },
      {
        id: "cloud_q3",
        question: "Which AWS IAM principle enforces that IAM roles/users only possess the minimum permissions required to perform their intended tasks?",
        options: [
          "Principle of Least Privilege (PoLP)",
          "Principle of Maximum Redundancy",
          "Public Read Authorization Rule",
          "Dynamic Role Escalation Standard"
        ],
        correctOptionIndex: 0,
        explanation: "The Principle of Least Privilege dictates granting only the specific IAM actions (e.g. s3:GetObject on a single bucket) strictly necessary for the workload.",
        difficulty: "beginner"
      },
      {
        id: "cloud_q4",
        question: "In 12-Factor App methodology, how should application configuration (API keys, DB URLs, secrets) be stored and provided to workloads?",
        options: [
          "Injected via Environment Variables at deployment/runtime rather than hardcoded in the codebase or checked into version control.",
          "Hardcoded in a config.ts file committed to Git.",
          "Saved as plaintext .env files on the public web server.",
          "Stored inside Docker images during build time."
        ],
        correctOptionIndex: 0,
        explanation: "Factor III of the Twelve-Factor App specifies storing config strictly in the environment, separating code from secrets and environment-specific settings.",
        difficulty: "intermediate"
      },
      {
        id: "cloud_q5",
        question: "What is the key advantage of Infrastructure as Code (IaC) tools like Terraform or AWS CDK?",
        options: [
          "Declarative, reproducible, version-controlled cloud infrastructure provisioning with state tracking and automated drift detection.",
          "They eliminate the need for cloud provider accounts.",
          "They convert JavaScript code into physical server racks.",
          "They replace application backend code entirely."
        ],
        correctOptionIndex: 0,
        explanation: "IaC enables programmatic definition, review, and automation of cloud resources, preventing manual console configuration drift and ensuring identical staging/production parity.",
        difficulty: "intermediate"
      },
      {
        id: "cloud_q6",
        question: "What is the primary difference between a Blue/Green deployment and a Canary deployment strategy?",
        options: [
          "Blue/Green switches 100% of traffic from the old environment to the new one after validation; Canary gradually routes a small percentage of real traffic (e.g., 5% -> 25% -> 100%) to test stability.",
          "Canary deployment requires shutting down all servers for maintenance.",
          "Blue/Green deployments do not support rollback.",
          "Canary deployments are only used for mobile app store releases."
        ],
        correctOptionIndex: 0,
        explanation: "Canary rollouts expose a subset of users to new code while monitoring telemetry/error rates before full rollout, whereas Blue/Green provides instant cutover between two full environments.",
        difficulty: "advanced"
      }
    ]
  },

  python: {
    id: "python",
    title: "Python Advanced Engineering & Async",
    skillName: "Python",
    category: "Programming",
    description:
      "Python mastery: Decorators, Generators, Asyncio event loop, GIL mechanics, Metaclasses, and Memory optimization.",
    durationMinutes: 15,
    passingScore: 70,
    iconName: "Binary",
    color: "#3776AB",
    questions: [
      {
        id: "py_q1",
        question: "How does the Python Global Interpreter Lock (GIL) in CPython affect multi-threaded CPU-bound programs versus I/O-bound programs?",
        options: [
          "The GIL ensures only one thread executes Python bytecode at a time, restricting CPU-bound multi-threading to a single core; I/O-bound programs benefit from multi-threading because the GIL is released during I/O operations.",
          "The GIL prevents all networking and disk read operations in threads.",
          "The GIL automatically accelerates multi-threaded math calculations across all CPU cores.",
          "The GIL is a feature exclusively found in PyPy, not standard CPython."
        ],
        correctOptionIndex: 0,
        explanation: "In CPython, the GIL protects memory management. For CPU-bound tasks, multiprocessing or C extensions are needed to leverage multiple cores; for I/O tasks, threads or asyncio release the GIL during waits.",
        difficulty: "advanced"
      },
      {
        id: "py_q2",
        question: "What does the `yield` keyword do when used inside a Python function?",
        codeSnippet: `def infinite_fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b`,
        options: [
          "It turns the function into a Generator that yields values lazily one at a time on demand without storing the entire sequence in memory.",
          "It forces the function to execute asynchronously in a background thread.",
          "It terminates the function execution and clears all local variables.",
          "It converts the returned value into a JSON response."
        ],
        correctOptionIndex: 0,
        explanation: "Generators pause execution state at 'yield' and resume on next(), allowing memory-efficient streaming of large or infinite datasets.",
        difficulty: "intermediate"
      },
      {
        id: "py_q3",
        question: "How does `functools.wraps` help when creating custom Python decorators?",
        codeSnippet: `import functools

def timing_decorator(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        # time measurement
        return func(*args, **kwargs)
    return wrapper`,
        options: [
          "It preserves the original function's metadata (docstring, __name__, __annotations__, __module__) rather than replacing them with wrapper attributes.",
          "It compiles the decorated function with Cython for 10x performance.",
          "It enforces static type checking at Python runtime.",
          "It makes the function thread-safe automatically."
        ],
        correctOptionIndex: 0,
        explanation: "functools.wraps copies name, docstring, and signature attributes from the decorated function to the wrapper function for introspection and debugging.",
        difficulty: "intermediate"
      },
      {
        id: "py_q4",
        question: "In Python's `asyncio`, what happens if you invoke a synchronous blocking call like `time.sleep(5)` inside an `async def` coroutine?",
        options: [
          "It blocks the entire asyncio event loop for 5 seconds, preventing all other concurrent coroutines from executing during that period.",
          "Asyncio automatically moves time.sleep to a background thread.",
          "Python raises an AsyncBlockedException immediately.",
          "The coroutine yields control and sleeps concurrently without affecting other tasks."
        ],
        correctOptionIndex: 0,
        explanation: "Blocking calls block the single thread running the asyncio event loop. To sleep asynchronously without blocking, 'await asyncio.sleep(5)' must be used.",
        difficulty: "intermediate"
      },
      {
        id: "py_q5",
        question: "What is the memory advantage of using `__slots__` in Python classes with millions of instantiated objects?",
        codeSnippet: `class Point:
    __slots__ = ('x', 'y')
    def __init__(self, x, y):
        self.x = x
        self.y = y`,
        options: [
          "It prevents the creation of the dynamic per-instance `__dict__` dictionary, drastically reducing memory footprint per instance.",
          "It encrypts the class instance attributes in RAM.",
          "It prevents inheritance from any other base class.",
          "It enables automatic garbage collection every 10 milliseconds."
        ],
        correctOptionIndex: 0,
        explanation: "__slots__ tells Python not to create a __dict__ for every object instance, storing attributes in a compact array and saving significant memory.",
        difficulty: "advanced"
      },
      {
        id: "py_q6",
        question: "What is the result of the following Python list comprehension with walrus operator `:=`?",
        codeSnippet: `data = ["apple", "banana", "kiwi", "cherry"]
result = [clean for word in data if (clean := word.strip()) and len(clean) > 5]`,
        options: [
          "['banana', 'cherry']",
          "['apple', 'banana', 'kiwi', 'cherry']",
          "['banana']",
          "SyntaxError because walrus operator cannot be used inside list comprehensions."
        ],
        correctOptionIndex: 0,
        explanation: "The walrus operator assigns 'clean' in the condition and evaluates length > 5: 'banana' (6) and 'cherry' (6) match and are collected.",
        difficulty: "intermediate"
      }
    ]
  }
};
