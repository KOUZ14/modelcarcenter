import type { ApiError } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY = 300;

type ApiClientOptions = RequestInit & {
  query?: Record<string, string | number | undefined>;
  skipJson?: boolean;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const buildUrl = (path: string, query?: Record<string, string | number | undefined>) => {
  const url = path.startsWith("http") ? new URL(path) : new URL(path.replace(/^\//, ""), `${BASE_URL.replace(/\/$/, "")}/`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
};

const parseJson = async (response: Response) => {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch (error) {
    throw {
      status: response.status,
      message: "Failed to parse server response",
      details: text,
    } satisfies ApiError;
  }
};

export async function apiClient<T = unknown>(path: string, options: ApiClientOptions = {}, attempt = 0): Promise<T> {
  const { query, skipJson, headers, body, ...rest } = options;

  const url = buildUrl(path, query);

  const requestHeaders = new Headers(headers);
  requestHeaders.set("Accept", "application/json");
  if (!skipJson && body !== undefined && !(body instanceof FormData)) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...rest,
    body: body && !(body instanceof FormData) && !skipJson ? JSON.stringify(body) : (body as BodyInit | null | undefined),
    headers: requestHeaders,
    cache: "no-store",
  });

  if (response.status === 429 && attempt < MAX_RETRIES) {
    const delay = RETRY_BASE_DELAY * Math.pow(2, attempt);
    await sleep(delay);
    return apiClient<T>(path, options, attempt + 1);
  }

  if (!response.ok) {
    const errorPayload = (await parseJson(response)) ?? undefined;
    const apiError: ApiError = {
      status: response.status,
      message:
        typeof errorPayload === "object" && errorPayload && "message" in errorPayload
          ? (errorPayload as Record<string, string>).message ?? response.statusText
          : response.statusText,
      details: errorPayload,
    };
    throw apiError;
  }

  if (response.status === 204 || skipJson) {
    return undefined as T;
  }

  return (await parseJson(response)) as T;
}

export const apiRoutes = {
  accounts: {
    base: "/accounts",
    detail: (accountId: string) => `/accounts/${accountId}`,
    listings: (accountId: string) => `/accounts/${accountId}/listings`,
    listingDetail: (accountId: string, listingId: string) => `/accounts/${accountId}/listings/${listingId}`,
  },
  search: (query: string) => `/search?q=${encodeURIComponent(query)}`,
  payments: {
    base: "/payments",
    detail: (paymentId: string) => `/payments/${paymentId}`,
  },
};
