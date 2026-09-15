'use client';

import { useQueueStore } from '../stores/queueStore';
import { useRoomStore } from '../stores/roomStore';
import { Play, Check, Clock } from 'lucide-react';

export function QueuePanel() {
  const { queue } = useQueueStore();

  return (
    <div className="glass-card p-4 flex flex-col h-full max-h-[400px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">Up Next</h3>
        <span className="text-xs text-muted">{queue.length}/10</span>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {queue.length === 0 ? (
          <p className="text-muted text-sm italic">Queue is empty</p>
        ) : (
          queue.map((item) => {
            const isPlaying = item.status === 'playing';
            const isCompleted = item.status === 'completed';
            
            return (
              <div 
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  isPlaying 
                    ? 'border-primary/50 bg-primary/10' 
                    : isCompleted 
                      ? 'border-white/5 opacity-50 bg-black/20 line-through' 
                      : 'border-white/10 bg-surface'
                }`}
              >
                {isPlaying && <Play size={16} className="text-primary" />}
                {isCompleted && <Check size={16} className="text-muted" />}
                {!isPlaying && !isCompleted && <Clock size={16} className="text-muted" />}
                
                <div className="flex-1 min-w-0">
                  <p className={`truncate text-sm font-medium ${isPlaying ? 'text-primary' : 'text-white'}`}>
                    {item.bhajan?.title || 'Unknown'}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
