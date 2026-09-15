'use client';

import { useRoomStore } from '../stores/roomStore';
import { useLyricsStore } from '../stores/lyricsStore';
import { getSocket } from '../lib/socket';
import { ArrowLeft, ArrowRight, SkipForward } from 'lucide-react';

export function LeaderControls() {
  const { roomCode, myRole } = useRoomStore();
  const { currentBhajan, activeParaIdx } = useLyricsStore();
  const socket = getSocket();

  const isLeader = myRole === 'leader' || myRole === 'co-leader';

  if (!isLeader) return null;

  const handleNext = () => {
    if (!roomCode) return;
    // Auto finish if it's the last line
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
    <div className="absolute bottom-0 left-0 right-0 p-4 bg-bg/80 backdrop-blur-lg border-t border-white/10 z-40">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        
        <div className="flex gap-4">
          <button 
            onClick={handlePrev}
            disabled={!currentBhajan || activeParaIdx === 0}
            className="p-3 bg-surface border border-white/10 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <ArrowLeft size={24} />
          </button>
          
          <button 
            onClick={handleNext}
            disabled={!currentBhajan}
            className="px-8 py-3 bg-primary text-white font-bold rounded-full hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            Next Line <ArrowRight size={20} />
          </button>
        </div>

        <button 
          onClick={handleFinish}
          disabled={!currentBhajan}
          className="px-4 py-3 bg-red-500/20 text-red-400 font-semibold rounded-full hover:bg-red-500/30 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <SkipForward size={18} /> Finish Bhajan
        </button>

      </div>
    </div>
  );
}
