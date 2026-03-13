import {useState, useCallback, useEffect} from 'react';

interface UseRefreshControlOptions {
  fetching: boolean;
  refetch: (opts?: Record<string, unknown>) => void;
}

export function useRefreshControl({fetching, refetch}: UseRefreshControlOptions) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch({requestPolicy: 'network-only'});
  }, [refetch]);

  useEffect(() => {
    if (!fetching) {
      setRefreshing(false);
    }
  }, []);

  return {refreshing, onRefresh};
}
