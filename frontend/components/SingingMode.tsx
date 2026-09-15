'use client';

import { useState, useEffect } from 'react';
import { Maximize, Minimize } from 'lucide-react';
import { useWakeLock } from '../hooks/useWakeLock';

interface SingingModeProps {
  children: React.ReactNode;
}

export function SingingMode({ children }: SingingModeProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { requestWakeLock, releaseWakeLock } = useWakeLock();

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (document.fullscreenElement) {
        requestWakeLock();
      } else {
        releaseWakeLock();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen mode: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className={isFullscreen ? "fixed inset-0 z-50 bg-bg" : "flex-1 flex flex-col relative"}>
      <button 
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white/50 hover:text-white transition-all backdrop-blur-md"
        title={isFullscreen ? "Exit Singing Mode" : "Enter Singing Mode"}
      >
        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
      </button>
      
      {children}
    </div>
  );
}
