import { notFound } from "next/navigation";
import fs from 'fs/promises';
import path from 'path';
import { QuizModule } from "@/schema/QuizModule";
import { QuestionRenderer } from "@/components/gamified/QuestionRenderer";

interface ModulePageProps {
  params: Promise<{
    domain: string;
    moduleId: string;
  }>;
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { domain, moduleId } = await params;

  let moduleData: QuizModule | null = null;
  try {
    const filePath = path.join(process.cwd(), `src/data/modules/${domain}/${moduleId}.json`);
    const fileContents = await fs.readFile(filePath, 'utf8');
    moduleData = JSON.parse(fileContents);
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold mb-2 capitalize">{moduleData.domain} Module: {moduleData.title}</h1>
        <p className="text-gray-600">{moduleData.description}</p>
      </div>
      
      <div className="space-y-12">
        {moduleData.questions.map((question) => (
          <QuestionRenderer key={question.id} question={question as any} />
        ))}
      </div>
    </div>
  );
}
