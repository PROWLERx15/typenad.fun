/**
 * API Helper Utilities
 * Provides consistent error handling, retry logic, and fallback support for API calls
 */

interface ApiCallOptions<T> {
  retries?: number;
  fallback?: T;
  errorMessage?: string;
  retryDelay?: number;
}

/**
 * Handles API calls with retry logic and error handling
 * 
 * @param apiCall - Function that returns a Promise<Response>
 * @param options - Configuration options
 * @returns The parsed response data or fallback value
 */
export async function handleApiCall<T>(
  apiCall: () => Promise<Response>,
  options: ApiCallOptions<T> = {}
): Promise<T | null> {
  const { 
    retries = 3, 
    fallback, 
    errorMessage = 'API call failed',
    retryDelay = 1000 
  } = options;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await apiCall();

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      const isLastAttempt = attempt === retries - 1;
      
      if (isLastAttempt) {
        console.error(`${errorMessage}:`, error);
        return fallback !== undefined ? fallback : null;
      }

      // Exponential backoff
      const delay = retryDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return fallback !== undefined ? fallback : null;
}

/**
 * Categorizes API errors for better user messaging
 */
export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  VALIDATION = 'validation',
  SERVER = 'server',
  NOT_FOUND = 'not_found',
  UNKNOWN = 'unknown',
}

/**
 * Categorizes an error based on its properties
 */
export function categorizeError(error: any): ErrorCategory {
  if (!error) return ErrorCategory.UNKNOWN;

  const message = error.message?.toLowerCase() || '';
  const status = error.status || error.statusCode;

  // Network errors
  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('timeout') ||
    message.includes('connection')
  ) {
    return ErrorCategory.NETWORK;
  }

  // Authentication errors
  if (
    status === 401 ||
    status === 403 ||
    message.includes('unauthorized') ||
    message.includes('authentication') ||
    message.includes('wallet')
  ) {
    return ErrorCategory.AUTHENTICATION;
  }

  // Validation errors
  if (
    status === 400 ||
    message.includes('invalid') ||
    message.includes('validation') ||
    message.includes('required')
  ) {
    return ErrorCategory.VALIDATION;
  }

  // Not found errors
  if (status === 404 || message.includes('not found')) {
    return ErrorCategory.NOT_FOUND;
  }

  // Server errors
  if (status >= 500 || message.includes('server error')) {
    return ErrorCategory.SERVER;
  }

  return ErrorCategory.UNKNOWN;
}

/**
 * Gets a user-friendly error message based on error category
 */
export function getUserFriendlyErrorMessage(error: any): string {
  const category = categorizeError(error);

  const messages: Record<ErrorCategory, string> = {
    [ErrorCategory.NETWORK]: 'Network error. Please check your connection and try again.',
    [ErrorCategory.AUTHENTICATION]: 'Please connect your wallet to continue.',
    [ErrorCategory.VALIDATION]: 'Invalid input. Please check your data and try again.',
    [ErrorCategory.NOT_FOUND]: 'The requested resource was not found.',
    [ErrorCategory.SERVER]: 'Server error. Please try again later.',
    [ErrorCategory.UNKNOWN]: 'An unexpected error occurred. Please try again.',
  };

  return messages[category];
}

/**
 * Checks if the user is online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

/**
 * Waits for the user to come back online
 */
export function waitForOnline(timeout = 30000): Promise<boolean> {
  return new Promise((resolve) => {
    if (isOnline()) {
      resolve(true);
      return;
    }

    const timeoutId = setTimeout(() => {
      window.removeEventListener('online', onlineHandler);
      resolve(false);
    }, timeout);

    const onlineHandler = () => {
      clearTimeout(timeoutId);
      window.removeEventListener('online', onlineHandler);
      resolve(true);
    };

    window.addEventListener('online', onlineHandler);
  });
}

/**
 * Fetches data with automatic retry and error handling
 */
export async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retryOptions: ApiCallOptions<T> = {}
): Promise<T | null> {
  return handleApiCall<T>(
    () => fetch(url, options),
    retryOptions
  );
}
