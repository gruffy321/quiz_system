import React, { useEffect } from 'react';
import Image from 'next/image';

interface QuestionContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string;
  contextText?: string;
  promptTitle: string;
}

export const QuestionContextModal: React.FC<QuestionContextModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  contextText,
  promptTitle
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const renderFormattedText = (text: string) => {
    return text.split('**').map((part, i) => 
      i % 2 === 1 ? <strong key={i} className="text-blue-500 font-bold">{part}</strong> : part
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="relative w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
          <h3 className="font-semibold text-lg text-foreground">Visual Context & Hint</h3>
          <button 
            onClick={onClose}
            className="text-foreground/50 hover:text-foreground transition-colors p-1"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {imageUrl && (
            <div className="mb-6 relative w-full h-64 md:h-80 bg-muted rounded-lg overflow-hidden border border-border/50 shadow-inner">
              <Image 
                src={imageUrl} 
                alt="Context visualization" 
                fill 
                className="object-contain p-2"
                sizes="(max-w-768px) 100vw, 800px"
              />
            </div>
          )}
          
          {contextText && (
            <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-lg shadow-sm">
              <p className="text-foreground text-md md:text-lg leading-relaxed">
                {renderFormattedText(contextText)}
              </p>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-border flex justify-end bg-muted/30">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};
