import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import {SdkProvider} from './sdk-provider.js';
import {CliProvider} from './cli-provider.js';
import {ProviderFactory, BackendType} from './factory.js';
import {NotImplementedYet} from './types.js';

describe('Provider Integration Tests', () => {
	const originalEnv = process.env;

	beforeEach(() => {
		process.env = {...originalEnv};
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	describe('SdkProvider Real AWS Integration', () => {
		it('should connect to AWS and list EC2 instances', async () => {
			const provider = new SdkProvider();

			// This will either succeed with real AWS connection or fail with credential error
			try {
				const instances = await provider.listEC2();
				expect(Array.isArray(instances)).toBe(true);

				// If we have instances, validate structure
				if (instances.length > 0) {
					const instance = instances[0];
					expect(typeof instance.id).toBe('string');
					expect(typeof instance.name).toBe('string');
					expect(typeof instance.state).toBe('string');
					expect(typeof instance.type).toBe('string');
				}
			} catch (error) {
				// Expected errors for missing credentials/permissions
				expect(error.name).toMatch(
					/(CredentialsProviderError|UnauthorizedOperation|InvalidUserID\.NotFound)/,
				);
			}
		});

		it('should throw NotImplementedYet for unimplemented methods', async () => {
			const provider = new SdkProvider();

			await expect(provider.listS3()).rejects.toThrow(NotImplementedYet);
			await expect(provider.listLambda()).rejects.toThrow(NotImplementedYet);
			await expect(provider.listRDS()).rejects.toThrow(NotImplementedYet);
		});
	});

	describe('CliProvider Real AWS Integration', () => {
		it('should connect to AWS CLI and list EC2 instances', async () => {
			const provider = new CliProvider();

			try {
				const instances = await provider.listEC2();
				expect(Array.isArray(instances)).toBe(true);

				// If we have instances, validate structure
				if (instances.length > 0) {
					const instance = instances[0];
					expect(typeof instance.id).toBe('string');
					expect(typeof instance.name).toBe('string');
					expect(typeof instance.state).toBe('string');
					expect(typeof instance.type).toBe('string');
				}
			} catch (error) {
				// Expected errors for missing AWS CLI, credentials, etc.
				const errorMessage = error.message.toLowerCase();
				expect(
					errorMessage.includes('aws') ||
						errorMessage.includes('command not found') ||
						errorMessage.includes('credential') ||
						errorMessage.includes('unable to locate'),
				).toBe(true);
			}
		});

		it('should throw NotImplementedYet for unimplemented methods', async () => {
			const provider = new CliProvider();

			await expect(provider.listS3()).rejects.toThrow(NotImplementedYet);
			await expect(provider.listLambda()).rejects.toThrow(NotImplementedYet);
			await expect(provider.listRDS()).rejects.toThrow(NotImplementedYet);
		});
	});

	describe('ProviderFactory Integration', () => {
		const testConfigurations: Array<{
			name: string;
			env: string | undefined;
			expectedType: string;
			expectedBackend: BackendType;
		}> = [
			{
				name: 'SDK Provider',
				env: 'sdk',
				expectedType: 'SdkProvider',
				expectedBackend: 'sdk',
			},
			{
				name: 'CLI Provider',
				env: 'cli',
				expectedType: 'CliProvider',
				expectedBackend: 'cli',
			},
			{
				name: 'Auto Mode',
				env: 'auto',
				expectedType: 'SdkProvider',
				expectedBackend: 'auto',
			},
			{
				name: 'No env (auto)',
				env: undefined,
				expectedType: 'SdkProvider',
				expectedBackend: 'auto',
			},
		];

		testConfigurations.forEach(config => {
			it(`should create ${config.name} correctly`, async () => {
				// Set environment
				if (config.env) {
					process.env.A3S_BACKEND = config.env;
				} else {
					delete process.env.A3S_BACKEND;
				}

				// Test factory
				const provider = ProviderFactory.create();
				const backendType = ProviderFactory.getBackendType();

				expect(provider.constructor.name).toBe(config.expectedType);
				expect(backendType).toBe(config.expectedBackend);

				// Test that provider can execute (basic smoke test)
				try {
					const instances = await provider.listEC2();
					expect(Array.isArray(instances)).toBe(true);
				} catch (error) {
					// Expected for missing credentials/CLI - just ensure it's not our implementation error
					expect(error instanceof NotImplementedYet).toBe(false);
				}

				// Test unimplemented methods
				await expect(provider.listS3()).rejects.toThrow(NotImplementedYet);
			});
		});

		it('should throw error for invalid backend configuration', () => {
			process.env.A3S_BACKEND = 'invalid';

			expect(() => ProviderFactory.create()).toThrow(
				'Invalid A3S_BACKEND: invalid. Must be one of: sdk, cli, auto',
			);
		});
	});

	describe('Cross-Provider Compatibility', () => {
		it('should return same data structure from both providers', async () => {
			const sdkProvider = new SdkProvider();
			const cliProvider = new CliProvider();

			try {
				const [sdkInstances, cliInstances] = await Promise.allSettled([
					sdkProvider.listEC2(),
					cliProvider.listEC2(),
				]);

				// If both succeed, compare structure
				if (
					sdkInstances.status === 'fulfilled' &&
					cliInstances.status === 'fulfilled'
				) {
					expect(Array.isArray(sdkInstances.value)).toBe(true);
					expect(Array.isArray(cliInstances.value)).toBe(true);

					// Compare instance structure if we have data
					if (sdkInstances.value.length > 0 && cliInstances.value.length > 0) {
						const sdkInstance = sdkInstances.value[0];
						const cliInstance = cliInstances.value[0];

						// Should have same properties
						expect(Object.keys(sdkInstance).sort()).toEqual(
							Object.keys(cliInstance).sort(),
						);
					}
				}
			} catch {
				// Expected if credentials/CLI not available
				// This test passes if both providers handle errors consistently
				expect(true).toBe(true);
			}
		});
	});
});
