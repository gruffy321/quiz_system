import { getStudentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { onboardStudent } from '../actions';

export default async function OnboardingPage() {
  const session = await getStudentSession();
  if (!session?.studentId) {
    redirect('/login');
  }

  const student = await prisma.student.findUnique({
    where: { id: session.studentId as string }
  });

  if (!student) redirect('/login');
  
  // If already onboarded, send to home
  if (student.fullName) {
    redirect('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12">
      <div className="bg-card p-8 rounded-lg shadow-md border border-border w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-center">Welcome!</h1>
        <p className="text-center text-foreground/60 mb-6 text-sm">
          Please complete your profile to claim this access code.
        </p>
        
        <form action={onboardStudent} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            <input 
              type="text" 
              name="fullName"
              required 
              className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="e.g. Jane Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tutor Group</label>
            <input 
              type="text" 
              name="tutorGroup"
              className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="e.g. 10A"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">School Email (Optional)</label>
            <input 
              type="email" 
              name="email"
              className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="e.g. jane.doe@school.edu"
            />
          </div>
          
          <button 
            type="submit" 
            className="mt-4 bg-primary text-primary-foreground py-2 px-4 rounded-md font-medium hover:bg-primary/90 transition-colors"
          >
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
}
