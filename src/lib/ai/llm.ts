/**
 * Centralized Multi-Provider LLM Engine for AuraCareer
 * Tiered priority:
 * 1. Google Gemini (gemini-flash-latest, gemini-2.5-flash, gemini-3.5-flash)
 * 2. Groq (openai/gpt-oss-120b, qwen/qwen3.6-27b, openai/gpt-oss-20b)
 * 3. OpenRouter / NVIDIA (google/gemini-2.5-flash, meta-llama/llama-3.3-70b-instruct)
 */

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  deadlineAt?: number;
}

function providerTimeout(options: LLMOptions, maximum: number) {
  return Math.max(1, Math.min(maximum, (options.deadlineAt || Date.now() + maximum) - Date.now()));
}

/**
 * Strips markdown fences, quotes, and cleans raw LLM text for JSON parsing
 */
export function cleanJSONString(raw: string): string {
  let text = raw.trim();
  if (text.startsWith('```json')) {
    text = text.slice(7);
  } else if (text.startsWith('```')) {
    text = text.slice(3);
  }
  if (text.endsWith('```')) {
    text = text.slice(0, -3);
  }
  text = text.trim();

  // Find first '{' or '[' and last '}' or ']'
  const firstBrace = text.indexOf('{');
  const firstBracket = text.indexOf('[');
  let startIdx = 0;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    const lastBrace = text.lastIndexOf('}');
    if (lastBrace !== -1 && lastBrace > startIdx) {
      text = text.substring(startIdx, lastBrace + 1);
    } else {
      text = text.substring(startIdx);
    }
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    const lastBracket = text.lastIndexOf(']');
    if (lastBracket !== -1 && lastBracket > startIdx) {
      text = text.substring(startIdx, lastBracket + 1);
    } else {
      text = text.substring(startIdx);
    }
  }

  // Remove any trailing commas before closing braces/brackets
  text = text.replace(/,\s*([}\]])/g, '$1');

  return text.trim();
}

/**
 * Calls Google Gemini API
 */
