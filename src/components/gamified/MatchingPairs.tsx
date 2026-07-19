'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

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
  
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [lockedPairs, setLockedPairs] = useState<Array<{ leftId: string; rightId: string }>>([]);
  
  const [attempts, setAttempts] = useState(0);
  const [errorFlash, setErrorFlash] = useState<string | null>(null);

  // Initial shuffle on mount
  useEffect(() => {
    setShuffledLeft(shuffleArray(leftItems));
    setShuffledRight(shuffleArray(rightItems));
  }, [leftItems, rightItems]);

  // Check for match when both selected
  useEffect(() => {
    if (selectedLeft && selectedRight) {
      const isMatch = correctMatches.some(
        (match) => match.leftId === selectedLeft && match.rightId === selectedRight
      );

      if (isMatch) {
        setLockedPairs((prev) => [...prev, { leftId: selectedLeft, rightId: selectedRight }]);
        setSelectedLeft(null);
        setSelectedRight(null);
      } else {
        setAttempts((a) => a + 1);
        setErrorFlash(`${selectedLeft}-${selectedRight}`);
        
        // Reset selection after delay
        setTimeout(() => {
          setSelectedLeft(null);
          setSelectedRight(null);
          setErrorFlash(null);
        }, 800);
      }
    }
  }, [selectedLeft, selectedRight, correctMatches]);

  // Check for completion
  useEffect(() => {
    if (lockedPairs.length > 0 && lockedPairs.length === correctMatches.length) {
      onComplete(attempts);
    }
  }, [lockedPairs, correctMatches.length, attempts, onComplete]);

  const handleLeftClick = (id: string) => {
    if (lockedPairs.some((p) => p.leftId === id) || errorFlash) return;
    setSelectedLeft((prev) => (prev === id ? null : id));
  };

  const handleRightClick = (id: string) => {
    if (lockedPairs.some((p) => p.rightId === id) || errorFlash) return;
    setSelectedRight((prev) => (prev === id ? null : id));
  };

  return (
    <div className="max-w-4xl mx-auto my-6 p-6 bg-muted/30 rounded-xl border border-border">
      <div className="mb-6 text-center">
        <p className="text-foreground/80">Select a card on the left and find its match on the right.</p>
        <p className="text-sm font-medium mt-2 text-primary">Matches found: {lockedPairs.length} / {correctMatches.length}</p>
      </div>

      <div className="grid grid-cols-2 gap-8 relative">
        {/* Left Column */}
        <div className="space-y-4">
          {shuffledLeft.map((item) => {
            const isLocked = lockedPairs.some((p) => p.leftId === item.id);
            const isSelected = selectedLeft === item.id;
            const isError = errorFlash?.startsWith(item.id + '-');

            let stateClasses = "bg-card border-border hover:border-primary/50 cursor-pointer";
            if (isLocked) stateClasses = "bg-green-50 dark:bg-green-950/30 border-green-500 text-green-700 dark:text-green-400 cursor-default opacity-60";
            else if (isError) stateClasses = "bg-red-50 dark:bg-red-950/30 border-red-500 text-red-700 dark:text-red-400";
            else if (isSelected) stateClasses = "border-primary ring-2 ring-primary ring-offset-2";

            return (
              <div
                key={item.id}
                onClick={() => handleLeftClick(item.id)}
                className={`p-4 border-2 rounded-lg shadow-sm transition-all duration-200 min-h-[80px] flex items-center justify-center text-center font-medium ${stateClasses}`}
              >
                {item.text}
                {isLocked && <CheckCircle2 className="inline-block ml-2 w-5 h-5" />}
                {isError && <XCircle className="inline-block ml-2 w-5 h-5" />}
              </div>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {shuffledRight.map((item) => {
            const isLocked = lockedPairs.some((p) => p.rightId === item.id);
            const isSelected = selectedRight === item.id;
            const isError = errorFlash?.endsWith('-' + item.id);

            let stateClasses = "bg-card border-border hover:border-primary/50 cursor-pointer";
            if (isLocked) stateClasses = "bg-green-50 dark:bg-green-950/30 border-green-500 text-green-700 dark:text-green-400 cursor-default opacity-60";
            else if (isError) stateClasses = "bg-red-50 dark:bg-red-950/30 border-red-500 text-red-700 dark:text-red-400";
            else if (isSelected) stateClasses = "border-primary ring-2 ring-primary ring-offset-2";

            return (
              <div
                key={item.id}
                onClick={() => handleRightClick(item.id)}
                className={`p-4 border-2 rounded-lg shadow-sm transition-all duration-200 min-h-[80px] flex items-center justify-center text-center font-medium ${stateClasses}`}
              >
                {item.text}
                {isLocked && <CheckCircle2 className="inline-block ml-2 w-5 h-5" />}
                {isError && <XCircle className="inline-block ml-2 w-5 h-5" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
