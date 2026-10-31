'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  Terminal as TerminalIcon,
  BookOpen,
  Zap,
  Clock,
  ChevronDown,
  Trash2,
  Code2,
  AlertTriangle,
  CheckCircle2,
  Maximize2,
  Minimize2,
  AlignLeft,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  CODE_PROBLEM_PRESETS,
  CodeProblemPreset,
  SupportedLanguage,
} from './codeTemplates';
import { runCodeSnippet, ExecutionResult, ConsoleLogEntry } from './codeRunner';

// Dynamically import Monaco Editor with ssr: false to prevent Next.js hydration issues
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-full min-h-[440px] flex flex-col items-center justify-center bg-[#1e1e1e] rounded-b-2xl text-slate-400 space-y-3">
        <div className="w-7 h-7 border-2 border-[#3D5AFE] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-medium">Mounting Monaco VS Code Sandbox...</span>
      </div>
    ),
  }
);

const DIFFICULTY_STYLES: Record<string, string> = {
  Easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Hard: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  Open: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
};

const LANGUAGE_LABELS: Record<SupportedLanguage, { label: string; ext: string; badge: string }> = {
  javascript: { label: 'JavaScript', ext: '.js', badge: 'ES6+' },
  typescript: { label: 'TypeScript', ext: '.ts', badge: 'TS' },
  python: { label: 'Python 3', ext: '.py', badge: 'Py 3' },
};

function getStorageKey(presetId: string, lang: SupportedLanguage): string {
  return `skillezo:sandbox:${presetId}:${lang}`;
}

