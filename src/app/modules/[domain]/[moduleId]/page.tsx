import { notFound, redirect } from "next/navigation";
import fs from 'fs/promises';
import path from 'path';
import { QuizModule } from "@/schema/QuizModule";
import { ModuleRunner } from "@/components/gamified/ModuleRunner";
import { SessionProvider } from "@/components/gamified/SessionProvider";
import { getStudentSession } from "@/lib/auth";

interface ModulePageProps {
  params: Promise<{
    domain: string;
    moduleId: string;
  }>;
}

export default async function ModulePage({ params }: ModulePageProps) {
  const session = await getStudentSession();
  if (!session?.studentId) {
    redirect('/login');
  }

  const { domain, moduleId } = await params;

  let moduleData: QuizModule | null = null;
  try {
    const filePath = path.join(process.cwd(), `src/data/modules/${domain}/${moduleId}.json`);
    const fileContents = await fs.readFile(filePath, 'utf8');
    moduleData = JSON.parse(fileContents);
  } catch (error) {
    console.error("Failed to load module:", error);
  }

  if (!moduleData) {
    notFound();
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold mb-2 capitalize">{moduleData.domain} Module: {moduleData.title}</h1>
        <p className="text-gray-600">{moduleData.description}</p>
      </div>
      
      <SessionProvider domain={domain} moduleId={moduleId}>
        <ModuleRunner questions={moduleData.questions as any} />
      </SessionProvider>
    </div>
  );
}
