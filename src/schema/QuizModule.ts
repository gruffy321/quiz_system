export type QuestionType = 'multiple_choice' | 'drag_and_drop' | 'fill_in_the_blank' | 'matching';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  points: number;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple_choice';
  options: string[];
  correctAnswerIndex: number;
}

export interface FillInTheBlankQuestion extends BaseQuestion {
  type: 'fill_in_the_blank';
  expectedKeywords?: string[]; // Used for forgiving, keyword-based evaluation
}

export interface DragAndDropQuestion extends BaseQuestion {
  type: 'drag_and_drop';
  draggables: { id: string; label: string }[];
  dropZones: { id: string; expectedDraggableId: string; imageUrl?: string }[];
}

export type Question = MultipleChoiceQuestion | DragAndDropQuestion;

export interface QuizModule {
  moduleId: string;
  domain: string; 
  title: string;
  description: string;
  questions: Question[];
}
