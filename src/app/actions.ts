'use server';

import { setStudentSession, clearStudentSession, getStudentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function loginStudent(formData: FormData) {
  const code = (formData.get('code') as string)?.toUpperCase().trim();
  if (!code) throw new Error('Join code is required');

  const student = await prisma.student.findUnique({
    where: { joinCode: code }
  });

  if (!student) {
    throw new Error('Invalid join code');
  }

  await setStudentSession(student.id);

  if (!student.fullName) {
    redirect('/onboarding');
  } else {
    redirect('/');
  }
}

export async function onboardStudent(formData: FormData) {
  const session = await getStudentSession();
  if (!session?.studentId) throw new Error('Not authenticated');

  const fullName = formData.get('fullName') as string;
  const tutorGroup = formData.get('tutorGroup') as string;
  const email = formData.get('email') as string;

  if (!fullName) throw new Error('Full name is required');

  await prisma.student.update({
    where: { id: session.studentId as string },
    data: { fullName, tutorGroup, email }
  });

  redirect('/');
}

export async function updateProfile(formData: FormData) {
  const session = await getStudentSession();
  if (!session?.studentId) throw new Error('Not authenticated');

  const fullName = formData.get('fullName') as string;
  const tutorGroup = formData.get('tutorGroup') as string;
  const email = formData.get('email') as string;

  await prisma.student.update({
    where: { id: session.studentId as string },
    data: { fullName, tutorGroup, email }
  });

  redirect('/profile?updated=true');
}

export async function deleteAccount(formData: FormData) {
  const session = await getStudentSession();
  if (!session?.studentId) throw new Error('Not authenticated');

  const confirmCode = (formData.get('confirmCode') as string)?.toUpperCase().trim();
  
  const student = await prisma.student.findUnique({
    where: { id: session.studentId as string }
  });

  if (!student || student.joinCode !== confirmCode) {
    throw new Error('Join code does not match. Deletion aborted.');
  }

  // Right to be forgotten (cascades and deletes all telemetry as well)
  await prisma.student.delete({
    where: { id: student.id }
  });

  await clearStudentSession();
  redirect('/login');
}

export async function logoutStudent() {
  await clearStudentSession();
  redirect('/login');
}
