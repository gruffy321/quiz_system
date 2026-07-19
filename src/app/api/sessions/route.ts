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
    const { moduleId, domain } = body;

    // Create the session for the logged-in student
    const session = await prisma.session.create({
      data: {
        studentId: studentSession.studentId as string,
        moduleId: moduleId || 'unknown',
        domain: domain || 'unknown',
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
