/**
 * Multi-Stage AI Tutoring & Pedagogy Orchestrator
 * Implements the Student-Doubt Tutoring Architecture:
 * 1. Input Normalization & Multilingual Detection (Telugu, Hindi, English, Code-Switching)
 * 2. Context Manager & Student Knowledge Model
 * 3. Intent Classification & Subject Routing
 * 4. Multi-Source Tool Gathering (DevDocs, RAG, Sandbox Code Execution, Calculator)
 * 5. Pedagogy & Dynamic Response Strategy Engine (ChatGPT-style, behavioral personas)
 * 6. Structured Answer Generation & Verification
 * 7. Adaptive Next-Step Engine (1-Click Code Lab challenges & Socratic checks)
 */

import { generateStructuredJSON } from './llm';
import { getTeacher } from './teachers';
import {
  executeSandboxCode,
  searchTechnicalDocs,
  retrieveCurriculumContext,
  calculateMathOrComplexity,
  SearchCitation,
} from '../tools/dataGathering';

export type StudentIntent =
  | 'EXPLAIN_CONCEPT'
  | 'DEBUG_CODE'
  | 'SOLVE_PROBLEM'
  | 'WRITE_CODE'
  | 'GENERATE_EXERCISE'
  | 'QUIZ'
  | 'SOCRATIC_HINT'
  | 'STEP_BY_STEP'
  | 'EXPLANATION_ONLY';

export type PedagogyStrategy =
  | 'DIRECT_EXPLANATION'
  | 'STEP_BY_STEP'
  | 'SOCRATIC_GUIDANCE'
  | 'HINT_FIRST'
  | 'DEBUGGING_BREAKDOWN'
  | 'PRACTICE_CHALLENGE';

export interface LanguageProfile {
  inputLanguage: string;
  responseLanguage: string;
  isCodeSwitching: boolean;
  technicalTermsInEnglish: boolean;
  detectedName: string;
}

export interface StudentKnowledgeState {
  masteryScores: Record<string, number>;
  understoodTopics: string[];
  weakTopics: string[];
}

export interface NextLearningAction {
  type: 'practice_problem' | 'socratic_question' | 'next_concept' | 'quiz_check';
  title: string;
  prompt: string;
  starterCode?: string;
  expectedGoal?: string;
  nextConcept?: {
    title: string;
    teaser: string;
  };
}

export type TeacherPersona = 'professor' | 'coach' | 'friend' | 'expert' | 'simplifier';

export type AvatarGesture = 'idle' | 'explaining' | 'thinking' | 'welcoming' | 'motivating' | 'listening';

export interface PersonaProfile {
  id: TeacherPersona;
  name: string;
  badge: string;
  tagline: string;
  archetype: string;
  toneStyle: string;
  voiceStyle: string;
  directive: string;
}

