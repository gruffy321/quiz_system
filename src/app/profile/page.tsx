import { getStudentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { updateProfile, deleteAccount, logoutStudent } from '../actions';

export default async function ProfilePage() {
  const session = await getStudentSession();
  if (!session?.studentId) redirect('/login');

  const student = await prisma.student.findUnique({
    where: { id: session.studentId as string }
  });

  if (!student) redirect('/login');

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <form action={logoutStudent}>
            <button className="text-sm bg-secondary text-secondary-foreground py-2 px-4 rounded-md hover:bg-secondary/80">
              Logout
            </button>
          </form>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Edit Details</h2>
          <form action={updateProfile} className="flex flex-col gap-4 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input 
                type="text" 
                name="fullName"
                required 
                defaultValue={student.fullName || ''}
                className="w-full p-2 border border-border rounded-md bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tutor Group</label>
              <input 
                type="text" 
                name="tutorGroup"
                defaultValue={student.tutorGroup || ''}
                className="w-full p-2 border border-border rounded-md bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">School Email</label>
              <input 
                type="email" 
                name="email"
                defaultValue={student.email || ''}
                className="w-full p-2 border border-border rounded-md bg-background"
              />
            </div>
            <button type="submit" className="bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 mt-2 w-fit">
              Update Profile
            </button>
          </form>
        </div>

        <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-lg border border-red-200 dark:border-red-900 shadow-sm">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h2>
          <p className="text-sm text-red-800 dark:text-red-300 mb-4">
            You have the right to be forgotten. Clicking this will permanently delete your account, your name, and all your quiz progress.
          </p>
          <form action={deleteAccount} className="flex flex-col gap-4 max-w-sm border-t border-red-200 dark:border-red-900 pt-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-red-800 dark:text-red-300">
                Confirm Join Code to Delete:
              </label>
              <input 
                type="text" 
                name="confirmCode"
                required 
                maxLength={6}
                placeholder="A1B2C3"
                className="w-full p-2 border border-red-300 dark:border-red-800 rounded-md bg-background text-red-900 dark:text-red-100"
              />
            </div>
            <button type="submit" className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 w-fit font-medium">
              Permanently Delete My Data
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
