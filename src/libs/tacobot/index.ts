import { TacoBotApiClient } from './ApiClient';
import config from '../../config';

/**
 * Factory function to create a TacoBot API client instance
 * with configuration from the environment
 */
export function createTacoBotApiClient(): TacoBotApiClient {
  return new TacoBotApiClient({
    baseUrl: config.tacobot.api.url,
    token: config.tacobot.api.token,
    tokenHeader: config.tacobot.api.header,
    timeout: 30000 // 30 seconds default timeout
  });
}

/**
 * Singleton instance of the TacoBot API client
 * Use this for most cases unless you need custom configuration
 */
export const tacoBotApiClient = createTacoBotApiClient();

// Re-export everything for convenience
export { TacoBotApiClient } from './ApiClient';
export * from './types';
export * from './utils';

export default tacoBotApiClient;