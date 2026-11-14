import { NextRequest, NextResponse } from 'next/server';
import { orchestrateTutoringResponse } from '@/lib/ai/tutoringEngine';

// Allow up to 60 seconds for deep multi-stage tutoring and sandbox verification
export const maxDuration = 60;

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
  knownMastery?: Record<string, number>;
  image?: string;
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
    const difficulty = body.difficulty || 'intermediate';
    const knownMastery = body.knownMastery || {};
    const image = body.image;

    if (!studentQuestion) {
      return NextResponse.json(
        { success: false, error: 'Question text is required' },
        { status: 400 }
      );
    }

    // Call the Multi-Stage AI Tutoring Engine
    const tutoringResult = await orchestrateTutoringResponse({
      question: studentQuestion,
      courseTitle,
      topic,
      currentSlide,
      history,
      difficulty,
      persona,
      knownMastery,
      image,
    });

    const responseData = {
      answer: tutoringResult.answer,
      speech: tutoringResult.speech,
      gesture: tutoringResult.gesture || 'explaining',
      codeSnippet: tutoringResult.codeSnippet,
      output: tutoringResult.output,
      memoryInsight: tutoringResult.memoryInsight,
      suggestedFollowUp: tutoringResult.nextAction?.prompt,
      nextConcept: tutoringResult.nextAction?.nextConcept,
      nextAction: tutoringResult.nextAction,
      telemetry: tutoringResult.telemetry,
      updatedKnowledgeState: tutoringResult.updatedKnowledgeState,
    };

    return NextResponse.json({
      success: true,
      answer: tutoringResult.answer,
      speech: tutoringResult.speech,
      gesture: tutoringResult.gesture || 'explaining',
      data: responseData,
    });

  } catch (error: any) {
    console.error('Ask-Professor multi-stage error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Tutoring engine encountered an issue',
      answer: 'Let us break down this concept step by step.',
      data: {
        answer: 'Let us break down this concept step by step with clean logic and practical examples.',
        speech: 'Let us break down this concept step by step.',
      },
    }, { status: 500 });
  }
}
