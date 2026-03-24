import React from 'react';
import { SkipBack, SkipForward, Play, Pause, Shuffle, Repeat, Music, ListMusic } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { cn } from '../lib/utils';

export const Player: React.FC = () => {
  const { isMusicPlaying, toggleMusic, musicVolume, setMusicVolume } = useAudio();

  return (
    <footer className="fixed bottom-0 w-full z-50 glass flex justify-between items-center px-12 py-3 border-t border-white/10">
      <div className="flex items-center gap-4 w-1/3">
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
          <Music size={20} className="text-primary" />
        </div>
        <div>
          <p className="text-on-surface font-medium text-sm">Midnight Chill Beats</p>
          <p className="text-slate-500 text-[10px] uppercase tracking-widest font-headline">Lofi Radio</p>
          <div className="mt-1 flex items-end gap-1 h-4">
            {[0, 1, 2, 3].map((bar) => (
              <span
                key={bar}
                className={cn('equalizer-bar', isMusicPlaying && 'playing')}
                style={{ animationDelay: `${bar * 120}ms` }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1 flex-1">
        <div className="flex items-center gap-6">
          <button className="text-slate-500 hover:text-primary transition-colors"><Shuffle size={18} /></button>
          <button className="text-on-surface hover:text-primary transition-colors"><SkipBack size={20} /></button>
          <button
            onClick={toggleMusic}
            className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center hover:scale-95 transition-all"
          >
            {isMusicPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>
          <button className="text-on-surface hover:text-primary transition-colors"><SkipForward size={20} /></button>
          <button className="text-slate-500 hover:text-primary transition-colors"><Repeat size={18} /></button>
        </div>
        <div className="flex items-center gap-3 w-full max-w-md">
          <span className="text-[10px] text-slate-500 font-headline">02:14</span>
          <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden relative">
            <div className="absolute top-0 left-0 h-full w-[45%] bg-primary" />
          </div>
          <span className="text-[10px] text-slate-500 font-headline">04:30</span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-6 w-1/3 text-slate-500">
        <span className="text-xs font-headline uppercase tracking-widest hover:text-primary transition-colors cursor-pointer">Timer Settings</span>
        <span className="text-xs font-headline uppercase tracking-widest hover:text-primary transition-colors cursor-pointer">Ambient Mix</span>
        <div className="flex items-center gap-2">
          <Music size={16} className="text-primary" />
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(musicVolume * 100)}
            onInput={(event) => setMusicVolume(Number((event.target as HTMLInputElement).value) / 100)}
            className="w-20 accent-[var(--accent)]"
            aria-label="Music volume"
          />
        </div>
        <button className="hover:text-primary transition-colors"><Music size={18} /></button>
        <button className="hover:text-primary transition-colors"><ListMusic size={18} /></button>
      </div>
    </footer>
  );
};