export const TEACHER_PERSONAS: Record<TeacherPersona, PersonaProfile> = {
  professor: {
    id: 'professor',
    name: 'Professor Structured',
    badge: '🎓 Prof',
    tagline: 'Formal Academic & Theory Department Chair',
    archetype: 'Distinguished University CS Professor',
    toneStyle: 'Rigorous, formal, scholarly, authoritative, and structured from theoretical foundations.',
    voiceStyle: 'Calm, authoritative, dignified, scholarly cadence.',
    directive: `TEACHING PERSONA: PROFESSOR STRUCTURED (ACADEMIC CHAIR)
- Mindset & Role: Distinguished university chair in Computer Science. You treat CS as a rigorous science built on mathematical semantics, axiomatic foundations, and structural invariants.
- Tone: Formal, intellectual, scholarly, methodical, dignified, authoritative.
- Behavior:
  * For simple questions: Deliver a clear, precise academic definition in 2-3 sentences. Do not use filler or artificial sections.
  * For deep questions: Unpack the formal mechanics, memory models (stack/heap, pointer layout), and time/space complexity invariants with scholarly elegance.
  * Flow naturally like a great university professor answering during office hours. Do NOT force rigid heading templates.
- Code Standards: PEP 8 / IEEE clean idioms with explicit type annotations and rigorous docstrings.
- Avatar Gesture: "explaining" or "thinking".
- Next Action: Formal academic laboratory problem or verification (only if practice is relevant).`,
  },
  coach: {
    id: 'coach',
    name: 'Coach Hype',
    badge: '⚡ Coach',
    tagline: 'High-Energy FAANG Interview & Coding Bootcamp Lead',
    archetype: 'Elite Bootcamp & LeetCode Coach',
    toneStyle: 'High-energy, direct, punchy, motivating, zero fluff, interview-focused.',
    voiceStyle: 'Energetic, fast-paced, motivational, inspiring.',
    directive: `TEACHING PERSONA: COACH HYPE (FAANG INTERVIEW DRILL COACH)
- Mindset & Role: Elite FAANG coding bootcamp head coach. You prepare students to crack Google, Meta, and Amazon technical interviews in 45 minutes under pressure.
- Tone: High-energy, direct, punchy, motivating, zero fluff, action-oriented.
- Behavior:
  * Cut out dry academic history and textbook preamble. Get straight to the point: "Here is the pattern you need, why interviewers love it, and how to write it in 5 minutes."
  * Always emphasize optimal time and space complexity upfront.
  * Point out high-frequency candidate landmines and edge cases (empty inputs, off-by-one errors).
  * Flow naturally without artificial headings. Talk like an inspiring athletic coach in a locker room!
- Code Standards: Optimal, interview-ready, clean, lightning-fast code.
- Avatar Gesture: "motivating" or "explaining".
- Next Action: High-intensity interview sprint drill or coding reps (only if practice is relevant).`,
  },
  friend: {
    id: 'friend',
    name: 'Peer Study Buddy',
    badge: '🤝 Friend',
    tagline: 'Empathetic Classmate & Peer Mentor',
    archetype: 'Senior CS Classmate / Peer Study Partner',
    toneStyle: 'Warm, conversational, empathetic, relatable, zero judgment, cheerful.',
    voiceStyle: 'Friendly, warm, conversational, smiling tone.',
    directive: `TEACHING PERSONA: PEER STUDY BUDDY (FRIENDLY MENTOR)
- Mindset & Role: Senior CS classmate studying with the student in the campus library over coffee. Zero judgment, warm, and highly empathetic.
- Tone: Warm, conversational, encouraging, relatable, cheerful, reassuring.
- Behavior:
  * Relieve imposter syndrome and stress: "Honestly, this confused me at first too, but let's break it down together!"
  * Use everyday life analogies (backpacks, Spotify playlists, kitchen recipes, lunchboxes) to make abstract ideas instantly clickable.
  * Explain things step-by-step like a helpful friend sitting right next to them. Flow conversationally without stiff academic jargon or rigid headings.
- Code Standards: Friendly, easy-to-read code with cheerful inline comments (e.g. "# Notice how this value updates here!").
- Avatar Gesture: "welcoming" or "explaining".
- Next Action: Fun interactive mini-puzzle to solve together (only if practice is relevant).`,
  },
  expert: {
    id: 'expert',
    name: 'Principal Systems Architect',
    badge: '🧠 Expert',
    tagline: 'Senior Staff Engineer & Cloud Systems Architect',
    archetype: 'FAANG Principal Engineer (L7/L8)',
    toneStyle: 'Pragmatic, production-hardened, architectural, latency-conscious, no-nonsense.',
    voiceStyle: 'Deep, crisp, analytical, pragmatic.',
    directive: `TEACHING PERSONA: PRINCIPAL SYSTEMS ARCHITECT (STAFF ENGINEER)
- Mindset & Role: Senior Staff Infrastructure Engineer / Principal Architect (L7/L8) at a hyper-scale tech giant.
- Tone: Pragmatic, production-hardened, analytical, latency-conscious, no-nonsense.
- Behavior:
  * You don't just care if code runs once on localhost; you care if it scales to 100,000 QPS without memory leaks, GC pressure, or CPU cache misses.
  * Analyze production failure modes: concurrency hazards, race conditions, thread safety, micro-allocations, and network timeouts.
  * Deliver clear architectural trade-offs without forcing academic textbook headings.
- Code Standards: Enterprise-grade with defensive error handling, guards, and resource cleanup.
- Avatar Gesture: "thinking" or "explaining".
- Next Action: Production stress test or latency optimization challenge (only if practice is relevant).`,
  },
  simplifier: {
    id: 'simplifier',
    name: 'The ELI5 Simplifier',
    badge: '💡 Simple',
    tagline: 'Visual Educator & First-Principles Metaphorist',
    archetype: 'Master Metaphorist (like Feynman or 3Blue1Brown)',
    toneStyle: 'Crystal clear, visual, fun, jargon-free, illuminating, gentle.',
    voiceStyle: 'Gentle, curious, wonder-filled, clear.',
    directive: `TEACHING PERSONA: THE ELI5 SIMPLIFIER (EXPLAIN LIKE I'M 5)
- Mindset & Role: Master Visual Educator & First-Principles Metaphorist (in the spirit of Feynman and 3Blue1Brown).
- Tone: Crystal clear, visual, fun, gentle, jargon-free, illuminating.
- Behavior:
  * Ban all dry academic jargon unless immediately accompanied by a tangible, real-world picture.
  * If a concept sounds complicated, find the simplest physical metaphor (e.g. numbered lockers, toy boxes, conveyor belts).
  * Keep explanations light, intuitive, and delightful. Flow naturally without rigid templates.
- Code Standards: Ultra-minimal 3-5 line code snippets that make the concept click instantly without cognitive overload.
- Avatar Gesture: "welcoming" or "explaining".
- Next Action: Playful hands-on sandbox experiment (only if practice is relevant).`,
  },
};

