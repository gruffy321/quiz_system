import { prisma } from '@/lib/prisma';
import React from 'react';
import { getAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { generateCodes } from './actions';

// Force dynamic rendering so the admin page always fetches fresh data
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const allStudents = await prisma.student.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const registeredStudentsCount = allStudents.filter(s => s.fullName).length;
  const sessionsCount = await prisma.session.count();
  
  // Aggregate metrics
  const metrics = await prisma.questionMetric.findMany({
    include: { session: true }
  });

  // Calculate some basic KPIs
  const totalAttempts = metrics.reduce((acc, m) => acc + m.incorrectAttempts, 0);
  const avgIncorrectAttempts = metrics.length > 0 ? (totalAttempts / metrics.length).toFixed(1) : 0;

  // Group by questionId
  const questionStats = metrics.reduce((acc, m) => {
    if (!acc[m.questionId]) {
      acc[m.questionId] = { correct: 0, incorrectAttempts: 0, total: 0 };
    }
    acc[m.questionId].total += 1;
    acc[m.questionId].incorrectAttempts += m.incorrectAttempts;
    if (m.isCorrect) acc[m.questionId].correct += 1;
    return acc;
  }, {} as Record<string, { correct: number, incorrectAttempts: number, total: number }>);

  return (
    <div className="container mx-auto p-8 max-w-6xl flex flex-col gap-12">
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Telemetry Dashboard</h1>
          <form action={generateCodes} className="flex gap-2 items-center bg-card border border-border p-2 rounded-lg shadow-sm">
            <label htmlFor="count" className="text-sm font-medium ml-2 text-foreground/70">Generate:</label>
            <input 
              type="number" 
              name="count" 
              id="count"
              defaultValue={30} 
              min={1} 
              max={100}
              className="w-20 p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:outline-none"
            />
            <span className="text-sm font-medium mr-2 text-foreground/70">codes</span>
            <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors">
              + Add
            </button>
          </form>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
            <h2 className="text-sm text-foreground/70 font-medium">Registered Students</h2>
            <p className="text-4xl font-bold mt-2 text-primary">{registeredStudentsCount}</p>
          </div>
          <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
            <h2 className="text-sm text-foreground/70 font-medium">Active Sessions</h2>
            <p className="text-4xl font-bold mt-2 text-primary">{sessionsCount}</p>
          </div>
          <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
            <h2 className="text-sm text-foreground/70 font-medium">Avg. Incorrect Attempts</h2>
            <p className="text-4xl font-bold mt-2 text-red-500">{avgIncorrectAttempts}</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">Student Access Codes</h2>
        <div className="bg-card rounded-lg border border-border overflow-hidden mb-12">
          <table className="w-full text-left">
            <thead className="bg-foreground/5">
              <tr>
                <th className="p-4 font-medium">Join Code</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Student Name</th>
                <th className="p-4 font-medium">Tutor Group</th>
                <th className="p-4 font-medium">Created</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allStudents.map(student => (
                <tr key={student.id} className="border-t border-border">
                  <td className="p-4 font-mono font-bold tracking-widest">{student.joinCode || 'N/A'}</td>
                  <td className="p-4">
                    {student.fullName ? (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Claimed</span>
                    ) : (
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">Unused</span>
                    )}
                  </td>
                  <td className="p-4">{student.fullName || '-'}</td>
                  <td className="p-4">{student.tutorGroup || '-'}</td>
                  <td className="p-4 text-sm text-foreground/50">{student.createdAt.toLocaleDateString()}</td>
                  <td className="p-4">
                    {student.fullName ? (
                      <a href={`/student/${student.joinCode}/report`} target="_blank" className="text-primary hover:underline text-sm font-medium">View Report</a>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {allStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-foreground/50">
                    No access codes generated yet. Click "Generate 30 Join Codes" to start.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <h2 className="text-2xl font-bold mb-4">Question Breakdown</h2>
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-foreground/5">
              <tr>
                <th className="p-4 font-medium">Question ID</th>
                <th className="p-4 font-medium text-right">Total Interactions</th>
                <th className="p-4 font-medium text-right">Avg. Errors</th>
                <th className="p-4 font-medium text-right">Success Rate</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(questionStats).map(([qId, stats]) => {
                const avgErrors = (stats.incorrectAttempts / stats.total).toFixed(1);
                const successRate = Math.round((stats.correct / stats.total) * 100);
                return (
                  <tr key={qId} className="border-t border-border">
                    <td className="p-4 font-mono text-sm">{qId}</td>
                    <td className="p-4 text-right">{stats.total}</td>
                    <td className="p-4 text-right text-red-500">{avgErrors}</td>
                    <td className="p-4 text-right text-green-600 font-medium">{successRate}%</td>
                  </tr>
                );
              })}
              {Object.keys(questionStats).length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-foreground/50">
                    No telemetry data collected yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
