'use client';

import { loginStudent } from '../actions';
import { useState } from 'react';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    try {
      await loginStudent(formData);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-card p-8 rounded-lg shadow-md border border-border w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-center">Student Portal</h1>
        <p className="text-center text-foreground/60 mb-6 text-sm">Enter the Join Code provided by your teacher.</p>
        
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Join Code</label>
            <input 
              type="text" 
              name="code"
              required 
              maxLength={6}
              className="w-full p-3 font-mono text-center tracking-widest text-lg uppercase border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="A1B2C3"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button 
            type="submit" 
            className="mt-2 bg-primary text-primary-foreground py-2 px-4 rounded-md font-medium hover:bg-primary/90 transition-colors"
          >
            Enter Portal
          </button>
        </form>
      </div>
    </div>
  );
}
