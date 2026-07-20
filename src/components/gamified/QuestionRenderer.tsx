'use client';

import React, { useState } from 'react';
import { Question } from '@/schema/QuizModule';
import { DragAndDropBoard } from './DragAndDropBoard';
import { UserPrompt } from '@/components/common/UserPrompt';
import { Alert } from '@/components/common/Alert';
import { useSession } from './SessionProvider';
import { SequenceBuilder } from './SequenceBuilder';
import { MatchingPairs } from './MatchingPairs';
import { CatchGame } from './CatchGame';
import { QuestionContextModal } from '@/components/ui/QuestionContextModal';

interface QuestionRendererProps {
  question: Question;
  onQuestionComplete?: () => void;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({ question, onQuestionComplete }) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isContextModalOpen, setIsContextModalOpen] = useState(false);
  const { sessionId } = useSession();

  const handleComplete = async (incorrectAttempts: number = 0) => {
    setErrorMsg('');
    setIsCompleted(true);
    
    // Fire and forget metric logging
    if (sessionId) {
      try {
        const res = await fetch('/api/metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            questionId: question.id,
            incorrectAttempts,
            isCorrect: true, 
            timeTakenSeconds: 0, 
          }),
        });
        if (!res.ok) console.error('Metric sync returned non-OK status');
      } catch (err) {
        console.error('Metric sync failed:', err);
      }
    }
    
    if (onQuestionComplete) {
      onQuestionComplete();
    }
  };

  const handleFillInTheBlankSubmit = (input: string) => {
    setErrorMsg('');
    if (question.type === 'fill_in_the_blank' && question.expectedKeywords) {
      const inputLower = input.toLowerCase().trim();
      const inputWords = inputLower.split(/[\s,]+/);
      const matchedKeywords = question.expectedKeywords.filter(kw => inputLower.includes(kw.toLowerCase()));
      
      const threshold = Math.ceil(question.expectedKeywords.length / 2);
      
      // Check for keywords and ensure they actually wrote a sentence (not just a comma separated list of the keywords)
      const isTooShort = inputWords.length <= question.expectedKeywords.length + 1;
      
      if (matchedKeywords.length < threshold || isTooShort) {
        setErrorMsg(`Your answer is missing key concepts or is too brief. Try to include terminology related to: ${question.expectedKeywords.join(', ')} in a full sentence.`);
        
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
    
    // Fire and forget metric logging for the successful fill_in_the_blank with userAnswerData
    if (sessionId) {
      fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionId: question.id,
          incorrectAttempts: 0,
          isCorrect: true, 
          timeTakenSeconds: 0,
          userAnswerData: input,
        }),
      }).catch(console.error);
    }
    
    setErrorMsg('');
    setIsCompleted(true);
    if (onQuestionComplete) {
      onQuestionComplete();
    }
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
      case 'sequence_builder':
        return (
          <SequenceBuilder
            steps={question.steps}
            correctOrder={question.correctOrder}
            onComplete={(attempts) => handleComplete(attempts)}
          />
        );
      case 'matching_pairs':
        return (
          <MatchingPairs
            leftItems={question.leftItems}
            rightItems={question.rightItems}
            correctMatches={question.correctMatches}
            onComplete={(attempts) => handleComplete(attempts)}
          />
        );
      case 'catch_game':
        return (
          <CatchGame
            basketLabel={question.basketLabel}
            basketImageUrl={question.basketImageUrl}
            items={question.items}
            onComplete={(attempts) => handleComplete(attempts)}
          />
        );
      default:
        return <Alert title="Error" message={`Unsupported question type: ${(question as any).type}`} variant="error" />;
    }
  };

  return (
    <div className="mb-8">
      <div className="mb-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-lg font-medium text-foreground mr-4">{question.prompt}</h3>
          {(question.imageUrl || question.exampleContext) && (
            <button 
              onClick={() => setIsContextModalOpen(true)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium border border-blue-200 dark:border-blue-800"
              title="View visual context and hints"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              View Hint
            </button>
          )}
        </div>
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

      <QuestionContextModal 
        isOpen={isContextModalOpen}
        onClose={() => setIsContextModalOpen(false)}
        imageUrl={question.imageUrl}
        contextText={question.exampleContext}
        promptTitle={question.prompt}
      />
    </div>
  );
};
