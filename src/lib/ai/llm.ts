/**
 * Centralized Multi-Provider LLM Engine for AURA Learn
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
    'gemini-flash-latest',
    'gemini-2.5-flash',
    'gemini-3.5-flash',
    'gemini-3.7-flash',
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
              maxOutputTokens: options.maxTokens ?? 8192,
              responseMimeType: options.jsonMode ? 'application/json' : undefined,
            },
          }),
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
    'openai/gpt-oss-120b',
    'qwen/qwen3.6-27b',
    'openai/gpt-oss-20b',
    'groq/compound',
  ];

  const messages = [
    ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
    { role: 'user', content: userPrompt },
  ];

  for (const model of candidateModels) {
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
          max_tokens: options.maxTokens ?? 8192,
          response_format: options.jsonMode ? { type: 'json_object' } : undefined,
        }),
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
    'google/gemini-2.5-flash',
    'google/gemini-3.7-flash',
    'meta-llama/llama-3.3-70b-instruct',
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
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature ?? 0.6,
          max_tokens: options.maxTokens ?? 8192,
          response_format: options.jsonMode ? { type: 'json_object' } : undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text && text.trim().length > 0) {
          return text.trim();
        }
      }
    } catch (err: any) {
      console.warn(`OpenRouter call error on ${model}:`, err?.message || err);
    }
  }

  return null;
}

/**
 * Generates text using the best available LLM provider
 */
export async function generateLLMText(
  systemPrompt: string,
  userPrompt: string,
  options: LLMOptions = {}
): Promise<string | null> {
  // 1. Try Gemini
  const geminiRes = await callGemini(systemPrompt, userPrompt, options);
  if (geminiRes) return geminiRes;

  // 2. Try Groq
  const groqRes = await callGroq(systemPrompt, userPrompt, options);
  if (groqRes) return groqRes;

  // 3. Try OpenRouter
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
