'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CatchItem } from '@/schema/QuizModule';
import { Alert } from '@/components/common/Alert';

interface CatchGameProps {
  basketLabel: string;
  basketImageUrl?: string;
  items: CatchItem[];
  onComplete: (incorrectAttempts: number) => void;
}

interface ActiveItem {
  id: string; // Unique instance ID
  data: CatchItem;
  x: number;
  y: number;
  speed: number;
}

const GAME_WIDTH = 600;
const GAME_HEIGHT = 500;
const BASKET_WIDTH = 120;
const BASKET_HEIGHT = 40;
const ITEM_SIZE = 60;

export function CatchGame({ basketLabel, basketImageUrl, items, onComplete }: CatchGameProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [basketX, setBasketX] = useState(GAME_WIDTH / 2 - BASKET_WIDTH / 2);
  const targetBasketX = useRef(GAME_WIDTH / 2 - BASKET_WIDTH / 2); // For smoothing
  const [activeItems, setActiveItems] = useState<ActiveItem[]>([]);
  
  // Game State
  const [caughtTargets, setCaughtTargets] = useState<string[]>([]); // Track caught target IDs
  const [attempts, setAttempts] = useState(0);
  
  // Modal State
  const [pausedItem, setPausedItem] = useState<{ data: CatchItem; isCaught: boolean } | null>(null);

  const requestRef = useRef<number>(0);
  const lastSpawnTime = useRef<number>(0);
  const keysPressed = useRef({ left: false, right: false });
  const containerRef = useRef<HTMLDivElement>(null);

  const targetCount = items.filter(i => i.isTarget).length;

  const updatePhysics = useCallback((time: number) => {
    if (!isPlaying || pausedItem || isGameOver) return;

    // Handle continuous keypresses for smooth Arkanoid movement
    if (keysPressed.current.left) {
      targetBasketX.current = Math.max(0, targetBasketX.current - 6);
    }
    if (keysPressed.current.right) {
      targetBasketX.current = Math.min(GAME_WIDTH - BASKET_WIDTH, targetBasketX.current + 6);
    }

    // Smooth basket movement (Lerp)
    setBasketX(prev => {
      const diff = targetBasketX.current - prev;
      return prev + diff * 0.15; // 0.15 is the smoothing factor
    });

    setActiveItems(prevItems => {
      let nextItems = [...prevItems];

      // 1. Spawning Logic (Moved inside to check against current active items)
      if (time - lastSpawnTime.current > 2000) {
        const available = items.filter(item => {
          // Don't spawn targets that are already caught
          if (item.isTarget && caughtTargets.includes(item.id)) return false;
          // Prevent duplicates of any item currently on screen
          if (nextItems.some(active => active.data.id === item.id)) return false;
          return true;
        });

        if (available.length > 0) {
          const randomItem = available[Math.floor(Math.random() * available.length)];
          const newX = Math.random() * (GAME_WIDTH - ITEM_SIZE);
          nextItems.push({
            id: Math.random().toString(36).substr(2, 9),
            data: randomItem,
            x: newX,
            y: -ITEM_SIZE,
            speed: 2 + Math.random() * 2 // Fall speed between 2 and 4
          });
          lastSpawnTime.current = time;
        }
      }

      // 2. Physics & Collision Logic
      let collidedIndex = -1;
      let missedTargetIndex = -1;

      for (let i = 0; i < nextItems.length; i++) {
        const item = nextItems[i];
        item.y += item.speed;

        // Collision Check
        const itemBottom = item.y + ITEM_SIZE;
        const basketTop = GAME_HEIGHT - BASKET_HEIGHT;
        const itemCenterX = item.x + (ITEM_SIZE / 2);
        
        // Expanded hit box to make it more forgiving
        const hitToleranceX = 30; // pixels of leniency on the sides
        const hitToleranceY = 15; // pixels of leniency above the basket

        if (itemBottom >= basketTop - hitToleranceY && item.y <= GAME_HEIGHT) {
          if (itemCenterX >= basketX - hitToleranceX && itemCenterX <= basketX + BASKET_WIDTH + hitToleranceX) {
            collidedIndex = i;
            break;
          }
        }

        // Missed target check
        if (item.y > GAME_HEIGHT) {
          missedTargetIndex = i;
        }
      }

      if (collidedIndex !== -1) {
        const collided = nextItems[collidedIndex];
        nextItems.splice(collidedIndex, 1);
        handleCollision(collided.data);
      } else if (missedTargetIndex !== -1) {
        const missed = nextItems[missedTargetIndex];
        nextItems.splice(missedTargetIndex, 1);
        if (missed.data.isTarget) {
          handleMissedTarget(missed.data);
        }
      }

      return nextItems;
    });

    requestRef.current = requestAnimationFrame(updatePhysics);
  }, [isPlaying, pausedItem, isGameOver, items, caughtTargets, basketX]);

  const handleMissedTarget = (item: CatchItem) => {
    setPausedItem({ data: item, isCaught: false });
    setAttempts(a => a + 1); // Penalize!
  };

  // Handle Collision Logic
  const handleCollision = (item: CatchItem) => {
    setPausedItem({ data: item, isCaught: true });
    
    if (item.isTarget) {
      if (!caughtTargets.includes(item.id)) {
        setCaughtTargets(prev => {
          const newTargets = [...prev, item.id];
          if (newTargets.length === targetCount) {
            setIsGameOver(true);
          }
          return newTargets;
        });
      }
    } else {
      // Caught a hazard!
      setAttempts(a => a + 1);
    }
  };

  // Game Loop
  useEffect(() => {
    if (isPlaying && !pausedItem && !isGameOver) {
      requestRef.current = requestAnimationFrame(updatePhysics);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying, pausedItem, isGameOver, updatePhysics]);

  // Controls
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current && isPlaying && !pausedItem && !isGameOver) {
        const rect = containerRef.current.getBoundingClientRect();
        let newX = e.clientX - rect.left - (BASKET_WIDTH / 2);
        newX = Math.max(0, Math.min(newX, GAME_WIDTH - BASKET_WIDTH));
        targetBasketX.current = newX; // Update target, not state directly
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPlaying && !pausedItem && !isGameOver) {
        if (e.key === 'ArrowLeft') keysPressed.current.left = true;
        if (e.key === 'ArrowRight') keysPressed.current.right = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') keysPressed.current.left = false;
      if (e.key === 'ArrowRight') keysPressed.current.right = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying, pausedItem, isGameOver]);

  const startGame = () => {
    setIsPlaying(true);
    setCaughtTargets([]);
    setAttempts(0);
    setActiveItems([]);
    setIsGameOver(false);
    lastSpawnTime.current = performance.now();
  };

  const closePausedModal = () => {
    setPausedItem(null);
    if (isGameOver) {
      onComplete(attempts);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-6">
      <div className="mb-4 flex justify-between items-end">
        <div>
          <h4 className="font-bold text-lg">Catch the Right Items!</h4>
          <p className="text-sm text-foreground/70">Use your <strong className="text-foreground">Mouse</strong> or <strong className="text-foreground">⬅️ ➡️ Arrow Keys</strong> to move the basket and avoid hazards.</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-primary text-xl">{caughtTargets.length} / {targetCount}</p>
          <p className="text-xs uppercase font-bold text-foreground/50">Caught</p>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="relative w-full overflow-hidden bg-sky-100 dark:bg-sky-900/60 border-2 border-border rounded-xl cursor-none"
        style={{ height: GAME_HEIGHT, maxWidth: GAME_WIDTH }}
      >
        {!isPlaying ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50">
            <h2 className="text-2xl font-bold mb-4">Ready to catch?</h2>
            <button 
              onClick={startGame}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold text-lg hover:bg-primary/90 transition-transform hover:scale-105"
            >
              Start Game
            </button>
          </div>
        ) : null}

        {/* Falling Items */}
        {activeItems.map(item => (
          <div 
            key={item.id}
            className="absolute flex items-center justify-center bg-card shadow-md rounded-full border border-border overflow-hidden"
            style={{
              left: item.x,
              top: item.y,
              width: ITEM_SIZE,
              height: ITEM_SIZE,
            }}
          >
            {item.data.imageUrl ? (
              <img src={item.data.imageUrl} alt={item.data.text} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-center px-1 leading-tight">{item.data.text}</span>
            )}
          </div>
        ))}

        {/* Basket */}
        <div 
          className="absolute bottom-0 rounded-t-lg flex items-center justify-center text-primary-foreground font-bold overflow-hidden"
          style={{
            left: basketX,
            width: BASKET_WIDTH,
            height: BASKET_HEIGHT,
            backgroundColor: basketImageUrl ? 'transparent' : 'hsl(var(--primary))',
            boxShadow: basketImageUrl ? 'none' : '0 -4px 10px rgba(0,0,0,0.2)'
          }}
        >
          {basketImageUrl ? (
            <img src={basketImageUrl} alt={basketLabel} className="w-full h-full object-contain object-bottom pointer-events-none" />
          ) : (
            <span>{basketLabel}</span>
          )}
        </div>

        {/* Pause Modal overlay */}
        {pausedItem && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
            <div className="bg-card w-full max-w-sm rounded-xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="text-center mb-6">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                  (pausedItem.isCaught && pausedItem.data.isTarget)
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {(pausedItem.isCaught && pausedItem.data.isTarget) ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                  )}
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  {pausedItem.isCaught 
                    ? (pausedItem.data.isTarget ? 'Good Catch!' : 'Oops! Hazard Caught.')
                    : 'Oops! You missed a target!'}
                </h3>
                <h4 className="text-lg font-semibold text-foreground/80 mb-4">{pausedItem.data.text}</h4>
                <p className="text-foreground/70">{pausedItem.data.explanation}</p>
              </div>
              <button 
                onClick={closePausedModal}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:bg-primary/90"
              >
                {isGameOver ? 'Complete Level' : 'Continue'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
