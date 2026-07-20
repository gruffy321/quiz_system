import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getStudentSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const studentSession = await getStudentSession();
    if (!studentSession?.studentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, questionId, incorrectAttempts, isCorrect, timeTakenSeconds, userAnswerData } = body;

    if (!sessionId || !questionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the session actually belongs to this student
    const sessionRecord = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { studentId: true }
    });

    if (!sessionRecord || sessionRecord.studentId !== studentSession.studentId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const metric = await prisma.questionMetric.create({
      data: {
        sessionId,
        questionId,
        incorrectAttempts: incorrectAttempts || 0,
        isCorrect: isCorrect || false,
        timeTakenSeconds: timeTakenSeconds || 0,
        userAnswerData: userAnswerData || null,
      },
    });

    return NextResponse.json({ success: true, metric });
  } catch (error) {
    console.error('Metric creation error:', error);
    return NextResponse.json({ error: 'Failed to log metric' }, { status: 500 });
  }
}
