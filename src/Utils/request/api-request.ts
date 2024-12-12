import { RequestResult, Route } from "@/Utils/request/types";

import request from "./request";

interface QueryOptions<TData> {
  pathParams?: Record<string, string>;
  queryParams?: Record<string, string>;
  silent?: boolean;
  onResponse?: (result: RequestResult<TData>) => void;
}

/**
 * Creates a TanStack Query compatible request function
 */
function createQuery<TData, TBody>(
  route: Route<TData, TBody>,
  options?: QueryOptions<TData>,
) {
  return async ({
    signal,
  }: {
    signal: AbortSignal;
  }): Promise<RequestResult<TData>> => {
    return request(route, {
      pathParams: options?.pathParams,
      query: options?.queryParams,
      signal,
      silent: options?.silent,
      onResponse: options?.onResponse,
    });
  };
}

const api = {
  query: createQuery,
} as const;

export default api;