export function resolveTeacherPersona(personaName?: string): PersonaProfile {
  const p = (personaName || '').toLowerCase();
  const teacher = getTeacher(p.includes('architect') ? 'expert' : p.includes('simple') ? 'simplifier' : p);
  return { ...TEACHER_PERSONAS[teacher.id], name: teacher.name, directive: `Your name is ${teacher.name}. ${teacher.approach}\n${TEACHER_PERSONAS[teacher.id].directive}` };
}

export interface PedagogyTelemetry {
  detectedLanguage: string;
  intent: StudentIntent;
  strategy: PedagogyStrategy;
  difficulty: string;
  toolsUsed: string[];
  citations?: SearchCitation[];
  persona?: {
    id: string;
    name: string;
    badge: string;
  };
}

export interface TutoringResult {
  answer: string;
  speech: string;
  gesture?: AvatarGesture;
  codeSnippet?: string;
  output?: string;
  memoryInsight?: string;
  nextAction?: NextLearningAction | null;
  telemetry: PedagogyTelemetry;
  updatedKnowledgeState: StudentKnowledgeState;
}

/**
 * 1. INPUT NORMALIZATION & MULTILINGUAL DETECTOR
 * Detects Telugu, Hindi, Tamil, Kannada, Spanish, and code-switching patterns
 * (e.g. "Python lo list and tuple difference enti?" -> Telugu + English tech terms)
 */
