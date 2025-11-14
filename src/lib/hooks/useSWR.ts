import { useState, useEffect, useRef } from 'react';

interface SWROptions {
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  refreshInterval?: number;
  dedupingInterval?: number;
}

interface SWRResponse<T> {
  data: T | undefined;
  error: Error | undefined;
  isLoading: boolean;
  mutate: () => Promise<void>;
}

const cache = new Map<string, { data: any; timestamp: number; promise?: Promise<any> }>();

export function useSWR<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  options: SWROptions = {}
): SWRResponse<T> {
  const {
    revalidateOnFocus = false,
    revalidateOnReconnect = false,
    refreshInterval = 0,
    dedupingInterval = 5000,
  } = options;

  const [data, setData] = useState<T | undefined>(cache.get(key || '')?.data);
  const [error, setError] = useState<Error | undefined>();
  const [isLoading, setIsLoading] = useState(!data && !!key);
  const mutateRef = useRef<() => Promise<void>>();

  const mutate = async () => {
    if (!key) return;
    setIsLoading(true);
    setError(undefined);
    try {
      const result = await fetcher();
      cache.set(key, { data: result, timestamp: Date.now() });
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  mutateRef.current = mutate;

  useEffect(() => {
    if (!key) {
      setIsLoading(false);
      return;
    }

    const cached = cache.get(key);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < dedupingInterval) {
      setData(cached.data);
      setIsLoading(false);
      return;
    }

    if (cached?.promise) {
      cached.promise.then((result) => {
        setData(result);
        setIsLoading(false);
      }).catch((err) => {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setIsLoading(false);
      });
      return;
    }

    const promise = fetcher();
    cache.set(key, { data: cached?.data, timestamp: cached?.timestamp || 0, promise });
    
    promise
      .then((result) => {
        cache.set(key, { data: result, timestamp: Date.now() });
        setData(result);
        setIsLoading(false);
      })
      .catch((err) => {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        setIsLoading(false);
      });
  }, [key, fetcher, dedupingInterval]);

  useEffect(() => {
    if (!revalidateOnFocus || !key) return;
    const handleFocus = () => mutateRef.current?.();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [revalidateOnFocus, key]);

  useEffect(() => {
    if (!revalidateOnReconnect || !key) return;
    const handleOnline = () => mutateRef.current?.();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [revalidateOnReconnect, key]);

  useEffect(() => {
    if (!refreshInterval || !key) return;
    const interval = setInterval(() => mutateRef.current?.(), refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, key]);

  return { data, error, isLoading, mutate: mutateRef.current || (async () => {}) };
}

