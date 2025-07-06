import {
	EC2Instance,
	S3Bucket,
	LambdaFunction,
	RDSInstance,
} from '../types/resources.js';

export interface Provider {
	listEC2(): Promise<EC2Instance[]>;
	listS3(): Promise<S3Bucket[]>;
	listLambda(): Promise<LambdaFunction[]>;
	listRDS(): Promise<RDSInstance[]>;
}

export class NotImplementedYet extends Error {
	constructor(method: string) {
		super(`${method} is not implemented yet`);
		this.name = 'NotImplementedYet';
	}
}
