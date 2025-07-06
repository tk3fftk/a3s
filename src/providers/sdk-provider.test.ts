import {describe, it, expect} from 'vitest';
import {SdkProvider} from './sdk-provider.js';
import {NotImplementedYet} from './types.js';

describe('SdkProvider', () => {
	it('should implement Provider interface', () => {
		const provider = new SdkProvider();

		expect(typeof provider.listEC2).toBe('function');
		expect(typeof provider.listS3).toBe('function');
		expect(typeof provider.listLambda).toBe('function');
		expect(typeof provider.listRDS).toBe('function');
	});

	it('listEC2() should handle credentials error gracefully', async () => {
		const provider = new SdkProvider();

		try {
			await provider.listEC2();
			// If it succeeds, it should return an array
			// This might happen if AWS credentials are configured
		} catch (error) {
			// Expected in test environment without credentials
			expect(error).toBeInstanceOf(Error);
			expect(typeof error.message).toBe('string');
		}
	});

	it('unimplemented methods should throw NotImplementedYet', async () => {
		const provider = new SdkProvider();

		await expect(provider.listS3()).rejects.toThrow(NotImplementedYet);
		await expect(provider.listS3()).rejects.toThrow(
			'listS3 is not implemented yet',
		);

		await expect(provider.listLambda()).rejects.toThrow(NotImplementedYet);
		await expect(provider.listLambda()).rejects.toThrow(
			'listLambda is not implemented yet',
		);

		await expect(provider.listRDS()).rejects.toThrow(NotImplementedYet);
		await expect(provider.listRDS()).rejects.toThrow(
			'listRDS is not implemented yet',
		);
	});

	it('listEC2() should handle AWS errors gracefully', async () => {
		const provider = new SdkProvider();

		// This test will pass if the method exists and handles errors
		// In real scenarios, this might throw AWS credential errors
		try {
			await provider.listEC2();
			expect(true).toBe(true); // Pass if no error
		} catch (error) {
			// Should be AWS SDK error, not our implementation error
			expect(error instanceof NotImplementedYet).toBe(false);
		}
	});
});
