import { useCallback, useEffect, useState } from 'react';

export function useAsyncData<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    setError(false);
    loader()
      .then((result) => {
        if (active) setData(result);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
    // loader is intentionally keyed by version only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  const reload = useCallback(() => {
    setData(null);
    setVersion((value) => value + 1);
  }, []);

  return { data, error, reload };
}
