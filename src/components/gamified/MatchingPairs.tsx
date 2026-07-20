'use client';

import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { LightboxImage } from '@/components/ui/LightboxImage';

interface MatchingPairsProps {
  leftItems: { id: string; text: string; imageUrl?: string }[];
  rightItems: { id: string; text: string; imageUrl?: string }[];
  correctMatches: { leftId: string; rightId: string }[];
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

export function MatchingPairs({ leftItems, rightItems, correctMatches, onComplete }: MatchingPairsProps) {
  const [shuffledLeft, setShuffledLeft] = useState(leftItems);
  const [shuffledRight, setShuffledRight] = useState(rightItems);
  
  const [lockedPairs, setLockedPairs] = useState<Array<{ leftId: string; rightId: string }>>([]);
  const [attempts, setAttempts] = useState(0);
  const [errorFlash, setErrorFlash] = useState<string | null>(null);

  // Line drawing state
  const [dragStartId, setDragStartId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const leftRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const rightRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [, forceUpdate] = useState({});

  // Initial shuffle on mount
  useEffect(() => {
    setShuffledLeft(shuffleArray(leftItems));
    setShuffledRight(shuffleArray(rightItems));
  }, [leftItems, rightItems]);

  // Force a re-render once refs are populated so lines draw correctly
  useLayoutEffect(() => {
    forceUpdate({});
    const handleResize = () => forceUpdate({});
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [shuffledLeft, shuffledRight]);

  // Check for completion
  useEffect(() => {
    if (lockedPairs.length > 0 && lockedPairs.length === correctMatches.length) {
      onComplete(attempts);
    }
  }, [lockedPairs, correctMatches.length, attempts, onComplete]);

  // Handle Dragging
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragStartId && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  }, [dragStartId]);

  const handleMouseUpGlobal = useCallback((e: MouseEvent) => {
    if (!dragStartId) return;

    const target = e.target as HTMLElement;
    const rightItemEl = target.closest('[data-right-id]');
    
    if (rightItemEl) {
      const rightId = rightItemEl.getAttribute('data-right-id');
      if (rightId) {
        const isMatch = correctMatches.some(m => m.leftId === dragStartId && m.rightId === rightId);
        if (isMatch) {
          // If already locked, ignore
          if (!lockedPairs.some(p => p.rightId === rightId)) {
            setLockedPairs(prev => [...prev, { leftId: dragStartId, rightId }]);
          }
        } else {
          setAttempts(a => a + 1);
          setErrorFlash(`${dragStartId}-${rightId}`);
          setTimeout(() => setErrorFlash(null), 800);
        }
      }
    }
    
    setDragStartId(null);
    setMousePos(null);
  }, [dragStartId, correctMatches, lockedPairs]);

  useEffect(() => {
    if (dragStartId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUpGlobal);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, [dragStartId, handleMouseMove, handleMouseUpGlobal]);

  const getCenter = (el: HTMLElement | null) => {
    if (!el || !containerRef.current) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    return {
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top + rect.height / 2,
    };
  };

  return (
    <div className="max-w-4xl mx-auto my-6 p-6 bg-muted/30 rounded-xl border border-border">
      <div className="mb-6 text-center relative z-20">
        <h4 className="font-bold text-lg mb-1">Match the Equipment!</h4>
        <p className="text-foreground/80">Click and drag a line from the text on the left to the correct icon on the right.</p>
        <p className="text-sm font-bold mt-2 text-primary uppercase tracking-wider">Matches found: {lockedPairs.length} / {correctMatches.length}</p>
      </div>

      <div ref={containerRef} className="grid grid-cols-2 gap-24 relative select-none">
        
        {/* SVG Overlay for Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
          {/* Permanent locked lines */}
          {lockedPairs.map((pair) => {
            const start = getCenter(leftRefs.current[pair.leftId]);
            const end = getCenter(rightRefs.current[pair.rightId]);
            return (
              <line 
                key={`${pair.leftId}-${pair.rightId}`}
                x1={start.x} y1={start.y} x2={end.x} y2={end.y}
                stroke="#22c55e" strokeWidth="6" strokeLinecap="round" 
                className="drop-shadow-sm"
              />
            );
          })}

          {/* Temporary dragging line */}
          {dragStartId && mousePos && (
            <line
              x1={getCenter(leftRefs.current[dragStartId]).x}
              y1={getCenter(leftRefs.current[dragStartId]).y}
              x2={mousePos.x}
              y2={mousePos.y}
              stroke="#3b82f6" strokeWidth="6" strokeDasharray="10 10" strokeLinecap="round"
              className="drop-shadow-sm opacity-80"
            />
          )}

          {/* Error flash line */}
          {errorFlash && (() => {
            const [leftId, rightId] = errorFlash.split('-');
            const start = getCenter(leftRefs.current[leftId]);
            const end = getCenter(rightRefs.current[rightId]);
            return (
              <line
                x1={start.x} y1={start.y} x2={end.x} y2={end.y}
                stroke="#ef4444" strokeWidth="6" strokeLinecap="round"
                className="animate-pulse drop-shadow-md"
              />
            );
          })()}
        </svg>

        {/* Left Column (Words) */}
        <div className="space-y-4 relative z-20">
          {shuffledLeft.map((item) => {
            const isLocked = lockedPairs.some((p) => p.leftId === item.id);
            const isDragging = dragStartId === item.id;
            const isError = errorFlash?.startsWith(item.id + '-');

            let stateClasses = "bg-card border-border hover:border-primary/50 cursor-grab active:cursor-grabbing";
            if (isLocked) stateClasses = "bg-green-50 dark:bg-green-950/30 border-green-500 text-green-700 dark:text-green-400 cursor-default opacity-60";
            else if (isError) stateClasses = "bg-red-50 dark:bg-red-950/30 border-red-500 text-red-700 dark:text-red-400";
            else if (isDragging) stateClasses = "border-primary ring-2 ring-primary ring-offset-2 bg-primary/5";

            return (
              <div
                key={item.id}
                ref={(el) => { leftRefs.current[item.id] = el; }}
                onMouseDown={(e) => {
                  if (isLocked || errorFlash) return;
                  setDragStartId(item.id);
                  const rect = containerRef.current!.getBoundingClientRect();
                  setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                }}
                className={`p-4 border-2 rounded-xl shadow-sm transition-all duration-200 min-h-[90px] flex items-center justify-center text-center relative ${stateClasses}`}
              >
                <span className="font-bold text-lg">{item.text}</span>
                {isLocked && <div className="absolute top-2 left-2"><CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" /></div>}
              </div>
            );
          })}
        </div>

        {/* Right Column (Icons) */}
        <div className="space-y-4 relative z-20">
          {shuffledRight.map((item) => {
            const isLocked = lockedPairs.some((p) => p.rightId === item.id);
            const isError = errorFlash?.endsWith('-' + item.id);

            let stateClasses = "bg-card border-border";
            if (isLocked) stateClasses = "bg-green-50 dark:bg-green-950/30 border-green-500 text-green-700 dark:text-green-400 opacity-60";
            else if (isError) stateClasses = "bg-red-50 dark:bg-red-950/30 border-red-500 text-red-700 dark:text-red-400";
            
            // Add hover effect if currently dragging to indicate drop target
            if (dragStartId && !isLocked) {
              stateClasses += " hover:border-primary hover:ring-2 hover:ring-primary/50 hover:scale-105";
            }

            return (
              <div
                key={item.id}
                data-right-id={item.id}
                ref={(el) => { rightRefs.current[item.id] = el; }}
                className={`p-4 border-2 rounded-xl shadow-sm transition-all duration-200 h-[90px] flex items-center justify-center text-center relative ${stateClasses}`}
              >
                {item.imageUrl ? (
                  <LightboxImage src={item.imageUrl} alt={item.text} className="h-full max-h-[60px]" />
                ) : (
                  <span className="font-bold text-lg">{item.text}</span>
                )}
                {isLocked && <div className="absolute top-2 right-2"><CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" /></div>}
                {isError && <div className="absolute top-2 right-2"><XCircle className="w-5 h-5 text-red-600 dark:text-red-400" /></div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
