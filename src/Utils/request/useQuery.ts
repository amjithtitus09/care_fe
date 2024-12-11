import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import request from "@/Utils/request/request";
import { QueryRoute, RequestOptions } from "@/Utils/request/types";

import { mergeRequestOptions } from "./utils";

export interface QueryOptions<TData> extends RequestOptions<TData> {
  prefetch?: boolean;
  refetchOnWindowFocus?: boolean;
  key?: string;
}

/**
 * @deprecated use `useQuery` from `@tanstack/react-query` instead.
 */
export default function useTanStackQueryInstead<TData>(
  route: QueryRoute<TData>,
  options?: QueryOptions<TData>,
) {
  const [overrides, setOverrides] = useState<QueryOptions<TData>>();
  const {
    data: response,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [route.path, options?.pathParams, options?.query],
    queryFn: async ({ signal }) => {
      const resolvedOptions = overrides
        ? mergeRequestOptions(options || {}, overrides)
        : options;

      return await request(route, { ...resolvedOptions, signal });
    },
    enabled: options?.prefetch ?? true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus,
  });

  return {
    data: response?.data,
    loading: isLoading,
    error: response?.error,
    res: response?.res,
    /**
     * Refetch function that applies new options and fetches fresh data.
     */
    refetch: async (overrides?: QueryOptions<TData>) => {
      setOverrides(overrides);
      await refetch();
      return response!;
    },
  };
}
