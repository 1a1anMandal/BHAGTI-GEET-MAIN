'use client';

import { useRoomStore } from '../stores/roomStore';
import { useLyricsStore } from '../stores/lyricsStore';
import { getSocket } from '../lib/socket';
import { ChevronUp, ChevronDown, CheckCircle2 } from 'lucide-react';

export function LeaderControls() {
  const { roomCode, myRole } = useRoomStore();
  const { currentBhajan, activeParaIdx } = useLyricsStore();
  const socket = getSocket();

  const isLeader = myRole === 'leader' || myRole === 'co-leader';

  if (!isLeader) return null;

  const handleNext = () => {
    if (!roomCode) return;
    if (currentBhajan && activeParaIdx === currentBhajan.lyrics.length - 1) {
      socket.emit('finish_bhajan', { roomCode });
    } else {
      socket.emit('next_para', { roomCode });
    }
  };

  const handlePrev = () => {
    if (roomCode) socket.emit('prev_para', { roomCode });
  };

  const handleFinish = () => {
    if (roomCode) socket.emit('finish_bhajan', { roomCode });
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-[90%] z-50">
      <div className="flex items-center justify-between bg-surface2/90 backdrop-blur-xl border border-white/10 rounded-full p-2 shadow-2xl shadow-primary/20">
        
        <button 
          onClick={handlePrev}
          disabled={!currentBhajan || activeParaIdx === 0}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronUp size={24} />
        </button>
        
        <button 
          onClick={handleNext}
          disabled={!currentBhajan}
          className="flex-1 mx-2 h-12 bg-primary-gradient rounded-full text-black font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,122,0,0.4)] disabled:opacity-50"
        >
          {currentBhajan && activeParaIdx === currentBhajan.lyrics.length - 1 ? 'Finish Song' : 'Next Line'}
        </button>

        <button 
          onClick={handleFinish}
          disabled={!currentBhajan}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-30 disabled:pointer-events-none"
          title="Force Finish"
        >
          <CheckCircle2 size={20} />
        </button>

      </div>
    </div>
  );
}
