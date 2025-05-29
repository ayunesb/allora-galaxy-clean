import { useState, useCallback, useEffect } from "react";
import { notifyError } from "@/lib/notifications/toast";

type QueryOptions = {
  enabled?: boolean;
  retries?: number;
  retryDelay?: number;
  showErrorToast?: boolean;
};

/**
 * Hook for handling data fetching with partial data display on errors
 */
export function usePartialDataFetch<T extends Record<string, any>>(
  queries: Record<string, () => Promise<any>>,
  options: QueryOptions = {},
) {
  const [state, setState] = useState<{
    data: Partial<T>;
    isLoading: boolean;
    errors: Record<string, Error | null>;
    completedQueries: string[];
    failedQueries: string[];
  }>({
    data: {},
    isLoading: true,
    errors: {},
    completedQueries: [],
    failedQueries: [],
  });

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    const results: Partial<T> = {};
    const errors: Record<string, Error | null> = {};
    const completedQueries: string[] = [];
    const failedQueries: string[] = [];

    await Promise.all(
      Object.entries(queries).map(async ([key, queryFn]) => {
        try {
          const result = await queryFn();
          results[key as keyof T] = result;
          completedQueries.push(key);
        } catch (error: any) {
          errors[key] =
            error instanceof Error
              ? error
              : new Error(error?.message || "Unknown error");
          failedQueries.push(key);

          if (options.showErrorToast) {
            notifyError({
              title: `Error loading ${key}`,
              description: error?.message || "Failed to load data",
            });
          }
        }
      }),
    );

    setState({
      data: results,
      isLoading: false,
      errors,
      completedQueries,
      failedQueries,
    });

    return { results, errors };
  }, [queries, options.showErrorToast]);

  useEffect(() => {
    if (options.enabled !== false) {
      fetchData();
    }
  }, [fetchData, options.enabled]);

  const retryQuery = useCallback(
    async (key: string) => {
      if (!queries[key]) return;

      setState((prev) => ({
        ...prev,
        errors: { ...prev.errors, [key]: null },
      }));

      try {
        const result = await queries[key]();
        setState((prev) => ({
          ...prev,
          data: { ...prev.data, [key]: result },
          completedQueries: [
            ...prev.completedQueries.filter((k) => k !== key),
            key,
          ],
          failedQueries: prev.failedQueries.filter((k) => k !== key),
          errors: { ...prev.errors, [key]: null },
        }));

        return result;
      } catch (error: any) {
        const formattedError =
          error instanceof Error
            ? error
            : new Error(error?.message || "Unknown error");
        setState((prev) => ({
          ...prev,
          errors: { ...prev.errors, [key]: formattedError },
          failedQueries: [...prev.failedQueries.filter((k) => k !== key), key],
          completedQueries: prev.completedQueries.filter((k) => k !== key),
        }));

        if (options.showErrorToast) {
          notifyError({
            title: `Error loading ${key}`,
            description: error?.message || "Failed to load data",
          });
        }

        throw error;
      }
    },
    [queries, options.showErrorToast],
  );

  return {
    ...state,
    refetch: fetchData,
    retryQuery,
    isPartialData:
      state.failedQueries.length > 0 && state.completedQueries.length > 0,
    isComplete: state.completedQueries.length === Object.keys(queries).length,
  };
}
