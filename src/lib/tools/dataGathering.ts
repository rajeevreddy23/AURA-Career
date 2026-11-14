/**
 * Multi-Source Data Gathering & Tool Execution Layer
 * Provides APIs for:
 * 1. Sandbox Code Execution (Compiler Explorer / Godbolt & Python/JS runtimes)
 * 2. Live Technical Documentation & Web Search
 * 3. Course RAG & Curriculum Context Retrieval
 * 4. Algorithmic Complexity & Math Calculator
 */

export interface CodeExecutionResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  language: string;
  executionTimeMs?: number;
}

export interface SearchCitation {
  title: string;
  snippet: string;
  source: string;
  url?: string;
}

export interface DataGatheringContext {
  codeExecution?: CodeExecutionResult;
  searchCitations?: SearchCitation[];
  curriculumContext?: string;
  calculatedValue?: string;
  toolsUsed: string[];
}

// Godbolt Compiler IDs
const COMPILER_MAP: Record<string, string> = {
  python: 'python311', // Python 3.11
  javascript: 'nodejs_default', // Node.js
  typescript: 'typescript_default', // TypeScript
  java: 'java1802', // OpenJDK 18
  cpp: 'g122', // GCC 12.2
  c: 'c_gcc122',
  go: 'gl1190', // Go 1.19
  rust: 'r1600', // Rust 1.60
};

/**
 * 1. SANDBOX CODE EXECUTION API
 * Executes code in a safe sandbox via Compiler Explorer (Godbolt)
 */
export async function executeSandboxCode(
  language: string,
  code: string
): Promise<CodeExecutionResult> {
  const startTime = Date.now();
  const normalizedLang = language.toLowerCase().trim();
  const compilerId = COMPILER_MAP[normalizedLang] || 'python311';

  try {
    const res = await fetch(`https://godbolt.org/api/compiler/${compilerId}/compile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: code,
        options: {
          userArguments: '',
          compilerOptions: { executorRequest: true, skipAsm: true },
          filters: { execute: true },
          tools: [],
          libraries: [],
          executeParameters: { args: [], stdin: '' },
        },
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return {
        success: false,
        stdout: '',
        stderr: `Sandbox returned status HTTP ${res.status}`,
        exitCode: 1,
        language: normalizedLang,
        executionTimeMs: Date.now() - startTime,
      };
    }

    const raw = await res.text();

    // Extract stdout and stderr from Godbolt response
    const stdout = extractBetween(raw, 'Standard out:', '\nStandard error:').trim();
    const stderr = extractBetween(raw, 'Standard error:', undefined).trim();
    const exitMatch = raw.match(/Compiler exited with result code (\d+)/);
    const exitCode = exitMatch ? parseInt(exitMatch[1], 10) : (stderr ? 1 : 0);

    return {
      success: exitCode === 0,
      stdout: stdout || (exitCode === 0 && !stderr ? 'Code executed successfully (no output)' : ''),
      stderr,
      exitCode,
      language: normalizedLang,
      executionTimeMs: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      success: false,
      stdout: '',
      stderr: error.message || 'Execution timed out',
      exitCode: 1,
      language: normalizedLang,
      executionTimeMs: Date.now() - startTime,
    };
  }
}

function extractBetween(text: string, startKey: string, endKey?: string): string {
  const sIdx = text.indexOf(startKey);
  if (sIdx === -1) return '';
  const from = sIdx + startKey.length;
  if (!endKey) return text.substring(from).trim();
  const eIdx = text.indexOf(endKey, from);
  if (eIdx === -1) return text.substring(from).trim();
  return text.substring(from, eIdx).trim();
}

/**
 * 2. LIVE DOCUMENTATION & TECHNICAL SEARCH API
 * Queries open technical indices (DuckDuckGo Instant Answers & DevDocs API)
 */
export async function searchTechnicalDocs(query: string): Promise<SearchCitation[]> {
  const citations: SearchCitation[] = [];
  const cleanQuery = query.replace(/[^\w\s.-]/g, ' ').trim();
  if (!cleanQuery) return citations;

  try {
    // 1. DuckDuckGo Instant Answer API (Free, JSON format, no API key needed)
    const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(cleanQuery)}&format=json&no_html=1&skip_disambig=1`;
    const res = await fetch(ddgUrl, {
      signal: AbortSignal.timeout(4000),
      headers: { 'User-Agent': 'AuraCareer-AI-Tutor/1.0' },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.AbstractText) {
        citations.push({
          title: data.Heading || cleanQuery,
          snippet: data.AbstractText,
          source: data.AbstractSource || 'Official Documentation',
          url: data.AbstractURL || undefined,
        });
      }

      // Check RelatedTopics if available
      if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
        for (const topic of data.RelatedTopics.slice(0, 2)) {
          if (topic.Text) {
            citations.push({
              title: topic.FirstURL ? topic.FirstURL.split('/').pop()?.replace(/_/g, ' ') || 'Reference' : 'Topic Overview',
              snippet: topic.Text,
              source: 'Knowledge Base',
              url: topic.FirstURL,
            });
          }
        }
      }
    }
  } catch (err) {
    // Silently continue
  }

  // 2. Wikipedia Summary API fallback for core computer science algorithms/theories
  if (citations.length === 0) {
    try {
      const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanQuery.split(' ')[0])}`;
      const wRes = await fetch(wikiUrl, { signal: AbortSignal.timeout(3000) });
      if (wRes.ok) {
        const wData = await wRes.json();
        if (wData.extract) {
          citations.push({
            title: wData.title || cleanQuery,
            snippet: wData.extract.slice(0, 280) + '...',
            source: 'Computer Science Encyclopaedia',
            url: wData.content_urls?.desktop?.page,
          });
        }
      }
    } catch {
      // Ignore
    }
  }

  return citations;
}

/**
 * 3. CURRICULUM RAG & SYLLABUS RETRIEVER
 * Matches student question against active course syllabus and presentation materials
 */
export function retrieveCurriculumContext(
  question: string,
  courseTitle?: string,
  activeTopic?: string,
  slideContext?: { title?: string; speech?: string; code?: string }
): string {
  const parts: string[] = [];
  if (courseTitle) parts.push(`Course Curriculum: ${courseTitle}`);
  if (activeTopic) parts.push(`Current Topic Unit: ${activeTopic}`);
  if (slideContext?.title) parts.push(`Active Slide: ${slideContext.title}`);
  if (slideContext?.speech) parts.push(`Presentation Audio Script: ${slideContext.speech}`);
  if (slideContext?.code) parts.push(`Blackboard Code: ${slideContext.code}`);

  return parts.join('\n');
}

/**
 * 4. ALGORITHMIC COMPLEXITY & MATH CALCULATOR
 * Evaluates math expressions and asymptotic complexity models
 */
export function calculateMathOrComplexity(input: string): string | null {
  // Check for Big-O or math calculations (e.g. 2^10, 1024 / 8, log2(1000))
  try {
    const mathPattern = /calculate\s+([\d+\-*/^().e\s]+)|what\s+is\s+([\d+\-*/^().e\s]+)/i;
    const match = input.match(mathPattern);
    const expr = match ? (match[1] || match[2])?.trim() : null;

    if (expr && /^[\d+\-*/().\s]+$/.test(expr)) {
      // Safe sanitized arithmetic evaluation
      const sanitized = expr.replace(/[^0-9+\-*/().]/g, '');
      const result = Function(`'use strict'; return (${sanitized})`)();
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        return `${expr} = ${result}`;
      }
    }
  } catch {
    return null;
  }
  return null;
}