export function CodeSandboxView() {
  const [selectedPreset, setSelectedPreset] = useState<CodeProblemPreset>(
    CODE_PROBLEM_PRESETS[0]
  );
  const [language, setLanguage] = useState<SupportedLanguage>('javascript');

  // Performance Optimization: Holds the editor instance directly so typing does NOT re-render React!
  const editorRef = useRef<any>(null);
  const codeRef = useRef<string>(CODE_PROBLEM_PRESETS[0].starterCode.javascript);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [activeRightTab, setActiveRightTab] = useState<'console' | 'problem'>('console');
  const [logFilter, setLogFilter] = useState<'all' | 'errors' | 'logs'>('all');

  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLogs, setCopiedLogs] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(13);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Load saved code from local storage or fallback to preset starter code
  const getInitialCode = useCallback(
    (preset: CodeProblemPreset, lang: SupportedLanguage) => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(getStorageKey(preset.id, lang));
        if (saved) return saved;
      }
      return preset.starterCode[lang] || preset.starterCode.javascript;
    },
    []
  );

  // Monaco onMount hook
  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    const initialCode = getInitialCode(selectedPreset, language);
    codeRef.current = initialCode;
    editor.setValue(initialCode);

    // Save debounced progress into local storage
    let timeout: any = null;
    editor.onDidChangeModelContent(() => {
      codeRef.current = editor.getValue();
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (typeof window !== 'undefined') {
          localStorage.setItem(
            getStorageKey(selectedPreset.id, language),
            codeRef.current
          );
        }
      }, 1000);
    });
  };

  // Switch Preset
  const handlePresetChange = (preset: CodeProblemPreset) => {
    setSelectedPreset(preset);
    const newCode = getInitialCode(preset, language);
    codeRef.current = newCode;
    if (editorRef.current) {
      editorRef.current.setValue(newCode);
    }
    setExecutionResult(null);
  };

  // Switch Language
  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    const newCode = getInitialCode(selectedPreset, newLang);
    codeRef.current = newCode;
    if (editorRef.current) {
      editorRef.current.setValue(newCode);
    }
    setExecutionResult(null);
  };

  // Reset Code to default template
  const handleResetCode = () => {
    const defaultTemplate =
      selectedPreset.starterCode[language] || selectedPreset.starterCode.javascript;
    codeRef.current = defaultTemplate;
    if (editorRef.current) {
      editorRef.current.setValue(defaultTemplate);
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(getStorageKey(selectedPreset.id, language));
    }
    setExecutionResult(null);
    toast.info('Reset to original problem template.');
  };

  // Format Code (Auto-prettify)
  const handleFormatCode = () => {
    if (editorRef.current) {
      const action = editorRef.current.getAction('editor.action.formatDocument');
      if (action) {
        action.run();
        toast.success('Code formatted');
      }
    }
  };

  // Copy Code to Clipboard
  const handleCopyCode = async () => {
    try {
      const currentCode = editorRef.current ? editorRef.current.getValue() : codeRef.current;
      await navigator.clipboard.writeText(currentCode);
      setCopiedCode(true);
      toast.success('Code copied to clipboard');
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      toast.error('Failed to copy code');
    }
  };

  // Copy Terminal Output
  const handleCopyLogs = async () => {
    if (!executionResult) return;
    try {
      const text = executionResult.logs.map((l) => `[${l.type.toUpperCase()}] ${l.content}`).join('\n');
      await navigator.clipboard.writeText(text);
      setCopiedLogs(true);
      toast.success('Console output copied');
      setTimeout(() => setCopiedLogs(false), 2000);
    } catch {
      toast.error('Failed to copy output');
    }
  };

  // Run Code via Isolated Web Worker
  const handleRunCode = useCallback(async () => {
    if (isRunning) return;
    const currentCode = editorRef.current ? editorRef.current.getValue() : codeRef.current;
    if (!currentCode.trim()) {
      toast.warning('Editor is empty. Write some code first.');
      return;
    }

    setIsRunning(true);
    setActiveRightTab('console');

    try {
      const result = await runCodeSnippet(currentCode, language);
      setExecutionResult(result);

      if (result.success) {
        toast.success(`Executed in ${result.executionTimeMs}ms`, {
          duration: 2500,
        });
      } else {
        toast.error('Execution encountered an error', {
          description: result.error,
        });
      }
    } catch (err: any) {
      toast.error('Execution error', {
        description: err?.message,
      });
    } finally {
      setIsRunning(false);
    }
  }, [language, isRunning]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter -> Run Code
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      }
      // Ctrl/Cmd + K -> Clear Console
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setExecutionResult(null);
      }
      // Escape -> Exit Fullscreen
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRunCode, isFullscreen]);

  // Auto-scroll terminal output to bottom
  useEffect(() => {
    if (executionResult && activeRightTab === 'console') {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [executionResult, activeRightTab]);

  // Filtered logs
  const filteredLogs = executionResult
    ? executionResult.logs.filter((log) => {
        if (logFilter === 'errors') return log.type === 'error';
        if (logFilter === 'logs') return log.type === 'log';
        return true;
      })
    : [];

  return (
    <div
      className={`space-y-4 transition-all duration-200 ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-[#0B0F19] p-4 md:p-6 overflow-y-auto'
          : 'relative'
      }`}
    >
      {/* Top Action & Navigation Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 md:p-4 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shadow-xl">
        {/* Left: Problem Dropdown & Difficulty */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <select
              value={selectedPreset.id}
              onChange={(e) => {
                const found = CODE_PROBLEM_PRESETS.find((p) => p.id === e.target.value);
                if (found) handlePresetChange(found);
              }}
              className="appearance-none bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-white text-xs font-semibold rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:border-[#3D5AFE] cursor-pointer transition-colors"
            >
              {CODE_PROBLEM_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id} className="bg-slate-900 text-white">
                  {preset.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <span
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
              DIFFICULTY_STYLES[selectedPreset.difficulty]
            }`}
          >
            {selectedPreset.difficulty}
          </span>

          <span className="text-[11px] text-slate-400 hidden sm:inline-block">
            {selectedPreset.category}
          </span>
        </div>

        {/* Center: Language Switcher */}
        <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          {(['javascript', 'typescript', 'python'] as SupportedLanguage[]).map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                language === lang
                  ? 'bg-[#3D5AFE] text-white shadow-sm shadow-[#3D5AFE]/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{LANGUAGE_LABELS[lang].label}</span>
            </button>
          ))}
        </div>

        {/* Right: Actions (Font, Prettify, Copy, Reset, Run) */}
        <div className="flex items-center gap-2">
          {/* Format Code */}
          <button
            onClick={handleFormatCode}
            title="Auto-Format Code (Prettify)"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-colors hidden sm:flex items-center justify-center"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>

          {/* Font Size Adjuster */}
          <div className="hidden lg:flex items-center bg-slate-800/60 rounded-xl px-2 py-1 text-slate-400 text-[11px] gap-1.5 border border-slate-700/60">
            <button
              onClick={() => setFontSize((s) => Math.max(11, s - 1))}
              className="hover:text-white px-1"
              title="Decrease font size"
            >
              A-
            </button>
            <span className="text-slate-500 font-mono text-[10px]">{fontSize}px</span>
            <button
              onClick={() => setFontSize((s) => Math.min(18, s + 1))}
              className="hover:text-white px-1"
              title="Increase font size"
            >
              A+
            </button>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopyCode}
            title="Copy Code"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-colors"
          >
            {copiedCode ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Reset Code */}
          <button
            onClick={handleResetCode}
            title="Reset to problem template"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Enter Fullscreen'}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-colors"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Primary Run Code Button */}
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#3D5AFE] to-indigo-600 hover:from-[#324bdf] hover:to-indigo-500 text-white shadow-lg shadow-[#3D5AFE]/25 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          >
            {isRunning ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Executing...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Run Code</span>
                <span className="text-[10px] opacity-75 font-mono hidden sm:inline">
                  (Ctrl+↵)
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Split Sandbox Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch min-h-[600px]">
        {/* Left Side: Monaco Code Editor (Col 7) */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl overflow-hidden border border-slate-800 bg-[#1e1e1e] shadow-2xl">
          {/* Editor Tab Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#18181b] border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#3D5AFE]" />
              <span className="text-xs font-mono text-slate-300 font-semibold">
                solution{LANGUAGE_LABELS[language].ext}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-800 text-slate-400">
                {LANGUAGE_LABELS[language].badge}
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span className="hidden sm:inline-block text-[10px] font-mono text-slate-500">
                Auto-saved locally
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Thread Ready
              </span>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 w-full min-h-[480px]">
            <MonacoEditor
              height="100%"
              language={language === 'python' ? 'python' : language}
              theme="vs-dark"
              onMount={handleEditorDidMount}
              options={{
                fontSize,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                automaticLayout: true,
                tabSize: 2,
                cursorBlinking: 'smooth',
                smoothScrolling: true,
                renderLineHighlight: 'all',
                bracketPairColorization: { enabled: true },
                formatOnPaste: true,
                formatOnType: true,
                padding: { top: 14, bottom: 14 },
                fontFamily: "'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
                fontLigatures: true,
                scrollbar: {
                  verticalScrollbarSize: 8,
                  horizontalScrollbarSize: 8,
                },
              }}
            />
          </div>
        </div>

        {/* Right Side: Output Terminal & Problem Brief (Col 5) */}
        <div className="lg:col-span-5 flex flex-col rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/95 shadow-2xl">
          {/* Tab Selector Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-950 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveRightTab('console')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeRightTab === 'console'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TerminalIcon className="w-3.5 h-3.5 text-[#3D5AFE]" />
                <span>Terminal Output</span>
                {executionResult && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-slate-700 text-slate-300 font-mono">
                    {executionResult.logs.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveRightTab('problem')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeRightTab === 'problem'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span>Problem Brief</span>
              </button>
            </div>

            {/* Right tab actions */}
            {activeRightTab === 'console' && executionResult && (
              <div className="flex items-center gap-1">
                {/* Log Severity Filter */}
                <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-[10px]">
                  <button
                    onClick={() => setLogFilter('all')}
                    className={`px-1.5 py-0.5 rounded ${
                      logFilter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setLogFilter('errors')}
                    className={`px-1.5 py-0.5 rounded ${
                      logFilter === 'errors' ? 'bg-rose-500/30 text-rose-300' : 'text-slate-400'
                    }`}
                  >
                    Errors
                  </button>
                </div>

                {/* Copy logs */}
                <button
                  onClick={handleCopyLogs}
                  title="Copy terminal output"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
                >
                  {copiedLogs ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* Clear console */}
                <button
                  onClick={() => setExecutionResult(null)}
                  title="Clear console (Ctrl + K)"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Content Pane */}
          <div className="flex-1 flex flex-col overflow-y-auto max-h-[540px] p-4 text-xs font-mono">
            {activeRightTab === 'problem' ? (
              /* Problem Brief Description */
              <div className="space-y-4 font-sans text-slate-300">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">
                      {selectedPreset.title}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        DIFFICULTY_STYLES[selectedPreset.difficulty]
                      }`}
                    >
                      {selectedPreset.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Category:{' '}
                    <span className="text-slate-200">{selectedPreset.category}</span>
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                  {selectedPreset.description}
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider text-[10px]">
                    Engineering Objectives
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-400 list-disc list-inside">
                    <li>Analyze boundary inputs and edge cases.</li>
                    <li>Strive for optimal algorithmic time complexity.</li>
                    <li>Verify behavior against test cases in the starter code.</li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-start gap-2.5">
                  <Zap className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed text-[11px]">
                    Tip: Press{' '}
                    <kbd className="px-1.5 py-0.5 rounded bg-blue-900/50 text-white font-mono text-[10px]">
                      Ctrl + Enter
                    </kbd>{' '}
                    to execute code instantly on an isolated background worker thread.
                  </p>
                </div>
              </div>
            ) : (
              /* Terminal Output View */
              <div className="flex-1 flex flex-col justify-between space-y-3">
                {/* Status Bar */}
                {executionResult && (
                  <div
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                      executionResult.success
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {executionResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                      )}
                      <span className="font-semibold font-sans">
                        {executionResult.success
                          ? 'Execution Successful'
                          : 'Execution Failed'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{executionResult.executionTimeMs}ms</span>
                    </div>
                  </div>
                )}

                {/* Console Log Stream */}
                {!executionResult ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-2.5">
                    <TerminalIcon className="w-8 h-8 text-slate-600" />
                    <p className="text-xs text-slate-400">Terminal console is clear.</p>
                    <p className="text-[11px] text-slate-500 max-w-xs">
                      Press{' '}
                      <span className="text-[#3D5AFE] font-semibold">"Run Code"</span> or{' '}
                      <span className="text-slate-400 font-semibold">Ctrl + Enter</span> to execute the
                      solution on an isolated background thread.
                    </p>
                  </div>
                ) : filteredLogs.length === 0 && !executionResult.returnValue ? (
                  <div className="p-4 text-slate-500 text-xs italic">
                    Program exited with no console output matching filter. Use console.log() or print() to display values.
                  </div>
                ) : (
                  <div className="space-y-1.5 font-mono text-[11px]">
                    {filteredLogs.map((log: ConsoleLogEntry, idx: number) => {
                      const logStyles: Record<string, string> = {
                        log: 'text-slate-200',
                        info: 'text-sky-300',
                        warn: 'text-amber-300',
                        error: 'text-rose-400 font-bold',
                      };

                      return (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 py-1 px-2 rounded hover:bg-slate-800/40 transition-colors"
                        >
                          <span className="text-slate-600 select-none text-[10px] w-6 text-right">
                            {idx + 1}
                          </span>
                          <span className="text-slate-500 select-none text-[10px]">
                            [{log.timestamp}]
                          </span>
                          <span
                            className={`flex-1 whitespace-pre-wrap break-all ${
                              logStyles[log.type] || 'text-slate-300'
                            }`}
                          >
                            {log.content}
                          </span>
                        </div>
                      );
                    })}

                    {/* Return Value Highlight */}
                    {executionResult.returnValue !== undefined && (
                      <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-indigo-500/30 text-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                          Return Value:
                        </span>
                        <code className="text-emerald-300 font-mono">
                          {executionResult.returnValue}
                        </code>
                      </div>
                    )}
                    <div ref={terminalEndRef} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
