'use client';

import React, { useState } from 'react';
import { Question } from '@/schema/QuizModule';
import { QuestionRenderer } from './QuestionRenderer';
import { X } from 'lucide-react';

interface ModuleRunnerProps {
  questions: Question[];
}

export const ModuleRunner: React.FC<ModuleRunnerProps> = ({ questions }) => {
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [completedQuestions, setCompletedQuestions] = useState<Record<string, boolean>>({});

  const handleClose = () => setActiveQuestionId(null);

  const handleQuestionComplete = (questionId: string) => {
    setCompletedQuestions(prev => ({ ...prev, [questionId]: true }));
    // Wait a moment before closing so they can see success message
    setTimeout(() => {
      handleClose();
    }, 1500);
  };

  const activeQuestion = questions.find(q => q.id === activeQuestionId);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {questions.map((question, index) => {
          const isCompleted = completedQuestions[question.id];
          return (
            <div 
              key={question.id}
              onClick={() => setActiveQuestionId(question.id)}
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${
                isCompleted 
                  ? 'border-green-500 bg-green-50/10' 
                  : 'border-border bg-card shadow-sm hover:border-primary hover:shadow-md'
              }`}
            >
              <h3 className="font-bold text-lg mb-2 text-foreground">Task {index + 1}</h3>
              <p className="text-sm text-foreground/70 mb-4 line-clamp-2">{question.prompt}</p>
              <div className="flex justify-between items-center text-xs font-medium">
                <span className="uppercase tracking-wider opacity-60">
                  {question.type.replace(/_/g, ' ')}
                </span>
                {isCompleted ? (
                  <span className="text-green-600 font-bold">Completed ✓</span>
                ) : (
                  <span className="text-primary">Click to start</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {activeQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div 
            className="bg-background rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden relative my-auto animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-border bg-card">
              <h2 className="text-xl font-bold">Task</h2>
              <button 
                onClick={handleClose}
                className="p-2 hover:bg-foreground/10 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
              {activeQuestion.type === 'fill_in_the_blank' && (activeQuestion as any).exampleContext && (
                <div className="mb-6 p-4 bg-blue-50/50 border border-blue-100 rounded-lg text-blue-900 text-sm leading-relaxed">
                  <strong className="block mb-1 text-blue-950">Context:</strong>
                  {(activeQuestion as any).exampleContext}
                </div>
              )}
              
              <QuestionRenderer 
                question={activeQuestion} 
                onQuestionComplete={() => handleQuestionComplete(activeQuestion.id)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