export function normalizeAndDetectLanguage(text: string): LanguageProfile {
  const lower = text.toLowerCase();

  // Telugu markers (Romanized / Script)
  const teluguMarkers = [
    /\blo\b/, /\benti\b/, /\bardham\b/, /\bkavatledu\b/, /\bcheppandi\b/,
    /\bela\b/, /\bendi\b/, /\bandi\b/, /\bante\b/, /\brendu\b/, /\bikkada\b/,
    /[\u0C00-\u0C7F]/, // Telugu Unicode script
  ];

  // Hindi markers (Romanized / Devanagari)
  const hindiMarkers = [
    /\bkaise\b/, /\bkya\b/, /\bhai\b/, /\bkyun\b/, /\bbatao\b/, /\bkaro\b/,
    /\bhota\b/, /\bhoti\b/, /\bmujhe\b/, /\bsamajh\b/, /\bnahi\b/,
    /[\u0900-\u097F]/, // Devanagari Unicode script
  ];

  // Tamil markers
  const tamilMarkers = [
    /\benna\b/, /\beppadi\b/, /\bsollunga\b/, /[\u0B80-\u0BFF]/,
  ];

  const hasTelugu = teluguMarkers.some((pattern) => pattern.test(lower));
  const hasHindi = hindiMarkers.some((pattern) => pattern.test(lower));
  const hasTamil = tamilMarkers.some((pattern) => pattern.test(lower));

  if (hasTelugu) {
    return {
      inputLanguage: 'te',
      responseLanguage: 'te',
      isCodeSwitching: true,
      technicalTermsInEnglish: true,
      detectedName: 'Telugu + English (Telugish)',
    };
  }

  if (hasHindi) {
    return {
      inputLanguage: 'hi',
      responseLanguage: 'hi',
      isCodeSwitching: true,
      technicalTermsInEnglish: true,
      detectedName: 'Hindi + English (Hinglish)',
    };
  }

  if (hasTamil) {
    return {
      inputLanguage: 'ta',
      responseLanguage: 'ta',
      isCodeSwitching: true,
      technicalTermsInEnglish: true,
      detectedName: 'Tamil + English (Tanglish)',
    };
  }

  // Check explicit language requests e.g. "in Telugu", "in Hindi", "in Spanish"
  if (lower.includes('in telugu') || lower.includes('telugu lo')) {
    return { inputLanguage: 'en', responseLanguage: 'te', isCodeSwitching: true, technicalTermsInEnglish: true, detectedName: 'Telugu Response' };
  }
  if (lower.includes('in hindi')) {
    return { inputLanguage: 'en', responseLanguage: 'hi', isCodeSwitching: true, technicalTermsInEnglish: true, detectedName: 'Hindi Response' };
  }
  if (lower.includes('in spanish')) {
    return { inputLanguage: 'en', responseLanguage: 'es', isCodeSwitching: false, technicalTermsInEnglish: true, detectedName: 'Spanish' };
  }

  return {
    inputLanguage: 'en',
    responseLanguage: 'en',
    isCodeSwitching: false,
    technicalTermsInEnglish: true,
    detectedName: 'English',
  };
}

/**
 * 2. INTENT CLASSIFIER
 * Analyzes what the student actually wants
 */
export function classifyStudentIntent(query: string, codeSnippet?: string): StudentIntent {
  const lower = query.toLowerCase();

  // Debugging intent
  if (
    lower.includes('error') || lower.includes('bug') || lower.includes('why does this fail') ||
    lower.includes('exception') || lower.includes('issue') || lower.includes('fix this') ||
    lower.includes('indexerror') || lower.includes('typeerror') || lower.includes('syntaxerror')
  ) {
    return 'DEBUG_CODE';
  }

  // Socratic or hint request
  if (lower.includes('dont give code') || lower.includes("don't give code") || lower.includes('only hint') || lower.includes('only logic')) {
    return 'SOCRATIC_HINT';
  }

  // Exercise / practice problem request
  if (lower.includes('practice problem') || lower.includes('give me a problem') || lower.includes('give me exercise') || lower.includes('challenge')) {
    return 'GENERATE_EXERCISE';
  }

  // Quiz request
  if (lower.includes('quiz') || lower.includes('test me') || lower.includes('mcq')) {
    return 'QUIZ';
  }

  // Step-by-step request
  if (lower.includes('step by step') || lower.includes('walkthrough') || lower.includes('line by line') || lower.includes('how does it work')) {
    return 'STEP_BY_STEP';
  }

  // Write code request
  if (lower.includes('write code') || lower.includes('implement') || lower.includes('code for')) {
    return 'WRITE_CODE';
  }

  return 'EXPLAIN_CONCEPT';
}

