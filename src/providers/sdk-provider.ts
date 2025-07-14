import {EC2Client, DescribeInstancesCommand} from '@aws-sdk/client-ec2';
import {
	EC2Instance,
	S3Bucket,
	LambdaFunction,
	RDSInstance,
} from '../types/resources.js';
import {Provider, NotImplementedYet} from './types.js';
import {debugLog} from '../utils/debug.js';

export class SdkProvider implements Provider {
	private ec2Client: EC2Client;

	constructor() {
		const config: any = {};

		// AWS SDK v3 automatically reads region from:
		// 1. AWS_REGION env var
		// 2. AWS profile config
		// 3. AWS_DEFAULT_REGION env var
		// So we don't need to manually set it unless we have specific requirements

		// LocalStack endpoint configuration
		if (process.env['AWS_ENDPOINT_URL']) {
			config.endpoint = process.env['AWS_ENDPOINT_URL'];
			config.forcePathStyle = true; // Required for LocalStack S3
			config.credentials = {
				accessKeyId: process.env['AWS_ACCESS_KEY_ID'] || 'test',
				secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'] || 'test',
			};
		}

		this.ec2Client = new EC2Client(config);

		// Debug logging - get the resolved region from the client
		this.ec2Client.config
			.region()
			.then(region => {
				debugLog('SDK Provider - Resolved region:', region);
				debugLog('SDK Provider - AWS_PROFILE:', process.env['AWS_PROFILE']);
			})
			.catch(err => {
				debugLog('SDK Provider - Failed to get region:', err);
			});
	}

	async listEC2(): Promise<EC2Instance[]> {
		const command = new DescribeInstancesCommand({});
		const response = await this.ec2Client.send(command);

		const instances: EC2Instance[] = [];

		debugLog(
			'SDK Provider - Reservations count:',
			response.Reservations?.length || 0,
		);

		if (response.Reservations) {
			for (const reservation of response.Reservations) {
				if (reservation.Instances) {
					debugLog(
						'SDK Provider - Instances in reservation:',
						reservation.Instances.length,
					);
					for (const instance of reservation.Instances) {
						const nameTag = instance.Tags?.find(tag => tag.Key === 'Name');

						instances.push({
							id: instance.InstanceId || '',
							name: nameTag?.Value || '',
							state: instance.State?.Name || '',
							type: instance.InstanceType || '',
							publicIp: instance.PublicIpAddress,
							privateIp: instance.PrivateIpAddress,
							availabilityZone: instance.Placement?.AvailabilityZone,
							launchTime: instance.LaunchTime?.toISOString(),
						});
					}
				}
			}
		}

		debugLog('SDK Provider - Total instances found:', instances.length);
		return instances;
	}

	async listS3(): Promise<S3Bucket[]> {
		throw new NotImplementedYet('listS3');
	}

	async listLambda(): Promise<LambdaFunction[]> {
		throw new NotImplementedYet('listLambda');
	}

	async listRDS(): Promise<RDSInstance[]> {
		throw new NotImplementedYet('listRDS');
	}
}
