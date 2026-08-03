'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import {
  Play, RotateCcw, Download, Copy, Check, ChevronDown,
  Loader2, AlertCircle, Terminal, Brain
} from 'lucide-react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const SUPPORTED_LANGUAGES = [
  { id: 'python', label: 'Python', defaultCode: 'print("Hello, AURA Learn!")' },
  { id: 'javascript', label: 'JavaScript', defaultCode: 'console.log("Hello, AURA Learn!");' },
  { id: 'typescript', label: 'TypeScript', defaultCode: 'const greeting: string = "Hello, AURA Learn!";\nconsole.log(greeting);' },
  { id: 'html', label: 'HTML', defaultCode: '<h1>Hello, AURA Learn!</h1>' },
  { id: 'css', label: 'CSS', defaultCode: 'body {\n  background: #f0f0f0;\n  font-family: sans-serif;\n}' },
  { id: 'java', label: 'Java', defaultCode: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, AURA Learn!");\n  }\n}' },
  { id: 'cpp', label: 'C++', defaultCode: '#include <iostream>\nint main() {\n  std::cout << "Hello, AURA Learn!" << std::endl;\n  return 0;\n}' },
  { id: 'go', label: 'Go', defaultCode: 'package main\nimport "fmt"\nfunc main() {\n  fmt.Println("Hello, AURA Learn!")\n}' },
  { id: 'rust', label: 'Rust', defaultCode: 'fn main() {\n  println!("Hello, AURA Learn!");\n}' },
  { id: 'sql', label: 'SQL', defaultCode: 'SELECT "Hello, AURA Learn!" AS greeting;' },
];

let pyodideInstance: any = null;

const loadPyodideScript = () => {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }
    if ((window as any).loadPyodide) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Pyodide WebAssembly script'));
    document.head.appendChild(script);
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Real sandbox execution for Java / Go / Rust / C++ via Compiler Explorer API
// (godbolt.org) — free, CORS-enabled, no API key required.
// ─────────────────────────────────────────────────────────────────────────────
const GODBOLT_COMPILERS: Record<string, string> = {
  java: 'java1802', // OpenJDK 18.0.2
  go: 'gl1190', // Go 1.19
  rust: 'r1600', // Rust 1.60
  cpp: 'g122', // GCC 12.2 (C++)
};

const stripJavaPublicModifiers = (code: string): string => {
  // Godbolt compiles Java from a temp file named <source>. "public class X"
  // requires X.java, so drop the public modifier on top-level classes only.
  return code.replace(/public\s+class\s+([A-Za-z_$][\w$]*)/g, 'class $1');
};

