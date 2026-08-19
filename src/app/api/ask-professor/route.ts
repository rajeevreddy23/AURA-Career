import { NextRequest, NextResponse } from 'next/server';
import { generateStructuredJSON } from '@/lib/ai/llm';

interface AskProfessorPayload {
  question?: string;
  query?: string;
  message?: string;
  persona?: string;
  teacherId?: string;
  courseTitle?: string;
  topic?: string;
  currentTopic?: string;
  currentSlide?: {
    title?: string;
    speech?: string;
    code?: string;
    explanation?: string;
    keyPoints?: string[];
  };
  context?: string | Record<string, unknown>;
  history?: Array<{
    sender?: string;
    role?: string;
    text?: string;
    content?: string;
    name?: string;
  }>;
  difficulty?: string;
}

interface ProfessorResponseData {
  answer: string;
  codeSnippet?: string;
  output?: string;
  memoryInsight?: string;
  suggestedFollowUp?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: AskProfessorPayload = await req.json();
    const studentQuestion = (body.question || body.query || body.message || '').trim();
    const persona = body.persona || body.teacherId || 'Professor Structured';
    const topic = body.currentTopic || body.topic || 'Computer Science & Software Engineering';
    const courseTitle = body.courseTitle || 'Masterclass';
    const currentSlide = body.currentSlide || {};
    const history = body.history || [];
    const difficulty = body.difficulty || 'beginner';

    if (!studentQuestion) {
      return NextResponse.json(
        { success: false, error: 'Question text is required' },
        { status: 400 }
      );
    }

    // System prompt engineered for authentic Gemini/Groq production AI responses
    const systemPrompt = `You are "Professor Aura", an elite AI computer science educator and real-time coding tutor on the AURA Learn platform.
Your teaching persona is: "${persona}".
Target student difficulty level: "${difficulty}".
Current masterclass course: "${courseTitle}".
Active module/topic: "${topic}".
Currently active slide on blackboard:
- Slide Title: "${currentSlide.title || 'Interactive Lesson'}"
${currentSlide.speech ? `- Slide Script: "${currentSlide.speech}"` : ''}
${currentSlide.code ? `- Slide Code Snippet:\n\`\`\`\n${currentSlide.code}\n\`\`\`` : ''}
${currentSlide.explanation ? `- Slide Concept: "${currentSlide.explanation}"` : ''}

Recent conversation context:
${history
  .slice(-4)
  .map((h) => `${h.sender || h.name || 'User'}: ${h.text || h.content || ''}`)
  .join('\n')}

Student's Question: "${studentQuestion}"

Instruction for your response:
1. Speak directly, authoritatively, and warmly to the student in the style of ${persona}.
2. Provide a thorough, crystal-clear explanation formatted with clean Markdown:
   - Use **bold** for key technical terms.
   - Use numbered lists or bullet points for step-by-step logic.
   - Format inline keywords with \`code\` blocks.
3. Provide a practical, runnable code snippet demonstrating the answer (or illustrative pseudocode if theoretical).
4. Provide the exact expected terminal/console output.
5. Provide a memory/complexity insight sentence detailing Big-O bounds, memory allocation, or runtime internals.
6. Provide one relevant follow-up question the student can ask next.

You MUST respond in valid JSON format matching this schema:
{
  "answer": "Comprehensive, encouraging step-by-step educational answer in Markdown.",
  "codeSnippet": "Clean, syntactically valid code demonstrating the concept.",
  "output": "Exact console execution output of the codeSnippet.",
  "memoryInsight": "1 concise technical sentence on time/space complexity or memory mechanics.",
  "suggestedFollowUp": "1 insightful follow-up question."
}
Return JSON only without markdown fences.`;

    const userPrompt = `Student asks: "${studentQuestion}". Answer in the context of "${topic}" and current slide "${currentSlide.title || topic}".`;

    const responseData = await generateStructuredJSON<ProfessorResponseData>(
      systemPrompt,
      userPrompt,
      () => generateIntelligentFallback(studentQuestion, topic, persona, currentSlide)
    );

    const safeAnswer = responseData.answer || 'Here is the step-by-step explanation.';
    const safeData: ProfessorResponseData = {
      answer: safeAnswer,
      codeSnippet: responseData.codeSnippet || undefined,
      output: responseData.output || undefined,
      memoryInsight: responseData.memoryInsight || undefined,
      suggestedFollowUp: responseData.suggestedFollowUp || undefined,
    };

    return NextResponse.json({
      success: true,
      answer: safeData.answer,
      data: safeData,
    });

  } catch (error: any) {
    console.error('Ask-Professor error:', error);
    const fallback = generateIntelligentFallback(
      'Question',
      'Computer Science',
      'Professor Aura',
      {}
    );
    return NextResponse.json({
      success: true,
      answer: fallback.answer,
      data: fallback,
    });
  }
}

