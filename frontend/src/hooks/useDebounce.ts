import { useCallback, useEffect, useRef, useState } from 'react';

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    timer.current = setTimeout(() => setDebounced(value), delay);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [value, delay]);

  return debounced;
}

export function useDebouncedCallback<A extends unknown[]>(
  callback: (...args: A) => void,
  delay = 300,
): (...args: A) => void {
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const cb = useRef(callback);
  cb.current = callback;

  return useCallback(
    (...args: A) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => cb.current(...args), delay);
    },
    [delay],
  );
}
