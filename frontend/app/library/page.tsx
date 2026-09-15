'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchBhajans } from '../../lib/api';
import { Bhajan } from '@bhagi-geet/shared';
import { Search, Plus, ArrowLeft } from 'lucide-react';

export default function Library() {
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
    
    // Simple debounce
    const timeout = setTimeout(loadData, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-muted hover:text-white flex items-center gap-2 transition-colors">
          <ArrowLeft size={20} /> Back
        </Link>
        <Link href="/library/add" className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition-colors">
          <Plus size={18} /> Add Bhajan
        </Link>
      </div>

      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Bhajan Library</h1>
        <div className="relative">
          <Search className="absolute left-3 top-3 text-muted" size={20} />
          <input 
            type="text"
            placeholder="Search bhajans..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center text-muted py-10">Loading...</div>
      ) : (
        <div className="grid gap-4">
          {bhajans.map((bhajan) => (
            <div key={bhajan.id} className="glass-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
              <div>
                <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">{bhajan.title}</h3>
                <p className="text-sm text-muted mt-1">
                  Added by: {bhajan.added_by || 'Unknown'} • {bhajan.lyrics.length} lines
                </p>
              </div>
              {/* Optional: Add a "View Lyrics" button or expander here */}
            </div>
          ))}
          {bhajans.length === 0 && (
            <div className="text-center text-muted py-10">No bhajans found.</div>
          )}
        </div>
      )}
    </div>
  );
}
