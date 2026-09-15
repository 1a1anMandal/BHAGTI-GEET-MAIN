'use client';

import { useState, useEffect } from 'react';
import { useRoomStore } from '../stores/roomStore';
import { getSocket } from '../lib/socket';
import { fetchBhajans } from '../lib/api';
import { Bhajan } from '@bhagi-geet/shared';
import { Search, Plus, Play } from 'lucide-react';

export function LeaderLibraryPanel() {
  const { roomCode, myRole } = useRoomStore();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Bhajan[]>([]);
  const socket = getSocket();

  useEffect(() => {
    const timeout = setTimeout(async () => {
      try {
        const data = await fetchBhajans(search);
        setResults(data);
      } catch (err) {}
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleAddToQueue = (bhajanId: string) => {
    if (!roomCode) return;
    socket.emit('add_to_queue', { roomCode, bhajanId });
  };

  const handlePlayNow = (bhajanId: string) => {
    if (!roomCode) return;
    // Play now loads it instantly
    socket.emit('load_bhajan', { roomCode, bhajanId });
  };

  const isLeader = myRole === 'leader' || myRole === 'co-leader';
  if (!isLeader) return null;

  return (
    <div className="flex flex-col h-full bg-surface2/90 border-t border-white/10 backdrop-blur">
      <div className="p-2 border-b border-white/5 flex items-center bg-black/20">
        <Search className="text-muted ml-2 mr-2" size={16} />
        <input 
          type="text" 
          placeholder="Search Library to Add to Queue..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm text-white focus:outline-none"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {results.length === 0 ? (
          <p className="text-muted text-xs text-center pt-4">No bhajans found.</p>
        ) : (
          results.map(b => (
            <div key={b.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-md group">
              <span className="text-sm truncate pr-2">{b.title}</span>
              <div className="flex gap-1 shrink-0">
                <button 
                  onClick={() => handlePlayNow(b.id)}
                  title="Play Now"
                  className="p-1.5 bg-primary/20 text-primary hover:bg-primary/40 rounded transition-colors"
                >
                  <Play size={14} />
                </button>
                <button 
                  onClick={() => handleAddToQueue(b.id)}
                  title="Add to Queue"
                  className="p-1.5 bg-white/10 text-white hover:bg-white/20 rounded transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
