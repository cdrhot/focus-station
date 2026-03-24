import React, { useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useTimer } from '../hooks/useTimer';

const TimerBase: React.FC = () => {
  const { timeLeft, isActive, toggle, reset, setDuration } = useTimer(25);
  const [showSettings, setShowSettings] = useState(false);
  const [editMinutes, setEditMinutes] = useState('25');
  const [editSeconds, setEditSeconds] = useState('00');

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const formatTime = (val: number) => val.toString().padStart(2, '0');

  const openSettings = () => {
    setEditMinutes(minutes.toString());
    setEditSeconds(formatTime(seconds));
    setShowSettings(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedMinutes = Number.parseInt(editMinutes, 10);
    const parsedSeconds = Number.parseInt(editSeconds, 10);

    const nextMinutes = Number.isFinite(parsedMinutes) ? parsedMinutes : 0;
    const nextSeconds = Number.isFinite(parsedSeconds) ? parsedSeconds : 0;

    if (nextMinutes >= 0 && nextMinutes <= 120 && nextSeconds >= 0 && nextSeconds <= 59) {
      setDuration(nextMinutes, nextSeconds);
      setShowSettings(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center group">
      <div className="relative flex items-center justify-center">
        {/* Progress Ring */}
        <svg className="w-[450px] h-[450px] transform -rotate-90">
          <circle
            cx="225"
            cy="225"
            fill="transparent"
            r="210"
            stroke="var(--ring-track)"
            strokeWidth="2"
          />
          <circle
            cx="225"
            cy="225"
            fill="transparent"
            r="210"
            stroke="var(--accent)"
            strokeDasharray="1319"
            strokeDashoffset={1319 - (1319 * timeLeft) / (25 * 60)}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        {/* Timer Display */}
        <div className="absolute flex flex-col items-center">
          <span
            onClick={openSettings}
            className="timer-text font-headline font-light text-[10rem] leading-none text-on-background tracking-tighter cursor-pointer select-none hover:text-primary transition-colors"
          >
            {formatTime(minutes)}:{formatTime(seconds)}
          </span>

          <div className="flex gap-6 mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <button
              onClick={toggle}
              className="bg-primary text-on-primary px-8 py-3 rounded-xl font-headline tracking-widest text-sm hover:scale-95 transition-all duration-300 flex items-center gap-2"
            >
              {isActive ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
              {isActive ? 'PAUSE' : 'START'}
            </button>
            <button
              onClick={() => reset()}
              className="bg-white/10 text-on-surface px-8 py-3 rounded-xl font-headline tracking-widest text-sm hover:scale-95 transition-all duration-300 border border-white/5 flex items-center gap-2"
            >
              <RotateCcw size={18} />
              RESET
            </button>
          </div>

          <button
            onClick={openSettings}
            className="mt-4 rounded-full border border-white/15 bg-white/5 px-4 py-1 text-[10px] font-headline uppercase tracking-widest text-slate-300 hover:text-primary"
          >
            Timer Settings
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/35 backdrop-blur-sm">
          <form onSubmit={handleEditSubmit} className="glass w-[320px] rounded-2xl border border-white/15 p-5 shadow-2xl">
            <h3 className="text-sm font-headline uppercase tracking-widest text-on-surface">Timer Settings</h3>
            <p className="mt-1 text-xs text-slate-400">Set a clean MM:SS duration.</p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-xs text-slate-400">
                Minutes
                <input
                  autoFocus
                  type="number"
                  min={0}
                  max={120}
                  step={1}
                  inputMode="numeric"
                  value={editMinutes}
                  onChange={(e) => setEditMinutes(e.target.value.replace(/[^0-9]/g, ''))}
                  className="h-10 rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-on-surface focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs text-slate-400">
                Seconds
                <input
                  type="number"
                  min={0}
                  max={59}
                  step={1}
                  inputMode="numeric"
                  value={editSeconds}
                  onChange={(e) => setEditSeconds(e.target.value.replace(/[^0-9]/g, ''))}
                  className="h-10 rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-on-surface focus:outline-none"
                />
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-wider text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-primary px-4 py-2 text-xs uppercase tracking-wider text-on-primary"
              >
                Apply
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="mt-8">
        <span className="bg-white/5 text-primary px-4 py-1 rounded-full text-xs font-headline tracking-[0.2em] uppercase">
          Deep Work Phase
        </span>
      </div>
    </div>
  );
};

export const Timer = React.memo(TimerBase);
