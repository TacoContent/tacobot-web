import { ApiError, ApiResponse } from './types';

/**
 * Utility functions for working with the TacoBot API
 */

/**
 * Check if an error is an API error
 */
export function isApiError(error: any): error is ApiError {
  return error && typeof error.status === 'number' && typeof error.message === 'string';
}

/**
 * Handle API errors with common patterns
 */
export function handleApiError(error: any, context?: string): string {
  if (isApiError(error)) {
    const contextStr = context ? `[${context}] ` : '';
    
    switch (error.status) {
      case 401:
        return `${contextStr}Unauthorized: Invalid or missing API token`;
      case 403:
        return `${contextStr}Forbidden: Access denied`;
      case 404:
        return `${contextStr}Not found: The requested resource was not found`;
      case 429:
        return `${contextStr}Rate limited: Too many requests`;
      case 500:
        return `${contextStr}Server error: Internal server error occurred`;
      case 503:
        return `${contextStr}Service unavailable: The API is temporarily unavailable`;
      default:
        return `${contextStr}API Error (${error.status}): ${error.message}`;
    }
  }
  
  return context ? `[${context}] ${error.message || 'Unknown error'}` : (error.message || 'Unknown error');
}

/**
 * Safely extract data from API response
 */
export function extractApiData<T>(response: ApiResponse<T>): T {
  return response.data;
}

/**
 * Check if API response was successful
 */
export function isSuccessResponse<T>(response: ApiResponse<T>): boolean {
  return response.status >= 200 && response.status < 300;
}

/**
 * Retry logic for API calls
 */
export async function retryApiCall<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<ApiResponse<T>> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx), only on server errors (5xx) or network issues
      if (isApiError(error) && error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        await sleep(delay * attempt); // Exponential backoff
      }
    }
  }
  
  throw lastError;
}

/**
 * Sleep utility for retry logic
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validate guild ID format
 */
export function isValidGuildId(guildId: string): boolean {
  return /^\d{17,19}$/.test(guildId);
}

/**
 * Validate user ID format
 */
export function isValidUserId(userId: string): boolean {
  return /^\d{17,19}$/.test(userId);
}

/**
 * Validate channel ID format
 */
export function isValidChannelId(channelId: string): boolean {
  return /^\d{17,19}$/.test(channelId);
}

/**
 * Validate Minecraft username format
 */
export function isValidMinecraftUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,16}$/.test(username);
}

/**
 * Validate UUID format
 */
export function isValidUuid(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

/**
 * Convert Unix timestamp to Date
 */
export function timestampToDate(timestamp: number): Date {
  return new Date(timestamp * 1000);
}

/**
 * Convert Date to Unix timestamp
 */
export function dateToTimestamp(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

/**
 * Format Discord snowflake timestamp
 */
export function getSnowflakeTimestamp(snowflake: string): Date {
  const timestamp = (BigInt(snowflake) >> BigInt(22)) + BigInt(1420070400000);
  return new Date(Number(timestamp));
}

/**
 * Build query string from parameters
 */
export function buildQueryString(params: Record<string, string | number | boolean | string[]>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(v => searchParams.append(key, v.toString()));
    } else if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString());
    }
  });
  
  return searchParams.toString();
}