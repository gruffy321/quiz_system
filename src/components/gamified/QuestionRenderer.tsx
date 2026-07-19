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

  const handleComplete = () => {
    setIsCompleted(true);
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
            onSubmit={handleComplete} 
            requireCleanInput={true}
          />
        );
      default:
        return <Alert title="Error" message={`Unsupported question type: ${question.type}`} variant="error" />;
    }
  };

  return (
    <div className="mb-8">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">{question.prompt}</h3>
        <span className="text-sm text-gray-500">Points: {question.points}</span>
      </div>
      
      {renderContent()}

      {isCompleted && (
        <div className="mt-4">
          <Alert title="Success!" message="You have completed this challenge." variant="success" />
        </div>
      )}
    </div>
  );
};
