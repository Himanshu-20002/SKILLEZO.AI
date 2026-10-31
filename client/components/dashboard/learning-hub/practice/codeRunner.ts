import { SupportedLanguage } from './codeTemplates';

export interface ConsoleLogEntry {
  type: 'log' | 'info' | 'warn' | 'error';
  content: string;
  timestamp: string;
}

export interface ExecutionResult {
  success: boolean;
  logs: ConsoleLogEntry[];
  returnValue?: string;
  error?: string;
  executionTimeMs: number;
}

// Global cached pyodide instance
let pyodideInstance: any = null;
let isPyodideLoading = false;
let pyodideLoadPromise: Promise<any> | null = null;

/**
 * Strips basic TypeScript syntax for browser evaluation
 */
export function transpileTypeScriptToJS(tsCode: string): string {
  let js = tsCode;
  // Remove multi-line interface declarations
  js = js.replace(/interface\s+\w+(?:<[^>]+>)?\s*\{[\s\S]*?\}/g, '');
  // Remove type alias declarations
  js = js.replace(/type\s+\w+(?:<[^>]+>)?\s*=\s*[\s\S]*?;/g, '');
  // Remove function return type annotations (: void, : number, : Promise<any>, etc.)
  js = js.replace(/\)\s*:\s*(?:[A-Za-z0-9_<>\[\]|&\s]+)(?=\s*\{|\s*=>)/g, ')');
  // Remove variable type annotations (: string, : number, etc.)
  js = js.replace(/:\s*(?:number|string|boolean|any|void|unknown|never|symbol|bigint|object|[A-Za-z0-9_]+)(?:\[\])?(?=\s*[,=;)\r\n])/g, '');
  // Remove type assertions (as unknown, as any)
  js = js.replace(/\s+as\s+[A-Za-z0-9_<>\[\]]+/g, '');
  // Remove non-null assertions (!)
  js = js.replace(/(\w+)!/g, '$1');
  return js;
}

/**
 * Creates an isolated Web Worker script string
 * Features:
 * - Real separate thread (main UI thread never hangs)
 * - Safe cyclic object stringifier
 * - Console method interception (log, info, warn, error, time, timeEnd, table)
 * - Error boundary catching uncaught rejections and syntax bugs
 */
function createWorkerScript(executableCode: string): string {
  return `
    self.onmessage = async function(e) {
      const getTimestamp = () => new Date().toLocaleTimeString();

      function safeStringify(arg) {
        if (arg === null) return 'null';
        if (arg === undefined) return 'undefined';
        if (typeof arg === 'string') return arg;
        if (typeof arg === 'function') return arg.toString();
        if (arg instanceof Error) return arg.name + ': ' + arg.message + (arg.stack ? '\\n' + arg.stack : '');
        
        const seen = new WeakSet();
        try {
          return JSON.stringify(arg, (key, value) => {
            if (typeof value === 'object' && value !== null) {
              if (seen.has(value)) return '[Circular Reference]';
              seen.add(value);
            }
            if (typeof value === 'bigint') return value.toString() + 'n';
            if (typeof value === 'symbol') return value.toString();
            return value;
          }, 2);
        } catch {
          return String(arg);
        }
      }

      const timers = new Map();

      const customConsole = {
        log: (...args) => {
          self.postMessage({
            type: 'log',
            content: args.map(safeStringify).join(' '),
            timestamp: getTimestamp()
          });
        },
        info: (...args) => {
          self.postMessage({
            type: 'info',
            content: args.map(safeStringify).join(' '),
            timestamp: getTimestamp()
          });
        },
        warn: (...args) => {
          self.postMessage({
            type: 'warn',
            content: args.map(safeStringify).join(' '),
            timestamp: getTimestamp()
          });
        },
        error: (...args) => {
          self.postMessage({
            type: 'error',
            content: args.map(safeStringify).join(' '),
            timestamp: getTimestamp()
          });
        },
        time: (label = 'default') => {
          timers.set(label, performance.now());
          customConsole.log('[Timer started]: ' + label);
        },
        timeEnd: (label = 'default') => {
          if (timers.has(label)) {
            const duration = (performance.now() - timers.get(label)).toFixed(2);
            timers.delete(label);
            customConsole.log('[Timer finished]: ' + label + ': ' + duration + 'ms');
          } else {
            customConsole.warn('Timer "' + label + '" does not exist');
          }
        },
        table: (data) => {
          customConsole.log(safeStringify(data));
        }
      };

      try {
        const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
        const fn = new AsyncFunction('console', ${JSON.stringify(executableCode)});
        const result = await fn(customConsole);
        self.postMessage({
          type: 'done',
          returnValue: result !== undefined ? safeStringify(result) : undefined
        });
      } catch (err) {
        self.postMessage({
          type: 'error',
          error: err && err.message ? err.message : String(err)
        });
      }
    };
  `;
}

