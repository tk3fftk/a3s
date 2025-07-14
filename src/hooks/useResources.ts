import {useState, useEffect, useCallback} from 'react';
import {createProvider} from '../providers/factory.js';
import {useResourceCache} from './ResourceCacheContext.js';
import {debugLog} from '../utils/debug.js';
import type {EC2Instance} from '../types/resources.js';

export function useResources(resourceType: string) {
	const [data, setData] = useState<EC2Instance[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [fromCache, setFromCache] = useState(false);
	const [cacheAge, setCacheAge] = useState<number | null>(null);

	// Try to use cache context, but make it optional for backwards compatibility
	let cacheContext: ReturnType<typeof useResourceCache> | null = null;
	try {
		cacheContext = useResourceCache();
	} catch {
		// Cache context not available - continue without caching
	}

	const cacheKey = `${resourceType}-resources`;

	// Data loading effect - runs when resourceType changes
	useEffect(() => {
		const fetchData = async () => {
			// Only fetch data for EC2 currently
			if (resourceType !== 'ec2') {
				// Reset state for unsupported resource types
				setData([]);
				setLoading(false);
				setError(null);
				setFromCache(false);
				setCacheAge(null);
				return;
			}

			// Check cache first if available
			if (cacheContext) {
				const cachedData = cacheContext.getCache(cacheKey);
				if (cachedData) {
					debugLog('useResources - Using cached data for', resourceType);
					setData(cachedData);
					setFromCache(true);
					setCacheAge(cacheContext.getCacheAge(cacheKey));
					setError(null);
					setLoading(false);
					return;
				}
			}

			// No cache available, fetch fresh data
			setLoading(true);
			setError(null);
			setFromCache(false);
			setCacheAge(null);

			try {
				const provider = await createProvider();
				debugLog('useResources - Fetching EC2 data...');
				const instances = await provider.listEC2();
				debugLog('useResources - Received instances:', instances.length);

				setData(instances);
				setFromCache(false); // This is fresh data, not from cache

				// Cache the data if cache context is available
				if (cacheContext) {
					cacheContext.setCache(cacheKey, instances);
					setCacheAge(0); // Fresh data
				}
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : 'Unknown error occurred';
				setError(errorMessage);
				setData([]);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [resourceType]); // Only depend on resourceType

	const refresh = useCallback(async () => {
		// Only fetch data for EC2 currently
		if (resourceType !== 'ec2') {
			return;
		}

		setLoading(true);
		setError(null);
		setFromCache(false);
		setCacheAge(null);

		try {
			const provider = await createProvider();
			debugLog('useResources - Refreshing EC2 data...');
			const instances = await provider.listEC2();
			debugLog('useResources - Received instances:', instances.length);

			setData(instances);
			setFromCache(false); // This is fresh data, not from cache

			// Cache the data if cache context is available
			if (cacheContext) {
				cacheContext.setCache(cacheKey, instances);
				setCacheAge(0); // Fresh data
			}
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : 'Unknown error occurred';
			setError(errorMessage);
			setData([]);
		} finally {
			setLoading(false);
		}
	}, [resourceType]); // Remove cacheContext and cacheKey from deps

	return {
		data,
		loading,
		error,
		refresh,
		fromCache,
		cacheAge,
	};
}
