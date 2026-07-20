import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { WorksheetRenderer } from '@/components/printable/WorksheetRenderer';
import { PrintButton } from '@/components/printable/PrintButton';
import fs from 'fs/promises';
import path from 'path';

interface ReportPageProps {
  params: Promise<{
    joinCode: string;
  }>;
}

export default async function StudentReportPage({ params }: ReportPageProps) {
  const { joinCode } = await params;

  // 1. Fetch Student and their completed Sessions
  const student = await prisma.student.findUnique({
    where: { joinCode },
    include: {
      sessions: {
        include: {
          metrics: true
        }
      }
    }
  });

  if (!student) {
    notFound();
  }

  // 2. Load Module Data for each unique session
  // In a real app, you might want to filter sessions where they actually completed all metrics,
  // but since they have a session, we'll print the module.
  const moduleDataList = [];
  
  // Get unique moduleIds
  const completedModuleIds = Array.from(new Set(student.sessions.map(s => s.moduleId)));
  
  for (const moduleId of completedModuleIds) {
    try {
      // We assume domain is 'engineering' for now, or find the session to get the domain
      const sessionForModule = student.sessions.find(s => s.moduleId === moduleId);
      const domain = sessionForModule?.domain || 'engineering';
      
      const filePath = path.join(process.cwd(), `src/data/modules/${domain}/${moduleId}.json`);
      const fileContents = await fs.readFile(filePath, 'utf8');
      const moduleData = JSON.parse(fileContents);
      moduleDataList.push({ moduleData, date: sessionForModule?.endTime || sessionForModule?.startTime });
    } catch (error) {
      console.error(`Failed to load module data for ${moduleId}`, error);
    }
  }

  const studentName = student.fullName || `Student (${joinCode})`;

  return (
    <div className="min-h-screen bg-gray-200 py-8 print:bg-white print:py-0">
      <div className="max-w-[210mm] mx-auto mb-4 flex justify-between items-center print:hidden px-4">
        <div>
          <h2 className="text-xl font-bold">Report for {studentName}</h2>
          <p className="text-sm text-gray-600">Completed {moduleDataList.length} modules</p>
        </div>
        <PrintButton />
      </div>

      <div className="flex flex-col gap-8 print:gap-0">
        {moduleDataList.length === 0 ? (
          <div className="max-w-[210mm] mx-auto bg-white p-8 text-center text-gray-500">
            No completed modules found for this student.
          </div>
        ) : (
          moduleDataList.map(({ moduleData, date }, idx) => (
            <div key={idx} className="print:break-after-page">
              <WorksheetRenderer 
                moduleData={moduleData} 
                studentName={studentName}
                date={date ? new Date(date).toLocaleDateString() : new Date().toLocaleDateString()}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
