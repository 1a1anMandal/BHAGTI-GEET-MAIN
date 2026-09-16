'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchBhajans } from '../../lib/api';
import { Bhajan } from '@bhagi-geet/shared';
import { Search, Plus, User, Flame, Heart, FileText, Music2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Library() {
  const router = useRouter();
  const [bhajans, setBhajans] = useState<Bhajan[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchBhajans(search);
        setBhajans(data);
      } catch (error) {
        console.error('Failed to load bhajans', error);
      } finally {
        setLoading(false);
      }
    };
    
    const timeout = setTimeout(loadData, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  // Helper to generate a consistent gradient based on string length/characters
  const getGradient = (title: string) => {
    const colors = [
      'from-orange-500 to-amber-300',
      'from-rose-500 to-orange-400',
      'from-amber-600 to-yellow-400',
      'from-red-500 to-orange-500',
    ];
    return colors[title.length % colors.length];
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24 hide-scrollbar bg-bg relative">
      {/* Decorative background subtle glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="p-4 flex items-center justify-between sticky top-0 bg-bg/90 backdrop-blur z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface2 flex items-center justify-center text-primary">
            <Flame size={20} className="fill-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide">Bhajan Library</h1>
            <p className="text-[10px] text-muted font-medium uppercase tracking-wider">Divine Music for a Better World</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-surface2 px-3 py-1 rounded-full border border-white/5">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold text-primary tracking-wider">LIVE</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-surface2 flex items-center justify-center text-muted border border-white/5">
            <User size={18} />
          </div>
        </div>
      </div>

      <div className="px-4 space-y-6 relative z-10">
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-muted" size={18} />
          <input 
            type="text"
            placeholder="Search bhajan by title, deity, or lyrics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface2 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors shadow-lg"
          />
        </div>

        {/* Section Title & Add */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Music2 size={20} className="text-primary" />
            <h2 className="text-lg font-bold">All Bhajans</h2>
          </div>
          <Link href="/library/add" className="bg-primary/20 text-primary-light hover:bg-primary hover:text-black border border-primary/30 px-4 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold transition-colors">
            <Plus size={14} /> Add Bhajan
          </Link>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {bhajans.map((bhajan) => {
              // Extract a small snippet of lyrics
              const lyricsSnippet = bhajan.lyrics.length > 0 
                ? bhajan.lyrics.map(l => l.hindi).join(' ').substring(0, 100) + '...'
                : 'No lyrics available.';

              return (
                <div key={bhajan.id} className="glass-card p-3 flex gap-4">
                  {/* Image Placeholder */}
                  <div className={`w-28 h-36 rounded-xl shrink-0 bg-gradient-to-br ${getGradient(bhajan.title)} flex flex-col items-center justify-center text-black/40 shadow-inner relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
                    <Music2 size={32} className="relative z-10" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col py-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-base font-bold text-white truncate pr-2">{bhajan.title}</h3>
                      <button className="text-muted hover:text-red-400 transition-colors shrink-0">
                        <Heart size={16} />
                      </button>
                    </div>
                    
                    <p className="text-[10px] text-muted leading-relaxed line-clamp-3 mb-auto">
                      {lyricsSnippet}
                    </p>

                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 py-1.5 bg-surface2 border border-white/5 rounded-lg flex items-center justify-center gap-1.5 text-[10px] font-semibold text-white/80 hover:bg-white/10 transition-colors">
                        <FileText size={12} /> View Lyrics
                      </button>
                      <button className="flex-1 py-1.5 bg-primary/10 border border-primary/30 rounded-lg flex items-center justify-center gap-1.5 text-[10px] font-bold text-primary hover:bg-primary/20 transition-colors">
                        <Music2 size={12} /> + Add to Queue
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {bhajans.length === 0 && (
              <div className="text-center text-muted py-10 text-sm">
                No bhajans found. Be the first to add one!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
