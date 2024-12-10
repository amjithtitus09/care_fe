import { useQuery } from "@tanstack/react-query";

import request from "@/Utils/request/request";
import {
  QueryRoute,
  RequestOptions,
  RequestResult,
} from "@/Utils/request/types";

import { mergeRequestOptions } from "./utils";

export interface QueryOptions<TData> extends RequestOptions<TData> {
  prefetch?: boolean;
  refetchOnWindowFocus?: boolean;
  key?: string;
}

export default function useTanStackQueryInstead<TData>(
  route: QueryRoute<TData>,
  options?: QueryOptions<TData>,
) {
  const { data: response, isLoading } = useQuery({
    queryKey: [route.path, options?.pathParams, options?.query],
    queryFn: async () => {
      return await request(route, options);
    },
    enabled: options?.prefetch ?? true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus,
  });

  /**
   * Refetch function that applies new options and fetches fresh data.
   */
  const refetch = async (
    overrides?: QueryOptions<TData>,
  ): Promise<RequestResult<TData>> => {
    const resolvedOptions = overrides
      ? mergeRequestOptions(options || {}, overrides)
      : options;

    // Directly fetch data with resolved options
    return await request(route, resolvedOptions);
  };

  return {
    data: response?.data,
    loading: isLoading,
    error: response?.error,
    res: response?.res,
    refetch,
  };
}
