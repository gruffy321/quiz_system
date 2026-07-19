'use client';

import React, { useState } from 'react';
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';

interface DraggableItemProps {
  id: string;
  label: string;
  isMatched: boolean;
}

const DraggableItem = ({ id, label, isMatched }: DraggableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id, disabled: isMatched });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-3 m-2 border rounded-md cursor-grab shadow-sm transition-colors ${
        isMatched 
          ? 'bg-green-100 border-green-500 text-green-800 dark:bg-green-900/50 dark:border-green-600 dark:text-green-300' 
          : 'bg-card border-border text-foreground hover:bg-primary/5'
      } ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      {label}
    </div>
  );
};

interface DropZoneProps {
  id: string;
  matchedLabel?: string;
  imageUrl?: string;
}

const DropZone = ({ id, matchedLabel, imageUrl }: DropZoneProps) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div className="flex flex-col items-center gap-2 m-2">
      {imageUrl && (
        <div className="w-24 h-24 flex items-center justify-center rounded-sm">
          {/* We will use a standard img tag here, relying on public/ folder static assets */}
          <img src={imageUrl} alt="Hazard Symbol" className="w-20 h-20 object-contain" />
        </div>
      )}
      <div
        ref={setNodeRef}
        className={`p-4 w-40 h-16 border-2 border-dashed rounded-md flex items-center justify-center text-sm text-center transition-colors ${
          isOver ? 'bg-primary/10 border-primary' : 'bg-card border-border'
        } ${matchedLabel ? 'bg-green-50 border-green-400 text-green-700 font-medium dark:bg-green-900/30 dark:border-green-600 dark:text-green-400' : 'text-foreground/50'}`}
      >
        {matchedLabel || 'Drop Label Here'}
      </div>
    </div>
  );
};

interface DragAndDropBoardProps {
  draggables: { id: string; label: string }[];
  dropZones: { id: string; expectedDraggableId: string; imageUrl?: string }[];
  onComplete: () => void;
}

export const DragAndDropBoard: React.FC<DragAndDropBoardProps> = ({ draggables, dropZones, onComplete }) => {
  const [isMounted, setIsMounted] = React.useState(false);
  const [matches, setMatches] = useState<Record<string, string>>({}); // dropZoneId -> draggableLabel

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    
    const draggable = draggables.find(d => d.id === active.id);
    const targetZone = dropZones.find(z => z.id === over.id);
    
    // STRICT VALIDATION: Only allow match if the active draggable matches the target zone's expectedDraggableId
    if (draggable && targetZone && targetZone.expectedDraggableId === draggable.id && !matches[over.id]) {
      const newMatches = { ...matches, [over.id]: draggable.label };
      setMatches(newMatches);

      if (Object.keys(newMatches).length === draggables.length) {
        onComplete();
      }
    }
  };

  const isMatched = (id: string) => Object.values(matches).includes(draggables.find(d => d.id === id)?.label || '');

  if (!isMounted) {
    return <div className="p-6 bg-card rounded-lg shadow-sm border border-border h-64 flex items-center justify-center text-foreground/50">Loading Challenge...</div>;
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-8 p-6 bg-card rounded-lg shadow-sm border border-border">
        
        {/* Drop Zones (The "Boxes") */}
        <div className="flex flex-wrap justify-center gap-4">
          {dropZones.map((zone) => (
            <DropZone key={zone.id} id={zone.id} matchedLabel={matches[zone.id]} imageUrl={zone.imageUrl} />
          ))}
        </div>

        <hr className="border-gray-100" />

        {/* Draggables (The "Hazards") */}
        <div className="flex flex-wrap justify-center gap-2">
          {draggables.map((item) => (
            <DraggableItem key={item.id} id={item.id} label={item.label} isMatched={isMatched(item.id)} />
          ))}
        </div>

      </div>
    </DndContext>
  );
};