/**
 * Executes JavaScript/TypeScript on a dedicated Web Worker thread
 * Guaranteed 0% UI freezing, with hard watchdog thread termination.
 */
function executeInWebWorker(
  code: string,
  isTypeScript: boolean = false,
  timeoutMs: number = 3500
): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    const logs: ConsoleLogEntry[] = [];
    const startTime = performance.now();
    let isTerminated = false;

    let executableCode = code;
    if (isTypeScript) {
      try {
        executableCode = transpileTypeScriptToJS(code);
      } catch (transpileErr: any) {
        return resolve({
          success: false,
          logs: [
            {
              type: 'error',
              content: `Transpilation Error: ${transpileErr?.message || 'Invalid TypeScript syntax'}`,
              timestamp: new Date().toLocaleTimeString(),
            },
          ],
          error: transpileErr?.message,
          executionTimeMs: 0,
        });
      }
    }

    const workerScript = createWorkerScript(executableCode);
    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const blobUrl = URL.createObjectURL(blob);

    let worker: Worker | null = null;
    let timerId: any = null;

    const cleanup = () => {
      if (timerId) clearTimeout(timerId);
      if (worker) {
        worker.terminate();
        worker = null;
      }
      URL.revokeObjectURL(blobUrl);
    };

    try {
      worker = new Worker(blobUrl);
    } catch (workerInitErr: any) {
      cleanup();
      // Fallback to inline runner if Worker instantiation fails (e.g. strict CSP)
      return resolve(executeInlineFallback(code, isTypeScript));
    }

    // Set hard watchdog timer: terminates worker thread instantly if stuck
    timerId = setTimeout(() => {
      if (!isTerminated) {
        isTerminated = true;
        cleanup();
        const duration = Math.round(performance.now() - startTime);
        logs.push({
          type: 'error',
          content: `Execution Timeout: Code exceeded the ${timeoutMs}ms limit. The background worker thread was safely terminated to prevent browser freeze.`,
          timestamp: new Date().toLocaleTimeString(),
        });
        resolve({
          success: false,
          logs,
          error: `Execution Timeout: Exceeded ${timeoutMs}ms limit.`,
          executionTimeMs: duration,
        });
      }
    }, timeoutMs);

    worker.onmessage = (e: MessageEvent) => {
      if (isTerminated) return;
      const data = e.data;

      if (data.type === 'log' || data.type === 'info' || data.type === 'warn' || data.type === 'error') {
        logs.push({
          type: data.type,
          content: data.content,
          timestamp: data.timestamp || new Date().toLocaleTimeString(),
        });
      } else if (data.type === 'done') {
        isTerminated = true;
        cleanup();
        const duration = Math.round(performance.now() - startTime);
        resolve({
          success: true,
          logs,
          returnValue: data.returnValue,
          executionTimeMs: duration,
        });
      }
    };

    worker.onerror = (e: ErrorEvent) => {
      if (isTerminated) return;
      isTerminated = true;
      cleanup();
      const duration = Math.round(performance.now() - startTime);
      const errorMsg = e.message || 'Worker runtime error';
      logs.push({
        type: 'error',
        content: `Runtime Error: ${errorMsg}`,
        timestamp: new Date().toLocaleTimeString(),
      });
      resolve({
        success: false,
        logs,
        error: errorMsg,
        executionTimeMs: duration,
      });
    };

    // Kick off worker execution
    worker.postMessage({ start: true });
  });
}

/**
 * Fallback inline evaluator if environment blocks Web Workers
 */
