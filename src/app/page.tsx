import fs from 'fs';
import path from 'path';
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

  // Dynamically load and parse modules from the filesystem
  const modulesDir = path.join(process.cwd(), 'src/data/modules/engineering');
  const fileNames = fs.readdirSync(modulesDir);
  const modules = fileNames
    .filter(file => file.endsWith('.json'))
    .map(file => {
      const filePath = path.join(modulesDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const json = JSON.parse(content);
      return { id: json.id, title: json.title };
    })
    .sort((a, b) => {
      // Sort numerically by the WS number (e.g., ws1, ws2, ws10)
      const numA = parseInt(a.id.replace(/\D/g, ''), 10);
      const numB = parseInt(b.id.replace(/\D/g, ''), 10);
      return numA - numB;
    });

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
              className="bg-card p-6 rounded-lg border border-border hover:border-primary hover:shadow-md transition-all flex flex-col justify-between min-h-[8rem] group relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors pr-2 leading-tight">
                  {mod.title}
                </h3>
                <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-md shadow-sm border border-primary/20 flex-shrink-0 uppercase tracking-wider">
                  {mod.id}
                </span>
              </div>
              <span className="text-sm text-primary font-medium mt-6 inline-flex items-center">
                Start Module 
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
