import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {ProviderFactory} from './factory.js';
import {SdkProvider} from './sdk-provider.js';
import {CliProvider} from './cli-provider.js';

describe('ProviderFactory', () => {
	const originalEnv = process.env;

	beforeEach(() => {
		vi.resetModules();
		process.env = {...originalEnv};
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	it('should create SdkProvider when A3S_BACKEND=sdk', () => {
		process.env.A3S_BACKEND = 'sdk';
		const provider = ProviderFactory.create();
		expect(provider).toBeInstanceOf(SdkProvider);
	});

	it('should create CliProvider when A3S_BACKEND=cli', () => {
		process.env.A3S_BACKEND = 'cli';
		const provider = ProviderFactory.create();
		expect(provider).toBeInstanceOf(CliProvider);
	});

	it('should create SdkProvider when A3S_BACKEND=auto (default)', () => {
		process.env.A3S_BACKEND = 'auto';
		const provider = ProviderFactory.create();
		expect(provider).toBeInstanceOf(SdkProvider);
	});

	it('should create SdkProvider when A3S_BACKEND is not set', () => {
		delete process.env.A3S_BACKEND;
		const provider = ProviderFactory.create();
		expect(provider).toBeInstanceOf(SdkProvider);
	});

	it('should throw error for invalid A3S_BACKEND value', () => {
		process.env.A3S_BACKEND = 'invalid';
		expect(() => ProviderFactory.create()).toThrow(
			'Invalid A3S_BACKEND: invalid. Must be one of: sdk, cli, auto',
		);
	});

	describe('getBackendType', () => {
		it('should return sdk for A3S_BACKEND=sdk', () => {
			process.env.A3S_BACKEND = 'sdk';
			expect(ProviderFactory.getBackendType()).toBe('sdk');
		});

		it('should return cli for A3S_BACKEND=cli', () => {
			process.env.A3S_BACKEND = 'cli';
			expect(ProviderFactory.getBackendType()).toBe('cli');
		});

		it('should return auto for A3S_BACKEND=auto', () => {
			process.env.A3S_BACKEND = 'auto';
			expect(ProviderFactory.getBackendType()).toBe('auto');
		});

		it('should return auto when A3S_BACKEND is not set', () => {
			delete process.env.A3S_BACKEND;
			expect(ProviderFactory.getBackendType()).toBe('auto');
		});
	});
});
