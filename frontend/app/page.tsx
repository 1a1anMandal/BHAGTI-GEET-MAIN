'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createRoom } from '../lib/api';
import Link from 'next/link';
import { Music, Users, PlusCircle } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateRoom = async () => {
    if (!name.trim()) return alert('Please enter your name');
    setLoading(true);
    try {
      const { code } = await createRoom(name.trim());
      router.push(`/room/${code}?name=${encodeURIComponent(name.trim())}`);
    } catch (error) {
      alert('Failed to create room');
      setLoading(false);
    }
  };

  const handleJoinRoom = () => {
    if (!name.trim()) return alert('Please enter your name');
    if (!joinCode.trim()) return alert('Please enter a room code');
    router.push(`/room/${joinCode.toUpperCase()}?name=${encodeURIComponent(name.trim())}`);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-12">
      <div className="space-y-4">
        <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
          Bhagi Geet
        </h1>
        <p className="text-muted text-lg md:text-xl max-w-xl mx-auto">
          Real-time synchronized bhajan singing. Create a room, share the code, and sing together in perfect sync.
        </p>
      </div>

      <div className="w-full max-w-md glass-card p-8 space-y-8">
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="Your Name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-surface border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={handleCreateRoom}
            disabled={loading}
            className="flex flex-col items-center justify-center p-4 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-xl text-primary transition-all gap-2"
          >
            <PlusCircle size={24} />
            <span className="font-semibold">Create Room</span>
          </button>

          <div className="flex flex-col gap-2">
            <input 
              type="text" 
              placeholder="Room Code" 
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="w-full bg-surface border border-white/10 rounded-lg p-3 text-white text-center uppercase focus:outline-none focus:border-primary"
            />
            <button 
              onClick={handleJoinRoom}
              className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Users size={18} /> Join
            </button>
          </div>
        </div>
      </div>

      <Link href="/library" className="flex items-center gap-2 text-muted hover:text-primary transition-colors">
        <Music size={20} />
        Browse Bhajan Library
      </Link>
    </div>
  );
}
