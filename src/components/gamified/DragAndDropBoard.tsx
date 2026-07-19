'use client';

import React, { useState } from 'react';
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';

interface DraggableItemProps {
  id: string;
  label: string;
  isMatched: boolean;
}

const DraggableItem = ({ id, label, isMatched }: DraggableItemProps) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id, disabled: isMatched });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-3 m-2 border rounded-md cursor-grab shadow-sm transition-colors ${
        isMatched ? 'bg-green-100 text-green-800 border-green-300 opacity-50 cursor-not-allowed' : 'bg-white hover:bg-gray-50 border-gray-300'
      }`}
    >
      {label}
    </div>
  );
};

interface DropZoneProps {
  id: string;
  matchedLabel?: string;
}

const DropZone = ({ id, matchedLabel }: DropZoneProps) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`p-4 m-2 w-40 h-24 border-2 border-dashed rounded-md flex items-center justify-center text-sm text-center transition-colors ${
        isOver ? 'bg-blue-50 border-blue-400' : 'bg-gray-50 border-gray-300'
      } ${matchedLabel ? 'bg-green-50 border-green-400 text-green-700 font-medium' : 'text-gray-400'}`}
    >
      {matchedLabel || 'Drop Hazard Here'}
    </div>
  );
};

interface DragAndDropBoardProps {
  draggables: { id: string; label: string }[];
  dropZones: { id: string; expectedDraggableId: string }[];
  onComplete: () => void;
}

export const DragAndDropBoard: React.FC<DragAndDropBoardProps> = ({ draggables, dropZones, onComplete }) => {
  const [matches, setMatches] = useState<Record<string, string>>({}); // dropZoneId -> draggableLabel

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    // Check if the drop was valid (for this specific game rules, any hazard can be placed in any empty zone 
    // since the original worksheet asked them to 'complete the boxes'. If strict mapping is required, we check expectedDraggableId).
    
    // For this vertical slice, we allow them to drop any hazard into a box to "complete" the worksheet visually.
    const draggable = draggables.find(d => d.id === active.id);
    if (draggable && !matches[over.id]) {
      const newMatches = { ...matches, [over.id]: draggable.label };
      setMatches(newMatches);

      if (Object.keys(newMatches).length === draggables.length) {
        onComplete();
      }
    }
  };

  const isMatched = (id: string) => Object.values(matches).includes(draggables.find(d => d.id === id)?.label || '');

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        
        {/* Drop Zones (The "Boxes") */}
        <div className="flex flex-wrap justify-center gap-4">
          {dropZones.map((zone) => (
            <DropZone key={zone.id} id={zone.id} matchedLabel={matches[zone.id]} />
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
