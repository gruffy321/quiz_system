export type QuestionType = 'multiple_choice' | 'drag_and_drop' | 'fill_in_the_blank' | 'sequence_builder' | 'matching_pairs' | 'catch_game';

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

export interface SequenceQuestion extends BaseQuestion {
  type: 'sequence_builder';
  steps: { id: string; text: string }[];
  correctOrder: string[]; // Array of step IDs in the correct chronological order
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'matching_pairs';
  leftItems: { id: string; text: string; imageUrl?: string }[];
  rightItems: { id: string; text: string; imageUrl?: string }[];
  correctMatches: { leftId: string; rightId: string }[];
}

export interface CatchItem {
  id: string;
  text: string;
  isTarget: boolean;
  explanation: string;
  imageUrl?: string;
}

export interface CatchGameQuestion extends BaseQuestion {
  type: 'catch_game';
  basketLabel: string;
  basketImageUrl?: string;
  items: CatchItem[];
}

export type Question = MultipleChoiceQuestion | FillInTheBlankQuestion | DragAndDropQuestion | SequenceQuestion | MatchingQuestion | CatchGameQuestion;

export interface QuizModule {
  id?: string; // Some JSONs use id instead of moduleId
  moduleId?: string;
  domain: string; 
  title: string;
  description: string;
  questions: Question[];
}
