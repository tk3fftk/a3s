import {describe, it, expect, vi, beforeEach} from 'vitest';
import {CliProvider} from './cli-provider.js';
import {NotImplementedYet} from './types.js';

// Mock execa
vi.mock('execa', () => ({
	execa: vi.fn(),
}));

const mockExeca = vi.mocked((await import('execa')).execa);

describe('CliProvider', () => {
	let provider: CliProvider;

	beforeEach(() => {
		provider = new CliProvider();
		vi.clearAllMocks();
	});

	it('should implement Provider interface', () => {
		expect(typeof provider.listEC2).toBe('function');
		expect(typeof provider.listS3).toBe('function');
		expect(typeof provider.listLambda).toBe('function');
		expect(typeof provider.listRDS).toBe('function');
	});

	describe('listEC2', () => {
		it('should call AWS CLI with correct command', async () => {
			const mockInstances = {
				Reservations: [
					{
						Instances: [
							{
								InstanceId: 'i-1234567890abcdef0',
								State: {Name: 'running'},
								InstanceType: 't2.micro',
								PublicIpAddress: '203.0.113.12',
								PrivateIpAddress: '10.0.1.30',
								Placement: {AvailabilityZone: 'us-east-1a'},
								LaunchTime: '2023-01-01T12:00:00.000Z',
								Tags: [{Key: 'Name', Value: 'test-instance'}],
							},
						],
					},
				],
			};

			mockExeca.mockResolvedValue({
				stdout: JSON.stringify(mockInstances),
				stderr: '',
				exitCode: 0,
			} as any);

			const instances = await provider.listEC2();

			expect(mockExeca).toHaveBeenCalledWith('aws', [
				'ec2',
				'describe-instances',
				'--output',
				'json',
			]);

			expect(instances).toHaveLength(1);
			expect(instances[0]).toEqual({
				id: 'i-1234567890abcdef0',
				name: 'test-instance',
				state: 'running',
				type: 't2.micro',
				publicIp: '203.0.113.12',
				privateIp: '10.0.1.30',
				availabilityZone: 'us-east-1a',
				launchTime: '2023-01-01T12:00:00.000Z',
			});
		});

		it('should handle empty instances response', async () => {
			mockExeca.mockResolvedValue({
				stdout: JSON.stringify({Reservations: []}),
				stderr: '',
				exitCode: 0,
			} as any);

			const instances = await provider.listEC2();

			expect(instances).toEqual([]);
		});

		it('should handle instances without name tags', async () => {
			const mockInstances = {
				Reservations: [
					{
						Instances: [
							{
								InstanceId: 'i-1234567890abcdef0',
								State: {Name: 'running'},
								InstanceType: 't2.micro',
								Tags: [],
							},
						],
					},
				],
			};

			mockExeca.mockResolvedValue({
				stdout: JSON.stringify(mockInstances),
				stderr: '',
				exitCode: 0,
			} as any);

			const instances = await provider.listEC2();

			expect(instances[0].name).toBe('');
		});

		it('should handle AWS CLI execution errors', async () => {
			mockExeca.mockRejectedValue(new Error('AWS CLI not found'));

			await expect(provider.listEC2()).rejects.toThrow('AWS CLI not found');
		});

		it('should handle invalid JSON response', async () => {
			mockExeca.mockResolvedValue({
				stdout: 'invalid json',
				stderr: '',
				exitCode: 0,
			} as any);

			await expect(provider.listEC2()).rejects.toThrow();
		});
	});

	it('unimplemented methods should throw NotImplementedYet', async () => {
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
});