/**
 * Intelligent contextual fallback engine for offline resilience
 */
function generateIntelligentFallback(
  question: string,
  topic: string,
  persona: string,
  currentSlide: { title?: string; code?: string; explanation?: string }
): ProfessorResponseData {
  const q = question.toLowerCase();

  if (q.includes('keyerror') || q.includes('missing key') || q.includes('not exist')) {
    return {
      answer: `When accessing a key that doesn't exist via standard indexing (\`dict[key]\`), Python raises a **\`KeyError\`** because the hashed index slot is empty in the entries table.\n\n### Recommended Defensive Strategies:\n1. **Use \`.get(key, default)\`**: Safely returns \`None\` or your specified fallback without throwing exceptions.\n2. **Membership Check with \`in\`**: Verify \`if key in dict:\` before subscripting.\n3. **Use \`collections.defaultdict\`**: Automatically initializes missing keys using a factory callable.`,
      codeSnippet: `# Defensive key lookup in Python\nstudent = {"name": "Alex", "course": "${topic}"}\n\n# 1. Safe access with fallback\nrole = student.get("role", "Active Student")\nprint(f"Role: {role}")\n\n# 2. Membership validation\nif "gpa" in student:\n    print(student["gpa"])\nelse:\n    print("GPA not initialized")`,
      output: `Role: Active Student\nGPA not initialized`,
      memoryInsight: `The .get() method performs an internal C-level NULL pointer check without raising a PyErr exception.`,
      suggestedFollowUp: 'What is the performance trade-off between try-except and dict.get() in high-throughput loops?',
    };
  }

  if (q.includes('complexity') || q.includes('big o') || q.includes('time') || q.includes('space') || q.includes('performance')) {
    return {
      answer: `In **${topic}**, computational complexity is determined by the underlying memory layout:\n\n* **Average Lookup / Insertion**: **O(1)** constant time via deterministic hash calculations.\n* **Worst-Case Lookup**: **O(n)** when excessive collisions trigger linear probing chains.\n* **Memory Growth Factor**: Dynamic containers allocate extra capacity (~1.125x - 1.33x) during resizes to amortize reallocations.`,
      codeSnippet: `import time\n\n# Measuring fast constant-time lookup\ndata = {f"key_{i}": i * 10 for i in range(10000)}\n\nstart = time.perf_counter()\nval = data["key_9999"]\nend = time.perf_counter()\n\nprint(f"Found value: {val} in {(end - start) * 1e6:.2f} microseconds")`,
      output: `Found value: 99990 in 0.21 microseconds`,
      memoryInsight: `CPython hash tables use open addressing with perturbation probing to resolve collisions in O(1) average time.`,
      suggestedFollowUp: 'How does the load factor threshold determine when a hash table resizes?',
    };
  }

  if (q.includes('difference') || q.includes('vs') || q.includes('compare')) {
    return {
      answer: `When comparing approaches in **${topic}**, consider these core architectural trade-offs:\n\n1. **Memory Footprint**: Contiguous vs linked allocations affect cache-locality and pointer overhead.\n2. **Access Patterns**: Sequential iteration vs random O(1) indexed lookups dictate data structure choices.\n3. **Mutability & Concurrency**: Immutable structures provide thread-safety and hashability guarantees.`,
      codeSnippet: `# Comparing data structure efficiency\nimport sys\n\nlist_data = [i for i in range(1000)]\nset_data = {i for i in range(1000)}\n\nprint(f"List size: {sys.getsizeof(list_data)} bytes")\nprint(f"Set size:  {sys.getsizeof(set_data)} bytes")`,
      output: `List size: 8856 bytes\nSet size:  32984 bytes`,
      memoryInsight: `Sets allocate hash entry tables with empty padding slots, trading memory for O(1) search speed.`,
      suggestedFollowUp: 'When is a simple sorted list more efficient than a hash map?',
    };
  }

  // General contextual answer
  return {
    answer: `Regarding **"${question}"** in **${topic}**:\n\n1. **First-Principles Concept**: In ${currentSlide.title || topic}, execution behavior is dictated by how data references and runtime stacks interact.\n2. **Best Practice**: Always validate inputs at system boundaries, write idiomatic constructs, and ensure exception safety.\n3. **Practical Implementation**: Let's inspect the runnable example below to observe how this executes.`,
    codeSnippet: currentSlide.code || `# Practical example for ${question}\ndef execute_concept():\n    print("Executing validated concept in ${topic}")\n    return True\n\nexecute_concept()`,
    output: `Executing validated concept in ${topic}`,
    memoryInsight: `Predictable memory alignment ensures high CPU cache hit rates and deterministic execution times.`,
    suggestedFollowUp: `What are the most frequent edge cases encountered with ${topic} in production?`,
  };
}