async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  options: LLMOptions = {}
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) return null;

  const candidateModels = [
    ...(process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL] : []),
    'gemini-flash-latest',
    'gemini-2.5-flash',
  ];

  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${userPrompt}` : userPrompt;

  for (const model of candidateModels) {
    if (options.deadlineAt && Date.now() >= options.deadlineAt) return null;
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
            generationConfig: {
              temperature: options.temperature ?? 0.4,
              maxOutputTokens: options.maxTokens ?? 4096,
              responseMimeType: options.jsonMode ? 'application/json' : undefined,
            },
          }),
          signal: AbortSignal.timeout(providerTimeout(options, 10000)),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 0) {
          return text.trim();
        }
      } else {
        const errData = await res.json().catch(() => null);
        console.warn(`Gemini model ${model} returned ${res.status}:`, errData?.error?.message || res.statusText);
      }
    } catch (err: any) {
      console.warn(`Gemini call error on ${model}:`, err?.message || err);
    }
  }

  return null;
}

/**
 * Calls Groq API
 */
async function callGroq(
  systemPrompt: string,
  userPrompt: string,
  options: LLMOptions = {}
): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const candidateModels = [
    { id: 'openai/gpt-oss-120b', maxTok: 4096 },
    { id: 'qwen/qwen3.8-27b', maxTok: 4096 },
    { id: 'groq/compound-mini', maxTok: 4096 },
    { id: 'openai/gpt-oss-20b', maxTok: 4096 },
  ];

  const safeSystem = systemPrompt.slice(0, 18000);
  const safeUser = userPrompt.slice(0, 8000);

  const messages = [
    ...(safeSystem ? [{ role: 'system', content: safeSystem }] : []),
    { role: 'user', content: safeUser },
  ];

  for (const { id: model, maxTok } of candidateModels) {
    if (options.deadlineAt && Date.now() >= options.deadlineAt) return null;
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature ?? 0.5,
          max_tokens: Math.min(options.maxTokens ?? 4096, maxTok),
          response_format: options.jsonMode ? { type: 'json_object' } : undefined,
        }),
        signal: AbortSignal.timeout(providerTimeout(options, 8000)),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text && text.trim().length > 0) {
          return text.trim();
        }
      } else {
        const errData = await res.json().catch(() => null);
        console.warn(`Groq model ${model} returned ${res.status}:`, errData?.error?.message || res.statusText);
      }
    } catch (err: any) {
      console.warn(`Groq call error on ${model}:`, err?.message || err);
    }
  }

  return null;
}

/**
 * Calls OpenRouter API
 */
async function callOpenRouter(
  systemPrompt: string,
  userPrompt: string,
  options: LLMOptions = {}
): Promise<string | null> {
  const apiKey = process.env.NVIDIA_API_KEY || process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const candidateModels = [
    'google/gemini-2.0-flash-lite-001',
    'meta-llama/llama-3.3-70b-instruct',
    'qwen/qwen-2.5-coder-32b-instruct',
  ];

  const messages = [
    ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt.slice(0, 18000) }] : []),
    { role: 'user' as const, content: userPrompt.slice(0, 4000) },
  ];

  for (const model of candidateModels) {
    if (options.deadlineAt && Date.now() >= options.deadlineAt) return null;
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://auracareer.com',
          'X-Title': 'AuraCareer',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature ?? 0.6,
          max_tokens: options.maxTokens ?? 4096,
          response_format: options.jsonMode ? { type: 'json_object' } : undefined,
        }),
        signal: AbortSignal.timeout(providerTimeout(options, 8000)),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text && text.trim().length > 0) {
          return text.trim();
        }
      } else {
        const errData = await res.json().catch(() => null);
        console.warn(`OpenRouter model ${model} returned ${res.status}:`, errData?.error?.message || res.statusText);
      }
    } catch (err: any) {
      console.warn(`OpenRouter call error on ${model}:`, err?.message || err);
    }
  }

  return null;
}

/**
 * Generates text using the best available LLM provider
 * Priority: 1. Gemini (Native high-quality) -> 2. Groq (Ultra-fast) -> 3. OpenRouter
 */
export async function generateLLMText(
  systemPrompt: string,
  userPrompt: string,
  options: LLMOptions = {}
): Promise<string | null> {
  // 1. Tier 1: Google Gemini (gemini-2.5-flash)
  const geminiRes = await callGemini(systemPrompt, userPrompt, options);
  if (geminiRes) return geminiRes;

  // 2. Tier 2: Groq (Ultra-fast)
  const groqRes = await callGroq(systemPrompt, userPrompt, options);
  if (groqRes) return groqRes;

  // 3. Tier 3: OpenRouter API
  const openRouterRes = await callOpenRouter(systemPrompt, userPrompt, options);
  if (openRouterRes) return openRouterRes;

  return null;
}

/**
 * Attempts to safely parse or recover JSON from raw LLM text
 */
function tryParseOrRecoverJSON<T>(rawText: string): T | null {
  if (!rawText) return null;

  // Attempt 1: Standard cleaned parse
  try {
    const cleaned = cleanJSONString(rawText);
    return JSON.parse(cleaned) as T;
  } catch {
    // Continue to recovery
  }

  // Attempt 2: Extract innermost JSON object or array
  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      // Fix unescaped control chars
      const sanitized = jsonMatch[0]
        .replace(/[\u0000-\u001F]+/g, (match) => {
          if (match.includes('\n')) return '\\n';
          if (match.includes('\r')) return '\\r';
          if (match.includes('\t')) return '\\t';
          return '';
        })
        .replace(/,\s*([}\]])/g, '$1');
      return JSON.parse(sanitized) as T;
    }
  } catch {
    // Continue to recovery
  }

  // Attempt 3: Regex extraction for key fields if the output is an answer payload
  try {
    const answerMatch = rawText.match(/"answer"\s*:\s*"([\s\S]*?)(?:",\s*"[a-zA-Z]|\s*"$|\s*})/);
    const codeMatch = rawText.match(/```(?:\w+)?\n([\s\S]*?)```/);
    const mermaidMatch = rawText.match(/```mermaid\n([\s\S]*?)```/);

    if (answerMatch || rawText.includes('###') || rawText.includes('```')) {
      const fallbackObj: any = {
        answer: answerMatch ? answerMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : rawText,
        codeSnippet: codeMatch ? codeMatch[1].trim() : undefined,
        speech: 'Here is the direct concept breakdown with visual flow and code.',
      };
      return fallbackObj as T;
    }
  } catch {
    // Failed all recovery
  }

  return null;
}

/**
 * Generates and parses structured JSON from LLM with multi-provider fallback loop
 */
export async function generateStructuredJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  fallbackGenerator?: () => T,
  options: LLMOptions = {}
): Promise<T> {
  const jsonOptions: LLMOptions = { ...options, jsonMode: true, deadlineAt: options.deadlineAt || Date.now() + 40000 };

  // Provider 1: Gemini (Tier 1 - Native JSON Schema validation)
  try {
    const geminiText = await callGemini(systemPrompt, userPrompt, jsonOptions);
    if (geminiText) {
      const parsed = tryParseOrRecoverJSON<T>(geminiText);
      if (parsed) return parsed;
    }
  } catch (err) {
    console.warn('[LLM] Gemini structured generation failed:', err);
  }

  // Provider 2: Groq with JSON Mode (Tier 2 - Fast fallback)
  try {
    const groqText = await callGroq(systemPrompt, userPrompt, jsonOptions);
    if (groqText) {
      const parsed = tryParseOrRecoverJSON<T>(groqText);
      if (parsed) return parsed;
    }
  } catch (err) {
    console.warn('[LLM] Groq structured generation failed:', err);
  }

  // Provider 3: OpenRouter (Tier 3)
  try {
    const openRouterText = await callOpenRouter(systemPrompt, userPrompt, jsonOptions);
    if (openRouterText) {
      const parsed = tryParseOrRecoverJSON<T>(openRouterText);
      if (parsed) return parsed;
    }
  } catch (err) {
    console.warn('[LLM] OpenRouter structured generation failed:', err);
  }

  // Final fallback
  if (fallbackGenerator) {
    return fallbackGenerator();
  }

  throw new Error('All LLM providers failed and no fallback was provided');
}
