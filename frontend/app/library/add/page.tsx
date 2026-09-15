'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { addBhajan } from '../../../lib/api';
import { LyricParagraph } from '@bhagi-geet/shared';
import { ArrowLeft, Plus, Trash2, Save, GripVertical } from 'lucide-react';

export default function AddBhajan() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [addedBy, setAddedBy] = useState('');
  const [lines, setLines] = useState<LyricParagraph[]>([{ hindi: '', english: '' }]);
  const [loading, setLoading] = useState(false);

  const handleAddLine = () => setLines([...lines, { hindi: '', english: '' }]);
  
  const handleRemoveLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleUpdateLine = (index: number, field: keyof LyricParagraph, value: string) => {
    const newLines = [...lines];
    newLines[index][field] = value;
    setLines(newLines);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newLines = [...lines];
      [newLines[index - 1], newLines[index]] = [newLines[index], newLines[index - 1]];
      setLines(newLines);
    } else if (direction === 'down' && index < lines.length - 1) {
      const newLines = [...lines];
      [newLines[index + 1], newLines[index]] = [newLines[index], newLines[index + 1]];
      setLines(newLines);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) return alert('Title is required');
    const validLines = lines.filter(l => l.hindi.trim());
    if (validLines.length === 0) return alert('At least one Hindi line is required');
    
    setLoading(true);
    try {
      await addBhajan({
        title,
        language: 'both',
        lyrics: validLines,
        addedBy: addedBy || 'Anonymous'
      });
      router.push('/library');
    } catch (error) {
      alert('Failed to save bhajan');
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/library" className="text-muted hover:text-white flex items-center gap-2 transition-colors">
          <ArrowLeft size={20} /> Back
        </Link>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-primary hover:bg-orange-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-semibold transition-colors disabled:opacity-50"
        >
          <Save size={18} /> {loading ? 'Saving...' : 'Save Bhajan'}
        </button>
      </div>

      <div className="glass-card p-6 md:p-8 space-y-6">
        <input 
          type="text"
          placeholder="Bhajan Title (e.g. Jai Jagdish Hare)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-transparent border-b border-white/20 pb-2 text-3xl font-bold text-white focus:outline-none focus:border-primary transition-colors placeholder:text-muted"
        />
        
        <input 
          type="text"
          placeholder="Your Name (Optional)"
          value={addedBy}
          onChange={(e) => setAddedBy(e.target.value)}
          className="w-full max-w-md bg-surface border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary"
        />

        <div className="space-y-4 pt-4">
          <h3 className="font-semibold text-lg">Lyrics</h3>
          {lines.map((line, idx) => (
            <div key={idx} className="flex flex-col md:flex-row gap-3 bg-surface/50 p-4 rounded-xl border border-white/5 relative group">
              <div className="flex flex-col gap-2 w-12 items-center justify-center text-muted">
                <button onClick={() => handleMove(idx, 'up')} disabled={idx === 0} className="hover:text-white disabled:opacity-30">▲</button>
                <span className="text-xs">{idx + 1}</span>
                <button onClick={() => handleMove(idx, 'down')} disabled={idx === lines.length - 1} className="hover:text-white disabled:opacity-30">▼</button>
              </div>
              
              <div className="flex-1 space-y-3">
                <input 
                  type="text"
                  placeholder="Hindi Line (Required)"
                  value={line.hindi}
                  onChange={(e) => handleUpdateLine(idx, 'hindi', e.target.value)}
                  className="w-full bg-bg border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary"
                />
                <input 
                  type="text"
                  placeholder="English Transliteration (Optional)"
                  value={line.english || ''}
                  onChange={(e) => handleUpdateLine(idx, 'english', e.target.value)}
                  className="w-full bg-bg border border-white/10 rounded-lg p-3 text-muted focus:outline-none focus:border-primary focus:text-white"
                />
              </div>

              <button 
                onClick={() => handleRemoveLine(idx)}
                className="p-3 text-red-400 hover:bg-red-400/10 rounded-lg h-fit self-start md:self-center transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          
          <button 
            onClick={handleAddLine}
            className="w-full py-4 border-2 border-dashed border-white/20 rounded-xl text-muted hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Plus size={20} /> Add Next Line
          </button>
        </div>
      </div>
    </div>
  );
}
