'use client';

import React, { useState } from 'react';
import { Question } from '@/schema/QuizModule';
import { DragAndDropBoard } from './DragAndDropBoard';
import { UserPrompt } from '@/components/common/UserPrompt';
import { Alert } from '@/components/common/Alert';
import { useSession } from './SessionProvider';

interface QuestionRendererProps {
  question: Question;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({ question }) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { sessionId } = useSession();

  const handleComplete = async (incorrectAttempts: number = 0) => {
    setErrorMsg('');
    setIsCompleted(true);
    
    // Fire and forget metric logging
    if (sessionId) {
      fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionId: question.id,
          incorrectAttempts,
          isCorrect: true, // They finally got it right
          timeTakenSeconds: 0, // Placeholder for future timer
        }),
      }).catch(err => console.error('Metric sync failed:', err));
    }
  };

  const handleFillInTheBlankSubmit = (input: string) => {
    setErrorMsg('');
    if (question.type === 'fill_in_the_blank' && question.expectedKeywords) {
      const inputLower = input.toLowerCase();
      const matchedKeywords = question.expectedKeywords.filter(kw => inputLower.includes(kw.toLowerCase()));
      
      const threshold = Math.ceil(question.expectedKeywords.length / 2);
      if (matchedKeywords.length < threshold) {
        setErrorMsg(`Your answer is missing key concepts. Try to include terminology related to: ${question.expectedKeywords.join(', ')}`);
        // Track the failed attempt
        if (sessionId) {
           fetch('/api/metrics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              questionId: question.id,
              incorrectAttempts: 1,
              isCorrect: false, 
            }),
          }).catch(console.error);
        }
        return;
      }
    }
    handleComplete(0);
  };

  const renderContent = () => {
    switch (question.type) {
      case 'drag_and_drop':
        return (
          <DragAndDropBoard 
            draggables={question.draggables} 
            dropZones={question.dropZones} 
            onComplete={(attempts) => handleComplete(attempts)} 
          />
        );
      case 'fill_in_the_blank':
        return (
          <UserPrompt 
            promptText={question.prompt} 
            onSubmit={handleFillInTheBlankSubmit} 
            requireCleanInput={true}
          />
        );
      default:
        return <Alert title="Error" message={`Unsupported question type: ${(question as any).type}`} variant="error" />;
    }
  };

  return (
    <div className="mb-8">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-foreground">{question.prompt}</h3>
        <span className="text-sm text-foreground/70">Points: {question.points}</span>
      </div>
      
      {renderContent()}

      {errorMsg && (
        <div className="mt-4">
          <Alert title="Incorrect" message={errorMsg} variant="error" />
        </div>
      )}

      {isCompleted && (
        <div className="mt-4">
          <Alert title="Success!" message="You have completed this challenge." variant="success" />
        </div>
      )}
    </div>
  );
};
