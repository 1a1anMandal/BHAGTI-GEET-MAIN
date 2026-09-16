'use client';

import { useQueueStore } from '../stores/queueStore';
import { Play, Menu } from 'lucide-react';

export function QueuePanel() {
  const { queue } = useQueueStore();

  const playingItem = queue.find(q => q.status === 'playing');
  const upcomingItems = queue.filter(q => q.status !== 'playing');

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Now Singing Header */}
      {playingItem && (
        <div className="p-3 m-3 bg-surface2 border border-primary/30 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary shrink-0">
            <Play size={18} className="fill-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-primary font-bold uppercase tracking-wider mb-0.5">Now Singing</p>
            <p className="text-sm font-bold text-white truncate">{playingItem.bhajan?.title || 'Unknown'}</p>
          </div>
          <div className="flex gap-1 items-end h-4 opacity-70">
            <div className="w-1 bg-primary rounded-full animate-[bounce_1s_infinite_100ms] h-full" />
            <div className="w-1 bg-primary rounded-full animate-[bounce_1s_infinite_300ms] h-2/3" />
            <div className="w-1 bg-primary rounded-full animate-[bounce_1s_infinite_200ms] h-full" />
            <div className="w-1 bg-primary rounded-full animate-[bounce_1s_infinite_400ms] h-1/2" />
          </div>
        </div>
      )}

      {/* Queue Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-primary text-sm">🎵</span>
          <h3 className="font-bold text-sm text-white/90">Bhajan Queue</h3>
        </div>
        <span className="text-[10px] text-muted">Total {queue.length} bhajans</span>
      </div>
      
      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {upcomingItems.length === 0 && !playingItem ? (
          <p className="text-muted text-xs text-center py-6 italic">Queue is empty</p>
        ) : (
          upcomingItems.map((item, index) => {
            const isCompleted = item.status === 'completed';
            
            return (
              <div 
                key={item.id}
                className={`flex items-center gap-3 p-2 rounded-xl group transition-colors ${
                  isCompleted ? 'opacity-40' : 'hover:bg-white/5'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-surface2 border border-white/5 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-muted">{index + 1}</span>
                </div>
                
                <div className="flex-1 min-w-0 py-1">
                  <p className={`text-sm font-semibold truncate ${isCompleted ? 'line-through text-muted' : 'text-white/90'}`}>
                    {item.bhajan?.title || 'Unknown'}
                  </p>
                  <p className="text-[10px] text-muted mt-0.5 truncate">
                    Requested by System
                  </p>
                </div>

                {!isCompleted && (
                  <button className="p-2 text-muted hover:text-white transition-colors cursor-grab">
                    <Menu size={16} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
