import {execa} from 'execa';
import {
	EC2Instance,
	S3Bucket,
	LambdaFunction,
	RDSInstance,
} from '../types/resources.js';
import {Provider, NotImplementedYet} from './types.js';

export class CliProvider implements Provider {
	private buildAwsCommand(
		service: string,
		operation: string,
		extraArgs: string[] = [],
	): string[] {
		const args = [service, operation];

		// Add LocalStack endpoint if configured
		if (process.env['AWS_ENDPOINT_URL']) {
			args.push('--endpoint-url', process.env['AWS_ENDPOINT_URL']);
		}

		args.push(...extraArgs);
		return args;
	}

	async listEC2(): Promise<EC2Instance[]> {
		const args = this.buildAwsCommand('ec2', 'describe-instances', [
			'--output',
			'json',
		]);
		const result = await execa('aws', args);

		const response = JSON.parse(result.stdout);
		const instances: EC2Instance[] = [];

		if (response.Reservations) {
			for (const reservation of response.Reservations) {
				if (reservation.Instances) {
					for (const instance of reservation.Instances) {
						const nameTag = instance.Tags?.find(
							(tag: any) => tag.Key === 'Name',
						);

						instances.push({
							id: instance.InstanceId || '',
							name: nameTag?.Value || '',
							state: instance.State?.Name || '',
							type: instance.InstanceType || '',
							publicIp: instance.PublicIpAddress,
							privateIp: instance.PrivateIpAddress,
							availabilityZone: instance.Placement?.AvailabilityZone,
							launchTime: instance.LaunchTime,
						});
					}
				}
			}
		}

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
