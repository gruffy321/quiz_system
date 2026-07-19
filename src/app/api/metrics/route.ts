import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, questionId, incorrectAttempts, isCorrect, timeTakenSeconds } = body;

    if (!sessionId || !questionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const metric = await prisma.questionMetric.create({
      data: {
        sessionId,
        questionId,
        incorrectAttempts: incorrectAttempts || 0,
        isCorrect: isCorrect || false,
        timeTakenSeconds: timeTakenSeconds || 0,
      },
    });

    return NextResponse.json({ success: true, metric });
  } catch (error) {
    console.error('Metric creation error:', error);
    return NextResponse.json({ error: 'Failed to log metric' }, { status: 500 });
  }
}
