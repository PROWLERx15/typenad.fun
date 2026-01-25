/**
 * Fetch wrapper with retry logic and timeout handling
 */

export interface FetchWithRetryOptions extends RequestInit {
  maxRetries?: number;
  timeout?: number;
  retryDelay?: number;
}

export async function fetchWithRetry(
  url: string,
  options: FetchWithRetryOptions = {}
): Promise<Response> {
  const {
    maxRetries = 3,
    timeout = 10000,
    retryDelay = 1000,
    ...fetchOptions
  } = options;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Retry on 5xx errors
      if (response.status >= 500 && attempt < maxRetries) {
        console.warn(
          `[fetchWithRetry] Server error (${response.status}), retrying... (attempt ${attempt}/${maxRetries})`
        );
        await new Promise((resolve) => setTimeout(resolve, retryDelay * attempt));
        continue;
      }

      return response;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error(`[fetchWithRetry] Request timeout (attempt ${attempt}/${maxRetries})`);
      } else {
        console.error(`[fetchWithRetry] Request failed (attempt ${attempt}/${maxRetries}):`, error);
      }

      if (attempt === maxRetries) {
        throw new Error(
          `Request failed after ${maxRetries} attempts: ${error.message || 'Unknown error'}`
        );
      }

      // Exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, retryDelay * Math.pow(2, attempt - 1))
      );
    }
  }

  throw new Error('Max retries exceeded');
}

/**
 * Fetch JSON with retry logic
 */
export async function fetchJSONWithRetry<T = any>(
  url: string,
  options: FetchWithRetryOptions = {}
): Promise<T> {
  const response = await fetchWithRetry(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return response.json();
}
