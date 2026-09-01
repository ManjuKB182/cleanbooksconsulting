import { useCallback, useState } from "react";
import { toast } from "sonner";

/** Wraps a dashboard's refresh action with a loading flag and a toast, so the
 * header Refresh button behaves the same whether it re-fetches live data (POD)
 * or just re-syncs a demo dataset (the other 4 dashboards). */
export function useRefreshable(refreshFn: () => Promise<void>) {
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshFn();
      toast.success("Dashboard refreshed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not refresh.");
    } finally {
      setRefreshing(false);
    }
  }, [refreshFn]);

  return { refreshing, refresh };
}
