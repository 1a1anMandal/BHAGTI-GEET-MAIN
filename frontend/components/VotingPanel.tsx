'use client';

import { useState, useEffect } from 'react';
import { useRoomStore } from '../stores/roomStore';
import { useQueueStore } from '../stores/queueStore';
import { getSocket } from '../lib/socket';
import { fetchBhajans } from '../lib/api';
import { Bhajan } from '@bhagi-geet/shared';
import { Search, Check, X, ThumbsUp } from 'lucide-react';

export function VotingPanel() {
  const { roomCode, myRole, myName } = useRoomStore();
  const { votes } = useQueueStore();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Bhajan[]>([]);
  const socket = getSocket();

  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const data = await fetchBhajans(search);
        setResults(data);
      } catch (err) {}
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleVote = (bhajanId: string) => {
    if (!roomCode || !myName) return;
    socket.emit('cast_vote', { roomCode, bhajanId, voterName: myName });
    setSearch('');
    setResults([]);
  };

  const handleAccept = (bhajanId: string) => {
    if (!roomCode) return;
    socket.emit('accept_vote', { roomCode, bhajanId });
  };

  const handleReject = (bhajanId: string) => {
    if (!roomCode) return;
    socket.emit('reject_vote', { roomCode, bhajanId });
  };

  const isLeader = myRole === 'leader' || myRole === 'co-leader';

  return (
    <div className="glass-card p-4 flex flex-col h-full max-h-[400px]">
      <h3 className="font-bold text-lg mb-4">Vote Next Bhajan</h3>
      
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 text-muted" size={16} />
        <input 
          type="text" 
          placeholder="Search to vote..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-surface border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-primary"
        />
        
        {/* Search Results Dropdown */}
        {results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-surface2 border border-white/10 rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto">
            {results.map(b => (
              <button 
                key={b.id} 
                onClick={() => handleVote(b.id)}
                className="w-full text-left p-3 hover:bg-white/5 border-b border-white/5 last:border-0 text-sm flex justify-between items-center group"
              >
                <span>{b.title}</span>
                <ThumbsUp size={14} className="opacity-0 group-hover:opacity-100 text-primary transition-opacity" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {votes.length === 0 ? (
          <p className="text-muted text-sm italic">No active votes</p>
        ) : (
          votes.map((vote) => (
            <div key={vote.bhajanId} className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-surface/50">
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-sm font-medium text-white truncate">{vote.title}</p>
                <p className="text-xs text-primary">{vote.count} vote{vote.count > 1 ? 's' : ''}</p>
              </div>
              
              {isLeader && (
                <div className="flex gap-2">
                  <button onClick={() => handleAccept(vote.bhajanId)} className="p-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-md transition-colors">
                    <Check size={16} />
                  </button>
                  <button onClick={() => handleReject(vote.bhajanId)} className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-md transition-colors">
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
