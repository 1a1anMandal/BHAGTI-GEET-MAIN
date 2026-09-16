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
    <div className="flex flex-col h-full bg-surface2/90 border-t border-white/10 backdrop-blur">
      <div className="p-2 border-b border-white/5 bg-black/20 relative">
        <Search className="absolute left-4 top-4 text-muted" size={16} />
        <input 
          type="text" 
          placeholder="Search to suggest a bhajan..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-surface border border-white/5 rounded-xl py-2 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
        />
        
        {/* Search Results Dropdown */}
        {results.length > 0 && (
          <div className="absolute top-full left-2 right-2 mt-1 bg-surface2 border border-white/10 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto">
            {results.map(b => (
              <button 
                key={b.id} 
                onClick={() => handleVote(b.id)}
                className="w-full text-left p-3 hover:bg-white/5 border-b border-white/5 last:border-0 text-sm flex justify-between items-center group"
              >
                <span className="truncate pr-4">{b.title}</span>
                <ThumbsUp size={14} className="text-primary opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {votes.length === 0 ? (
          <p className="text-muted text-xs text-center py-6 italic">No suggestions yet.</p>
        ) : (
          votes.map((vote) => (
            <div key={vote.bhajanId} className="flex items-center justify-between p-2 rounded-xl border border-white/5 bg-surface/50 hover:bg-white/5 transition-colors">
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-sm font-medium text-white truncate">{vote.title}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <ThumbsUp size={10} className="text-primary" />
                  <p className="text-[10px] text-primary">{vote.count} vote{vote.count > 1 ? 's' : ''}</p>
                </div>
              </div>
              
              {isLeader && (
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => handleAccept(vote.bhajanId)} className="p-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors" title="Accept to Queue">
                    <Check size={16} />
                  </button>
                  <button onClick={() => handleReject(vote.bhajanId)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors" title="Reject Suggestion">
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
