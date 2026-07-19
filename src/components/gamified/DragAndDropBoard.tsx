'use client';

import React, { useState } from 'react';
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';

interface DraggableItemProps {
  id: string;
  label: string;
  status: 'pool' | 'correct' | 'incorrect';
}

const DraggableItem = ({ id, label, status }: DraggableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  let colorClasses = 'bg-card border-border text-foreground hover:bg-primary/5';
  if (status === 'correct') {
    colorClasses = 'bg-green-100 border-green-500 text-green-800 dark:bg-green-900/50 dark:border-green-600 dark:text-green-300';
  } else if (status === 'incorrect') {
    colorClasses = 'bg-red-100 border-red-500 text-red-800 dark:bg-red-900/50 dark:border-red-600 dark:text-red-300';
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-3 border rounded-md cursor-grab shadow-sm transition-colors ${colorClasses} ${
        isDragging ? 'opacity-50 z-50 relative' : 'opacity-100'
      }`}
    >
      {label}
    </div>
  );
};

interface DropZoneProps {
  id: string;
  imageUrl?: string;
  children?: React.ReactNode;
}

const DropZone = ({ id, imageUrl, children }: DropZoneProps) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div className="flex flex-col items-center gap-4 m-2 flex-1 min-w-[140px] max-w-[240px]">
      {imageUrl && (
        <div className="w-full h-24 md:h-32 flex items-center justify-center rounded-sm">
          <img src={imageUrl} alt="Diagram" className="max-w-full max-h-full object-contain drop-shadow-sm" />
        </div>
      )}
      <div
        ref={setNodeRef}
        className={`p-2 w-full h-16 border-2 border-dashed rounded-md flex items-center justify-center text-sm text-center transition-colors ${
          isOver ? 'bg-primary/10 border-primary' : 'bg-card border-border'
        }`}
      >
        {children || <span className="text-foreground/50">Drop Here</span>}
      </div>
    </div>
  );
};

interface DragAndDropBoardProps {
  draggables: { id: string; label: string }[];
  dropZones: { id: string; expectedDraggableId: string; imageUrl?: string }[];
  onComplete: (attempts: number) => void;
}

export const DragAndDropBoard: React.FC<DragAndDropBoardProps> = ({ draggables, dropZones, onComplete }) => {
  const [isMounted, setIsMounted] = React.useState(false);
  // Map draggable.id -> dropZone.id (or null if in pool)
  const [itemLocations, setItemLocations] = useState<Record<string, string | null>>({});
  const [incorrectAttempts, setIncorrectAttempts] = useState(0);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const draggableId = active.id as string;

    if (!over) {
      // Returned to pool
      setItemLocations(prev => ({ ...prev, [draggableId]: null }));
      return;
    }

    const targetZoneId = over.id as string;
    const targetZone = dropZones.find(z => z.id === targetZoneId);
    
    if (targetZone) {
      // If there's already an item in this zone, swap it back to the pool
      const existingOccupantId = Object.keys(itemLocations).find(id => itemLocations[id] === targetZoneId);
      
      setItemLocations(prev => {
        const next = { ...prev, [draggableId]: targetZoneId };
        if (existingOccupantId && existingOccupantId !== draggableId) {
          next[existingOccupantId] = null;
        }
        return next;
      });

      // Track metric
      if (targetZone.expectedDraggableId !== draggableId) {
        setIncorrectAttempts(prev => prev + 1);
      } else {
        // Check if all are correct
        const nextLocations = { ...itemLocations, [draggableId]: targetZoneId };
        const allCorrect = dropZones.every(z => nextLocations[z.expectedDraggableId] === z.id);
        if (allCorrect) {
          const finalAttempts = incorrectAttempts + (targetZone.expectedDraggableId !== draggableId ? 1 : 0);
          console.log(`Challenge Completed. Incorrect Attempts: ${finalAttempts}`);
          onComplete(finalAttempts);
        }
      }
    }
  };

  if (!isMounted) {
    return <div className="p-6 bg-card rounded-lg shadow-sm border border-border h-64 flex items-center justify-center text-foreground/50">Loading Challenge...</div>;
  }

  // Items in the pool
  const poolItems = draggables.filter(d => !itemLocations[d.id]);

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-8 p-6 bg-card rounded-lg shadow-sm border border-border">
        
        {/* Drop Zones */}
        <div className="flex flex-wrap justify-center gap-4">
          {dropZones.map((zone) => {
            const occupantId = Object.keys(itemLocations).find(id => itemLocations[id] === zone.id);
            const occupant = draggables.find(d => d.id === occupantId);
            
            return (
              <DropZone key={zone.id} id={zone.id} imageUrl={zone.imageUrl}>
                {occupant && (
                  <DraggableItem 
                    id={occupant.id} 
                    label={occupant.label} 
                    status={occupant.id === zone.expectedDraggableId ? 'correct' : 'incorrect'} 
                  />
                )}
              </DropZone>
            );
          })}
        </div>

        <hr className="border-gray-100 dark:border-gray-800" />

        {/* Draggables Pool */}
        <div className="flex flex-wrap justify-center gap-2 min-h-16 p-4 border-2 border-dashed border-border rounded-lg bg-foreground/5">
          {poolItems.map((item) => (
            <DraggableItem key={item.id} id={item.id} label={item.label} status="pool" />
          ))}
          {poolItems.length === 0 && <span className="text-sm text-foreground/40 self-center">No items left in pool</span>}
        </div>

      </div>
    </DndContext>
  );
};
