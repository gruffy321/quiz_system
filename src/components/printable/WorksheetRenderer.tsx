import React from 'react';
import { QuizModule, Question } from '@/schema/QuizModule';

export function WorksheetRenderer({ 
  moduleData, 
  studentName, 
  date 
}: { 
  moduleData: QuizModule,
  studentName?: string,
  date?: string
}) {
  return (
    <div className="w-full max-w-[210mm] mx-auto bg-white p-8 mb-8 print:mb-0 print:p-0 print:shadow-none shadow-lg text-black font-sans">
      <div className="border-b-2 border-black pb-4 mb-6">
        <h1 className="text-3xl font-bold uppercase tracking-wider">{moduleData.title}</h1>
        <p className="text-gray-700 italic mt-2">{moduleData.description}</p>
        <div className="flex justify-between mt-4 text-sm font-medium">
          <div>Student Name: <span className="font-bold border-b border-black inline-block min-w-[200px]">{studentName || '___________________________'}</span></div>
          <div>Date: <span className="font-bold border-b border-black inline-block min-w-[150px]">{date || '_________________'}</span></div>
        </div>
      </div>

      <div className="space-y-8">
        {moduleData.questions.map((q, idx) => (
          <div key={q.id} className="border border-gray-300 p-4 rounded-sm print:break-inside-avoid">
            <h2 className="text-lg font-bold mb-4">{idx + 1}. {q.prompt}</h2>
            <QuestionStaticRenderer question={q} />
          </div>
        ))}
      </div>
      
      <div className="mt-12 text-center text-sm text-gray-500 print:block hidden">
        Auto-generated via Digital Skills Platform - olorsoft.com
      </div>
    </div>
  );
}

function QuestionStaticRenderer({ question }: { question: Question }) {
  switch (question.type) {
    case 'multiple_choice':
      return (
        <div className="space-y-2 pl-4">
          {question.options.map((opt, i) => {
            const isCorrect = i === question.correctAnswerIndex;
            return (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-4 h-4 border border-black flex items-center justify-center ${isCorrect ? 'bg-gray-200' : ''}`}>
                  {isCorrect && '✓'}
                </div>
                <span className={isCorrect ? 'font-bold' : ''}>{opt}</span>
              </div>
            );
          })}
        </div>
      );

    case 'fill_in_the_blank':
      return (
        <div className="pl-4">
          <p className="text-gray-700">
            <strong>Expected Answer(s):</strong> {question.expectedKeywords?.join(', ')}
          </p>
        </div>
      );

    case 'drag_and_drop':
      return (
        <div className="pl-4 grid grid-cols-2 gap-4">
          {question.dropZones.map((dz) => {
            const correctDraggable = question.draggables.find(d => d.id === dz.expectedDraggableId);
            return (
              <div key={dz.id} className="border border-gray-400 p-3 bg-gray-50 flex flex-col items-center justify-center text-center">
                {dz.imageUrl && <img src={dz.imageUrl} alt="Dropzone" className="h-16 mb-2" />}
                <span className="font-bold border-t border-dashed border-gray-400 w-full pt-2">
                  {correctDraggable?.label || 'Unknown'}
                </span>
              </div>
            );
          })}
        </div>
      );

    case 'sequence_builder':
      const correctSteps = question.correctOrder.map(id => question.steps.find(s => s.id === id));
      return (
        <ol className="list-decimal list-inside pl-4 space-y-2">
          {correctSteps.map((step, i) => (
            <li key={i} className="font-medium p-2 bg-gray-100 border border-gray-300">
              {step?.text}
            </li>
          ))}
        </ol>
      );

    case 'matching_pairs':
      return (
        <div className="pl-4 flex flex-col gap-2">
          {question.correctMatches.map((match, i) => {
            const left = question.leftItems.find(l => l.id === match.leftId);
            const right = question.rightItems.find(r => r.id === match.rightId);
            return (
              <div key={i} className="flex items-center gap-4 p-2 bg-gray-50 border border-gray-200">
                <div className="flex-1 font-medium">{left?.text}</div>
                <div className="text-gray-400">⟶</div>
                <div className="flex-1 flex items-center justify-end gap-2">
                  {right?.imageUrl && <img src={right.imageUrl} alt="Icon" className="h-8" />}
                  <span>{right?.text}</span>
                </div>
              </div>
            );
          })}
        </div>
      );

    case 'catch_game':
      const targets = question.items.filter(i => i.isTarget);
      const hazards = question.items.filter(i => !i.isTarget);
      return (
        <div className="pl-4 grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-bold mb-2">Items to Catch (PPE):</h3>
            <ul className="list-disc list-inside text-sm space-y-1">
              {targets.map(t => (
                <li key={t.id} className="flex items-center gap-2">
                  {t.imageUrl && <img src={t.imageUrl} alt="Item" className="h-6" />}
                  {t.text} - <span className="italic">{t.explanation}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-2">Hazards to Avoid:</h3>
            <ul className="list-disc list-inside text-sm space-y-1">
              {hazards.map(h => (
                <li key={h.id} className="flex items-center gap-2">
                  {h.imageUrl && <img src={h.imageUrl} alt="Item" className="h-6" />}
                  {h.text} - <span className="italic">{h.explanation}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );

    default:
      return <div>Unsupported question type</div>;
  }
}
