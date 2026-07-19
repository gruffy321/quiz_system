'use server';

import { setAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'teacher123';

export async function loginAdmin(formData: FormData) {
  const password = formData.get('password') as string;
  if (password === ADMIN_PASSWORD) {
    await setAdminSession();
    redirect('/admin');
  } else {
    throw new Error('Invalid password');
  }
}

export async function generateCodes(formData: FormData) {
  const countStr = formData.get('count') as string;
  const count = parseInt(countStr, 10) || 1;
  const codes = [];
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No ambiguous characters (I, 1, O, 0)
  
  for (let i = 0; i < count; i++) {
    let code = '';
    for (let j = 0; j < 6; j++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    codes.push(code);
  }

  // Insert into database
  await prisma.student.createMany({
    data: codes.map(code => ({
      joinCode: code,
    })),
    skipDuplicates: true, // Just in case a collision happens
  });

  revalidatePath('/admin');
}
