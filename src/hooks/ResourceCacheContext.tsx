import React, {createContext, useContext, useState, useCallback} from 'react';

interface CacheEntry {
	data: any;
	timestamp: number;
}

interface ResourceCacheContextValue {
	getCache: (key: string) => any | null;
	setCache: (key: string, data: any) => void;
	clearCache: () => void;
	hasCache: (key: string) => boolean;
	getCacheAge: (key: string) => number | null;
}

const ResourceCacheContext = createContext<ResourceCacheContextValue | null>(
	null,
);

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export function ResourceCacheProvider({children}: {children: React.ReactNode}) {
	const [cache, setCache] = useState<Map<string, CacheEntry>>(new Map());

	const getCache = useCallback(
		(key: string): any | null => {
			const entry = cache.get(key);
			if (!entry) {
				return null;
			}

			const now = Date.now();
			if (now - entry.timestamp > CACHE_TTL) {
				const newCache = new Map(cache);
				newCache.delete(key);
				setCache(newCache);
				return null;
			}

			return entry.data;
		},
		[cache],
	);

	const setCacheData = useCallback(
		(key: string, data: any): void => {
			const entry: CacheEntry = {
				data,
				timestamp: Date.now(),
			};
			const newCache = new Map(cache);
			newCache.set(key, entry);
			setCache(newCache);
		},
		[cache],
	);

	const clearCache = useCallback((): void => {
		setCache(new Map());
	}, []);

	const hasCache = useCallback(
		(key: string): boolean => {
			const entry = cache.get(key);
			if (!entry) {
				return false;
			}

			const now = Date.now();
			if (now - entry.timestamp > CACHE_TTL) {
				const newCache = new Map(cache);
				newCache.delete(key);
				setCache(newCache);
				return false;
			}

			return true;
		},
		[cache],
	);

	const getCacheAge = useCallback(
		(key: string): number | null => {
			const entry = cache.get(key);
			if (!entry) {
				return null;
			}

			const now = Date.now();
			if (now - entry.timestamp > CACHE_TTL) {
				const newCache = new Map(cache);
				newCache.delete(key);
				setCache(newCache);
				return null;
			}

			return now - entry.timestamp;
		},
		[cache],
	);

	const value: ResourceCacheContextValue = {
		getCache,
		setCache: setCacheData,
		clearCache,
		hasCache,
		getCacheAge,
	};

	return (
		<ResourceCacheContext.Provider value={value}>
			{children}
		</ResourceCacheContext.Provider>
	);
}

export function useResourceCache(): ResourceCacheContextValue {
	const context = useContext(ResourceCacheContext);
	if (!context) {
		throw new Error(
			'useResourceCache must be used within a ResourceCacheProvider',
		);
	}
	return context;
}
