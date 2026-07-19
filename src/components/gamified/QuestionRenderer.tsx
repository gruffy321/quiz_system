'use client';

import React, { useState } from 'react';
import { Question } from '@/schema/QuizModule';
import { DragAndDropBoard } from './DragAndDropBoard';
import { UserPrompt } from '@/components/common/UserPrompt';
import { Alert } from '@/components/common/Alert';

interface QuestionRendererProps {
  question: Question;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({ question }) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleComplete = () => {
    setErrorMsg('');
    setIsCompleted(true);
  };

  const handleFillInTheBlankSubmit = (input: string) => {
    setErrorMsg('');
    if (question.type === 'fill_in_the_blank' && question.expectedKeywords) {
      const inputLower = input.toLowerCase();
      const matchedKeywords = question.expectedKeywords.filter(kw => inputLower.includes(kw.toLowerCase()));
      
      // We require at least 50% of the keywords to be present (forgiving evaluation)
      const threshold = Math.ceil(question.expectedKeywords.length / 2);
      if (matchedKeywords.length < threshold) {
        setErrorMsg(`Your answer is missing key concepts. Try to include terminology related to: ${question.expectedKeywords.join(', ')}`);
        return;
      }
    }
    handleComplete();
  };

  const renderContent = () => {
    switch (question.type) {
      case 'drag_and_drop':
        return (
          <DragAndDropBoard 
            draggables={question.draggables} 
            dropZones={question.dropZones} 
            onComplete={handleComplete} 
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
