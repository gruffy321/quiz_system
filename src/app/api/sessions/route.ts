import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { moduleId, domain } = body;

    // 1. Create an anonymous student for this session
    const student = await prisma.student.create({ data: {} });

    // 2. Create the session
    const session = await prisma.session.create({
      data: {
        studentId: student.id,
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
