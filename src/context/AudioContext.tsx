import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getDefaultAppSettings, getSettingsWithFallback, saveSettingsWithFallback } from '../api/settings';

interface AudioContextType {
  isMusicPlaying: boolean;
  isRainActive: boolean;
  musicVolume: number;
  rainVolume: number;
  toggleMusic: () => void;
  toggleRain: () => void;
  setMusicVolume: (value: number) => void;
  setRainVolume: (value: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const MUSIC_URL = 'https://stream.zeno.fm/0r0xa792kwzuv';
const RAIN_URL = '/audio/rain.mp3';

function clampVolume(value: number): number {
  return Math.max(0, Math.min(1, value));
}

const AudioProviderBase: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const defaults = getDefaultAppSettings();

  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isRainActive, setIsRainActive] = useState(defaults.isRainActive);
  const [musicVolume, setMusicVolumeState] = useState(defaults.musicVolume);
  const [rainVolume, setRainVolumeState] = useState(defaults.rainVolume);

  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const rainAudioRef = useRef<HTMLAudioElement | null>(null);
  const hasHydratedSettingsRef = useRef(false);
  const audioElements = useMemo(() => {
    if (typeof window === 'undefined') {
      return { music: null as HTMLAudioElement | null, rain: null as HTMLAudioElement | null };
    }

    return {
      music: new Audio(MUSIC_URL),
      rain: new Audio(RAIN_URL),
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // Keep UI interactive even when browser audio APIs are unavailable.
    const hasAudioApi = typeof window.AudioContext !== 'undefined' || typeof (window as Window & { webkitAudioContext?: unknown }).webkitAudioContext !== 'undefined';
    if (!hasAudioApi) {
      console.warn('Audio API unavailable in this browser.');
      return;
    }

    const music = audioElements.music;
    const rain = audioElements.rain;

    if (!music || !rain) {
      return;
    }

    music.loop = true;
    rain.loop = true;

    music.volume = musicVolume;
    rain.volume = rainVolume;

    music.preload = 'none';
    rain.preload = 'none';

    musicAudioRef.current = music;
    rainAudioRef.current = rain;

    return () => {
      music.pause();
      rain.pause();
      musicAudioRef.current = null;
      rainAudioRef.current = null;
    };
  }, [audioElements]);

  useEffect(() => {
    const music = musicAudioRef.current;
    if (!music) {
      return;
    }

    music.volume = musicVolume;
  }, [musicVolume]);

  useEffect(() => {
    const rain = rainAudioRef.current;
    if (!rain) {
      return;
    }

    rain.volume = rainVolume;
  }, [rainVolume]);

  useEffect(() => {
    const music = musicAudioRef.current;
    if (!music) {
      return;
    }

    const attemptPlay = async () => {
      try {
        await music.play();
      } catch (error) {
        if (error instanceof DOMException && error.name === 'NotSupportedError') {
          console.error('Music source is not supported by this browser:', error);
        } else {
          console.error('Music playback blocked:', error);
        }
        setIsMusicPlaying(false);
      }
    };

    if (isMusicPlaying) {
      void attemptPlay();
      return;
    }

    music.pause();
  }, [isMusicPlaying]);

  useEffect(() => {
    const rain = rainAudioRef.current;
    if (!rain) {
      return;
    }

    const attemptPlay = async () => {
      try {
        await rain.play();
      } catch (error) {
        if (error instanceof DOMException && error.name === 'NotSupportedError') {
          console.error('Rain source is not supported by this browser:', error);
        } else {
          console.error('Rain playback blocked:', error);
        }
        console.warn('Place a local rain file at public/audio/rain.mp3 for the most reliable playback.');
        setIsRainActive(false);
      }
    };

    if (isRainActive) {
      void attemptPlay();
      return;
    }

    rain.pause();
  }, [isRainActive]);

  useEffect(() => {
    void (async () => {
      const settings = await getSettingsWithFallback();
      setMusicVolumeState(settings.musicVolume);
      setRainVolumeState(settings.rainVolume);
      setIsRainActive(settings.isRainActive);
      hasHydratedSettingsRef.current = true;
    })();
  }, []);

  useEffect(() => {
    if (!hasHydratedSettingsRef.current) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void saveSettingsWithFallback({ musicVolume });
    }, 250);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [musicVolume]);

  useEffect(() => {
    if (!hasHydratedSettingsRef.current) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void saveSettingsWithFallback({ rainVolume });
    }, 250);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [rainVolume]);

  useEffect(() => {
    if (!hasHydratedSettingsRef.current) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void saveSettingsWithFallback({ isRainActive });
    }, 150);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [isRainActive]);

  const setMusicVolume = useCallback((value: number) => {
    const nextVolume = clampVolume(value);
    setMusicVolumeState(nextVolume);
  }, []);

  const setRainVolume = useCallback((value: number) => {
    const nextVolume = clampVolume(value);
    setRainVolumeState(nextVolume);
  }, []);

  const toggleMusic = useCallback(() => {
    setIsMusicPlaying((current) => !current);
  }, []);

  const toggleRain = useCallback(() => {
    setIsRainActive((current) => !current);
  }, []);

  const value = useMemo(
    () => ({
      isMusicPlaying,
      isRainActive,
      musicVolume,
      rainVolume,
      toggleMusic,
      toggleRain,
      setMusicVolume,
      setRainVolume,
    }),
    [isMusicPlaying, isRainActive, musicVolume, rainVolume]
  );

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};

export const AudioProvider = React.memo(AudioProviderBase);
AudioProvider.displayName = 'AudioProvider';

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }

  return context;
};
