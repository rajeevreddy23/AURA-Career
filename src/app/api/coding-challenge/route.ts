import { NextRequest, NextResponse } from 'next/server';
import { generateStructuredJSON } from '@/lib/ai/llm';
import type { CodingChallenge } from '@/hooks/useClassroomState';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const topic = (body.currentTopic || body.topic || 'Computer Science Algorithms').trim();
    const level = body.level || body.difficulty || 'beginner';

    const systemPrompt = `You are an expert coding interview proctor and lab designer on AURA Learn.
Generate a concise, interactive, runnable practice coding lab challenge for the topic: "${topic}".
Level: "${level}".

You MUST return a valid JSON object matching this schema:
{
  "title": "Concise challenge title (e.g. Implement O(1) Frequency Counter)",
  "instructions": "Clear step-by-step requirements, input/output constraints, and expected Big-O complexity.",
  "starterCode": "def solution(data):\n    # Write your implementation here\n    pass",
  "solutionCode": "def solution(data):\n    # Official robust solution\n    return result",
  "testCases": [
    {
      "input": "sample input argument",
      "expected": "expected return value",
      "description": "Base case validation"
    },
    {
      "input": "edge case argument",
      "expected": "expected return value",
      "description": "Empty / boundary condition check"
    }
  ]
}
Return valid JSON only without markdown code fences.`;

    const userPrompt = `Create a high-yield coding challenge for topic: "${topic}".`;

    const challenge = await generateStructuredJSON<CodingChallenge>(
      systemPrompt,
      userPrompt,
      () => generateFallbackChallenge(topic)
    );

    return NextResponse.json({
      success: true,
      data: challenge,
    });

  } catch (error: any) {
    console.error('Coding challenge error:', error);
    const fallback = generateFallbackChallenge('Python Data Structures');
    return NextResponse.json({
      success: true,
      data: fallback,
    });
  }
}

function generateFallbackChallenge(topic: string): CodingChallenge {
  return {
    title: `Practice Challenge: Mastering ${topic}`,
    instructions: `Implement a robust function that processes the input stream, filters invalid values, and returns the aggregated result in O(n) time.`,
    starterCode: `def solve_challenge(items):\n    \"\"\"\n    Task: Filter non-empty strings and return their uppercase mapping.\n    Time Complexity: O(n)\n    \"\"\"\n    # TODO: Implement solution\n    pass`,
    solutionCode: `def solve_challenge(items):\n    return [item.upper() for item in items if item and isinstance(item, str)]`,
    testCases: [
      {
        input: `["apple", "banana", "cherry"]`,
        expected: `['APPLE', 'BANANA', 'CHERRY']`,
        description: 'Standard string stream'
      },
      {
        input: `["", None, "active"]`,
        expected: `['ACTIVE']`,
        description: 'Edge case with empty / falsy values'
      }
    ]
  };
}
