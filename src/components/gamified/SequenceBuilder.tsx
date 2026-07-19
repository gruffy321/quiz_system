'use client';

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Alert } from '@/components/common/Alert';

interface SortableItemProps {
  id: string;
  text: string;
  index: number;
}

function SortableItem({ id, text, index }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-4 mb-2 bg-card border ${isDragging ? 'border-primary shadow-lg' : 'border-border shadow-sm'} rounded-lg cursor-grab active:cursor-grabbing flex items-center gap-4`}
    >
      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-secondary text-secondary-foreground rounded-full font-bold">
        {index + 1}
      </div>
      <div className="font-medium">{text}</div>
    </div>
  );
}

interface SequenceBuilderProps {
  steps: { id: string; text: string }[];
  correctOrder: string[];
  onComplete: (incorrectAttempts: number) => void;
}

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function SequenceBuilder({ steps, correctOrder, onComplete }: SequenceBuilderProps) {
  const [items, setItems] = useState(() => {
    // Randomize initial order so it's a puzzle
    let initial = shuffleArray(steps);
    // Ensure it's not accidentally the correct order initially
    if (initial.map(s => s.id).join(',') === correctOrder.join(',')) {
      initial = [initial[initial.length - 1], ...initial.slice(0, -1)];
    }
    return initial;
  });
  
  const [attempts, setAttempts] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setErrorMsg(''); // clear error when they move something
    }
  };

  const handleCheck = () => {
    const currentOrder = items.map(item => item.id);
    const isCorrect = currentOrder.join(',') === correctOrder.join(',');

    if (isCorrect) {
      setIsSuccess(true);
      setErrorMsg('');
      onComplete(attempts);
    } else {
      setAttempts(a => a + 1);
      setErrorMsg('Not quite right. Review the sequence and try again!');
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-6 p-6 bg-muted/30 rounded-xl border border-border">
      <div className="mb-4">
        <p className="text-foreground/80 mb-2">Drag and drop the steps below into the correct chronological order.</p>
      </div>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map(i => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1">
            {items.map((item, idx) => (
              <SortableItem key={item.id} id={item.id} text={item.text} index={idx} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={handleCheck}
          disabled={isSuccess}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isSuccess ? 'Sequence Confirmed' : 'Check Sequence'}
        </button>
        {errorMsg && <p className="text-destructive font-medium">{errorMsg}</p>}
      </div>
    </div>
  );
}
