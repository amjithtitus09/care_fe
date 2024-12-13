import careConfig from "@careConfig";

import { QueryOptions, Route } from "@/Utils/request/types";
import { makeHeaders, makeUrl } from "@/Utils/request/utils";

import { ResponseError } from "../response/responseError";
import { getResponseBody } from "./request";

async function queryRequest<TData, TBody>(
  { path, method, noAuth }: Route<TData, TBody>,
  options?: QueryOptions<TBody> & { signal?: AbortSignal },
): Promise<TData> {
  const url = `${careConfig.apiUrl}${makeUrl(path, options?.queryParams, options?.pathParams)}`;

  const requestOptions: RequestInit = {
    method,
    headers: makeHeaders(noAuth ?? false),
    signal: options?.signal,
  };

  if (options?.body) {
    requestOptions.headers = {
      ...requestOptions.headers,
      'Content-Type': 'application/json'
    };
    requestOptions.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, requestOptions);

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ detail: "Something went wrong!" }));
    throw new ResponseError({
      name: error.name,
      message: "Request Failed",
      cause: {
        ...error,
        code: error.code || (res.status === 404 ? "not_found" : undefined),
        status: res.status,
        silent: options?.silent,
        detail: error.detail || "Something went wrong!",
      },
    });
  }

  return getResponseBody<TData>(res);
}

/**
 * Creates a TanStack Query compatible request function
 */
function createQuery<TData, TBody>(
  route: Route<TData, TBody>,
  options?: QueryOptions,
) {
  return async ({ signal }: { signal?: AbortSignal } = {}) => {
    return queryRequest(route, { ...options, signal });
  };
}

const api = {
  query: createQuery,
} as const;

export default api;
