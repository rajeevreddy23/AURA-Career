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
    'gemini-2.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-2.0-flash',
    'gemini-flash-latest',
  ];

  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${userPrompt}` : userPrompt;

  for (const model of candidateModels) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
            generationConfig: {
              temperature: options.temperature ?? 0.6,
              maxOutputTokens: options.maxTokens ?? 4096,
              responseMimeType: options.jsonMode ? 'application/json' : undefined,
            },
          }),
          signal: AbortSignal.timeout(5000),
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
    { id: 'llama-3.3-70b-specdec', maxTok: 4096 },
    { id: 'qwen-2.5-coder-32b', maxTok: 4096 },
    { id: 'deepseek-r1-distill-llama-70b', maxTok: 4096 },
    { id: 'llama-3.2-3b-preview', maxTok: 4096 },
  ];

  const safeSystem = systemPrompt.slice(0, 4000);
  const safeUser = userPrompt.slice(0, 4000);

  const messages = [
    ...(safeSystem ? [{ role: 'system', content: safeSystem }] : []),
    { role: 'user', content: safeUser },
  ];

  for (const { id: model, maxTok } of candidateModels) {
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
          temperature: options.temperature ?? 0.6,
          max_tokens: Math.min(options.maxTokens ?? 4096, maxTok),
          response_format: options.jsonMode && model.includes('llama') ? { type: 'json_object' } : undefined,
        }),
        signal: AbortSignal.timeout(4000),
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
    ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
    { role: 'user', content: userPrompt },
  ];

  for (const model of candidateModels) {
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
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 4096,
          response_format: options.jsonMode ? { type: 'json_object' } : undefined,
        }),
        signal: AbortSignal.timeout(6000),
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
 * Generates text using the best available LLM provider (Fastest tier first for instant replies)
 */
export async function generateLLMText(
  systemPrompt: string,
  userPrompt: string,
  options: LLMOptions = {}
): Promise<string | null> {
  // 1. Tier 1 (ULTRA-FAST < 1s): Groq Llama 3.1 & 3.3 Engine
  const groqRes = await callGroq(systemPrompt, userPrompt, options);
  if (groqRes) return groqRes;

  // 2. Tier 2 (LIVE REAL AI ~ 1s): Google Gemini API
  const geminiRes = await callGemini(systemPrompt, userPrompt, options);
  if (geminiRes) return geminiRes;

  // 3. Tier 3 (BACKUP): OpenRouter API
  const openRouterRes = await callOpenRouter(systemPrompt, userPrompt, options);
  if (openRouterRes) return openRouterRes;

  return null;
}

/**
 * Generates and parses structured JSON from LLM
 */
export async function generateStructuredJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  fallbackGenerator?: () => T,
  options: LLMOptions = {}
): Promise<T> {
  const jsonOptions: LLMOptions = { ...options, jsonMode: true };
  const rawText = await generateLLMText(systemPrompt, userPrompt, jsonOptions);

  if (rawText) {
    try {
      const cleaned = cleanJSONString(rawText);
      const parsed = JSON.parse(cleaned) as T;
      return parsed;
    } catch (parseErr) {
      console.warn('Failed to parse LLM JSON directly, attempting recovery...', parseErr);
      try {
        // Try extracting innermost json block
        const jsonMatch = rawText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (jsonMatch) {
          const recovered = JSON.parse(jsonMatch[0]) as T;
          return recovered;
        }
      } catch (recoveryErr) {
        console.error('JSON recovery failed:', recoveryErr);
      }
    }
  }

  if (fallbackGenerator) {
    return fallbackGenerator();
  }

  throw new Error('All LLM providers failed and no fallback was provided');
}
