import { useState, useEffect, useCallback, useRef } from 'react';

export function useTimer(initialMinutes: number = 25) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const initialMinutesRef = useRef(initialMinutes);

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setIsActive(false);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive]);

  const toggle = useCallback(() => setIsActive((prev) => !prev), []);
  
  const reset = useCallback((minutes: number = initialMinutesRef.current) => {
    setIsActive(false);
    setTimeLeft(minutes * 60);
  }, []);

  const setMinutes = useCallback((minutes: number) => {
    setTimeLeft(minutes * 60);
  }, []);

  const setDuration = useCallback((minutes: number, seconds: number = 0) => {
    const safeMinutes = Math.max(0, Math.floor(minutes));
    const safeSeconds = Math.max(0, Math.min(59, Math.floor(seconds)));
    setTimeLeft((safeMinutes * 60) + safeSeconds);
  }, []);

  return {
    timeLeft,
    isActive,
    toggle,
    reset,
    setMinutes,
    setDuration,
  };
}
