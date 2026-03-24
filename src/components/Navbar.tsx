import React from 'react';
import { Moon, Sunset, Snowflake, Hexagon, Droplets, ListTodo } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAudio } from '../context/AudioContext';
import { cn } from '../lib/utils';
import { SyncStatusBadge } from './SyncStatus';

type Theme = 'night-blue' | 'graphite' | 'solar' | 'arctic';

interface NavbarProps {
  tasksOpen: boolean;
  onToggleTasks: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ tasksOpen, onToggleTasks }) => {
  const { theme, setTheme } = useTheme();
  const { rainVolume, setRainVolume, isRainActive, toggleRain } = useAudio();

  const themes: { id: Theme; icon: React.ComponentType<{ size?: number; className?: string }>; label: string; swatch: string }[] = [
    { id: 'night-blue', icon: Moon, label: 'Night Blue', swatch: '#68b7ff' },
    { id: 'graphite', icon: Hexagon, label: 'Graphite', swatch: '#b5becd' },
    { id: 'solar', icon: Sunset, label: 'Solar', swatch: '#ffb266' },
    { id: 'arctic', icon: Snowflake, label: 'Arctic', swatch: '#0b6ea8' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 glass flex justify-between items-center px-8 py-4 shadow-lg">
      <div className="flex items-center gap-4">
        <span className="text-2xl font-bold text-primary font-headline tracking-tight">Focus Station</span>
      </div>
      
      <div className="flex items-center gap-8">
        <button
          onClick={onToggleTasks}
          className={cn(
            'flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-headline uppercase tracking-wider transition-colors',
            tasksOpen
              ? 'border-primary/40 bg-primary/15 text-primary'
              : 'border-white/15 bg-white/5 text-slate-300 hover:text-primary'
          )}
          title={tasksOpen ? 'Close Tasks' : 'Open Tasks'}
        >
          <ListTodo size={14} />
          Tasks
        </button>

        <SyncStatusBadge />

        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-full px-2">
          {themes.map(({ id, icon: Icon, label, swatch }) => (
            <button
              key={id}
              onClick={() => setTheme(id)}
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-2 transition-all duration-300 hover:bg-white/10",
                theme === id ? "bg-white/10 text-primary" : "text-slate-400"
              )}
              title={label}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: swatch }} />
              <Icon size={14} className="opacity-90" />
              <span className="text-[10px] font-headline uppercase tracking-wider">{label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full">
          <button
            onClick={toggleRain}
            className={cn(
              'rounded-full p-1.5 transition-colors',
              isRainActive ? 'bg-primary/20 text-primary' : 'text-slate-400 hover:text-primary'
            )}
            title={isRainActive ? 'Disable Rain' : 'Enable Rain'}
          >
            <Droplets size={14} />
          </button>

          <span className="text-[10px] font-headline text-slate-400 uppercase tracking-widest">Rain Ambiance</span>

          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(rainVolume * 100)}
            onInput={(event) => setRainVolume(Number((event.target as HTMLInputElement).value) / 100)}
            className="w-24 accent-[var(--accent)]"
            aria-label="Rain ambiance volume"
          />
        </div>
      </div>
    </nav>
  );
};
