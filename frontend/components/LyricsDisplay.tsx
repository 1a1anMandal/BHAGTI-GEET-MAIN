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
      <div className="flex-1 flex flex-col items-center justify-center text-primary-light/50 p-6 text-center h-full">
        <div className="w-16 h-16 mb-4 rounded-full border-2 border-primary-light/20 flex items-center justify-center animate-pulse">
          <span className="text-2xl">🪔</span>
        </div>
        <p className="text-sm font-medium tracking-wide">Waiting for the lead singer to start a bhajan...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full relative">
      {/* Background Watermark/Decoration */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-5">
        <div className="text-[200px] leading-none select-none text-primary">ॐ</div>
      </div>

      {/* Header Info */}
      <div className="pt-6 pb-2 text-center relative z-10 shrink-0">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-primary text-xs">ॐ</span>
          <p className="text-[10px] text-primary-light font-bold tracking-[0.2em] uppercase">
            Divine Melody
          </p>
          <span className="text-primary text-xs">ॐ</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-wide text-glow px-4">
          {currentBhajan.title}
        </h2>
        <div className="flex items-center justify-center gap-4 mt-3">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-primary/50" />
          <span className="text-primary-light/50 text-lg">🪷</span>
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-primary/50" />
        </div>
      </div>

      {/* Lyrics Scroll Area */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-8 scroll-smooth hide-scrollbar relative z-10"
      >
        <div className="max-w-2xl mx-auto space-y-4 pb-[30vh]">
          {currentBhajan.lyrics.map((para, idx) => {
            const isActive = idx === activeParaIdx;
            
            return (
              <div 
                key={idx}
                ref={isActive ? activeParaRef : null}
                className={isActive ? 'para-active' : 'para-inactive'}
              >
                <p className="whitespace-pre-line leading-relaxed">{para.hindi}</p>
                {para.english && (
                  <p className="opacity-60 mt-2 text-sm tracking-wide font-light">{para.english}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
