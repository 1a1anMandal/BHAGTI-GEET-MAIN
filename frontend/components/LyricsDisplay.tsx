'use client';

import { useEffect, useRef } from 'react';
import { useLyricsStore } from '../stores/lyricsStore';

export function LyricsDisplay() {
  const { currentBhajan, activeParaIdx } = useLyricsStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const activeParaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeParaRef.current) {
      activeParaRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeParaIdx]);

  if (!currentBhajan) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted">
        Waiting for leader to load a bhajan...
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-12 scroll-smooth"
    >
      <div className="max-w-3xl mx-auto space-y-2 pb-[50vh]">
        <h2 className="text-3xl font-bold mb-8 text-white/50 text-center">{currentBhajan.title}</h2>
        {currentBhajan.lyrics.map((para, idx) => {
          const isActive = idx === activeParaIdx;
          
          return (
            <div 
              key={idx}
              ref={isActive ? activeParaRef : null}
              className={isActive ? 'para-active' : 'para-inactive'}
            >
              <p>{para.hindi}</p>
              {para.english && (
                <p className="opacity-70 mt-1">{para.english}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
