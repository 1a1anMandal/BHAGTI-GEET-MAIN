'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createRoom, fetchBhajans } from '../lib/api';
import { Flame, User, Copy, Mic, Share2, Flower2, Clock, Radio } from 'lucide-react';
import { Bhajan } from '@bhagi-geet/shared';

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [bhajans, setBhajans] = useState<Bhajan[]>([]);
  const [selectedBhajanId, setSelectedBhajanId] = useState<string>('');
  const [leads, setLeads] = useState(1);

  useEffect(() => {
    fetchBhajans('').then((data) => {
      setBhajans(data);
      if (data.length > 0) setSelectedBhajanId(data[0].id);
    }).catch(() => {});
  }, []);

  const handleCreateRoom = async () => {
    if (!name.trim()) return alert('Please enter your name');
    setLoading(true);
    try {
      const { code } = await createRoom(name.trim());
      // Pre-load the selected bhajan immediately after joining via socket in the room, 
      // or we can pass it as a query param and let the room handle it.
      router.push(`/room/${code}?name=${encodeURIComponent(name.trim())}&initialBhajan=${selectedBhajanId}`);
    } catch (error) {
      alert('Failed to create room');
      setLoading(false);
    }
  };

  const handleJoinRoom = () => {
    if (!name.trim()) return alert('Please enter your name');
    if (!joinCode.trim()) return alert('Please enter a room ID');
    router.push(`/room/${joinCode.toUpperCase()}?name=${encodeURIComponent(name.trim())}`);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24 hide-scrollbar">
      {/* Header */}
      <div className="p-4 flex items-center justify-between sticky top-0 bg-bg/90 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface2 flex items-center justify-center text-primary">
            <Flame size={20} className="fill-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide">Bhagi Geet</h1>
            <p className="text-xs text-muted font-semibold tracking-widest">HOME</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-surface2 px-3 py-1 rounded-full">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold text-primary">LIVE</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-light/20 flex items-center justify-center text-primary-light">
            <User size={20} />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        
        {/* Greeting Card */}
        <div className="glass-card p-4 flex items-center justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-full bg-surface2 flex items-center justify-center text-primary-light">
              <Flower2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Namaste, Devotee...</h2>
              <p className="text-xs text-muted mt-1">Guest Sanctuary • Instant Access</p>
            </div>
          </div>
          <div className="bg-surface2 px-3 py-1 rounded-full border border-white/5 relative z-10">
            <span className="text-xs font-semibold text-muted">READY</span>
          </div>
        </div>

        {/* Create Room Form */}
        <div className="space-y-5">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-muted tracking-wider">DEVOTEE / LEAD VOCALIST NAME</label>
              <span className="text-xs font-bold text-primary tracking-wider">REQUIRED</span>
            </div>
            <div className="relative">
              <User size={18} className="absolute left-4 top-3.5 text-muted" />
              <input 
                type="text" 
                placeholder="E.g. Aarav Sharma" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface2 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-muted tracking-wider">INITIAL BHAJAN TRACK</label>
              <span className="text-xs font-bold text-muted tracking-wider">Pre-Tuned</span>
            </div>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
              {bhajans.map((b) => (
                <button 
                  key={b.id}
                  onClick={() => setSelectedBhajanId(b.id)}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedBhajanId === b.id 
                      ? 'bg-primary text-black' 
                      : 'bg-surface2 text-muted border border-white/5 hover:text-white'
                  }`}
                >
                  {b.title}
                </button>
              ))}
              {bhajans.length === 0 && (
                <div className="text-sm text-muted italic">Loading bhajans...</div>
              )}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-muted tracking-wider">SYNCHRONIZED LEAD SINGERS</label>
              <span className="text-xs font-bold text-muted tracking-wider">Up to 4 Leads</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { num: 1, label: 'Solo' },
                { num: 2, label: 'Duo' },
                { num: 3, label: 'Trio' },
                { num: 4, label: 'Quartet' }
              ].map((opt) => (
                <button
                  key={opt.num}
                  onClick={() => setLeads(opt.num)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    leads === opt.num 
                      ? 'bg-primary/20 border-primary text-primary-light' 
                      : 'bg-surface2 border-white/5 text-muted hover:bg-surface2/80'
                  }`}
                >
                  <span className="text-xl font-bold">{opt.num}</span>
                  <span className="text-[10px] font-medium tracking-wide uppercase">{opt.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-start gap-2 bg-surface2/50 p-3 rounded-lg">
              <div className="text-primary mt-0.5">🌟</div>
              <p className="text-xs text-muted leading-relaxed">
                You (Creator) automatically claim Vocal Leader #1 slot.
              </p>
            </div>
          </div>

          <button 
            onClick={handleCreateRoom}
            disabled={loading}
            className="w-full py-4 bg-primary-gradient rounded-xl font-bold text-black text-lg flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,122,0,0.3)] hover:scale-[1.02] transition-transform"
          >
            <Mic size={20} />
            {loading ? 'Creating...' : 'Create Synchronized Room'}
          </button>
        </div>

        {/* Join Room Section */}
        <div className="glass-card p-4 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted">
              <Radio size={16} />
              <span className="text-xs font-bold tracking-wider">INSTANT ROOM READY</span>
            </div>
            <span className="text-xs font-bold text-primary/80 tracking-wider bg-primary/10 px-2 py-0.5 rounded">Active Pulse</span>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 bg-surface2 border border-white/5 rounded-xl p-3 flex justify-between items-center relative overflow-hidden">
              <div className="absolute left-0 bottom-0 w-full h-1/2 bg-primary/5 blur-xl" />
              <div>
                <p className="text-[10px] text-muted font-semibold uppercase tracking-wider mb-1">Room ID</p>
                <input 
                  type="text" 
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="E.g. 7082" 
                  className="bg-transparent text-2xl font-bold text-primary-light w-full focus:outline-none placeholder:text-primary-light/30"
                  maxLength={6}
                />
              </div>
              <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-muted transition-colors shrink-0 z-10">
                <Copy size={18} />
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 py-3 bg-surface2 border border-white/5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-muted hover:text-white transition-colors">
              <Share2 size={16} /> WhatsApp Invite
            </button>
            <button 
              onClick={handleJoinRoom}
              className="flex-1 py-3 bg-primary rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-black hover:bg-primary-light transition-colors"
            >
              <Mic size={16} /> Enter Studio
            </button>
          </div>
        </div>

        {/* History Section (Mocked for UI representation as per prototype) */}
        <div>
          <div className="flex items-center gap-2 mb-3 text-white/80">
            <Clock size={16} />
            <h3 className="font-semibold text-sm">Last Joined Room</h3>
          </div>
          <div className="glass-card p-4 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-lg">Vrindavan Evening...</h4>
                <p className="text-xs text-muted mt-0.5">Raag Yaman • Radhe Govind Mah...</p>
              </div>
              <span className="text-[10px] bg-surface2 px-2 py-1 rounded-md text-muted border border-white/5 font-medium">
                14/20 Singing
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-black border border-bg">P</div>
                  <div className="w-6 h-6 rounded-full bg-primary-light flex items-center justify-center text-[10px] font-bold text-black border border-bg">A</div>
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary-light border border-bg">+12</div>
                </div>
                <span className="text-xs text-muted">Host: Pujya Keshav ji</span>
              </div>
              <button className="text-xs font-semibold text-white/80 flex items-center gap-1 hover:text-primary transition-colors">
                Join Again →
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
