'use client';

import React, { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';

interface LightboxImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function LightboxImage({ src, alt, className = '' }: LightboxImageProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div 
        className={`relative group cursor-pointer overflow-hidden rounded-md ${className}`} 
        onClick={() => setIsOpen(true)}
      >
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-contain transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <ZoomIn className="text-white opacity-0 group-hover:opacity-100 drop-shadow-md" size={32} />
        </div>
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setIsOpen(false)}
        >
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition-all"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          >
            <X size={32} />
          </button>
          <img 
            src={src} 
            alt={alt} 
            className="max-w-full max-h-[90vh] object-contain drop-shadow-2xl rounded-md bg-white p-4"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </>
  );
}
