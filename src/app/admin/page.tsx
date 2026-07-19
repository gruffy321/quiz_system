import { prisma } from '@/lib/prisma';
import React from 'react';

// Force dynamic rendering so the admin page always fetches fresh data
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const studentsCount = await prisma.student.count();
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
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Admin Telemetry Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
          <h2 className="text-sm text-foreground/70 font-medium">Total Students</h2>
          <p className="text-4xl font-bold mt-2 text-primary">{studentsCount}</p>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
          <h2 className="text-sm text-foreground/70 font-medium">Active Sessions</h2>
          <p className="text-4xl font-bold mt-2 text-primary">{sessionsCount}</p>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
          <h2 className="text-sm text-foreground/70 font-medium">Avg. Incorrect Attempts / Question</h2>
          <p className="text-4xl font-bold mt-2 text-red-500">{avgIncorrectAttempts}</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Question Breakdown</h2>
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-foreground/5">
            <tr>
              <th className="p-4 font-medium">Question ID</th>
              <th className="p-4 font-medium text-right">Total Interactions</th>
              <th className="p-4 font-medium text-right">Avg. Incorrect Attempts</th>
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
  );
}
