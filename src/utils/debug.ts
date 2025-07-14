/**
 * Debug logging utility - only logs in development environment
 */
export function debugLog(...args: any[]): void {
	if (process.env['NODE_ENV'] === 'development') {
		console.error('[DEBUG]', ...args);
	}
}

/**
 * Check if debug mode is enabled
 */
export function isDebugMode(): boolean {
	return process.env['NODE_ENV'] === 'development';
}
