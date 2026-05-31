/**
 * Tiny typed HTTP client. This is the ONLY place that knows about `fetch`,
 * base URLs and error shaping — feature `api/` modules depend on this
 * abstraction, not on the network primitive directly (Dependency Inversion).
 */

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly url: string,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export type HttpClient = {
  get<T>(path: string, signal?: AbortSignal): Promise<T>;
  post<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T>;
};

export type HttpClientConfig = {
  baseUrl: string;
  /** Injectable for tests; defaults to global fetch. */
  fetchFn?: typeof fetch;
  defaultHeaders?: Record<string, string>;
};

export function createHttpClient({
  baseUrl,
  fetchFn = fetch,
  defaultHeaders = {},
}: HttpClientConfig): HttpClient {
  async function request<T>(
    path: string,
    init: RequestInit,
    signal?: AbortSignal,
  ): Promise<T> {
    const url = `${baseUrl}${path}`;
    const response = await fetchFn(url, {
      ...init,
      signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...defaultHeaders,
        ...init.headers,
      },
    });

    if (!response.ok) {
      throw new HttpError(
        response.status,
        url,
        `Request failed with status ${response.status}`,
      );
    }

    return (await response.json()) as T;
  }

  return {
    get: (path, signal) => request(path, { method: 'GET' }, signal),
    post: (path, body, signal) =>
      request(path, { method: 'POST', body: JSON.stringify(body) }, signal),
  };
}
