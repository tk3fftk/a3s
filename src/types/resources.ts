export interface EC2Instance {
	id: string;
	name: string;
	state: string;
	type: string;
	publicIp?: string;
	privateIp?: string;
	availabilityZone?: string;
	launchTime?: string;
}

export interface S3Bucket {
	name: string;
	region: string;
	creationDate: string;
}

export interface LambdaFunction {
	name: string;
	runtime: string;
	handler: string;
	codeSize: number;
	timeout: number;
	memorySize: number;
	lastModified: string;
}

export interface RDSInstance {
	id: string;
	name: string;
	engine: string;
	engineVersion: string;
	instanceClass: string;
	status: string;
	endpoint?: string;
	port?: number;
	storageType: string;
	allocatedStorage: number;
}