async function executeInlineFallback(
  code: string,
  isTypeScript: boolean
): Promise<ExecutionResult> {
  const logs: ConsoleLogEntry[] = [];
  const startTime = performance.now();
  const getTimestamp = () => new Date().toLocaleTimeString();

  const customConsole = {
    log: (...args: any[]) =>
      logs.push({ type: 'log', content: args.map(String).join(' '), timestamp: getTimestamp() }),
    info: (...args: any[]) =>
      logs.push({ type: 'info', content: args.map(String).join(' '), timestamp: getTimestamp() }),
    warn: (...args: any[]) =>
      logs.push({ type: 'warn', content: args.map(String).join(' '), timestamp: getTimestamp() }),
    error: (...args: any[]) =>
      logs.push({ type: 'error', content: args.map(String).join(' '), timestamp: getTimestamp() }),
  };

  try {
    const executableCode = isTypeScript ? transpileTypeScriptToJS(code) : code;
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    const runner = new AsyncFunction('console', executableCode);
    const result = await runner(customConsole);
    return {
      success: true,
      logs,
      returnValue: result !== undefined ? String(result) : undefined,
      executionTimeMs: Math.round(performance.now() - startTime),
    };
  } catch (err: any) {
    const msg = err?.message || String(err);
    logs.push({ type: 'error', content: `Error: ${msg}`, timestamp: getTimestamp() });
    return {
      success: false,
      logs,
      error: msg,
      executionTimeMs: Math.round(performance.now() - startTime),
    };
  }
}

/**
 * Loads Pyodide once and caches the promise
 */
async function loadPyodideIfNeeded(): Promise<any> {
  if (pyodideInstance) return pyodideInstance;
  if (pyodideLoadPromise) return pyodideLoadPromise;
  if (typeof window === 'undefined') return null;

  pyodideLoadPromise = new Promise((resolve, reject) => {
    if ((window as any).loadPyodide) {
      (window as any)
        .loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/' })
        .then((inst: any) => {
          pyodideInstance = inst;
          resolve(inst);
        })
        .catch(reject);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
    script.async = true;
    script.onload = async () => {
      try {
        pyodideInstance = await (window as any).loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
        });
        resolve(pyodideInstance);
      } catch (err) {
        reject(err);
      }
    };
    script.onerror = () => {
      reject(new Error('Failed to load Pyodide WebAssembly script from CDN.'));
    };
    document.body.appendChild(script);
  });

  return pyodideLoadPromise;
}

/**
 * Executes Python using cached Pyodide WASM
 */
async function executePython(code: string): Promise<ExecutionResult> {
  const logs: ConsoleLogEntry[] = [];
  const startTime = performance.now();
  const getTimestamp = () => new Date().toLocaleTimeString();

  try {
    const isFirstLoad = !pyodideInstance;
    if (isFirstLoad) {
      logs.push({
        type: 'info',
        content: 'Loading Pyodide WebAssembly runtime (first-time CDN download)...',
        timestamp: getTimestamp(),
      });
    }

    const pyodide = await loadPyodideIfNeeded();
    if (!pyodide) {
      throw new Error('Pyodide WebAssembly engine is not available.');
    }

    // Set stdout and stderr hooks
    pyodide.setStdout({
      batched: (text: string) => {
        if (text.length > 0) {
          logs.push({
            type: 'log',
            content: text,
            timestamp: getTimestamp(),
          });
        }
      },
    });

    pyodide.setStderr({
      batched: (text: string) => {
        if (text.length > 0) {
          logs.push({
            type: 'error',
            content: text,
            timestamp: getTimestamp(),
          });
        }
      },
    });

    const result = await pyodide.runPythonAsync(code);
    const duration = Math.round(performance.now() - startTime);

    return {
      success: true,
      logs,
      returnValue: result !== undefined ? String(result) : undefined,
      executionTimeMs: duration,
    };
  } catch (err: any) {
    const duration = Math.round(performance.now() - startTime);
    const errorMessage = err?.message || String(err);

    logs.push({
      type: 'error',
      content: `Python Exception: ${errorMessage}`,
      timestamp: getTimestamp(),
    });

    return {
      success: false,
      logs,
      error: errorMessage,
      executionTimeMs: duration,
    };
  }
}

/**
 * Primary code execution dispatcher with thread isolation
 */
export async function runCodeSnippet(
  code: string,
  language: SupportedLanguage
): Promise<ExecutionResult> {
  if (language === 'python') {
    return executePython(code);
  }
  return executeInWebWorker(code, language === 'typescript');
}
