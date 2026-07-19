import { getStudentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function Home() {
  const session = await getStudentSession();
  
  if (!session?.studentId) {
    redirect('/login');
  }

  const student = await prisma.student.findUnique({
    where: { id: session.studentId as string }
  });

  if (!student) redirect('/login');
  if (!student.fullName) redirect('/onboarding');

  // Hardcode available modules for now
  const modules = [
    { id: 'ws1', title: 'Hazard Warning Diamonds' },
    { id: 'ws3', title: 'Engineering Drawings' },
    { id: 'ws4', title: 'ISO Fluid Power Symbols' },
    { id: 'ws5', title: 'BS3939 Circuit Symbols' },
    { id: 'ws6', title: 'Types of Fire Extinguishers' },
    { id: 'ws7', title: 'PPE (Personal Protective Equipment)' },
    { id: 'ws8', title: 'Mechanical Handling Equipment' },
    { id: 'ws9', title: 'Maximising Materials (Q&A)' },
    { id: 'ws10', title: 'Files (Q&A)' },
  ];

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center bg-card p-6 rounded-lg border border-border shadow-sm">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {student.fullName}</h1>
            <p className="text-sm text-foreground/60">Tutor Group: {student.tutorGroup || 'N/A'}</p>
          </div>
          <Link href="/profile" className="bg-secondary text-secondary-foreground py-2 px-4 rounded-md font-medium hover:bg-secondary/80">
            My Profile
          </Link>
        </div>

        <h2 className="text-xl font-bold">Available Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map(mod => (
            <Link 
              key={mod.id} 
              href={`/modules/engineering/${mod.id}`}
              className="bg-card p-6 rounded-lg border border-border hover:border-primary hover:shadow-md transition-all flex flex-col justify-between h-32 group"
            >
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{mod.title}</h3>
              <span className="text-sm text-primary font-medium mt-4">Start Module &rarr;</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