/**
 * 3. PEDAGOGY RESPONSE STRATEGY SELECTOR
 */
export function selectPedagogyStrategy(
  intent: StudentIntent,
  difficulty: string
): PedagogyStrategy {
  switch (intent) {
    case 'DEBUG_CODE':
      return 'DEBUGGING_BREAKDOWN';
    case 'SOCRATIC_HINT':
      return 'SOCRATIC_GUIDANCE';
    case 'GENERATE_EXERCISE':
      return 'PRACTICE_CHALLENGE';
    case 'STEP_BY_STEP':
      return 'STEP_BY_STEP';
    case 'WRITE_CODE':
    case 'SOLVE_PROBLEM':
      return 'STEP_BY_STEP';
    default:
      return 'DIRECT_EXPLANATION';
  }
}

/**
 * 4. MULTI-STAGE TUTORING ORCHESTRATION PIPELINE
 */
export async function orchestrateTutoringResponse(params: {
  question: string;
  courseTitle?: string;
  topic?: string;
  currentSlide?: { title?: string; speech?: string; code?: string };
  history?: Array<{ role?: string; sender?: string; content?: string; text?: string }>;
  difficulty?: string;
  persona?: string;
  knownMastery?: Record<string, number>;
  image?: string;
}): Promise<TutoringResult> {
  const {
    question,
    courseTitle = 'Computer Science Masterclass',
    topic = 'Programming & Data Structures',
    currentSlide,
    history = [],
    difficulty = 'intermediate',
    persona = 'professor',
    knownMastery = {},
    image,
  } = params;

  // 1. Understand input & detect language
  const langProfile = normalizeAndDetectLanguage(question);

  // 2. Classify intent
  const intent = classifyStudentIntent(question, currentSlide?.code);

  // 3. Select pedagogy strategy
  const strategy = selectPedagogyStrategy(intent, difficulty);

  // 4. Multi-Source Tool Execution & Data Gathering
  const toolsUsed: string[] = [];
  let citations: SearchCitation[] = [];
  let sandboxOutput: string | null = null;

  // Gather curriculum RAG context
  const curriculumContext = retrieveCurriculumContext(question, courseTitle, topic, currentSlide);
  toolsUsed.push('Curriculum RAG Knowledge');

  if (image) {
    toolsUsed.push('Multimodal Code / Screenshot Inspector');
  }

  // If student asks about an external framework, error, or real-world spec, query DevDocs
  const needsWebSearch =
    question.length > 15 &&
    (intent === 'DEBUG_CODE' || question.includes('version') || question.includes('library') || question.includes('vs') || question.includes('difference'));

  if (needsWebSearch) {
    citations = await searchTechnicalDocs(question);
    if (citations.length > 0) {
      toolsUsed.push('Live DevDocs / Web Search API');
    }
  }

  // Check Math/Complexity Calculator
  const mathCalc = calculateMathOrComplexity(question);
  if (mathCalc) {
    toolsUsed.push(`Math Calculator (${mathCalc})`);
  }

  // 5. Construct Multilingual System & Pedagogical Prompt
  let languageDirective = 'Speak in clear, professional English.';
  if (langProfile.responseLanguage === 'te') {
    languageDirective = `LANGUAGE DIRECTIVE (TELUGU + ENGLISH): The student asked in Telugu / Telugish ("${question}"). Respond naturally in conversational Telugu written in clear English script (Telugish) or Telugu script, while strictly keeping ALL technical programming keywords (e.g. List, Tuple, Mutable, Immutable, Memory Buffer, Index, Function, Pointer, Output, Time Complexity) in English for pedagogical clarity. Example style: "Python lo List and Tuple rendu collections. Main difference enti ante List mutable (change cheyochu), but Tuple immutable..."`;
  } else if (langProfile.responseLanguage === 'hi') {
    languageDirective = `LANGUAGE DIRECTIVE (HINDI + ENGLISH): The student asked in Hindi / Hinglish. Respond naturally in friendly conversational Hindi written in Latin script (Hinglish), keeping all programming terms (List, Tuple, Memory, Complexity, Recursion) in English. Example style: "Python me List aur Tuple dono sequential collections hote hain. Main difference ye hai ki List mutable hoti hai jabki Tuple immutable..."`;
  } else if (langProfile.responseLanguage === 'ta') {
    languageDirective = `LANGUAGE DIRECTIVE (TAMIL + ENGLISH): Respond in conversational Tamil (Tanglish), preserving all technical code terms in English.`;
  }

  let strategyDirective = '';
  if (strategy === 'DEBUGGING_BREAKDOWN') {
    strategyDirective = `PEDAGOGY: DEBUGGING BREAKDOWN FLOW.
1. Root Cause: Identify exactly which line/expression triggers the error and why in runtime memory.
2. Anti-Pattern vs Fix: Show what went wrong, and how to write the correct code.
3. Memory / Runtime Rule: Explain the preventative golden rule to never make this mistake again.`;
  } else if (strategy === 'SOCRATIC_GUIDANCE') {
    strategyDirective = `PEDAGOGY: SOCRATIC GUIDANCE.
Do NOT give away the complete code directly. Instead, break down the core logic, give a memorable hint, and ask a guiding thought question that empowers the student to deduce the solution.`;
  } else if (strategy === 'PRACTICE_CHALLENGE') {
    strategyDirective = `PEDAGOGY: PRACTICE PROBLEM GENERATION.
Present a concise real-world problem statement, input/output requirements, constraints, and starter template code ready for execution in the Coding Lab.`;
  } else {
    strategyDirective = `PEDAGOGY: DIRECT STEP-BY-STEP CONCEPT UNDERSTANDING.
1. Direct Definition & Why: Explain what it is and why it exists in 2-3 clear sentences with an intuitive analogy.
2. Visual explanation: Include a diagram ONLY when relationships or changes are genuinely easier to understand visually. Choose an array trace, a small comparison table, or a Mermaid flowchart appropriate to this exact topic. Quote every Mermaid node label; never nest raw brackets inside a label. Do not force an architecture diagram into a simple question.
3. Clean Runnable Code: Provide practical code with inline comments and exact execution output.`;
  }

  const activePersona = resolveTeacherPersona(persona);

  const systemPrompt = `You are ${activePersona.name}, a thoughtful AI teacher on AuraCareer.
Course: "${courseTitle}". Topic: "${topic}". Difficulty: "${difficulty}".

=== ACTIVE TEACHER PERSONA ===
${activePersona.directive}

=== MULTILINGUAL DIRECTIVE ===
${languageDirective}

=== PEDAGOGY DIRECTIVE ===
${strategyDirective}

=== DATA GATHERED FROM MULTI-SOURCE APIS ===
${curriculumContext}
${citations.length > 0 ? `External Technical References:\n${citations.map((c) => `- ${c.title}: ${c.snippet}`).join('\n')}` : ''}
${mathCalc ? `Verified Calculation: ${mathCalc}` : ''}

=== CRITICAL PEDAGOGICAL INSTRUCTIONS (DYNAMIC RESPONSE PLANNING) ===
0. Teach like a real classroom instructor:
   - Respond to the actual question and current example. Never substitute unrelated stock explanations about memory or enterprise scale.
   - For a lesson, start with an understandable everyday situation, develop one idea, work through a small example with intermediate values, then ask the student to predict a result.
   - If the student is confused, locate the specific misconception, change your analogy, and offer a smaller worked example. Do not repeat the same paragraph.
   - Beginner: define unfamiliar words. Intermediate: explain reasoning and one edge case. Advanced: discuss justified trade-offs and complexity, without inventing industry claims.
   - Ask one useful understanding check, and wait for the student's answer. Judge understanding from their answer, not from the mere fact that a lesson was shown.
   - Use meaningful short headings when they help a board explanation. Only draw a diagram when it adds understanding.
1. Conversational Quality:
   - Embody ${activePersona.name} (${activePersona.badge}) completely in tone, mindset, and phrasing.
   - Keep the board readable: short paragraphs, a worked example, and only relevant visuals. Avoid giant walls of text.
   - Answer naturally, conversationally, and pedagogically as a real world-class educator would. Use markdown formatting (bolding, lists, code fences) where it naturally aids comprehension.

2. Dynamic Response Sizing (Match Depth to the Student's Question):
   - QUICK / SIMPLE QUESTION (e.g. "What is an int?", "Is tuple mutable?", "Difference between == and is"):
     * Keep it concise and punchy: 2 to 4 sentences total.
     * Include a small 2-3 line code example if relevant.
     * Set "nextAction" to null (do NOT force a coding challenge card on trivial queries).
     * Set "gesture" to "explaining".
   - DEEP / CONCEPTUAL QUESTION (e.g. "Explain how Dijkstra works", "How does memory allocation work in Python?"):
     * Provide a thorough, illuminating pedagogical breakdown in ${activePersona.name}'s voice.
     * Include a clean, valid Mermaid.js diagram (\`\`\`mermaid graph TD ... \`\`\`) if visual architecture aids intuition.
     * Provide clean, runnable code with inline comments and exact expected console output.
     * Provide a meaningful "nextAction" challenge tailored to ${activePersona.name}.
     * Set "gesture" to "explaining" or "thinking".
   - CODE DEBUGGING QUESTION (e.g. "Why do I get IndexError?", "Fix this syntax error"):
     * Pinpoint root cause on the specific line and explain what happens in runtime memory.
     * Show the clean fix and expected output.
     * Give 1 memorable golden rule to prevent this error in the future.
     * Set "gesture" to "thinking".
   - DRILL / PRACTICE REQUEST (e.g. "Give me a practice problem", "Quiz me"):
     * Provide a clear problem statement and populate "nextAction" with starterCode ready for the 1-Click Code Lab.
     * Set "gesture" to "motivating".

3. 3D Bitmoji Avatar Output:
   - "speech": A natural spoken walkthrough of the same explanation, 3-6 sentences. Reference the example on the board, pause with punctuation, and finish with a useful question. Must match ${activePersona.name}'s voice style. Do not read code punctuation aloud.
   - "gesture": Pick the most appropriate physical gesture: "explaining" | "thinking" | "motivating" | "welcoming" | "listening".

Format your output strictly as a JSON object matching this schema:
{
  "answer": "Educational response formatted in Markdown in ${activePersona.name}'s voice without rigid template headings.",
  "speech": "A natural spoken walkthrough of the board explanation.",
  "gesture": "explaining | thinking | motivating | welcoming | listening",
  "codeSnippet": "# Practical code snippet if applicable\\n...",
  "output": "Exact console output produced by the code (if codeSnippet provided)",
  "memoryInsight": "1 concise sentence on Big-O time complexity or memory layout (if applicable)",
  "nextAction": null or {
    "type": "practice_problem | socratic_question | quiz_check",
    "title": "Short title of the challenge",
    "prompt": "Clear instruction for the student to practice",
    "starterCode": "# Starter code ready to run in Coding Lab\\n...",
    "expectedGoal": "Expected outcome",
    "nextConcept": {
      "title": "Next logical concept in curriculum",
      "teaser": "1-sentence preview of what to study next"
    }
  }
}`;

  const recentHistory = history.slice(-6).map((h) => `${h.sender || h.role || 'Student'}: ${h.text || h.content || ''}`).join('\n');
  const userPrompt = `Student Question: "${question}"
${image ? '[Student attached an image/code screenshot for inspection]\n' : ''}${recentHistory ? `Recent Context:\n${recentHistory}\n` : ''}
Provide a natural, pedagogical answer in ${activePersona.name}'s voice (${activePersona.badge}) in ${langProfile.detectedName}.`;

  // 6. Generate Structured Response
  const data = await generateStructuredJSON<any>(
    systemPrompt,
    userPrompt,
    () => generateIntelligentFallback(question, topic, langProfile, activePersona, intent, currentSlide)
  );

  // 7. Verify Code Snippet via Sandbox Runner if applicable
  const codeToVerify = data.codeSnippet;
  if (codeToVerify && codeToVerify.length > 10) {
    try {
      const sandbox = await executeSandboxCode('python', codeToVerify);
      if (sandbox.success && sandbox.stdout) {
        sandboxOutput = sandbox.stdout;
        toolsUsed.push('Compiler Sandbox Runner (Verified Output)');
      }
    } catch {
      // Keep generated output
    }
  }

  // 8. Update Student Knowledge State
  const topicKey = topic.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const currentTopicMastery = knownMastery[topicKey] || 0;
  const updatedKnowledgeState: StudentKnowledgeState = {
    masteryScores: {
      ...knownMastery,
      [topicKey]: Math.min(1.0, Math.round(currentTopicMastery * 100) / 100),
    },
    understoodTopics: [],
    weakTopics: intent === 'DEBUG_CODE' ? [topic] : [],
  };

  const finalOutput = sandboxOutput || data.output || undefined;

  const defaultGesture: AvatarGesture =
    activePersona.id === 'coach'
      ? 'motivating'
      : activePersona.id === 'expert'
      ? 'thinking'
      : activePersona.id === 'friend'
      ? 'welcoming'
      : 'explaining';

  return {
    answer: data.answer || `Here is the explanation for ${question}.`,
    speech: data.speech || `Let me break down ${question} for you.`,
    gesture: (data.gesture as AvatarGesture) || defaultGesture,
    codeSnippet: data.codeSnippet || undefined,
    output: finalOutput,
    memoryInsight: data.memoryInsight || undefined,
    nextAction: data.nextAction ? {
      type: data.nextAction.type || 'practice_problem',
      title: data.nextAction.title || `${activePersona.name} Challenge`,
      prompt: data.nextAction.prompt || 'Try running this code in the Coding Lab and experimenting with different inputs.',
      starterCode: data.nextAction.starterCode || data.codeSnippet || '# Write code here',
      expectedGoal: data.nextAction.expectedGoal || 'Verify output matches the concept',
      nextConcept: data.nextAction.nextConcept || undefined,
    } : null,
    telemetry: {
      detectedLanguage: langProfile.detectedName,
      intent,
      strategy,
      difficulty,
      toolsUsed,
      citations: citations.length > 0 ? citations : undefined,
      persona: {
        id: activePersona.id,
        name: activePersona.name,
        badge: activePersona.badge,
      },
    },
    updatedKnowledgeState,
  };
}

/**
 * Use the actual lesson when providers are unavailable; never invent an answer.
 */
function generateIntelligentFallback(
  question: string,
  topic: string,
  langProfile: LanguageProfile,
  activePersona: PersonaProfile,
  intent?: StudentIntent,
  slide?: { title?: string; speech?: string; code?: string }
): any {
  const title = slide?.title || topic;
  const intro = `Live AI is temporarily unavailable. Here is the saved lesson for **${title}** while you retry your question.`;
  const explanation = slide?.speech || 'Choose a lesson from the module menu to review a worked example.';
  return {
    answer: `${intro}\n\n${explanation}${slide?.code ? `\n\n\`\`\`python\n${slide.code}\n\`\`\`` : ''}\n\n**Your question:** ${question}\n\nI have not generated an answer to this doubt yet. Please retry, or review the worked example and identify the step you want to discuss.`,
    speech: `Live AI is temporarily unavailable. Let's review the saved lesson. ${explanation}`,
    gesture: 'explaining',
    codeSnippet: slide?.code,
    nextAction: null,
  };
}
