/**
 * @vitest-environment jsdom
 */
import React from 'react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {renderHook, waitFor} from '@testing-library/react';
import {useResources} from './useResources.js';
import {createProvider} from '../providers/factory.js';
import {
	ResourceCacheProvider,
	useResourceCache,
} from './ResourceCacheContext.js';
import type {EC2Instance} from '../types/resources.js';

// Mock the factory
vi.mock('../providers/factory.js', () => ({
	createProvider: vi.fn(),
}));

describe('useResources', () => {
	const mockEC2Instances: EC2Instance[] = [
		{
			id: 'i-1234567890abcdef0',
			name: 'test-instance-1',
			state: 'running',
			type: 't2.micro',
			publicIp: '54.123.45.67',
			privateIp: '10.0.1.10',
			availabilityZone: 'us-east-1a',
			launchTime: '2024-01-01T00:00:00.000Z',
		},
		{
			id: 'i-0987654321fedcba0',
			name: 'test-instance-2',
			state: 'stopped',
			type: 't3.large',
			publicIp: undefined,
			privateIp: '10.0.1.20',
			availabilityZone: 'us-east-1b',
			launchTime: '2024-01-02T00:00:00.000Z',
		},
	];

	const mockProvider = {
		listEC2: vi.fn(),
		listS3: vi.fn(),
		listLambda: vi.fn(),
		listRDS: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
		(createProvider as any).mockResolvedValue(mockProvider);
	});

	it('should load EC2 instances successfully', async () => {
		mockProvider.listEC2.mockResolvedValue(mockEC2Instances);

		const {result} = renderHook(() => useResources('ec2'));

		// Initial state should be loading
		expect(result.current.loading).toBe(true);
		expect(result.current.data).toEqual([]);
		expect(result.current.error).toBeNull();

		// Wait for data to load
		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		// Should have loaded the data
		expect(result.current.data).toEqual(mockEC2Instances);
		expect(result.current.error).toBeNull();
		expect(mockProvider.listEC2).toHaveBeenCalledTimes(1);
	});

	it('should handle loading state correctly', async () => {
		mockProvider.listEC2.mockResolvedValue(mockEC2Instances);

		const {result} = renderHook(() => useResources('ec2'));

		// Should start with loading true
		expect(result.current.loading).toBe(true);

		// Wait for loading to complete
		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		// Loading should be false after data is loaded
		expect(result.current.loading).toBe(false);
	});

	it('should handle errors gracefully', async () => {
		const errorMessage = 'Failed to fetch EC2 instances';
		mockProvider.listEC2.mockRejectedValue(new Error(errorMessage));

		const {result} = renderHook(() => useResources('ec2'));

		// Initial state
		expect(result.current.loading).toBe(true);
		expect(result.current.error).toBeNull();

		// Wait for error
		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		// Should have error state
		expect(result.current.data).toEqual([]);
		expect(result.current.error).toBe(errorMessage);
		expect(result.current.loading).toBe(false);
	});

	it('should not fetch data for non-EC2 resource types', async () => {
		const {result} = renderHook(() => useResources('s3'));

		// Should not be loading for unsupported types
		expect(result.current.loading).toBe(false);
		expect(result.current.data).toEqual([]);
		expect(result.current.error).toBeNull();

		// Provider should not be called
		expect(createProvider).not.toHaveBeenCalled();
		expect(mockProvider.listEC2).not.toHaveBeenCalled();
		expect(mockProvider.listS3).not.toHaveBeenCalled();
	});

	it('should refresh data when refresh function is called', async () => {
		mockProvider.listEC2.mockResolvedValue(mockEC2Instances);

		const {result} = renderHook(() => useResources('ec2'));

		// Wait for initial load
		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(mockProvider.listEC2).toHaveBeenCalledTimes(1);

		// Call refresh - it's synchronous so loading might not be true immediately
		result.current.refresh();

		// Wait for refresh to complete
		await waitFor(() => {
			// Check that provider was called again
			expect(mockProvider.listEC2).toHaveBeenCalledTimes(2);
		});

		// Should not be loading after completion
		expect(result.current.loading).toBe(false);
		expect(result.current.data).toEqual(mockEC2Instances);
	});

	it('should use the correct backend from environment', async () => {
		mockProvider.listEC2.mockResolvedValue(mockEC2Instances);
		const originalBackend = process.env['A3S_BACKEND'];
		process.env['A3S_BACKEND'] = 'cli';

		const {result} = renderHook(() => useResources('ec2'));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		// Should have called createProvider (backend is determined from env var internally)
		expect(createProvider).toHaveBeenCalled();

		// Restore original value
		if (originalBackend) {
			process.env['A3S_BACKEND'] = originalBackend;
		} else {
			delete process.env['A3S_BACKEND'];
		}
	});

	describe('with cache integration', () => {
		const wrapper = ({children}: {children: React.ReactNode}) => (
			<ResourceCacheProvider>{children}</ResourceCacheProvider>
		);

		it('should use cached data when available', async () => {
			mockProvider.listEC2.mockResolvedValue(mockEC2Instances);

			// Test multiple hooks within the same cache provider context
			const TestComponent = () => {
				const firstResult = useResources('ec2');
				const secondResult = useResources('ec2');
				return {firstResult, secondResult};
			};

			const {result} = renderHook(() => TestComponent(), {wrapper});

			await waitFor(() => {
				expect(result.current.firstResult.loading).toBe(false);
			});

			// First hook call will fetch data
			expect(result.current.firstResult.data).toEqual(mockEC2Instances);
			expect(result.current.firstResult.fromCache).toBe(false);

			// Second hook call should get cached data
			expect(result.current.secondResult.fromCache).toBe(true);
			expect(result.current.secondResult.data).toEqual(mockEC2Instances);
			expect(result.current.secondResult.loading).toBe(false);

			// Provider should only be called once
			expect(mockProvider.listEC2).toHaveBeenCalledTimes(1);
		});

		it('should refresh cache when refresh is called', async () => {
			const newInstances = [
				...mockEC2Instances,
				{
					id: 'i-newinstance123',
					name: 'new-instance',
					state: 'running',
					type: 't2.nano',
					publicIp: '1.2.3.4',
					privateIp: '10.0.1.30',
					availabilityZone: 'us-east-1c',
					launchTime: '2024-01-03T00:00:00.000Z',
				},
			];

			mockProvider.listEC2
				.mockResolvedValueOnce(mockEC2Instances)
				.mockResolvedValueOnce(newInstances);

			const {result} = renderHook(() => useResources('ec2'), {wrapper});

			// Wait for initial load
			await waitFor(() => {
				expect(result.current.loading).toBe(false);
			});

			expect(result.current.data).toEqual(mockEC2Instances);
			expect(mockProvider.listEC2).toHaveBeenCalledTimes(1);

			// Call refresh
			result.current.refresh();

			// Wait for refresh to complete
			await waitFor(() => {
				expect(mockProvider.listEC2).toHaveBeenCalledTimes(2);
			});

			expect(result.current.data).toEqual(newInstances);
		});

		it('should indicate cache status in return value', async () => {
			mockProvider.listEC2.mockResolvedValue(mockEC2Instances);

			const TestComponent = () => {
				const firstCall = useResources('ec2');
				// Second call within the same render should get cached data
				const secondCall = useResources('ec2');
				return {firstCall, secondCall};
			};

			const {result} = renderHook(() => TestComponent(), {wrapper});

			await waitFor(() => {
				expect(result.current.firstCall.loading).toBe(false);
			});

			// First call should not be from cache (it's the initial fetch)
			expect(result.current.firstCall.fromCache).toBe(false);
			expect(result.current.firstCall.data).toEqual(mockEC2Instances);

			// Second call should be from cache
			expect(result.current.secondCall.fromCache).toBe(true);
			expect(result.current.secondCall.data).toEqual(mockEC2Instances);
		});

		it('should provide cache age information', async () => {
			mockProvider.listEC2.mockResolvedValue(mockEC2Instances);

			const {result} = renderHook(() => useResources('ec2'), {wrapper});

			await waitFor(() => {
				expect(result.current.loading).toBe(false);
			});

			// Should have cache age
			expect(result.current.cacheAge).toBeGreaterThanOrEqual(0);
			expect(typeof result.current.cacheAge).toBe('number');
		});

		it('should support manual cache clearing', async () => {
			mockProvider.listEC2.mockResolvedValue(mockEC2Instances);

			const TestComponent = () => {
				const resourcesResult = useResources('ec2');
				const {clearCache} = useResourceCache();

				return {
					...resourcesResult,
					clearAllCache: clearCache,
				};
			};

			const {result} = renderHook(() => TestComponent(), {wrapper});

			await waitFor(() => {
				expect(result.current.loading).toBe(false);
			});

			expect(mockProvider.listEC2).toHaveBeenCalledTimes(1);

			// Clear cache manually
			result.current.clearAllCache();

			// New hook instance should fetch fresh data
			const {result: newResult} = renderHook(() => useResources('ec2'), {
				wrapper,
			});

			await waitFor(() => {
				expect(newResult.current.loading).toBe(false);
			});

			// Should have called provider again
			expect(mockProvider.listEC2).toHaveBeenCalledTimes(2);
		});

		it('should handle cache errors gracefully', async () => {
			// Test that errors don't break caching
			mockProvider.listEC2
				.mockRejectedValueOnce(new Error('Network error'))
				.mockResolvedValueOnce(mockEC2Instances);

			const {result} = renderHook(() => useResources('ec2'), {wrapper});

			await waitFor(() => {
				expect(result.current.loading).toBe(false);
			});

			// Should have error
			expect(result.current.error).toBe('Network error');
			expect(result.current.data).toEqual([]);

			// Refresh should work
			result.current.refresh();

			await waitFor(() => {
				expect(result.current.error).toBeNull();
			});

			expect(result.current.data).toEqual(mockEC2Instances);
		});
	});
});
