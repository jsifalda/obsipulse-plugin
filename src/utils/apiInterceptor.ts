/**
 * API Interceptor utility for YourPulse plugin
 * Handles blocking API requests when private mode is active
 */

export interface ApiInterceptorOptions {
  plugin: any // YourPulse plugin instance
}

export class ApiInterceptor {
  private plugin: any

  constructor(options: ApiInterceptorOptions) {
    this.plugin = options.plugin
  }

  /**
   * Check if private mode is currently active
   * @returns boolean indicating if private mode is enabled
   */
  isPrivateModeActive(): boolean {
    return this.plugin.settings.privateMode === true
  }

  /**
   * Check if API request should be blocked based on private mode setting
   * @returns boolean indicating if API request should be blocked
   */
  shouldBlockApiRequest(): boolean {
    return this.isPrivateModeActive()
  }

  /**
   * Log blocked API request for debugging purposes
   */
  logBlockedRequest(): void {
    if (this.isPrivateModeActive()) {
      console.log(`[YourPulse] API request blocked in private mode`)
    }
  }

  /**
   * Execute API request only if private mode is disabled
   * @param requestFn - Function that performs the actual API request
   * @returns Promise that resolves to the request result or null if blocked
   */
  async executeIfAllowed<T>(requestFn: () => Promise<T>): Promise<T | null> {
    if (this.shouldBlockApiRequest()) {
      this.logBlockedRequest()
      return null
    }

    try {
      return await requestFn()
    } catch (error) {
      console.error(`[YourPulse] API request failed:`, error)
      throw error
    }
  }
}
