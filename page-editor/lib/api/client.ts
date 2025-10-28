import type { RequestInit } from "next/dist/server/web/spec-extension/request";

const DEFAULT_BASE_URL = "http://localhost:3020";

export const EDITOR_HOME_URL =
  process.env.NEXT_PUBLIC_EDITOR_HOME_URL ?? DEFAULT_BASE_URL;

interface ApiRequestOptions extends RequestInit {
  query?: Record<string, string | number | boolean | undefined>;
}

export class ApiError extends Error {
  status: number;

  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export function buildUrl(path: string, query?: ApiRequestOptions["query"]) {
  const url = new URL(path, EDITOR_HOME_URL);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }
      url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

export async function apiRequest<T>(
  path: string,
  { query, headers, ...init }: ApiRequestOptions = {},
): Promise<T> {
  const url = buildUrl(path, query);

  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(headers ?? {}),
    },
  });

  if (!response.ok) {
    let details: unknown;
    try {
      details = await response.json();
    } catch {
      details = await response.text();
    }
    throw new ApiError(
      `Request to ${url} failed with status ${response.status}`,
      response.status,
      details,
    );
  }

  try {
    return (await response.json()) as T;
  } catch (error) {
    throw new ApiError(
      `Failed to parse JSON response from ${url}`,
      response.status,
      error,
    );
  }
}