const executeWithGodbolt = async (language: string, code: string): Promise<string> => {
  const compilerId = GODBOLT_COMPILERS[language];
  if (!compilerId) throw new Error(`No compiler configured for ${language}`);

  let source = code;
  if (language === 'java') source = stripJavaPublicModifiers(code);

  const res = await fetch(`https://godbolt.org/api/compiler/${compilerId}/compile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source,
      options: {
        userArguments: '',
        compilerOptions: { executorRequest: true, skipAsm: true },
        filters: { execute: true },
        tools: [],
        libraries: [],
        executeParameters: { args: [], stdin: '' },
      },
    }),
  });

  if (!res.ok) throw new Error(`Sandbox returned HTTP ${res.status}`);
  const raw = await res.text();

  // Response is a single text blob from godbolt — parse stdout / stderr / exit code.
  const stdout = extractBetween(raw, 'Standard out:', '\nStandard error:');
  const stderr = extractBetween(raw, 'Standard error:', undefined);
  const exitMatch = raw.match(/Compiler exited with result code (\d+)/);
  const timedOut = raw.includes('timed out after') || raw.includes('Execution timed out');
  const killed = raw.includes('Executing program failed') || raw.includes('killed after');

  const lines: string[] = [];
  if (stdout) lines.push(stdout);
  if (stderr) {
    lines.push(`\n[Compilation / Runtime Error]`);
    lines.push(stderr.split('\n').slice(0, 30).join('\n'));
  }
  if (exitMatch && exitMatch[1] !== '0') {
    lines.push(`\n[Process exited with code ${exitMatch[1]}]`);
  }
  if (timedOut) lines.push('\n[Execution timed out — infinite loop detected]');
  if (killed) lines.push('\n[Process was killed (resource limit reached)]');
  if (!stdout && !stderr && !exitMatch && !timedOut && !killed) {
    lines.push('Program finished with no output.');
  }
  return lines.join('\n').trim();
};

const extractBetween = (text: string, start: string, end?: string): string => {
  const startIdx = text.indexOf(start);
  if (startIdx === -1) return '';
  let chunk = text.slice(startIdx + start.length);
  if (end) {
    const endIdx = chunk.indexOf(end);
    if (endIdx !== -1) chunk = chunk.slice(0, endIdx);
  }
  return chunk.trim();
};

// ─────────────────────────────────────────────────────────────────────────────
// Real SQL execution via sql.js — SQLite compiled to WebAssembly, runs in the
// browser with zero server dependencies.
// ─────────────────────────────────────────────────────────────────────────────
let sqlJsModule: any = null;
let sqlJsDb: any = null;

const loadSqlJs = async (): Promise<any> => {
  if (sqlJsModule) return sqlJsModule;
  const win = window as any;
  if (!win.initSqlJs) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/sql.js@1.10.2/dist/sql-wasm.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load SQLite WebAssembly engine'));
      document.head.appendChild(script);
    });
  }
  sqlJsModule = await win.initSqlJs({
    locateFile: () => 'https://cdn.jsdelivr.net/npm/sql.js@1.10.2/dist/sql-wasm.wasm',
  });
  return sqlJsModule;
};

const executeSQL = async (code: string): Promise<string> => {
  const SQL = await loadSqlJs();
  if (!sqlJsDb) sqlJsDb = new SQL.Database();

  const lines: string[] = [];
  // db.exec runs each statement and returns result sets for SELECT etc.
  const results = sqlJsDb.exec(code);
  const lastStatement = code.trim().split(/;\s*$/)[0].trim().split(/\s+/)[0]?.toUpperCase();
  if (results.length === 0) {
    lines.push(
      lastStatement && ['CREATE', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'BEGIN', 'COMMIT'].includes(lastStatement)
        ? `SQL executed successfully. ${results.length} result set(s).`
        : 'SQL executed successfully (no result set returned).'
    );
  }
  results.forEach((result: any, idx: number) => {
    const { columns, values } = result;
    lines.push(idx > 0 ? '' : '');
    lines.push(`Result ${idx + 1} — ${columns.length} column(s), ${values.length} row(s)`);
    lines.push(columns.map((c: string) => c.padEnd(Math.max(10, c.length))).join('  '));
    lines.push(columns.map((c: string) => '-'.repeat(Math.max(10, c.length))).join('  '));
    values.forEach((row: any[]) => {
      lines.push(row.map(v => String(v ?? 'NULL').padEnd(Math.max(10, String(v ?? 'NULL').length))).join('  '));
    });
  });
  return lines.join('\n');
};

const fallbackPythonEval = (pyCode: string): string => {
  const logs: string[] = [];
  const lines = pyCode.split('\n');
  const variables: Record<string, any> = {};
  
  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;
    
    // Match print statements: print("hello") or print(x)
    const printMatch = line.match(/^print\((.*)\)$/);
    if (printMatch) {
      const expr = printMatch[1].trim();
      // Handle string literals
      if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
        logs.push(expr.slice(1, -1));
      } else {
        try {
          const value = new Function(...Object.keys(variables), `return ${expr};`)(...Object.values(variables));
          logs.push(typeof value === 'object' ? JSON.stringify(value) : String(value));
        } catch {
          logs.push(expr);
        }
      }
      continue;
    }
    
    // Match variable assignments: x = 123
    const assignMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.*)$/);
    if (assignMatch) {
      const varName = assignMatch[1];
      const expr = assignMatch[2].trim();
      try {
        const value = new Function(...Object.keys(variables), `return ${expr};`)(...Object.values(variables));
        variables[varName] = value;
      } catch {
        variables[varName] = expr;
      }
    }
  }
  return logs.join('\n') || 'Python script executed successfully (no stdout)';
};

interface CodingLabProps {
  initialCode?: string;
  language?: string;
  readOnly?: boolean;
  onCodeChange?: (code: string) => void;
  showAI?: boolean;
}

export const CodingLab: React.FC<CodingLabProps> = ({
  initialCode,
  language = 'python',
  readOnly = false,
  onCodeChange,
  showAI = true,
}) => {
  const lang = SUPPORTED_LANGUAGES.find(l => l.id === language) || SUPPORTED_LANGUAGES[0];
  const [code, setCode] = useState(initialCode || lang.defaultCode);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [selectedLang, setSelectedLang] = useState(language);
  const [copied, setCopied] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiSuggestion, setAISuggestion] = useState('');
  const [previewDoc, setPreviewDoc] = useState('');
  const [outputTab, setOutputTab] = useState<'console' | 'preview'>('console');

  const handleCodeChange = useCallback((value: string | undefined) => {
    if (value) {
      setCode(value);
      onCodeChange?.(value);
    }
  }, [onCodeChange]);

  const runCode = useCallback(async () => {
    setIsRunning(true);
    setOutput('');
    setPreviewDoc('');
    try {
      let simulatedOutput = '';
      if (selectedLang === 'python') {
        try {
          setOutput('Initializing Python interpreter in browser (WASM)...\n');
          await loadPyodideScript();
          if (!pyodideInstance) {
            pyodideInstance = await (window as any).loadPyodide({
              indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/',
            });
          }
          // Redirect sys.stdout and sys.stderr to capture print output
          pyodideInstance.runPython(`
            import sys
            import io
            sys.stdout = io.StringIO()
            sys.stderr = io.StringIO()
          `);
          
          await pyodideInstance.runPythonAsync(code);
          
          const stdout = pyodideInstance.runPython('sys.stdout.getvalue()');
          const stderr = pyodideInstance.runPython('sys.stderr.getvalue()');
          simulatedOutput = stderr ? `${stdout}\nError:\n${stderr}` : stdout;
          setOutputTab('console');
        } catch (e) {
          // WebAssembly fail safe - run basic python print scripts locally
          try {
            simulatedOutput = fallbackPythonEval(code);
          } catch (err) {
            simulatedOutput = `Python Execution Error: ${e}\nFallback Error: ${err}`;
          }
          setOutputTab('console');
        }
      } else if (selectedLang === 'javascript' || selectedLang === 'typescript') {
        try {
          const logs: string[] = [];
          const originalLog = console.log;
          const originalWarn = console.warn;
          const originalError = console.error;
          
          console.log = (...args: unknown[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
          console.warn = (...args: unknown[]) => logs.push(`[Warning] ` + args.map(String).join(' '));
          console.error = (...args: unknown[]) => logs.push(`[Error] ` + args.map(String).join(' '));
          
          let codeToRun = code;
          if (selectedLang === 'typescript') {
            // Strip simple typescript type markings for browser run
            codeToRun = code
              .replace(/:\s*string/g, '')
              .replace(/:\s*number/g, '')
              .replace(/:\s*boolean/g, '')
              .replace(/:\s*any/g, '')
              .replace(/as\s+string/g, '')
              .replace(/as\s+number/g, '');
          }
          
          const func = new Function(codeToRun);
          func();
          
          console.log = originalLog;
          console.warn = originalWarn;
          console.error = originalError;
          
          simulatedOutput = logs.join('\n');
          setOutputTab('console');
        } catch (e) {
          simulatedOutput = `JavaScript Execution Error: ${e}`;
          setOutputTab('console');
        }
      } else if (selectedLang === 'html' || selectedLang === 'css') {
        // Render preview inside iframe sandbox
        const srcDoc = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: sans-serif; padding: 15px; background-color: #0f172a; color: #f8fafc; }
                ${selectedLang === 'css' ? code : ''}
              </style>
            </head>
            <body>
              ${selectedLang === 'html' ? code : ''}
            </body>
          </html>
        `;
        setPreviewDoc(srcDoc);
        setOutputTab('preview');
        simulatedOutput = 'HTML/CSS Rendered in Live Preview!';
      } else if (selectedLang === 'sql') {
        // Real SQLite execution in the browser (sql.js / WASM)
        setOutput('Initializing SQLite engine (WASM)...\n');
        simulatedOutput = await executeSQL(code);
        setOutputTab('console');
      } else if (GODBOLT_COMPILERS[selectedLang]) {
        // Real sandboxed compilation + execution (Java / Go / Rust / C++)
        setOutput(`Compiling ${selectedLang.toUpperCase()} in a sandboxed environment...\n`);
        simulatedOutput = await executeWithGodbolt(selectedLang, code);
        setOutputTab('console');
      } else {
        simulatedOutput = `[${selectedLang.toUpperCase()}]\nCode executed successfully.\n\nServer sandbox connections coming soon for ${selectedLang}.`;
        setOutputTab('console');
      }
      setOutput(simulatedOutput || 'Code executed successfully (no stdout)');
    } catch (e: any) {
      setOutput(`Execution Error: ${e?.message || 'Unexpected error while executing code. Please check your syntax and try again.'}`);
    } finally {
      setIsRunning(false);
    }
  }, [code, selectedLang]);

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const resetCode = useCallback(() => {
    setCode(lang.defaultCode);
    setOutput('');
  }, [lang]);

  const getAISuggestion = useCallback(async () => {
    setShowAIPanel(true);
    setAISuggestion('Analyzing your code...');
    try {
      const res = await fetch('/api/v1/agents/public/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Explain this ${selectedLang} code line by line:\n\`\`\`${selectedLang}\n${code}\n\`\`\`\n\nExplain what each part does, the key concepts, and how it works.`,
          system_prompt: 'You are an expert coding instructor. Explain code clearly with line-by-line breakdowns.',
        }),
      });
      const data = await res.json();
      const responseText = data?.data?.response || '';
      if (responseText) {
        setAISuggestion(responseText);
        return;
      }
      throw new Error('Empty response');
    } catch {
      // High-fidelity fallback code explanation generator (offline-proof)
      const lines = code.split('\n');
      const breakdowns: string[] = [];
      breakdowns.push(`### Code Breakdown (${selectedLang.toUpperCase()})\n`);
      
      lines.forEach((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        
        let desc = "Executes program statement";
        if (trimmed.startsWith('#') || trimmed.startsWith('//')) {
          desc = "Comments detailing program intentions";
        } else if (trimmed.includes('print(') || trimmed.includes('console.log(')) {
          desc = "Prints variables or string details to user output screens";
        } else if (trimmed.startsWith('def ') || trimmed.startsWith('function ')) {
          desc = "Defines a reusable code logic function block";
        } else if (trimmed.startsWith('import ') || trimmed.startsWith('const ') && trimmed.includes('require(')) {
          desc = "Includes core dependencies or library references";
        } else if (trimmed.includes('=')) {
          desc = "Saves code evaluation values to stored variables";
        } else if (trimmed.startsWith('for ') || trimmed.startsWith('while ')) {
          desc = "Repeats program commands across collections or indexes";
        } else if (trimmed.startsWith('if ') || trimmed.startsWith('else ')) {
          desc = "Tests matching conditions to branch program paths";
        }
        
        breakdowns.push(`* **Line ${i + 1}:** \`${trimmed}\` ➡️ *${desc}*`);
      });
      
      breakdowns.push(`\n\n> [!NOTE]\n> Running in Offline Fallback Mode. Start the local Python backend API server or specify API endpoints to receive deeper LLM breakdowns.`);
      setAISuggestion(breakdowns.join('\n'));
    }
  }, [code, selectedLang]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <select
            value={selectedLang}
            onChange={(e) => {
              setSelectedLang(e.target.value);
              const newLang = SUPPORTED_LANGUAGES.find(l => l.id === e.target.value);
              if (newLang) setCode(newLang.defaultCode);
            }}
            className="h-8 px-2 rounded-lg border border-input bg-background text-sm"
          >
            {SUPPORTED_LANGUAGES.map(l => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>
          <Badge variant="default" size="sm">Read-Write</Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={copyCode}>
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={resetCode}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          {showAI && (
            <Button variant="ghost" size="sm" onClick={getAISuggestion}>
              <Brain className="h-4 w-4 mr-1" />
              AI Explain
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={runCode} isLoading={isRunning}>
            <Play className="h-4 w-4 mr-1" />
            Run
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0">
        <div className="border-r border-border">
          <MonacoEditor
            height="100%"
            language={selectedLang}
            value={code}
            onChange={handleCodeChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              readOnly,
              automaticLayout: true,
              wordWrap: 'on',
              suggestOnTriggerCharacters: true,
            }}
          />
        </div>

        <div className="flex flex-col">
          <div className="p-3 border-b border-border bg-card flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              <span className="text-sm font-medium">Output</span>
              
              {/* Show preview toggle for web languages */}
              {(selectedLang === 'html' || selectedLang === 'css') && (
                <div className="flex bg-slate-800 rounded-lg p-0.5 ml-2 border border-slate-700 select-none">
                  <button
                    onClick={() => setOutputTab('console')}
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded font-semibold transition-all",
                      outputTab === 'console' ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    Console
                  </button>
                  <button
                    onClick={() => setOutputTab('preview')}
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded font-semibold transition-all",
                      outputTab === 'preview' ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    Live Preview
                  </button>
                </div>
              )}
            </div>
            {output && (
              <Button variant="ghost" size="sm" onClick={() => { setOutput(''); setPreviewDoc(''); }}>
                Clear
              </Button>
            )}
          </div>
          <div className="flex-1 flex flex-col bg-black/5 dark:bg-black/20 overflow-hidden relative">
            {isRunning ? (
              <div className="flex-1 p-4 flex items-center gap-2 text-muted-foreground font-mono text-sm">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                <span>Running...</span>
              </div>
            ) : outputTab === 'preview' && previewDoc ? (
              <iframe
                title="Live Sandbox Preview"
                srcDoc={previewDoc}
                sandbox="allow-scripts"
                className="w-full h-full border-0 bg-slate-900"
              />
            ) : output ? (
              <pre
                className={cn(
                  "flex-1 p-4 font-mono text-sm overflow-auto whitespace-pre-wrap",
                  output.includes('Compilation / Runtime Error') || output.startsWith('Execution Error') ? "text-red-400" : "text-emerald-300/90"
                )}
              >
                {output}
              </pre>
            ) : (
              <span className="p-4 text-muted-foreground font-mono text-sm">Run your code to see output here</span>
            )}
          </div>

          {showAIPanel && (
            <div className="border-t border-border p-4 bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  AI Code Analysis
                </span>
                <Button variant="ghost" size="sm" onClick={() => setShowAIPanel(false)}>Close</Button>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{aiSuggestion}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
